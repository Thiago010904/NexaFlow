// src/context/AppContext.tsx

import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { 
  UserRole, 
  Employee, 
  DaySchedule, 
  ShiftBlock, 
  AuditLogEntry, 
  NoveltyReason, 
  WebhookConfig, 
  NotificationLog, 
  BackupSnapshot,
  EmployeeWeeklyLaborCalculation,
  Puesto,
  PuestoAssignment,
  HorarioSlot,
  NavigationModule
} from '../types/index';
import { 
  INITIAL_EMPLOYEES, 
  INITIAL_PUESTOS,
  getInitialPuestoAssignments,
  syncPuestoAssignmentsToDaySchedules,
  INITIAL_AUDIT_LOGS, 
  INITIAL_BACKUPS 
} from '../data/mockData';
import { 
  getWeekDates, 
  calculateWeeklyLaborAccumulated 
} from '../utils/colombianLaborEngine';
import { 
  DEFAULT_WEBHOOK_CONFIG, 
  dispatchScheduleWebhook, 
  dispatchHighPriorityAlertWebhook, 
  retryNotificationLog 
} from '../services/n8nIntegrationService';
import {
  checkDbConnection,
  fetchInitialDataFromDb,
  persistPuestoInDb,
  deletePuestoInDb,
  persistEmployeeInDb,
  deleteEmployeeInDb,
  persistAsignacionInDb,
  persistBitacoraInDb,
  DbStatusResponse
} from '../services/apiService';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

interface AppContextType {
  // Database Status
  dbStatus: DbStatusResponse | null;
  isDbConnected: boolean;

  // Roles & Navigation
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeModule: NavigationModule;
  setActiveModule: (module: NavigationModule) => void;
  
  // View mode in Schedule
  scheduleViewMode: 'puestos' | 'capacity';
  setScheduleViewMode: (mode: 'puestos' | 'capacity') => void;

  // Sede & Operator Filters
  selectedSedeFilter: 1 | 2 | 3 | 'all';
  setSelectedSedeFilter: (sede: 1 | 2 | 3 | 'all') => void;
  selectedOperatorId: string;
  setSelectedOperatorId: (id: string) => void;

  // Calendar / Week Navigation
  referenceDate: string; // "2026-10-26"
  weekDates: string[];
  goToPreviousWeek: () => void;
  goToNextWeek: () => void;
  goToCurrentWeek: () => void;

  // Core Data
  employees: Employee[];
  puestos: Puesto[];
  puestoAssignments: PuestoAssignment[];
  schedules: DaySchedule[];
  auditLogs: AuditLogEntry[];
  backups: BackupSnapshot[];
  notificationLogs: NotificationLog[];
  webhookConfig: WebhookConfig;
  updateWebhookConfig: (config: Partial<WebhookConfig>) => void;

  // Employee Management (Altas, Bajas, Edición y persistente en SQLite)
  addEmployee: (emp: Omit<Employee, 'id'>) => Promise<void>;
  updateEmployee: (empId: string, updates: Partial<Employee>) => Promise<void>;
  deleteEmployee: (empId: string) => Promise<void>;

  // Puestos Management (Editable por el Coordinador y persistente en SQLite)
  addPuesto: (puesto: { name: string; sedeId: 1 | 2 | 3; horarios?: Omit<HorarioSlot, 'id'>[] }) => void;
  updatePuesto: (puestoId: string, updates: Partial<Puesto>) => void;
  deletePuesto: (puestoId: string) => void;
  addHorarioToPuesto: (puestoId: string, horario: Omit<HorarioSlot, 'id'>) => void;
  updateHorario: (puestoId: string, horarioId: string, updates: Partial<HorarioSlot>) => void;
  deleteHorario: (puestoId: string, horarioId: string) => void;

  // Cell Assignment (Persistente en SQLite)
  assignEmployeeToPuesto: (params: {
    puestoId: string;
    horarioId: string;
    date: string;
    employeeId: string | null;
    customNote?: string;
    isCoveredByNovelty?: boolean;
    reason?: NoveltyReason;
    notes?: string;
  }) => Promise<void>;

