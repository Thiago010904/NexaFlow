// src/components/schedule/SendScheduleModal.tsx

import React, { useState } from 'react';
import { 
  X, 
  Send, 
  CheckCircle2, 
  Smartphone, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  AlertCircle,
  FileSpreadsheet,
  Clock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { maskPhoneNumber, maskEmail } from '../../services/n8nIntegrationService';

interface SendScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  gridElementRef: React.RefObject<HTMLDivElement | null>;
}

export const SendScheduleModal: React.FC<SendScheduleModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { 
    employees, 
    employeeWeeklyLabor, 
    weekDates, 
    sendScheduleViaWhatsApp, 
    webhookConfig,
    updateWebhookConfig
  } = useApp();

  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState<boolean | null>(null);

  if (!isOpen) return null;

  const totalHours = Object.values(employeeWeeklyLabor).reduce((acc, c) => acc + c.totalHours, 0);

  const handleSend = async () => {
    setIsSending(true);
    setSendSuccess(null);

    try {
      const res = await sendScheduleViaWhatsApp();
      setSendSuccess(res.success);
      if (res.success) {
        setTimeout(() => {
          onClose();
        }, 1800);
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="bg-emerald-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-emerald-700">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Enviar Malla por WhatsApp</h3>
              <p className="text-xs text-emerald-100">
                Flujo 6 (RF-05) • Integración Gateway n8n
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
          {/* Summary Box */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-[11px] text-slate-500 font-medium">Semana</p>
              <p className="text-xs font-bold text-slate-800">{weekDates[0]} al {weekDates[6]}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-medium">Destinatarios</p>
              <p className="text-xs font-bold text-slate-800">{employees.length} Operarios</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-medium">Horas Totales</p>
              <p className="text-xs font-bold text-emerald-700">{totalHours.toFixed(1)}h</p>
            </div>
          </div>

          {/* Habeas Data RNF-02 Toggle */}
          <div className="p-3 rounded-lg bg-slate-100/70 border border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <div>
                <span className="font-semibold text-slate-800">Protección de Datos (RNF-02):</span>
                <span className="text-[11px] text-slate-500 block">Enmascarar teléfonos y correos en vista pública</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => updateWebhookConfig({ enableDataPrivacyMasking: !webhookConfig.enableDataPrivacyMasking })}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50"
            >
              {webhookConfig.enableDataPrivacyMasking ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Enmascarado</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  <span>Visible</span>
                </>
              )}
            </button>
          </div>

          {/* Operators Delivery List */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Destinatarios de la Plantilla WhatsApp
            </h4>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl max-h-52 overflow-y-auto bg-white">
              {employees.map((emp) => {
                const labor = employeeWeeklyLabor[emp.id];
                const displayPhone = webhookConfig.enableDataPrivacyMasking 
                  ? maskPhoneNumber(emp.phone) 
                  : emp.phone;

                return (
                  <div key={emp.id} className="p-2.5 flex items-center justify-between hover:bg-slate-50 text-xs">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{emp.name}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{displayPhone}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-800">{labor ? `${labor.totalHours}h` : '0h'}</span>
                      {labor?.isOverLimit && (
                        <span className="block text-[10px] text-red-600 font-semibold">Excede 42h</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Webhook endpoint info */}
          <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
            <span className="truncate">
              Webhook: <span className="font-mono text-slate-700">{webhookConfig.sendScheduleUrl}</span>
            </span>
            <span className="shrink-0 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
              POST JSON
            </span>
          </div>

          {/* Result message */}
          {sendSuccess === true && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>¡Malla semanal transmitida con éxito a n8n para distribución masiva!</span>
            </div>
          )}

          {/* Footer buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSending}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={isSending}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
            >
              {isSending ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Procesando n8n...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Enviar a WhatsApp Ahora</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
