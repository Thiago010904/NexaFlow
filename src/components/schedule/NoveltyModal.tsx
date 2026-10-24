// src/components/schedule/NoveltyModal.tsx

import React, { useState } from 'react';
import { 
  X, 
  AlertTriangle, 
  Clock, 
  Building2, 
  ShieldAlert, 
  Send,
  Calendar,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Employee, ShiftBlock, NoveltyReason } from '../../types';
import { SEDES_ZONA_P } from '../../data/mockData';
import { calculateShiftMinutes, minutesToHours } from '../../utils/colombianLaborEngine';

interface NoveltyModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee;
  date: string;
  existingBlocks: ShiftBlock[];
  selectedBlockId?: string; // if editing an existing block
}

const NOVELTY_REASONS: Array<{ value: NoveltyReason; label: string; description: string }> = [
  { 
    value: 'Calamidad doméstica', 
    label: 'Calamidad doméstica', 
    description: 'Suceso familiar grave que amerita ausencia justificada del colaborador.' 
  },
  { 
    value: 'Inclemencias del clima', 
    label: 'Inclemencias del clima', 
    description: 'Lluvias torrenciales o contingencias climáticas que alteran la operación del parqueadero.' 
  },
  { 
    value: 'Fuerza mayor', 
    label: 'Fuerza mayor o Caso fortuito', 
    description: 'Fallas técnicas, imprevistos en barreras de acceso o siniestros imprevistos.' 
  },
  { 
    value: 'Ausentismo', 
    label: 'Ausentismo / No presentación', 
    description: 'El colaborador no se presentó a su turno programado sin previo aviso.' 
  },
  { 
    value: 'Otro', 
    label: 'Otro requerimiento operativo', 
    description: 'Reasignación de sedes por picos de tráfico, eventos masivos o convenios comerciales.' 
  },
];

