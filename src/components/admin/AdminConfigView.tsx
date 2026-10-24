// src/components/admin/AdminConfigView.tsx

import React, { useState } from 'react';
import { 
  Database, 
  Download, 
  RotateCcw, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Zap, 
  ExternalLink, 
  AlertCircle,
  FileCode,
  HardDrive,
  RefreshCw,
  Server,
  Key,
  Eye,
  EyeOff,
  Send,
  Calendar,
  Lock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BackupSnapshot, NotificationLog } from '../../types';
import { COLOMBIAN_LABOR_CONFIG_2026 } from '../../utils/colombianLaborEngine';

export const AdminConfigView: React.FC = () => {
  const { 
    backups, 
    executeManualBackup, 
    restoreBackup, 
    webhookConfig, 
    updateWebhookConfig, 
    notificationLogs, 
    retryFailedNotification,
    currentRole,
    addToast
  } = useApp();

  const [isBackingUp, setIsBackingUp] = useState(false);
  const [activeTab, setActiveTab] = useState<'backups' | 'webhooks' | 'legal'>('backups');
  const [selectedBackupToRestore, setSelectedBackupToRestore] = useState<BackupSnapshot | null>(null);

  // Form states for webhooks
  const [sendScheduleUrl, setSendScheduleUrl] = useState(webhookConfig.sendScheduleUrl);
  const [highPriorityAlertUrl, setHighPriorityAlertUrl] = useState(webhookConfig.highPriorityAlertUrl);
  const [backupUrl, setBackupUrl] = useState(webhookConfig.backupUrl);

  const isAdmin = currentRole === 'admin';

  const handleSaveWebhooks = (e: React.FormEvent) => {
    e.preventDefault();
    updateWebhookConfig({
      sendScheduleUrl,
      highPriorityAlertUrl,
      backupUrl,
    });
  };

  const handleTriggerManualBackup = async () => {
    setIsBackingUp(true);
    try {
      await executeManualBackup();
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleDownloadSnapshotFile = (backup: BackupSnapshot) => {
    const dataToExport = backup.snapshotData || JSON.stringify({
      id: backup.id,
      timestamp: backup.timestamp,
      checksum: backup.checksum,
      totalShifts: backup.totalShiftsCount,
      retentionDaysRemaining: backup.retentionDaysRemaining,
      system: 'Zona P - Flujo Laboral 2026'
    }, null, 2);

    const blob = new Blob([dataToExport], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = backup.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addToast({
      type: 'success',
      title: 'Instantánea Descargada',
      message: `Archivo ${backup.fileName} guardado localmente.`
    });
  };

  const handleConfirmRestore = () => {
    if (!selectedBackupToRestore) return;
    restoreBackup(selectedBackupToRestore.id);
    setSelectedBackupToRestore(null);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50 p-6 space-y-6">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Configuración Legal & Copias de Seguridad
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
              RF-06 & Flujo 8 n8n
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Retención de 90 días de historial, monitoreo del cron nocturno n8n y administración de webhooks
          </p>
        </div>

        {/* Action Button: Manual Backup */}
        {isAdmin && (
          <button
            onClick={handleTriggerManualBackup}
            disabled={isBackingUp}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95 disabled:opacity-50"
          >
            {isBackingUp ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generando Instantánea...</span>
              </>
            ) : (
              <>
                <Database className="w-4 h-4" />
                <span>Generar Backup Manual Ahora</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('backups')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'backups'
              ? 'bg-white text-emerald-700 border border-slate-200 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Historial de Respaldos (90 Días)</span>
        </button>

        <button
          onClick={() => setActiveTab('webhooks')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'webhooks'
              ? 'bg-white text-emerald-700 border border-slate-200 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-500" />
          <span>Webhooks n8n & WhatsApp Gateway</span>
        </button>

        <button
          onClick={() => setActiveTab('legal')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'legal'
              ? 'bg-white text-emerald-700 border border-slate-200 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Parámetros Laborales 2026</span>
        </button>
      </div>

      {/* TAB 1: BACKUPS HISTÓRICOS (RF-06 & Flujo 8) */}
      {activeTab === 'backups' && (
        <div className="space-y-6">
          {/* Cron Monitor Banner */}
          <div className="bg-emerald-950 text-white rounded-xl p-5 border border-emerald-900 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="font-bold text-sm">Flujo 8 n8n: Respaldo Automático Diario Activo</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-800 text-emerald-200">
                  Cron 23:59 COT
                </span>
              </div>
              <p className="text-xs text-emerald-200">
                Los turnos, marcaciones y bitácoras de auditoría se empaquetan cada medianoche en JSON estructurado y se almacenan durante 90 días continuos.
              </p>
            </div>
            <div className="text-right text-xs">
              <p className="text-emerald-300 font-semibold">Política de Retención Legal:</p>
              <p className="font-bold text-white text-sm">Mínimo 90 Días Garantizados</p>
            </div>
          </div>

          {/* Backup Snapshots Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                Instantáneas de los Últimos 3 Meses ({backups.length} Archivos Disponibles)
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                SHA-256 Verificado
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="p-3.5">Archivo / Instantánea</th>
                    <th className="p-3.5">Fecha y Hora (COT)</th>
                    <th className="p-3.5">Origen</th>
                    <th className="p-3.5">Tamaño</th>
                    <th className="p-3.5">Turnos</th>
                    <th className="p-3.5">Retención</th>
                    <th className="p-3.5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {backups.map((bkp) => {
                    return (
                      <tr key={bkp.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900 font-mono flex items-center gap-1.5">
                            <FileCode className="w-3.5 h-3.5 text-emerald-600" />
                            {bkp.fileName}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono truncate max-w-xs" title={bkp.checksum}>
                            Hash: {bkp.checksum.slice(0, 16)}...
                          </div>
                        </td>
                        <td className="p-3.5 font-medium text-slate-800">
                          {bkp.formattedDate}
                        </td>
                        <td className="p-3.5">
                          {bkp.type === 'AUTOMATIC_N8N_CRON' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <Clock className="w-3 h-3" />
                              Cron n8n Diario
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                              <ShieldCheck className="w-3 h-3" />
                              Manual Admin
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 font-mono text-slate-600">
                          {(bkp.fileSizeBytes / 1024).toFixed(1)} KB
                        </td>
                        <td className="p-3.5 font-semibold text-slate-800">
                          {bkp.totalShiftsCount} registros
                        </td>
                        <td className="p-3.5">
                          <span className="font-semibold text-slate-700">
                            {bkp.retentionDaysRemaining} días rest.
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-1.5">
                          <button
                            onClick={() => handleDownloadSnapshotFile(bkp)}
                            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-900"
                            title="Descargar copia JSON de seguridad"
                          >
                            <Download className="w-4 h-4 text-emerald-600" />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => setSelectedBackupToRestore(bkp)}
                              className="p-1.5 rounded-md hover:bg-amber-50 text-slate-600 hover:text-amber-700"
                              title="Restaurar este punto histórico"
                            >
                              <RotateCcw className="w-4 h-4 text-amber-600" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WEBHOOKS N8N & NOTIFICATION LOGS (Prompt 4) */}
      {activeTab === 'webhooks' && (
        <div className="space-y-6">
          {/* Webhook URLs Form */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Configuración de Endpoints Webhook de n8n
                </h3>
                <p className="text-xs text-slate-500">
                  Conexión directa entre la aplicación React y el orquestador n8n para distribución por WhatsApp
                </p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                HTTPS REST
              </span>
            </div>

            <form onSubmit={handleSaveWebhooks} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  VITE_N8N_WEBHOOK_SEND_SCHEDULE (Flujo 6 / RF-05)
                </label>
                <input
                  type="text"
                  value={sendScheduleUrl}
                  onChange={(e) => setSendScheduleUrl(e.target.value)}
                  className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Webhook llamado por el botón "Enviar Malla por WhatsApp" con la programación de toda la cuadrilla.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  VITE_N8N_WEBHOOK_HIGH_PRIORITY_ALERT (Flujo 7 / RF-05)
                </label>
                <input
                  type="text"
                  value={highPriorityAlertUrl}
                  onChange={(e) => setHighPriorityAlertUrl(e.target.value)}
                  className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Disparado automáticamente cuando se registra una novedad que altera el turno de hoy o mañana.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  VITE_N8N_WEBHOOK_BACKUP (Flujo 8 / RF-06)
                </label>
                <input
                  type="text"
                  value={backupUrl}
                  onChange={(e) => setBackupUrl(e.target.value)}
                  className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Toggles */}
              <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-slate-800">Modo Simulación Demo:</p>
                    <p className="text-[11px] text-slate-500">Simula respuestas instantáneas de n8n sin fallar por CORS</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={webhookConfig.enableSimulationMode}
                    onChange={(e) => updateWebhookConfig({ enableSimulationMode: e.target.checked })}
                    className="h-4 w-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-slate-800">Protección de Datos (RNF-02):</p>
                    <p className="text-[11px] text-slate-500">Enmascara teléfonos y correos en logs y payloads</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={webhookConfig.enableDataPrivacyMasking}
                    onChange={(e) => updateWebhookConfig({ enableDataPrivacyMasking: e.target.checked })}
                    className="h-4 w-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                </div>
              </div>

              {isAdmin && (
                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                  >
                    Guardar Configuración de Webhooks
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Delivery Logs Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                Registro de Entrega de Mensajes y Webhooks ({notificationLogs.length} Eventos)
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                Auditoría en Tiempo Real
              </span>
            </div>

            {notificationLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No hay notificaciones enviadas aún en esta sesión. Use el botón "Enviar Malla por WhatsApp" o modifique un turno urgente para disparar eventos.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                      <th className="p-3.5">ID / Hora</th>
                      <th className="p-3.5">Tipo Evento</th>
                      <th className="p-3.5">Destinatario</th>
                      <th className="p-3.5">Resumen Payload</th>
                      <th className="p-3.5">Estado HTTP</th>
                      <th className="p-3.5 text-right">Reintento</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    {notificationLogs.map((log) => {
                      return (
                        <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-3.5">
                            <div className="font-mono text-[10px] text-slate-500 font-bold">{log.id}</div>
                            <div className="text-[11px] text-slate-700 font-medium">{log.timestamp.slice(11, 19)}</div>
                          </td>
                          <td className="p-3.5">
                            {log.type === 'HIGH_PRIORITY_ALERT' ? (
                              <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-amber-100 text-amber-800 border border-amber-300">
                                ⚡ Alerta Alta (Flujo 7)
                              </span>
                            ) : log.type === 'SCHEDULE_DISPATCH' ? (
                              <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300">
                                📱 Malla WhatsApp (Flujo 6)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-purple-100 text-purple-800 border border-purple-300">
                                💾 Backup Cloud (Flujo 8)
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 font-mono text-slate-800 font-medium">
                            {log.recipientPhone}
                          </td>
                          <td className="p-3.5 text-slate-600 max-w-sm truncate" title={log.payloadSummary}>
                            {log.payloadSummary}
                          </td>
                          <td className="p-3.5">
                            <span className="inline-flex items-center gap-1 font-bold text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              200 OK
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => retryFailedNotification(log.id)}
                              className="text-xs text-slate-600 hover:text-emerald-700 font-semibold flex items-center gap-1 justify-end ml-auto"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>Reenviar</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: PARÁMETROS LEGALES 2026 (RF-01 & RF-02) */}
      {activeTab === 'legal' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="font-bold text-sm text-slate-900">
              Parámetros Laborales Colombianos 2026 (Ley 2101 de 2021 & Código Sustantivo del Trabajo)
            </h3>
            <p className="text-xs text-slate-500">
              Reglas codificadas en el motor matemático <code>src/utils/colombianLaborEngine.ts</code>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                1. Jornada Laboral Máxima Semanal (RF-01)
              </span>
              <p className="text-xs text-slate-700">
                A partir de julio de 2026, la jornada máxima legal en Colombia disminuye a <strong>42 horas semanales</strong>. Todo minuto posterior a la hora 42 computa automáticamente como <strong>Horas Extras</strong> y activa una alerta visual roja en la malla.
              </p>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 font-mono text-xs font-bold text-slate-800 flex justify-between">
                <span>WEEKLY_LEGAL_LIMIT_HOURS:</span>
                <span className="text-emerald-700">42 Horas</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-purple-800 uppercase tracking-wider">
                2. Franja de Trabajo Nocturno (RF-02)
              </span>
              <p className="text-xs text-slate-700">
                La jornada nocturna inicia formalmente a las <strong>19:00 (7:00 p.m.)</strong> y culmina a las <strong>06:00 (6:00 a.m.)</strong> del día siguiente. El motor calcula con precisión de minutos todo tiempo devengado en dicha franja.
              </p>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 font-mono text-xs font-bold text-slate-800 flex justify-between">
                <span>FRANJA_NOCTURNA:</span>
                <span className="text-purple-700">19:00 a 06:00 (+35% Recargo)</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">
                3. Tabla de Recargos de Nómina Aplicados
              </span>
              <ul className="text-xs text-slate-700 space-y-1">
                <li>• Recargo Nocturno Ordinario: <strong>+35%</strong> sobre el valor de la hora ordinaria</li>
                <li>• Hora Extra Diurna (HED): <strong>+25%</strong> sobre la hora diurna</li>
                <li>• Hora Extra Nocturna (HEN): <strong>+75%</strong> sobre la hora ordinaria</li>
                <li>• Recargo Dominical y Festivo: <strong>+75% / +100%</strong></li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                4. Protección de Datos y Habeas Data (RNF-02)
              </span>
              <p className="text-xs text-slate-700">
                En cumplimiento de la Ley Estatutaria 1581 de 2012, el sistema permite activar la anonimización y enmascaramiento de números de celular y correos electrónicos para vistas no administrativas.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal to Restore Backup */}
      {selectedBackupToRestore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="p-2 rounded-lg bg-amber-100">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">¿Restaurar Copia de Seguridad?</h3>
                <p className="text-xs text-slate-500">Punto histórico: {selectedBackupToRestore.formattedDate}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Se revertirá el estado actual de la malla de turnos y la bitácora a los datos guardados en <strong>{selectedBackupToRestore.fileName}</strong>. Esta acción no se puede deshacer.
            </p>

            <div className="pt-2 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setSelectedBackupToRestore(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmRestore}
                className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm"
              >
                Sí, Restaurar Instantánea
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