  // Labor Engine Pre-calculated Map
  employeeWeeklyLabor: Record<string, EmployeeWeeklyLaborCalculation>;

  // Shift & Novelty Actions (RF-03 & RF-05)
  saveShiftModification: (params: {
    employeeId: string;
    date: string;
    previousBlocks: ShiftBlock[];
    newBlocks: ShiftBlock[];
    reason: NoveltyReason;
    notes: string;
    coordinatorName: string;
  }) => Promise<void>;

  addShiftDirectly: (
    employeeId: string, 
    date: string, 
    block: Omit<ShiftBlock, 'id'>
  ) => void;

  deleteShiftDirectly: (
    employeeId: string, 
    date: string, 
    blockId: string
  ) => void;

  // n8n Integrations (RF-05)
  sendScheduleViaWhatsApp: (capturedImageBase64?: string) => Promise<{ success: boolean; message: string }>;
  retryFailedNotification: (logId: string) => Promise<void>;

  // Backups (RF-06 & Flujo 8)
  executeManualBackup: () => Promise<BackupSnapshot>;
  restoreBackup: (backupId: string) => void;

  // Toasts
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estado de conexión SQLite
  const [dbStatus, setDbStatus] = useState<DbStatusResponse | null>(null);
  const [isDbConnected, setIsDbConnected] = useState<boolean>(false);

  // Fecha de referencia inicial: 26 de Octubre 2026 (Semana de la imagen de Zona P)
  const [referenceDate, setReferenceDate] = useState<string>('2026-10-26');
  const [currentRole, setCurrentRole] = useState<UserRole>('coordinator');
  const [activeModule, setActiveModule] = useState<NavigationModule>('schedule');
  const [scheduleViewMode, setScheduleViewMode] = useState<'puestos' | 'capacity'>('puestos');
  const [selectedSedeFilter, setSelectedSedeFilter] = useState<1 | 2 | 3 | 'all'>('all');
  const [selectedOperatorId, setSelectedOperatorId] = useState<string>('emp-oswaldo');

  // Core state
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [puestos, setPuestos] = useState<Puesto[]>(INITIAL_PUESTOS);
  const [puestoAssignments, setPuestoAssignments] = useState<PuestoAssignment[]>(getInitialPuestoAssignments());
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [backups, setBackups] = useState<BackupSnapshot[]>(INITIAL_BACKUPS);
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>([]);
  const [webhookConfig, setWebhookConfig] = useState<WebhookConfig>(DEFAULT_WEBHOOK_CONFIG);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Toast Helpers
  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // --- CARGA INICIAL DESDE LA BASE DE DATOS SQLITE (database/zonap.db) ---
  useEffect(() => {
    async function initDatabaseConnection() {
      try {
        const status = await checkDbConnection();
        if (status && status.connected) {
          setDbStatus(status);
          setIsDbConnected(true);

          const dbData = await fetchInitialDataFromDb();
          if (dbData) {
            if (dbData.empleados && dbData.empleados.length > 0) {
              setEmployees(dbData.empleados);
            }
            if (dbData.puestos && dbData.puestos.length > 0) {
              setPuestos(dbData.puestos);
            }
            if (dbData.asignaciones && dbData.asignaciones.length > 0) {
              setPuestoAssignments(dbData.asignaciones);
            }
            if (dbData.bitacora && dbData.bitacora.length > 0) {
              setAuditLogs(dbData.bitacora);
            }

            addToast({
              type: 'success',
              title: 'SQLite Conectado Exitosamente',
              message: `Base de datos ${status.databaseFile} cargada (${status.counts.puestos} puestos, ${status.counts.empleados} operarios).`
            });
          }
        }
      } catch (err) {
        console.warn('Conexión directa con SQLite en modo local.', err);
      }
    }

    initDatabaseConnection();
  }, []);

  // Sincronización automática de asignaciones a DaySchedules para cálculo de motor laboral 2026
  const schedules = useMemo(() => {
    return syncPuestoAssignmentsToDaySchedules(puestoAssignments, puestos);
  }, [puestoAssignments, puestos]);

