// src/components/layout/Header.tsx

import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  ShieldCheck, 
  UserCheck, 
  Building2, 
  Sparkles,
  Zap,
  Database
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

export const Header: React.FC = () => {
  const {
    currentRole,
    setCurrentRole,
    referenceDate,
    weekDates,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
    selectedSedeFilter,
    setSelectedSedeFilter,
    webhookConfig,
    dbStatus,
    isDbConnected
  } = useApp();

  const roleLabels: Record<UserRole, { label: string; badge: string; color: string; desc: string }> = {
    admin: {
      label: 'Administrador',
      badge: 'Control Total',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      desc: 'Gestión completa de turnos, legal 42h, backups y webhooks'
    },
    coordinator: {
      label: 'Coordinador de Sede',
      badge: 'Operativo',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      desc: 'Edición de turnos con registro obligatorio de novedades (RF-03)'
    },
    operator: {
      label: 'Operario',
      badge: 'Consulta',
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      desc: 'Vista personal de turno, horas acumuladas y notificaciones'
    },
    hr_auditor: {
      label: 'Auditor RRHH',
      badge: 'Cumplimiento',
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      desc: 'Fiscalización laboral 2026 y descargas de nómina'
    }
  };

  const formatDateRange = () => {
    if (!weekDates || weekDates.length < 7) return '';
    const startParts = weekDates[0].split('-');
    const endParts = weekDates[6].split('-');
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const startM = months[parseInt(startParts[1], 10) - 1];
    const endM = months[parseInt(endParts[1], 10) - 1];
    return `${startParts[2]} ${startM} – ${endParts[2]} ${endM} ${startParts[0]}`;
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand & System Title */}
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            ZP
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-base tracking-tight">Zona P</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Normativa 2026 (42h)
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Flujo Laboral & Resource Planner • Parqueaderos
            </p>
          </div>
        </div>

        {/* Date / Week Range Selector (Everhour Schedule Picker Style) */}
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-1 space-x-1 shadow-sm">
          <button
            onClick={goToPreviousWeek}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded transition-colors"
            title="Semana anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <button
            onClick={goToCurrentWeek}
            className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-emerald-700 hover:bg-white rounded transition-colors flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span>{formatDateRange()}</span>
          </button>

          <button
            onClick={goToNextWeek}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded transition-colors"
            title="Semana siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right Section: Sedes Filter & Role Selector */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Sedes Fast Filter */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setSelectedSedeFilter('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                selectedSedeFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setSelectedSedeFilter(1)}
              className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 ${
                selectedSedeFilter === 1
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-blue-700'
              }`}
              title="Parqueadero Centro"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
              S1 Centro
            </button>
            <button
              onClick={() => setSelectedSedeFilter(2)}
              className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 ${
                selectedSedeFilter === 2
                  ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
              title="Parqueadero Norte"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              S2 Norte
            </button>
            <button
              onClick={() => setSelectedSedeFilter(3)}
              className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 ${
                selectedSedeFilter === 3
                  ? 'bg-purple-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-purple-700'
              }`}
              title="Parqueadero Laureles"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
              S3 Laureles
            </button>
          </div>

          {/* Role Simulator Selector */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1 shadow-2xs">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-400 leading-none">Simular Rol</span>
              <select
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value as UserRole)}
                className="text-xs font-semibold text-slate-800 bg-transparent border-none outline-none cursor-pointer pr-2 py-0.5"
              >
                <option value="admin">🛡️ Administrador</option>
                <option value="coordinator">👔 Coordinador de Sede</option>
                <option value="operator">👷 Operario</option>
                <option value="hr_auditor">📋 Auditor RRHH</option>
              </select>
            </div>
            <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${roleLabels[currentRole].color}`}>
              {roleLabels[currentRole].badge}
            </span>
          </div>

          {/* SQLite Database Connection Badge */}
          <div 
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 text-xs shadow-2xs"
            title={dbStatus ? `SQLite conectado: ${dbStatus.databaseFile} | ${dbStatus.counts.puestos} puestos, ${dbStatus.counts.empleados} operarios` : 'Base de datos SQLite local'}
          >
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-bold">SQLite:</span>
            <span className={`font-semibold ${isDbConnected ? 'text-emerald-700' : 'text-slate-600'}`}>
              {isDbConnected ? 'Conectado' : 'database/zonap.db'}
            </span>
          </div>

          {/* n8n Status Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold">n8n Gateway:</span>
            <span className="text-emerald-700">Online</span>
          </div>
        </div>
      </div>
    </header>
  );
};
