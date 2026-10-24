// src/components/schedule/AssignSlotModal.tsx

import React, { useState } from 'react';
import { 
  X, 
  User, 
  Clock, 
  Calendar, 
  ShieldAlert, 
  AlertTriangle, 
  Check, 
  Search, 
  Trash2, 
  Sparkles,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Puesto, HorarioSlot, NoveltyReason } from '../../types/index';
import { calculateShiftMinutes, minutesToHours, formatMinutesToHourMin } from '../../utils/colombianLaborEngine';

interface AssignSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  puesto: Puesto;
  horario: HorarioSlot;
  date: string;
  currentEmployeeId: string | null;
  currentNote?: string;
  isCoveredByNovelty?: boolean;
}

const NOVELTY_REASONS: NoveltyReason[] = [
  'Calamidad doméstica',
  'Inclemencias del clima',
  'Fuerza mayor',
  'Ausentismo',
  'Otro',
];

export const AssignSlotModal: React.FC<AssignSlotModalProps> = ({
  isOpen,
  onClose,
  puesto,
  horario,
  date,
  currentEmployeeId,
  currentNote = '',
  isCoveredByNovelty = false,
}) => {
  const { 
    employees, 
    employeeWeeklyLabor, 
    assignEmployeeToPuesto,
    schedules,
    currentRole
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmpId, setSelectedEmpId] = useState<string | null>(currentEmployeeId);
  const [customNote, setCustomNote] = useState(currentNote);
  const [isNovelty, setIsNovelty] = useState(isCoveredByNovelty);
  const [noveltyReason, setNoveltyReason] = useState<NoveltyReason>('Inclemencias del clima');
  const [noveltyNotes, setNoveltyNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Shift duration in hours
  const { totalMinutes, nocturnalMinutes } = calculateShiftMinutes(horario.startTime, horario.endTime);
  const shiftHours = minutesToHours(totalMinutes);
  const nocturnalHours = minutesToHours(nocturnalMinutes);

  // Filter employees by search
  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.cedula.includes(searchTerm) ||
    emp.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await assignEmployeeToPuesto({
        puestoId: puesto.id,
        horarioId: horario.id,
        date,
        employeeId: selectedEmpId,
        customNote: customNote.trim() || undefined,
        isCoveredByNovelty: isNovelty,
        reason: isNovelty ? noveltyReason : undefined,
        notes: isNovelty ? noveltyNotes : undefined,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnassign = async () => {
    setIsSubmitting(true);
    try {
      await assignEmployeeToPuesto({
        puestoId: puesto.id,
        horarioId: horario.id,
        date,
        employeeId: null,
        customNote: undefined,
        isCoveredByNovelty: false,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="bg-emerald-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-emerald-700">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Asignar Operario al Turno</h3>
              <p className="text-xs text-emerald-100">
                {puesto.name} • {horario.startTime} - {horario.endTime} ({shiftHours}h)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-100 hover:text-white hover:bg-emerald-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Shift Details Banner */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-slate-800">Fecha: {date}</span>
              <span className="block text-[11px] text-slate-500">Puesto: {puesto.name}</span>
            </div>
            <div className="text-right">
              <span className="font-extrabold text-slate-900 text-sm">{horario.startTime} – {horario.endTime}</span>
              {nocturnalHours > 0 && (
                <span className="block text-[10px] text-purple-700 font-semibold">
                  🌙 {nocturnalHours}h en franja nocturna
                </span>
              )}
            </div>
          </div>

          {/* Search Employee */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar operario por nombre, cédula o cargo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
            />
          </div>

          {/* Employees List with Real-time Capacity 42h */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Seleccionar Operario (Control de Capacidad 42h)
            </label>
            <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-56 overflow-y-auto bg-white">
              {filteredEmployees.map((emp) => {
                const labor = employeeWeeklyLabor[emp.id] || { totalHours: 0, isOverLimit: false };
                const currentWeeklyHours = labor.totalHours;
                const isSelected = selectedEmpId === emp.id;
                const projectedHours = isSelected 
                  ? currentWeeklyHours 
                  : currentWeeklyHours + shiftHours;
                const wouldExceed = projectedHours > 42;

                return (
                  <div
                    key={emp.id}
                    onClick={() => setSelectedEmpId(emp.id)}
                    className={`p-2.5 flex items-center justify-between cursor-pointer transition-colors text-xs ${
                      isSelected 
                        ? 'bg-emerald-50/80 border-l-4 border-l-emerald-600' 
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-xs"
                        style={{
                          backgroundColor: emp.colorBg || '#E2E8F0',
                          color: emp.colorText || '#0F172A',
                          border: `1px solid ${emp.colorBorder || '#CBD5E1'}`,
                        }}
                      >
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{emp.name}</p>
                        <p className="text-[10px] text-slate-500">{emp.role} • CC: {emp.cedula}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-1.5 justify-end">
                        <span className="font-bold text-slate-700">
                          {currentWeeklyHours}h / 42h
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                      </div>
                      {wouldExceed && !isSelected && (
                        <span className="text-[10px] text-red-600 font-bold block">
                          ⚠️ Superaría 42h ({projectedHours.toFixed(1)}h)
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Optional Note (e.g. 08-15) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nota o Ajuste de Horario en Celda (Opcional, ej: "08-15" o "Refuerzo"):
            </label>
            <input
              type="text"
              placeholder="Ej: 08-15 o Relevo"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Novelty / Reemplazo Checkbox (RF-03) */}
          <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-200 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-purple-900">
              <input
                type="checkbox"
                checked={isNovelty}
                onChange={(e) => setIsNovelty(e.target.checked)}
                className="h-4 w-4 text-purple-600 rounded border-purple-300 focus:ring-purple-500"
              />
              <span>Marcar como Reemplazo o Novedad Operativa (RF-03)</span>
            </label>

            {isNovelty && (
              <div className="space-y-2 pt-2 border-t border-purple-200">
                <div>
                  <label className="block text-[11px] font-bold text-purple-800 uppercase tracking-wider mb-1">
                    Motivo de la Novedad
                  </label>
                  <select
                    value={noveltyReason}
                    onChange={(e) => setNoveltyReason(e.target.value as NoveltyReason)}
                    className="w-full text-xs font-semibold bg-white border border-purple-300 rounded-lg p-2 text-purple-950 outline-none"
                  >
                    {NOVELTY_REASONS.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-purple-800 uppercase tracking-wider mb-1">
                    Observaciones para Bitácora
                  </label>
                  <input
                    type="text"
                    value={noveltyNotes}
                    onChange={(e) => setNoveltyNotes(e.target.value)}
                    placeholder="Detalle de la novedad para auditoría..."
                    className="w-full text-xs bg-white border border-purple-300 rounded-lg p-2 text-purple-950 outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            {currentEmployeeId ? (
              <button
                type="button"
                onClick={handleUnassign}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Desasignar</span>
              </button>
            ) : <div></div>}

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSubmitting || !selectedEmpId}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Guardando...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Confirmar Asignación</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