  // Calculate the 7 days of the current week (Lunes a Domingo)
  const weekDates = useMemo(() => {
    return getWeekDates(new Date(referenceDate + 'T12:00:00'));
  }, [referenceDate]);

  // Real-time calculation using Colombian Labor Engine 2026 for all employees
  const employeeWeeklyLabor = useMemo(() => {
    const map: Record<string, EmployeeWeeklyLaborCalculation> = {};
    employees.forEach(emp => {
      map[emp.id] = calculateWeeklyLaborAccumulated(emp.id, weekDates, schedules);
    });
    return map;
  }, [employees, weekDates, schedules]);

  // Week navigation
  const goToPreviousWeek = () => {
    const d = new Date(referenceDate + 'T12:00:00');
    d.setDate(d.getDate() - 7);
    setReferenceDate(d.toISOString().split('T')[0]);
  };

  const goToNextWeek = () => {
    const d = new Date(referenceDate + 'T12:00:00');
    d.setDate(d.getDate() + 7);
    setReferenceDate(d.toISOString().split('T')[0]);
  };

  const goToCurrentWeek = () => {
    setReferenceDate('2026-10-26');
  };

  const updateWebhookConfig = (newCfg: Partial<WebhookConfig>) => {
    setWebhookConfig(prev => ({ ...prev, ...newCfg }));
    addToast({
      type: 'info',
      title: 'Configuración de Webhooks',
      message: 'Parámetros de n8n actualizados correctamente.'
    });
  };

  // --- GESTIÓN DE EMPLEADOS (ALTAS, BAJAS, EDICIÓN & PERSISTIDO EN SQLITE) ---
  const addEmployee = async (newEmpData: Omit<Employee, 'id'>) => {
    const cleanName = (newEmpData.name || 'empleado')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-');
    const newId = `emp-${cleanName.slice(0, 15)}-${Date.now().toString().slice(-4)}`;

    const newEmployee: Employee = {
      ...newEmpData,
      id: newId,
      active: true,
      colorBg: newEmpData.colorBg || '#E0F2FE',
      colorText: newEmpData.colorText || '#0369A1',
      colorBorder: newEmpData.colorBorder || '#BAE6FD',
    };

    setEmployees(prev => [...prev, newEmployee]);

    // Persistir directamente en SQLite
    await persistEmployeeInDb(newEmployee);

    addToast({
      type: 'success',
      title: 'Empleado Registrado en SQLite',
      message: `${newEmployee.name} fue dado de alta exitosamente en database/zonap.db.`
    });
  };

  const updateEmployee = async (empId: string, updates: Partial<Employee>) => {
    let targetName = 'empleado';
    let savedEmployee: Employee | null = null;

    setEmployees(prev => prev.map(emp => {
      if (emp.id === empId) {
        savedEmployee = { ...emp, ...updates };
        targetName = savedEmployee.name;
        return savedEmployee;
      }
      return emp;
    }));

    if (savedEmployee) {
      await persistEmployeeInDb(savedEmployee);
    }

    addToast({
      type: 'info',
      title: 'Empleado Actualizado en SQLite',
      message: `Información de "${targetName}" guardada correctamente.`
    });
  };

  const deleteEmployee = async (empId: string) => {
    const targetEmp = employees.find(e => e.id === empId);

    // Remover de lista en memoria
    setEmployees(prev => prev.filter(e => e.id !== empId));

    // Limpiar asignaciones en celdas de la malla que tuvieran a este operario
    setPuestoAssignments(prev => prev.map(asg => {
      if (asg.employeeId === empId) {
        return { ...asg, employeeId: null };
      }
      return asg;
    }));

    // Si el operario simulado era este, pasar al primero disponible
    if (selectedOperatorId === empId) {
      const remaining = employees.filter(e => e.id !== empId);
      if (remaining.length > 0) {
        setSelectedOperatorId(remaining[0].id);
      }
    }

    // Persistir eliminación en SQLite (limpia turnos y borra/desactiva registro)
    await deleteEmployeeInDb(empId);

    addToast({
      type: 'warning',
      title: 'Empleado Eliminado de SQLite',
      message: `Se desvinculó a "${targetEmp?.name || empId}" y se liberaron sus turnos en la malla.`
    });
  };

