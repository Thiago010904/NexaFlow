// src/services/apiService.ts
/**
 * Servicio de Comunicación con la Base de Datos SQLite (database/zonap.db)
 * Conecta las acciones de la interfaz React con el backend de SQLite
 */

import { Employee, Puesto, PuestoAssignment, AuditLogEntry, BackupSnapshot } from '../types/index';

export interface DbStatusResponse {
  connected: boolean;
  engine: string;
  databaseFile: string;
  absolutePath: string;
  counts: {
    sedes: number;
    empleados: number;
    puestos: number;
    horarios: number;
    asignaciones: number;
    bitacora: number;
  };
}

export interface InitialDataResponse {
  sedes: any[];
  empleados: Employee[];
  puestos: Puesto[];
  asignaciones: PuestoAssignment[];
  bitacora: AuditLogEntry[];
  backups: BackupSnapshot[];
}

/**
 * Consulta el estado de conexión con SQLite
 */
export async function checkDbConnection(): Promise<DbStatusResponse | null> {
  try {
    const res = await fetch('/api/status', {
      headers: { 'X-ZonaP-Application': 'NexaFlow-Frontend' }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}

/**
 * Carga todo el estado inicial desde database/zonap.db
 */
export async function fetchInitialDataFromDb(): Promise<InitialDataResponse | null> {
  try {
    const res = await fetch('/api/initial-data', {
      headers: { 'X-ZonaP-Application': 'NexaFlow-Frontend' }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}

/**
 * Persiste la creación o actualización de un Empleado en SQLite
 */
export async function persistEmployeeInDb(employee: Employee): Promise<boolean> {
  try {
    const res = await fetch(`/api/empleados/${employee.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employee)
    });
    return res.ok;
  } catch (err) {
    console.warn('[apiService] Fallo persistiendo empleado en SQLite:', err);
    return false;
  }
}

/**
 * Elimina un Empleado en SQLite
 */
export async function deleteEmployeeInDb(employeeId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/empleados/${employeeId}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (err) {
    console.warn('[apiService] Fallo eliminando empleado en SQLite:', err);
    return false;
  }
}

/**
 * Persiste la creación o actualización de un Puesto en SQLite
 */
export async function persistPuestoInDb(puesto: Puesto): Promise<boolean> {
  try {
    const res = await fetch(`/api/puestos/${puesto.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(puesto)
    });
    return res.ok;
  } catch (err) {
    console.warn('[apiService] Fallo persistiendo puesto en SQLite:', err);
    return false;
  }
}

/**
 * Elimina un Puesto en SQLite
 */
export async function deletePuestoInDb(puestoId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/puestos/${puestoId}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (err) {
    console.warn('[apiService] Fallo eliminando puesto en SQLite:', err);
    return false;
  }
}

/**
 * Persiste la asignación de un operario a un puesto, horario y día en SQLite
 */
export async function persistAsignacionInDb(asg: {
  puestoId: string;
  horarioId: string;
  date: string;
  employeeId: string | null;
  customNote?: string;
  isCoveredByNovelty?: boolean;
}): Promise<boolean> {
  try {
    const res = await fetch('/api/asignaciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(asg)
    });
    return res.ok;
  } catch (err) {
    console.warn('[apiService] Fallo persistiendo asignación en SQLite:', err);
    return false;
  }
}

/**
 * Registra una novedad inmutable en la bitácora de SQLite (RF-03)
 */
export async function persistBitacoraInDb(entry: Partial<AuditLogEntry>): Promise<boolean> {
  try {
    const res = await fetch('/api/bitacora', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    });
    return res.ok;
  } catch (err) {
    console.warn('[apiService] Fallo persistiendo bitácora en SQLite:', err);
    return false;
  }
}