export const NoveltyModal: React.FC<NoveltyModalProps> = ({
  isOpen,
  onClose,
  employee,
  date,
  existingBlocks,
  selectedBlockId,
}) => {
  const { saveShiftModification, currentRole } = useApp();

  // Find target block or create new one
  const targetBlock = selectedBlockId 
    ? existingBlocks.find(b => b.id === selectedBlockId) 
    : undefined;

  const [reason, setReason] = useState<NoveltyReason>('Inclemencias del clima');
  const [notes, setNotes] = useState<string>('');
  const [sedeId, setSedeId] = useState<1 | 2 | 3>(targetBlock ? targetBlock.sedeId : employee.sedeDefault);
  const [startTime, setStartTime] = useState<string>(targetBlock ? targetBlock.startTime : '06:00');
  const [endTime, setEndTime] = useState<string>(targetBlock ? targetBlock.endTime : '14:00');
  const [blockNotes, setBlockNotes] = useState<string>(targetBlock?.notes || '');
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  // Check if affects today (2026-10-19) or tomorrow (2026-10-20)
  const isHighPriority = date === '2026-10-19' || date === '2026-10-20';

  // Calculate new duration
  const { totalMinutes, diurnalMinutes, nocturnalMinutes } = calculateShiftMinutes(startTime, endTime);
  const calculatedHours = minutesToHours(totalMinutes);
  const nocturnalHours = minutesToHours(nocturnalMinutes);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      alert('Debe seleccionar obligatoriamente un motivo de novedad (RF-03).');
      return;
    }

    setIsSubmitting(true);

    try {
      let newBlocks: ShiftBlock[] = [];

      if (!isDeleting) {
        if (selectedBlockId) {
          // Editing existing block
          newBlocks = existingBlocks.map(b => {
            if (b.id === selectedBlockId) {
              return {
                ...b,
                sedeId,
                startTime,
                endTime,
                notes: blockNotes,
              };
            }
            return b;
          });
        } else {
          // Adding new block to this date (supports multi-sede)
          const newBlock: ShiftBlock = {
            id: 'b-' + Date.now(),
            sedeId,
            startTime,
            endTime,
            notes: blockNotes,
          };
          newBlocks = [...existingBlocks, newBlock];
        }
      } else {
        // Deleting block
        newBlocks = existingBlocks.filter(b => b.id !== selectedBlockId);
      }

      await saveShiftModification({
        employeeId: employee.id,
        date,
        previousBlocks: existingBlocks,
        newBlocks,
        reason,
        notes,
        coordinatorName: currentRole === 'coordinator' 
          ? 'Coordinador de Sede Zona P' 
          : 'Administrador del Sistema',
      });

      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {selectedBlockId ? 'Modificar Turno por Novedad' : 'Asignar Turno con Novedad'}
              </h3>
              <p className="text-xs text-slate-500">
                Registro inmutable de auditoría (RF-03)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Employee & Date Summary Bar */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                {employee.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-xs text-slate-800">{employee.name}</p>
                <p className="text-[11px] text-slate-500">CC: {employee.cedula}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {date}
              </span>
              <span className="text-[10px] text-emerald-600 font-medium">
                {isHighPriority ? '📅 Día en Curso / Próximo' : 'Semana de Operación'}
              </span>
            </div>
          </div>

          {/* High Priority Warning Banner (Flujo 7 n8n) */}
          {isHighPriority && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 flex items-start gap-2.5 text-xs text-amber-900">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Alerta Prioritaria n8n (Flujo 7):</p>
                <p className="text-amber-800 text-[11px] mt-0.5">
                  Este cambio afecta el turno de hoy o mañana. Al confirmar, se disparará de forma inmediata el webhook a WhatsApp para notificar al operario.
                </p>
              </div>
            </div>
          )}

          {/* Mandatory Novelty Reason (RF-03) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              Motivo de la Novedad Operativa <span className="text-red-500">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as NoveltyReason)}
              required
              className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            >
              {NOVELTY_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 italic">
              {NOVELTY_REASONS.find(r => r.value === reason)?.description}
            </p>
          </div>

          {/* Action Choice: Modify or Cancel/Delete */}
          {selectedBlockId && (
            <div className="flex items-center gap-2 pt-1">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDeleting}
                  onChange={(e) => setIsDeleting(e.target.checked)}
                  className="rounded border-slate-300 text-red-600 focus:ring-red-500 h-4 w-4"
                />
                <span className={isDeleting ? 'text-red-600 font-bold' : ''}>
                  Cancelar/Eliminar este turno por la novedad indicada
                </span>
              </label>
            </div>
          )}

          {!isDeleting && (
            <div className="space-y-4 pt-2 border-t border-slate-200">
              {/* Parking Sede Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Sede de Operación (Multi-Sede)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {([1, 2, 3] as const).map((sId) => {
                    const sede = SEDES_ZONA_P[sId];
                    const isSelected = sedeId === sId;
                    return (
                      <button
                        type="button"
                        key={sId}
                        onClick={() => setSedeId(sId)}
                        className={`p-2.5 rounded-lg border text-xs font-semibold text-left transition-all ${
                          isSelected
                            ? `${sede.colorBg} ${sede.colorBorder} ${sede.colorText} ring-2 ring-emerald-500 shadow-xs`
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5" />
                          <span className="truncate">{sede.shortName}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Shift Hours with Colombian Labor Engine Preview */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Hora de Inicio
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                    className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Hora de Fin
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                    className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Shift calculation badge preview */}
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  Duración calculada:
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{calculatedHours}h totales</span>
                  {nocturnalHours > 0 && (
                    <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-semibold text-[10px]">
                      🌙 {nocturnalHours}h nocturnas (19:00-06:00)
                    </span>
                  )}
                </div>
              </div>

              {/* Shift Notes */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Detalle del Turno (Opcional)
                </label>
                <input
                  type="text"
                  value={blockNotes}
                  onChange={(e) => setBlockNotes(e.target.value)}
                  placeholder="Ej: Cobertura pico tarde / Barrera 2"
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>
          )}

          {/* Observations / Mandatory Audit Comments */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
              Observaciones / Justificación de Auditoría
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Explique el detalle de la novedad para el registro inmutable de auditoría..."
              className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
            />
          </div>

          {/* Footer buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 text-xs font-bold text-white rounded-lg shadow-sm flex items-center gap-1.5 transition-all ${
                isDeleting
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {isSubmitting ? (
                <span>Guardando...</span>
              ) : isDeleting ? (
                <span>Confirmar Eliminación con Novedad</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Guardar Novedad en Bitácora</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