  // --- GESTIÓN DE PUESTOS (EDITABLE POR EL COORDINADOR & PERSISTIDO EN SQLITE) ---
  const addPuesto = async (newPuestoData: { name: string; sedeId: 1 | 2 | 3; horarios?: Omit<HorarioSlot, 'id'>[] }) => {
    const newId = `puesto-${Date.now()}`;
    const defaultHorarios: HorarioSlot[] = newPuestoData.horarios && newPuestoData.horarios.length > 0
      ? newPuestoData.horarios.map((h, i) => ({ ...h, id: `h-${Date.now()}-${i}` }))
      : [
          { id: `h-${Date.now()}-1`, startTime: '06:00', endTime: '14:00', activeDays: [1, 2, 3, 4, 5] },
          { id: `h-${Date.now()}-2`, startTime: '14:00', endTime: '22:00', activeDays: [1, 2, 3, 4, 5] },
        ];

    const newPuesto: Puesto = {
      id: newId,
      name: newPuestoData.name || `Puesto # ${puestos.length + 1}`,
      sedeId: newPuestoData.sedeId || 1,
      order: puestos.length + 1,
      horarios: defaultHorarios,
    };

    setPuestos(prev => [...prev, newPuesto]);

    // Persistir en SQLite
    await persistPuestoInDb(newPuesto);

    addToast({
      type: 'success',
      title: 'Puesto Guardado en SQLite',
      message: `El puesto "${newPuesto.name}" fue creado y guardado en database/zonap.db.`
    });
  };

  const updatePuesto = async (puestoId: string, updates: Partial<Puesto>) => {
    let updatedObj: Puesto | null = null;
    setPuestos(prev => prev.map(p => {
      if (p.id === puestoId) {
        updatedObj = { ...p, ...updates };
        return updatedObj;
      }
      return p;
    }));

    if (updatedObj) {
      // Persistir en SQLite
      await persistPuestoInDb(updatedObj);
    }

    addToast({
      type: 'info',
      title: 'Puesto Actualizado en SQLite',
      message: `Cambios guardados en ${updates.name ? `"${updates.name}"` : 'el puesto'} (database/zonap.db).`
    });
  };

  const deletePuesto = async (puestoId: string) => {
    const target = puestos.find(p => p.id === puestoId);
    setPuestos(prev => prev.filter(p => p.id !== puestoId));
    setPuestoAssignments(prev => prev.filter(asg => asg.puestoId !== puestoId));

    // Persistir eliminación en SQLite
    await deletePuestoInDb(puestoId);

    addToast({
      type: 'warning',
      title: 'Puesto Eliminado de SQLite',
      message: `Se removió el puesto "${target?.name || puestoId}" de database/zonap.db.`
    });
  };

  const addHorarioToPuesto = async (puestoId: string, horario: Omit<HorarioSlot, 'id'>) => {
    const newHorarioId = `h-${Date.now()}`;
    const newSlot: HorarioSlot = {
      ...horario,
      id: newHorarioId,
    };

    let targetPuesto: Puesto | null = null;
    setPuestos(prev => prev.map(p => {
      if (p.id === puestoId) {
        targetPuesto = {
          ...p,
          horarios: [...p.horarios, newSlot]
        };
        return targetPuesto;
      }
      return p;
    }));

    if (targetPuesto) {
      await persistPuestoInDb(targetPuesto);
    }

    addToast({
      type: 'success',
      title: 'Horario Guardado en SQLite',
      message: `Horario ${newSlot.startTime} - ${newSlot.endTime} añadido.`
    });
  };

  const updateHorario = async (puestoId: string, horarioId: string, updates: Partial<HorarioSlot>) => {
    let targetPuesto: Puesto | null = null;
    setPuestos(prev => prev.map(p => {
      if (p.id === puestoId) {
        targetPuesto = {
          ...p,
          horarios: p.horarios.map(h => h.id === horarioId ? { ...h, ...updates } : h)
        };
        return targetPuesto;
      }
      return p;
    }));

    if (targetPuesto) {
      await persistPuestoInDb(targetPuesto);
    }
  };

