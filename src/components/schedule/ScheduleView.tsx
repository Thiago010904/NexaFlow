// src/components/schedule/ScheduleView.tsx

import React, { useState, useRef } from 'react';
import { 
  Send, 
  Plus, 
  Clock, 
  AlertTriangle, 
  Moon, 
  Building2, 
  User, 
  Sparkles,
  Edit2,
  Trash2,
  Check,
  X,
  Layers,
  LayoutGrid,
  Users,
  ChevronRight,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Employee, Puesto, HorarioSlot, PuestoAssignment } from '../../types/index';
import { SEDES_ZONA_P } from '../../data/mockData';
import { getDayLabel, calculateShiftMinutes, minutesToHours } from '../../utils/colombianLaborEngine';
import { AssignSlotModal } from './AssignSlotModal';
import { PuestoModal } from './PuestoModal';
import { SendScheduleModal } from './SendScheduleModal';

export const ScheduleView: React.FC = () => {
  const {
    employees,
    puestos,
    puestoAssignments,
    weekDates,
    employeeWeeklyLabor,
    selectedSedeFilter,
    currentRole,
    updatePuesto,
    scheduleViewMode,
    setScheduleViewMode
  } = useApp();

  const gridRef = useRef<HTMLDivElement>(null);

  // Modals state
  const [selectedSlotForAssignment, setSelectedSlotForAssignment] = useState<{
    puesto: Puesto;
    horario: HorarioSlot;
    date: string;
    currentEmployeeId: string | null;
    currentNote?: string;
    isCoveredByNovelty?: boolean;
  } | null>(null);

  const [puestoModalState, setPuestoModalState] = useState<{
    isOpen: boolean;
    puestoToEdit?: Puesto;
  }>({ isOpen: false });

  const [isSendWhatsAppOpen, setIsSendWhatsAppOpen] = useState(false);

  // Inline Puesto renaming state
  const [inlineEditingPuestoId, setInlineEditingPuestoId] = useState<string | null>(null);
  const [inlinePuestoName, setInlinePuestoName] = useState('');

  const canEdit = currentRole === 'admin' || currentRole === 'coordinator';

  // Filter puestos by Sede
  const filteredPuestos = puestos.filter(p => {
    if (selectedSedeFilter === 'all') return true;
    return p.sedeId === selectedSedeFilter;
  });

  // Calculate day total hours across all puestos
  const dayColumnTotals = weekDates.map(dateStr => {
    let dayTotalMinutes = 0;
    puestoAssignments.forEach(asg => {
      if (asg.date === dateStr && asg.employeeId) {
        const puesto = puestos.find(p => p.id === asg.puestoId);
        if (puesto && (selectedSedeFilter === 'all' || puesto.sedeId === selectedSedeFilter)) {
          const horario = puesto.horarios.find(h => h.id === asg.horarioId);
          if (horario) {
            const { totalMinutes } = calculateShiftMinutes(horario.startTime, horario.endTime);
            dayTotalMinutes += totalMinutes;
          }
        }
      }
    });
    return minutesToHours(dayTotalMinutes);
  });

  const grandTotalWeekHours = dayColumnTotals.reduce((a, b) => a + b, 0);

  // Start inline editing of puesto name
  const handleStartInlineEdit = (p: Puesto, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canEdit) return;
    setInlineEditingPuestoId(p.id);
    setInlinePuestoName(p.name);
  };

  const handleSaveInlineEdit = (pId: string) => {
    if (inlinePuestoName.trim()) {
      updatePuesto(pId, { name: inlinePuestoName.trim() });
    }
    setInlineEditingPuestoId(null);
  };

  // Helper to check if a horario is active on a given day (0=Dom, 1=Lun, ..., 6=Sab)
  const isHorarioActiveOnDate = (horario: HorarioSlot, dateStr: string): boolean => {
    const parts = dateStr.split('-').map(Number);
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    const dayOfWeek = d.getDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
    return horario.activeDays.includes(dayOfWeek);
  };

  // Get employee object by id
  const getEmployeeById = (id: string | null): Employee | undefined => {
    if (!id) return undefined;
    return employees.find(e => e.id === id);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
      
      {/* Top Banner / Actions Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Malla de Turnos Operativa — Zona P
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              {filteredPuestos.length} Puestos Configurados
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Matriz de puestos y horarios con asignación de personal, control legal de 42h y franja nocturna (19:00 - 06:00)
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Toggle View Mode: Puestos vs Capacidad */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setScheduleViewMode('puestos')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all ${
                scheduleViewMode === 'puestos'
                  ? 'bg-white text-emerald-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Matriz por Puestos</span>
            </button>
            <button
              onClick={() => setScheduleViewMode('capacity')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all ${
                scheduleViewMode === 'capacity'
                  ? 'bg-white text-emerald-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Capacidad Operarios</span>
            </button>
          </div>

          {/* Button: Agregar Puesto (Editable por el Coordinador) */}
          {canEdit && (
            <button
              onClick={() => setPuestoModalState({ isOpen: true })}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
              title="Agregar un nuevo puesto a la cuadrilla"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>+ Agregar Puesto</span>
            </button>
          )}

          {/* Button: Enviar Malla por WhatsApp (Flujo 6 / RF-05) */}
          <button
            onClick={() => setIsSendWhatsAppOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
            title="Enviar Malla Semanal por WhatsApp vía n8n"
          >
            <Send className="w-4 h-4" />
            <span>Enviar Malla por WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="flex-1 p-6 overflow-x-auto" ref={gridRef}>
        
        {scheduleViewMode === 'puestos' ? (
          /* ==============================================================
             VISTA 1: MATRIZ POR PUESTOS (FORMATO ZONA P ORIGINAL)
             ============================================================== */
          <div className="min-w-[1150px] bg-white rounded-xl border border-slate-300 shadow-xs overflow-hidden">
            <table className="w-full border-collapse text-left text-xs">
              
              {/* Encabezado Verde Clásico de Zona P */}
              <thead>
                <tr className="bg-[#90EE90]/80 text-slate-900 border-b-2 border-slate-400 font-extrabold text-[12px]">
                  <th className="p-3 border-r border-slate-300 w-44 text-center">
                    Puestos
                  </th>
                  <th className="p-3 border-r border-slate-300 w-36 text-center">
                    Horario
                  </th>
                  {weekDates.map((dateStr) => {
                    const { dayName, dayNumber, isHolidayOrSunday } = getDayLabel(dateStr);
                    const isToday = dateStr === '2026-10-26';

                    return (
                      <th
                        key={dateStr}
                        className={`p-2.5 border-r last:border-r-0 border-slate-300 text-center font-bold ${
                          isToday ? 'bg-[#76df76]' : ''
                        }`}
                      >
                        <div className="leading-tight">
                          <span className="capitalize">{dayName.toLowerCase()}</span>
                        </div>
                        <div className="text-[11px] font-semibold text-slate-700">
                          {dayNumber}/2026
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              {/* Filas agrupadas por Puesto */}
              <tbody className="divide-y divide-slate-300">
                {filteredPuestos.map((puesto) => {
                  const numHorarios = puesto.horarios.length;
                  const sede = SEDES_ZONA_P[puesto.sedeId];

                  return puesto.horarios.map((horario, hIndex) => {
                    return (
                      <tr key={`${puesto.id}-${horario.id}`} className="hover:bg-slate-50/50 transition-colors">
                        
                        {/* Columna Puestos: Se renderiza con rowSpan sólo en la primera fila del Puesto */}
                        {hIndex === 0 && (
                          <td
                            rowSpan={numHorarios}
                            className="p-3 border-r-2 border-b-2 border-slate-300 bg-white align-middle text-center font-bold text-slate-900 select-none group/puesto"
                          >
                            <div className="flex flex-col items-center justify-center space-y-1">
                              {inlineEditingPuestoId === puesto.id ? (
                                <div className="flex items-center gap-1 w-full max-w-[150px]">
                                  <input
                                    type="text"
                                    autoFocus
                                    value={inlinePuestoName}
                                    onChange={(e) => setInlinePuestoName(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleSaveInlineEdit(puesto.id);
                                      if (e.key === 'Escape') setInlineEditingPuestoId(null);
                                    }}
                                    className="w-full text-xs font-bold border border-emerald-500 rounded px-1.5 py-0.5 text-slate-900 outline-none"
                                  />
                                  <button
                                    onClick={() => handleSaveInlineEdit(puesto.id)}
                                    className="p-1 text-emerald-700 hover:bg-emerald-50 rounded"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <div 
                                  onClick={(e) => handleStartInlineEdit(puesto, e)}
                                  className="cursor-pointer hover:text-emerald-700 flex items-center justify-center gap-1 text-xs font-extrabold"
                                  title="Clic para renombrar este puesto"
                                >
                                  <span>{puesto.name}</span>
                                  {canEdit && (
                                    <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover/puesto:opacity-100 transition-opacity" />
                                  )}
                                </div>
                              )}

                              <span className={`text-[9px] px-1.5 py-0.2 rounded border font-medium ${sede.colorBg} ${sede.colorText} ${sede.colorBorder}`}>
                                {sede.shortName.split(':')[0]}
                              </span>

                              {canEdit && (
                                <div className="pt-1 opacity-0 group-hover/puesto:opacity-100 transition-opacity flex items-center gap-1">
                                  <button
                                    onClick={() => setPuestoModalState({ isOpen: true, puestoToEdit: puesto })}
                                    className="text-[10px] text-slate-500 hover:text-emerald-700 underline"
                                  >
                                    Configurar
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        )}

                        {/* Columna Horario */}
                        <td className="p-2 border-r-2 border-slate-300 font-mono text-center font-bold text-slate-800 text-[11px] bg-slate-50/50">
                          <div className="flex items-center justify-center gap-1">
                            <span>{horario.startTime} - {horario.endTime}</span>
                          </div>
                        </td>

                        {/* 7 Columnas de Días */}
                        {weekDates.map((dateStr) => {
                          const isActive = isHorarioActiveOnDate(horario, dateStr);
                          const assignment = puestoAssignments.find(
                            asg => asg.puestoId === puesto.id && asg.horarioId === horario.id && asg.date === dateStr
                          );
                          const employee = assignment?.employeeId ? getEmployeeById(assignment.employeeId) : undefined;
                          const note = assignment?.customNote;
                          const isNovelty = assignment?.isCoveredByNovelty;

                          // Celda Inactiva (Fines de semana o días no operativos): Gris #C0C0C0
                          if (!isActive) {
                            return (
                              <td
                                key={dateStr}
                                onClick={() => {
                                  if (canEdit) {
                                    setSelectedSlotForAssignment({
                                      puesto,
                                      horario,
                                      date: dateStr,
                                      currentEmployeeId: assignment?.employeeId || null,
                                      currentNote: note,
                                      isCoveredByNovelty: isNovelty,
                                    });
                                  }
                                }}
                                className="p-1 border-r last:border-r-0 border-slate-300 bg-[#C0C0C0] text-center cursor-pointer hover:bg-slate-300 transition-colors"
                                title="Franja no programada para este día (Clic para asignar turno extraordinario)"
                              >
                                {employee ? (
                                  <div
                                    className="p-1.5 rounded text-xs font-bold truncate shadow-2xs"
                                    style={{
                                      backgroundColor: employee.colorBg || '#E2E8F0',
                                      color: employee.colorText || '#0F172A',
                                      border: `1px solid ${employee.colorBorder || '#CBD5E1'}`
                                    }}
                                  >
                                    {employee.name} {note ? <span className="text-[10px] text-red-600 font-bold ml-1">{note}</span> : null}
                                  </div>
                                ) : (
                                  <div className="h-6"></div>
                                )}
                              </td>
                            );
                          }

                          // Celda Activa: Con o sin operario asignado
                          return (
                            <td
                              key={dateStr}
                              onClick={() => {
                                if (canEdit) {
                                  setSelectedSlotForAssignment({
                                    puesto,
                                    horario,
                                    date: dateStr,
                                    currentEmployeeId: assignment?.employeeId || null,
                                    currentNote: note,
                                    isCoveredByNovelty: isNovelty,
                                  });
                                }
                              }}
                              className="p-1 border-r last:border-r-0 border-slate-300 text-center cursor-pointer hover:bg-slate-100 transition-colors group/cell"
                            >
                              {employee ? (
                                <div
                                  className={`p-1.5 rounded text-xs font-bold truncate transition-transform hover:scale-[1.02] shadow-2xs ${
                                    isNovelty ? 'ring-2 ring-purple-500' : ''
                                  }`}
                                  style={{
                                    backgroundColor: employee.colorBg || '#E0F2FE',
                                    color: employee.colorText || '#0369A1',
                                    border: `1px solid ${employee.colorBorder || '#BAE6FD'}`
                                  }}
                                  title={`${employee.name} (${horario.startTime}-${horario.endTime}) - Clic para cambiar`}
                                >
                                  <span>{employee.name}</span>
                                  {note && (
                                    <span className="ml-1 text-[10px] font-extrabold text-red-600">
                                      {note}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <div className="h-7 rounded border border-dashed border-slate-300 hover:border-emerald-400 hover:bg-emerald-50/50 flex items-center justify-center text-[10px] text-slate-400 font-medium">
                                  <span className="opacity-0 group-hover/cell:opacity-100">+ Asignar</span>
                                </div>
                              )}
                            </td>
                          );
                        })}

                      </tr>
                    );
                  });
                })}
              </tbody>

              {/* Pie de tabla con Totales de Horas por Día */}
              <tfoot>
                <tr className="bg-slate-100/90 border-t-2 border-slate-400 font-bold text-xs text-slate-900">
                  <td colSpan={2} className="p-3 text-center border-r-2 border-slate-300 font-extrabold text-slate-800">
                    TOTAL HORAS DIARIAS:
                  </td>
                  {dayColumnTotals.map((tot, idx) => (
                    <td key={idx} className="p-3 text-center border-r last:border-r-0 border-slate-300 font-extrabold">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-950 font-black">
                        {tot.toFixed(1)}h
                      </span>
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          /* ==============================================================
             VISTA 2: CAPACIDAD POR EMPLEADO (ESTILO EVERHOUR RESOURCE PLANNER)
             ============================================================== */
          <div className="min-w-[1050px] bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="grid grid-cols-[280px_repeat(7,1fr)] border-b border-slate-200 bg-slate-50/80 text-xs text-slate-600 font-semibold sticky top-0 z-20">
              <div className="p-3.5 border-r border-slate-200 flex items-center justify-between">
                <span className="uppercase tracking-wider text-[11px] font-bold text-slate-500">
                  Operario / Capacidad 42h
                </span>
                <span className="text-[10px] text-slate-400 font-normal">Norma 2026</span>
              </div>
              {weekDates.map((dateStr) => {
                const { dayName, dayNumber } = getDayLabel(dateStr);
                return (
                  <div key={dateStr} className="p-2.5 text-center border-r last:border-r-0 border-slate-200">
                    <span className="font-bold block">{dayName}</span>
                    <span className="text-[11px] text-slate-400">{dayNumber}</span>
                  </div>
                );
              })}
            </div>

            <div className="divide-y divide-slate-200">
              {employees.map((emp) => {
                const labor = employeeWeeklyLabor[emp.id] || { totalHours: 0, isOverLimit: false, overLimitHours: 0 };
                const capRatio = Math.min(100, (labor.totalHours / 42) * 100);

                return (
                  <div key={emp.id} className="grid grid-cols-[280px_repeat(7,1fr)] hover:bg-slate-50/50 transition-colors">
                    <div className="p-3.5 border-r border-slate-200 bg-white flex flex-col justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-xs"
                          style={{
                            backgroundColor: emp.colorBg || '#E2E8F0',
                            color: emp.colorText || '#0F172A',
                            border: `1px solid ${emp.colorBorder || '#CBD5E1'}`,
                          }}
                        >
                          {emp.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-xs text-slate-900 truncate">{emp.name}</p>
                          <p className="text-[10px] text-slate-500 truncate">{emp.role}</p>
                        </div>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-100">
                        <div className="flex justify-between text-[11px] mb-1 font-semibold">
                          <span className="text-slate-500">Capacidad semanal:</span>
                          <span className={labor.isOverLimit ? 'text-red-600 font-extrabold' : 'text-slate-800'}>
                            {labor.totalHours}h / 42h
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                          <div
                            className={`h-full rounded-full ${
                              labor.isOverLimit ? 'bg-red-500' : labor.totalHours >= 38 ? 'bg-amber-400' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${capRatio}%` }}
                          ></div>
                        </div>
                        {labor.isOverLimit && (
                          <span className="text-[10px] font-bold text-red-600 mt-1 block">
                            ⚠️ Supera 42h (+{labor.overLimitHours}h Extras)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Días para este empleado */}
                    {weekDates.map(dateStr => {
                      const empAssignments = puestoAssignments.filter(
                        asg => asg.employeeId === emp.id && asg.date === dateStr
                      );

                      return (
                        <div key={dateStr} className="p-1.5 border-r last:border-r-0 border-slate-200 min-h-[70px] space-y-1">
                          {empAssignments.map(asg => {
                            const p = puestos.find(pst => pst.id === asg.puestoId);
                            const h = p?.horarios.find(hr => hr.id === asg.horarioId);

                            return (
                              <div
                                key={asg.id}
                                className="p-1 rounded text-[10px] font-bold border border-slate-200 shadow-2xs truncate"
                                style={{
                                  backgroundColor: emp.colorBg || '#E0F2FE',
                                  color: emp.colorText || '#0369A1',
                                }}
                              >
                                {p?.name}: {h?.startTime}-{h?.endTime}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Bottom Bar: Resumen de Horas y Capacidad Legal 42h (2026) */}
      <div className="bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-bold text-slate-700 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-emerald-600" />
            Total Cuadrilla Semanal: <span className="text-emerald-800 font-extrabold">{grandTotalWeekHours.toFixed(1)} Horas</span>
          </span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-500">
            Normativa 2026: <strong>Tope 42h/semana</strong> • Franja Nocturna: <strong>19:00 - 06:00</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {canEdit && (
            <button
              onClick={() => setPuestoModalState({ isOpen: true })}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              + Agregar / Configurar Puesto
            </button>
          )}
        </div>
      </div>

      {/* MODALS */}
      {selectedSlotForAssignment && (
        <AssignSlotModal
          isOpen={Boolean(selectedSlotForAssignment)}
          onClose={() => setSelectedSlotForAssignment(null)}
          puesto={selectedSlotForAssignment.puesto}
          horario={selectedSlotForAssignment.horario}
          date={selectedSlotForAssignment.date}
          currentEmployeeId={selectedSlotForAssignment.currentEmployeeId}
          currentNote={selectedSlotForAssignment.currentNote}
          isCoveredByNovelty={selectedSlotForAssignment.isCoveredByNovelty}
        />
      )}

      {puestoModalState.isOpen && (
        <PuestoModal
          isOpen={puestoModalState.isOpen}
          onClose={() => setPuestoModalState({ isOpen: false, puestoToEdit: undefined })}
          puestoToEdit={puestoModalState.puestoToEdit}
        />
      )}

      {isSendWhatsAppOpen && (
        <SendScheduleModal
          isOpen={isSendWhatsAppOpen}
          onClose={() => setIsSendWhatsAppOpen(false)}
          gridElementRef={gridRef}
        />
      )}

    </div>
  );
};
