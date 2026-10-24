// src/components/schedule/PuestoModal.tsx

import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  Plus, 
  Trash2, 
  Clock, 
  Check, 
  CalendarDays,
  Shield,
  Layers
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Puesto, HorarioSlot } from '../../types/index';
import { SEDES_ZONA_P } from '../../data/mockData';

interface PuestoModalProps {
  isOpen: boolean;
  onClose: () => void;
  puestoToEdit?: Puesto;
}

export const PuestoModal: React.FC<PuestoModalProps> = ({
  isOpen,
  onClose,
  puestoToEdit,
}) => {
  const { addPuesto, updatePuesto, deletePuesto } = useApp();

  const isEditing = Boolean(puestoToEdit);

  const [name, setName] = useState(puestoToEdit?.name || '');
  const [sedeId, setSedeId] = useState<1 | 2 | 3>(puestoToEdit?.sedeId || 1);
  const [horarios, setHorarios] = useState<Array<Omit<HorarioSlot, 'id'> & { tempId: string }>>(
    puestoToEdit?.horarios.map(h => ({
      tempId: h.id,
      startTime: h.startTime,
      endTime: h.endTime,
      activeDays: h.activeDays,
      label: h.label
    })) || [
      { tempId: 't-1', startTime: '06:00', endTime: '13:00', activeDays: [1, 2, 3, 4, 5] },
      { tempId: 't-2', startTime: '13:00', endTime: '20:00', activeDays: [1, 2, 3, 4, 5] },
      { tempId: 't-3', startTime: '20:00', endTime: '24:00', activeDays: [1, 2, 3, 4, 5] },
    ]
  );

  if (!isOpen) return null;

  const handleAddHorario = () => {
    setHorarios(prev => [
      ...prev,
      {
        tempId: `t-${Date.now()}`,
        startTime: '08:00',
        endTime: '16:00',
        activeDays: [1, 2, 3, 4, 5],
      }
    ]);
  };

  const handleRemoveHorario = (tempId: string) => {
    setHorarios(prev => prev.filter(h => h.tempId !== tempId));
  };

  const handleUpdateHorarioTime = (tempId: string, field: 'startTime' | 'endTime', val: string) => {
    setHorarios(prev => prev.map(h => h.tempId === tempId ? { ...h, [field]: val } : h));
  };

  const handleToggleDay = (tempId: string, dayNum: number) => {
    setHorarios(prev => prev.map(h => {
      if (h.tempId === tempId) {
        const hasDay = h.activeDays.includes(dayNum);
        const newDays = hasDay 
          ? h.activeDays.filter(d => d !== dayNum)
          : [...h.activeDays, dayNum];
        return { ...h, activeDays: newDays.sort() };
      }
      return h;
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (isEditing && puestoToEdit) {
      updatePuesto(puestoToEdit.id, {
        name: name.trim(),
        sedeId,
        horarios: horarios.map((h, i) => ({
          id: h.tempId.startsWith('t-') ? `h-${Date.now()}-${i}` : h.tempId,
          startTime: h.startTime,
          endTime: h.endTime,
          activeDays: h.activeDays,
          label: h.label,
        }))
      });
    } else {
      addPuesto({
        name: name.trim(),
        sedeId,
        horarios: horarios.map(h => ({
          startTime: h.startTime,
          endTime: h.endTime,
          activeDays: h.activeDays,
          label: h.label,
        }))
      });
    }

    onClose();
  };

  const handleDelete = () => {
    if (puestoToEdit && confirm(`¿Seguro que deseas eliminar el puesto "${puestoToEdit.name}" y sus turnos?`)) {
      deletePuesto(puestoToEdit.id);
      onClose();
    }
  };

  const dayShortLabels = [
    { num: 1, label: 'L' },
    { num: 2, label: 'M' },
    { num: 3, label: 'X' },
    { num: 4, label: 'J' },
    { num: 5, label: 'V' },
    { num: 6, label: 'S' },
    { num: 0, label: 'D' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-emerald-600">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                {isEditing ? `Editar Puesto: ${puestoToEdit?.name || ''}` : 'Crear Nuevo Puesto Operativo'}
              </h3>
              <p className="text-xs text-slate-300">
                Configuración de la columna de puestos para la cuadrilla
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Puesto Name Input (Editable por el Coordinador) */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
              Nombre del Puesto <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: puesto # 1, Rondero, Puesto # 12 Privado, Entrada Principal..."
              className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Este nombre se mostrará en la columna izquierda de la malla de turnos y puede ser modificado por el coordinador en cualquier momento.
            </p>
          </div>

          {/* Sede selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Sede Principal
            </label>
            <div className="grid grid-cols-3 gap-2">
              {([1, 2, 3] as const).map((sId) => {
                const s = SEDES_ZONA_P[sId];
                const isSelected = sedeId === sId;
                return (
                  <button
                    type="button"
                    key={sId}
                    onClick={() => setSedeId(sId)}
                    className={`p-2 rounded-lg border text-xs font-semibold text-left transition-all ${
                      isSelected 
                        ? `${s.colorBg} ${s.colorBorder} ${s.colorText} ring-2 ring-emerald-500 font-bold`
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="truncate">{s.shortName}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Horarios (Franjas Horarias) */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Horarios y Franjas de Turno
                </label>
                <p className="text-[11px] text-slate-500">
                  Sub-filas asociadas a este puesto (ej: mañana, tarde, noche o fines de semana)
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddHorario}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Franja Horaria</span>
              </button>
            </div>

            <div className="space-y-2">
              {horarios.map((h, idx) => (
                <div key={h.tempId} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-400 text-xs w-4">#{idx + 1}</span>
                    <input
                      type="text"
                      value={h.startTime}
                      onChange={(e) => handleUpdateHorarioTime(h.tempId, 'startTime', e.target.value)}
                      placeholder="06:00"
                      className="w-16 text-center font-bold font-mono bg-white border border-slate-300 rounded px-1.5 py-1 text-slate-800 outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <span className="text-slate-400 font-bold">-</span>
                    <input
                      type="text"
                      value={h.endTime}
                      onChange={(e) => handleUpdateHorarioTime(h.tempId, 'endTime', e.target.value)}
                      placeholder="14:00"
                      className="w-16 text-center font-bold font-mono bg-white border border-slate-300 rounded px-1.5 py-1 text-slate-800 outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Active Days Pills (L M X J V S D) */}
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400 font-semibold mr-1">Días:</span>
                    {dayShortLabels.map(d => {
                      const isActive = h.activeDays.includes(d.num);
                      return (
                        <button
                          type="button"
                          key={d.num}
                          onClick={() => handleToggleDay(h.tempId, d.num)}
                          className={`w-5 h-5 rounded text-[10px] font-bold transition-all ${
                            isActive 
                              ? 'bg-emerald-600 text-white' 
                              : 'bg-white text-slate-400 border border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {d.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveHorario(h.tempId)}
                    disabled={horarios.length <= 1}
                    className="p-1 text-slate-400 hover:text-red-600 rounded disabled:opacity-30 ml-auto md:ml-0"
                    title="Eliminar franja"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            {isEditing ? (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar Puesto</span>
              </button>
            ) : <div></div>}

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>{isEditing ? 'Guardar Cambios' : 'Crear Puesto'}</span>
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