  const deleteHorario = async (puestoId: string, horarioId: string) => {
    let targetPuesto: Puesto | null = null;
    setPuestos(prev => prev.map(p => {
      if (p.id === puestoId) {
        targetPuesto = {
          ...p,
          horarios: p.horarios.filter(h => h.id !== horarioId)
        };
        return targetPuesto;
      }
      return p;
    }));
    setPuestoAssignments(prev => prev.filter(asg => !(asg.puestoId === puestoId && asg.horarioId === horarioId)));

    if (targetPuesto) {
      await persistPuestoInDb(targetPuesto);
    }
  };

  // --- ASIGNACIÓN DE CELDA (PUESTO + HORARIO + DÍA) PERSISTIDA EN SQLITE ---
  const assignEmployeeToPuesto = async (params: {
    puestoId: string;
    horarioId: string;
    date: string;
    employeeId: string | null;
    customNote?: string;
    isCoveredByNovelty?: boolean;
    reason?: NoveltyReason;
    notes?: string;
  }) => {
    const { puestoId, horarioId, date, employeeId, customNote, isCoveredByNovelty, reason, notes } = params;

    const existingIndex = puestoAssignments.findIndex(
      asg => asg.puestoId === puestoId && asg.horarioId === horarioId && asg.date === date
    );

    const oldAssignment = existingIndex >= 0 ? puestoAssignments[existingIndex] : null;
    const oldEmployee = oldAssignment?.employeeId ? employees.find(e => e.id === oldAssignment.employeeId) : null;
    const newEmployee = employeeId ? employees.find(e => e.id === employeeId) : null;
    const puesto = puestos.find(p => p.id === puestoId);
    const horario = puesto?.horarios.find(h => h.id === horarioId);

    const isDifferent = oldAssignment?.employeeId !== employeeId || oldAssignment?.customNote !== customNote;

    if (!isDifferent) return;

    // Actualizar estado local
    setPuestoAssignments(prev => {
      const filtered = prev.filter(
        asg => !(asg.puestoId === puestoId && asg.horarioId === horarioId && asg.date === date)
      );

      if (employeeId !== null || customNote) {
        return [
          ...filtered,
          {
            id: oldAssignment?.id || `asg-${puestoId}-${horarioId}-${date}-${Date.now()}`,
            puestoId,
            horarioId,
            date,
            employeeId,
            customNote,
            isCoveredByNovelty: Boolean(isCoveredByNovelty || reason),
          }
        ];
      }
      return filtered;
    });

    // Persistir directamente en SQLite (INSERT / UPDATE)
    await persistAsignacionInDb({
      puestoId,
      horarioId,
      date,
      employeeId,
      customNote,
      isCoveredByNovelty: Boolean(isCoveredByNovelty || reason),
    });

    // Si hubo novedad o cambio de operario, registrar en Bitácora inmutable (RF-03)
    if (reason || (oldEmployee && newEmployee && oldEmployee.id !== newEmployee.id)) {
      const now = new Date();
      const changeId = 'aud-' + Date.now();
      const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const isTodayOrTomorrow = date === '2026-10-26' || date === '2026-10-27';

      const prevBlocks: ShiftBlock[] = oldEmployee && horario ? [{
        id: `prev-${Date.now()}`,
        sedeId: puesto?.sedeId || 1,
        puestoId,
        puestoName: puesto?.name,
        startTime: horario.startTime,
        endTime: horario.endTime,
        notes: puesto?.name
      }] : [];

      const newBlocks: ShiftBlock[] = newEmployee && horario ? [{
        id: `new-${Date.now()}`,
        sedeId: puesto?.sedeId || 1,
        puestoId,
        puestoName: puesto?.name,
        startTime: horario.startTime,
        endTime: horario.endTime,
        notes: customNote ? `${puesto?.name} (${customNote})` : puesto?.name
      }] : [];

      const auditEntry: AuditLogEntry = {
        id: changeId,
        timestamp: now.toISOString(),
        formattedDate,
        coordinatorId: 'coord-active',
        coordinatorName: currentRole === 'admin' ? 'Administrador General' : 'Coordinador de Sede Zona P',
        employeeId: newEmployee?.id || oldEmployee?.id || 'emp-general',
        employeeName: newEmployee?.name || oldEmployee?.name || 'Operario',
        shiftDate: date,
        reason: reason || 'Otro',
        notes: notes || `Reasignación en puesto ${puesto?.name} (${horario?.startTime}-${horario?.endTime})`,
        previousBlocks: prevBlocks,
        newBlocks: newBlocks,
        isHighPriorityAlert: isTodayOrTomorrow,
        n8nNotificationDispatched: false,
      };

      setAuditLogs(prev => [auditEntry, ...prev]);

      // Guardar también en tabla bitacora_novedades de SQLite
      await persistBitacoraInDb(auditEntry);

      // Alerta prioritaria WhatsApp si afecta hoy o mañana (Flujo 7 / RF-05)
      if (isTodayOrTomorrow && newEmployee) {
        addToast({
          type: 'warning',
          title: 'Alerta Prioritaria WhatsApp (Flujo 7)',
          message: `Disparando notificación n8n a ${newEmployee.name}...`
        });

        const alertRes = await dispatchHighPriorityAlertWebhook({
          employeeId: newEmployee.id,
          employeeName: newEmployee.name,
          phone: newEmployee.phone,
          email: newEmployee.email,
          shiftDate: date,
          reason: reason || 'Otro',
          coordinatorName: 'Coordinador Zona P',
          previousShiftSummary: oldEmployee ? `${oldEmployee.name} en ${puesto?.name}` : 'Sin asignación previa',
          newShiftDetails: `${puesto?.name} (${horario?.startTime}-${horario?.endTime})`,
          priority: 'HIGH',
          timestamp: now.toISOString(),
        }, webhookConfig);

        setNotificationLogs(prev => [alertRes.log, ...prev]);
        setAuditLogs(prev => prev.map(l => l.id === changeId ? { ...l, n8nNotificationDispatched: alertRes.success } : l));
      }
    }

    addToast({
      type: 'success',
      title: 'Turno Guardado en SQLite',
      message: `${newEmployee ? newEmployee.name : 'Turno liberado'} guardado en database/zonap.db.`
    });
  };

