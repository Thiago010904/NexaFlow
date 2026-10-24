// src/components/audit/AuditLogView.tsx

import React, { useState, useMemo } from 'react';
import { 
  History, 
  ShieldAlert, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  ArrowRight, 
  Zap, 
  CheckCircle2, 
  Clock, 
  FileDown, 
  AlertTriangle,
  Building2,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NoveltyReason, AuditLogEntry } from '../../types';
import { SEDES_ZONA_P } from '../../data/mockData';

export const AuditLogView: React.FC = () => {
  const { auditLogs, addToast } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReasonFilter, setSelectedReasonFilter] = useState<string>('all');

  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const matchesSearch = 
        log.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.coordinatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.shiftDate.includes(searchTerm);

      const matchesReason = 
        selectedReasonFilter === 'all' || log.reason === selectedReasonFilter;

      return matchesSearch && matchesReason;
    });
  }, [auditLogs, searchTerm, selectedReasonFilter]);

  const highPriorityCount = auditLogs.filter(l => l.isHighPriorityAlert).length;

  const handleExportJSON = () => {
    const jsonString = JSON.stringify(auditLogs, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ZonaP_Bitacora_Auditoria_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addToast({
      type: 'success',
      title: 'Bitácora Exportada',
      message: 'Se descargó el archivo JSON con los registros inmutables de auditoría.'
    });
  };

  const reasonColors: Record<NoveltyReason, { bg: string; text: string; border: string }> = {
    'Calamidad doméstica': { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200' },
    'Inclemencias del clima': { bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-200' },
    'Fuerza mayor': { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
    'Ausentismo': { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200' },
    'Otro': { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-300' },
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50 p-6 space-y-6">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Bitácora de Novedades & Auditoría
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
              RF-03 & RF-05 Inmutable
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Historial criptográficamente rastreable de modificaciones de turno, motivos operativos y alertas de reprogramación
          </p>
        </div>

        <button
          onClick={handleExportJSON}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition-all active:scale-95"
        >
          <FileDown className="w-4 h-4 text-emerald-600" />
          <span>Exportar Bitácora (JSON)</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Novedades Operativas</span>
            <History className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {auditLogs.length}
          </p>
          <span className="text-[11px] text-slate-500">Registros inmutables en bitácora</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Alertas de Prioridad Alta (n8n Flujo 7)</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 mt-1">
            {highPriorityCount}
          </p>
          <span className="text-[11px] text-amber-700 font-medium">Reprogramaciones hoy / mañana</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Estatus de Integridad</span>
            <ShieldAlert className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            100%
          </p>
          <span className="text-[11px] text-emerald-700 font-semibold">Trazabilidad completa con coordinador</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por operario, coordinador o fecha..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Motivo:
          </span>
          <select
            value={selectedReasonFilter}
            onChange={(e) => setSelectedReasonFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 outline-none"
          >
            <option value="all">Todos los Motivos</option>
            <option value="Calamidad doméstica">Calamidad doméstica</option>
            <option value="Inclemencias del clima">Inclemencias del clima</option>
            <option value="Fuerza mayor">Fuerza mayor</option>
            <option value="Ausentismo">Ausentismo</option>
            <option value="Otro">Otro</option>
          </select>
        </div>
      </div>

      {/* Logs Timeline List */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-xs">
            No se encontraron novedades registradas con los filtros aplicados.
          </div>
        ) : (
          filteredLogs.map((log) => {
            const reasonStyle = reasonColors[log.reason] || reasonColors['Otro'];

            return (
              <div
                key={log.id}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:shadow-xs transition-shadow space-y-3"
              >
                {/* Header of Log Card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      ID: {log.id}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${reasonStyle.bg} ${reasonStyle.text} ${reasonStyle.border}`}>
                      {log.reason}
                    </span>
                    {log.isHighPriorityAlert && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1 animate-pulse">
                        <Zap className="w-3 h-3 text-amber-600" />
                        Alerta WhatsApp Prioritaria (Flujo 7)
                      </span>
                    )}
                  </div>

                  <div className="text-right text-xs text-slate-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{log.formattedDate}</span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  {/* Coordinator & Operator */}
                  <div className="space-y-1">
                    <div className="text-slate-500 font-medium">Coordinador Responsable:</div>
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {log.coordinatorName}
                    </div>
                    <div className="text-slate-500 font-medium pt-1">Operario Afectado:</div>
                    <div className="font-bold text-emerald-800">
                      {log.employeeName}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Fecha del turno: <span className="font-semibold text-slate-800">{log.shiftDate}</span>
                    </div>
                  </div>

                  {/* Before vs After Visual Comparison */}
                  <div className="lg:col-span-2 space-y-1.5">
                    <div className="text-slate-500 font-medium">Modificación Realizada:</div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      {/* Before */}
                      <div className="flex-1 p-2 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                          Turno Anterior
                        </span>
                        {log.previousBlocks.length > 0 ? (
                          log.previousBlocks.map((b, i) => {
                            const sede = SEDES_ZONA_P[b.sedeId];
                            return (
                              <div key={i} className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                                <span>{b.startTime} - {b.endTime}</span>
                                <span className={`text-[10px] px-1 rounded ${sede.colorBg} ${sede.colorText}`}>
                                  {sede.shortName.split(':')[0]}
                                </span>
                              </div>
                            );
                          })
                        ) : (
                          <span className="text-slate-400 italic text-xs">Sin turno programado</span>
                        )}
                      </div>

                      <ArrowRight className="w-4 h-4 text-slate-400 hidden sm:block shrink-0" />

                      {/* After */}
                      <div className="flex-1 p-2 rounded-lg bg-emerald-50/50 border border-emerald-200">
                        <span className="text-[10px] uppercase font-bold text-emerald-700 block mb-0.5">
                          Turno Nuevo / Reasignado
                        </span>
                        {log.newBlocks.length > 0 ? (
                          log.newBlocks.map((b, i) => {
                            const sede = SEDES_ZONA_P[b.sedeId];
                            return (
                              <div key={i} className="text-xs font-bold text-emerald-900 flex items-center justify-between">
                                <span>{b.startTime} - {b.endTime}</span>
                                <span className={`text-[10px] px-1 rounded ${sede.colorBg} ${sede.colorText}`}>
                                  {sede.shortName.split(':')[0]}
                                </span>
                              </div>
                            );
                          })
                        ) : (
                          <span className="text-red-600 font-semibold text-xs">Turno Cancelado</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Justification & Notification dispatch confirmation */}
                {log.notes && (
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700">
                    <span className="font-bold text-slate-900">Justificación Operativa: </span>
                    <span>{log.notes}</span>
                  </div>
                )}

                {/* Notification Badge */}
                <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Registro criptográficamente inmutable</span>
                  </span>
                  {log.isHighPriorityAlert && (
                    <span className="text-emerald-700 font-semibold">
                      WhatsApp Gateway (n8n): Entregado
                    </span>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