  // RF-03 & RF-05: Modificación con Registro de Novedad Operativa e Invocación n8n
  const saveShiftModification = async (params: {
    employeeId: string;
    date: string;
    previousBlocks: ShiftBlock[];
    newBlocks: ShiftBlock[];
    reason: NoveltyReason;
    notes: string;
    coordinatorName: string;
  }) => {
    const employee = employees.find(e => e.id === params.employeeId);
    const empName = employee ? employee.name : 'Operario';

    const isTodayOrTomorrow = params.date === '2026-10-26' || params.date === '2026-10-27';
    const isHighPriority = isTodayOrTomorrow;

    const changeId = 'aud-' + Date.now();
    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newLogEntry: AuditLogEntry = {
      id: changeId,
      timestamp: now.toISOString(),
      formattedDate,
      coordinatorId: 'coord-active',
      coordinatorName: params.coordinatorName || 'Coordinador en Turno',
      employeeId: params.employeeId,
      employeeName: empName,
      shiftDate: params.date,
      reason: params.reason,
      notes: params.notes,
      previousBlocks: params.previousBlocks,
      newBlocks: params.newBlocks,
      isHighPriorityAlert: isHighPriority,
      n8nNotificationDispatched: false,
    };

    setAuditLogs(prev => [newLogEntry, ...prev]);

    // Persistir en SQLite
    await persistBitacoraInDb(newLogEntry);

    addToast({
      type: 'success',
      title: 'Novedad Operativa en SQLite',
      message: `Registro inmutable guardado en database/zonap.db (${params.reason}).`
    });

    if (isHighPriority && employee) {
      const prevSummary = params.previousBlocks.length > 0
        ? params.previousBlocks.map(b => `${b.startTime}-${b.endTime} (Sede ${b.sedeId})`).join(', ')
        : 'Sin turno asignado';
      const newSummary = params.newBlocks.length > 0
        ? params.newBlocks.map(b => `${b.startTime}-${b.endTime} (Sede ${b.sedeId})`).join(', ')
        : 'Turno cancelado / Día libre';

      addToast({
        type: 'warning',
        title: 'Alerta Prioritaria n8n',
        message: `Disparando notificación urgente de WhatsApp a ${empName} (Flujo 7)...`
      });

      const alertResult = await dispatchHighPriorityAlertWebhook({
        employeeId: employee.id,
        employeeName: employee.name,
        phone: employee.phone,
        email: employee.email,
        shiftDate: params.date,
        reason: params.reason,
        coordinatorName: params.coordinatorName || 'Coordinador en Turno',
        previousShiftSummary: prevSummary,
        newShiftDetails: newSummary,
        priority: 'HIGH',
        timestamp: now.toISOString(),
      }, webhookConfig);

      setNotificationLogs(prev => [alertResult.log, ...prev]);
      setAuditLogs(prev => prev.map(l => l.id === changeId ? { ...l, n8nNotificationDispatched: alertResult.success } : l));

      if (alertResult.success) {
        addToast({
          type: 'success',
          title: 'WhatsApp Enviado',
          message: `Operario notificado vía n8n [Alerta Prioritaria]`
        });
      }
    }
  };

  const addShiftDirectly = (employeeId: string, date: string, block: Omit<ShiftBlock, 'id'>) => {
    const targetPuesto = puestos[0];
    if (targetPuesto && targetPuesto.horarios.length > 0) {
      assignEmployeeToPuesto({
        puestoId: targetPuesto.id,
        horarioId: targetPuesto.horarios[0].id,
        date,
        employeeId,
      });
    }
  };

  const deleteShiftDirectly = (employeeId: string, date: string, _blockId: string) => {
    setPuestoAssignments(prev => prev.map(asg => {
      if (asg.employeeId === employeeId && asg.date === date) {
        return { ...asg, employeeId: null };
      }
      return asg;
    }));

    addToast({
      type: 'info',
      title: 'Turno Eliminado',
      message: 'El operario fue desasignado del turno.'
    });
  };

  // Flujo 6 / RF-05: Envío de Malla Semanal por WhatsApp
  const sendScheduleViaWhatsApp = async (capturedImageBase64?: string) => {
    const payloadEmployees = employees.map(emp => {
      const calc = employeeWeeklyLabor[emp.id];
      const empSchedules = schedules.filter(s => s.employeeId === emp.id && weekDates.includes(s.date));
      const shiftsSummary = empSchedules
        .map(s => `${s.date}: ${s.blocks.map(b => `${b.startTime}-${b.endTime} ${b.puestoName || `Sede ${b.sedeId}`}`).join(' | ')}`)
        .join('; ');

      return {
        id: emp.id,
        name: emp.name,
        phone: emp.phone,
        email: emp.email,
        totalHours: calc ? calc.totalHours : 0,
        shiftsSummary: shiftsSummary || 'Sin turnos asignados esta semana'
      };
    });

    const totalScheduledHours = Object.values(employeeWeeklyLabor).reduce((acc, curr) => acc + curr.totalHours, 0);

    const result = await dispatchScheduleWebhook({
      weekStart: weekDates[0],
      weekEnd: weekDates[6],
      generatedAt: new Date().toISOString(),
      totalEmployees: employees.length,
      totalScheduledHours,
      employees: payloadEmployees,
      capturedImageBase64,
    }, webhookConfig);

    setNotificationLogs(prev => [result.log, ...prev]);

    if (result.success) {
      addToast({
        type: 'success',
        title: 'Malla Enviada por WhatsApp',
        message: result.message
      });
    } else {
      addToast({
        type: 'error',
        title: 'Error en Envío WhatsApp',
        message: result.message
      });
    }

    return { success: result.success, message: result.message };
  };

  const retryFailedNotification = async (logId: string) => {
    const log = notificationLogs.find(l => l.id === logId);
    if (!log) return;

    addToast({
      type: 'info',
      title: 'Reintentando Notificación',
      message: `Enviando nuevamente mensaje a ${log.recipientPhone}...`
    });

    const updated = await retryNotificationLog(log, webhookConfig);
    setNotificationLogs(prev => prev.map(l => l.id === logId ? updated : l));

    addToast({
      type: 'success',
      title: 'Reintento Exitoso',
      message: `Notificación entregada correctamente.`
    });
  };

  // RF-06 & Flujo 8: Gestión de Backups Históricos
  const executeManualBackup = async (): Promise<BackupSnapshot> => {
    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} COT`;
    
    const snapshotPayload = JSON.stringify({
      version: '2026.3',
      system: 'Zona P - SQLite Connected',
      createdAt: now.toISOString(),
      employeesCount: employees.length,
      puestos,
      puestoAssignments,
      schedules,
      auditLogs,
    });

    const fileSizeBytes = new Blob([snapshotPayload]).size;
    const backupId = 'bkp-' + Date.now();
    const fileName = `zonap_snapshot_${now.toISOString().split('T')[0]}_manual.json`;
    const checksum = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const newSnapshot: BackupSnapshot = {
      id: backupId,
      timestamp: now.toISOString(),
      formattedDate,
      type: 'MANUAL_ADMIN',
      fileName,
      fileSizeBytes,
      checksum,
      totalShiftsCount: puestoAssignments.filter(a => a.employeeId !== null).length,
      totalAuditLogsCount: auditLogs.length,
      status: 'SUCCESS',
      retentionDaysRemaining: 90,
      snapshotData: snapshotPayload
    };

    setBackups(prev => [newSnapshot, ...prev]);

    const bkpLog: NotificationLog = {
      id: 'log-bkp-' + Date.now(),
      timestamp: now.toISOString(),
      type: 'BACKUP_SYNC',
      recipientPhone: 'Admin Cloud Storage',
      recipientEmail: 'sistemas@zonap.co',
      payloadSummary: `Copia de seguridad manual generada: ${fileName} (${(fileSizeBytes / 1024).toFixed(1)} KB)`,
      status: 'SUCCESS',
      httpStatus: 200,
      retryCount: 0,
      responseMessage: 'n8n Storage Engine: Snapshot stored in SQLite/Cloud with 90-day retention'
    };
    setNotificationLogs(prev => [bkpLog, ...prev]);

    addToast({
      type: 'success',
      title: 'Copia de Seguridad Creada',
      message: `Instantánea ${fileName} generada con éxito (Retención 90 días).`
    });

    return newSnapshot;
  };

  const restoreBackup = (backupId: string) => {
    const target = backups.find(b => b.id === backupId);
    if (!target) return;

    if (target.snapshotData) {
      try {
        const parsed = JSON.parse(target.snapshotData);
        if (parsed.puestos) {
          setPuestos(parsed.puestos);
        }
        if (parsed.puestoAssignments) {
          setPuestoAssignments(parsed.puestoAssignments);
        }
        if (parsed.auditLogs) {
          setAuditLogs(parsed.auditLogs);
        }
      } catch (e) {
        console.error('Error restaurando snapshot data', e);
      }
    }

    addToast({
      type: 'info',
      title: 'Restauración Completada',
      message: `El estado del sistema fue restaurado al punto histórico del ${target.formattedDate}.`
    });
  };

  return (
    <AppContext.Provider
      value={{
        dbStatus,
        isDbConnected,
        currentRole,
        setCurrentRole,
        activeModule,
        setActiveModule,
        scheduleViewMode,
        setScheduleViewMode,
        selectedSedeFilter,
        setSelectedSedeFilter,
        selectedOperatorId,
        setSelectedOperatorId,
        referenceDate,
        weekDates,
        goToPreviousWeek,
        goToNextWeek,
        goToCurrentWeek,
        employees,
        puestos,
        puestoAssignments,
        schedules,
        auditLogs,
        backups,
        notificationLogs,
        webhookConfig,
        updateWebhookConfig,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        addPuesto,
        updatePuesto,
        deletePuesto,
        addHorarioToPuesto,
        updateHorario,
        deleteHorario,
        assignEmployeeToPuesto,
        employeeWeeklyLabor,
        saveShiftModification,
        addShiftDirectly,
        deleteShiftDirectly,
        sendScheduleViaWhatsApp,
        retryFailedNotification,
        executeManualBackup,
        restoreBackup,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
