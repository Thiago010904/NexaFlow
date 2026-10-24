// src/components/layout/Sidebar.tsx

import React from 'react';
import { 
  CalendarDays, 
  BarChart3, 
  History, 
  Settings2, 
  AlertTriangle, 
  Clock, 
  Users, 
  Shield, 
  ExternalLink,
  Lock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Sidebar: React.FC = () => {
  const {
    activeModule,
    setActiveModule,
    currentRole,
    employeeWeeklyLabor,
    employees
  } = useApp();

  // Calculate total overlimit alerts in current week
  const overLimitCount = Object.values(employeeWeeklyLabor).filter(c => c.isOverLimit).length;
  const totalWeeklyHours = Object.values(employeeWeeklyLabor).reduce((acc, c) => acc + c.totalHours, 0);

  const navItems = [
    {
      id: 'schedule' as const,
      label: 'Malla de Turnos',
      subtitle: 'Resource Planner',
      icon: CalendarDays,
      badge: overLimitCount > 0 ? `${overLimitCount} Alerta` : undefined,
      badgeColor: 'bg-red-100 text-red-700 border-red-200',
      allowedRoles: ['admin', 'coordinator', 'operator', 'hr_auditor']
    },
    {
      id: 'employees' as const,
      label: 'Gestión de Empleados',
      subtitle: 'Altas, Bajas y Roles',
      icon: Users,
      badge: `${employees.length}`,
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      allowedRoles: ['admin', 'coordinator', 'hr_auditor']
    },
    {
      id: 'reports' as const,
      label: 'Reportes de Nómina',
      subtitle: 'Excel, CSV & TXT',
      icon: BarChart3,
      badge: 'RF-04',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      allowedRoles: ['admin', 'coordinator', 'hr_auditor']
    },
    {
      id: 'audit' as const,
      label: 'Bitácora Novedades',
      subtitle: 'Changelog Inmutable',
      icon: History,
      badge: 'RF-03',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      allowedRoles: ['admin', 'coordinator', 'hr_auditor']
    },
    {
      id: 'admin' as const,
      label: 'Legal & Backups',
      subtitle: 'Norma 2026 & n8n',
      icon: Settings2,
      badge: '90 Días',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      allowedRoles: ['admin', 'hr_auditor']
    }
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 min-h-[calc(100vh-61px)]">
      {/* Top Navigation */}
      <div className="p-4 space-y-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3">
            Módulos Principales
          </span>
          <nav className="mt-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;
              const isAllowed = item.allowedRoles.includes(currentRole);

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (isAllowed) {
                      setActiveModule(item.id);
                    }
                  }}
                  disabled={!isAllowed}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-all group ${
                    !isAllowed
                      ? 'opacity-40 cursor-not-allowed text-slate-400'
                      : isActive
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    />
                    <div>
                      <div className="leading-tight">{item.label}</div>
                      <div className="text-[11px] text-slate-400 font-normal leading-tight">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  {!isAllowed ? (
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                  ) : item.badge ? (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Live Labor Compliance Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              Normativa 2026
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
              Ley 2101
            </span>
          </div>
          
          <div className="space-y-1.5 text-[11px] text-slate-600">
            <div className="flex justify-between">
              <span>Tope Legal Semanal:</span>
              <span className="font-semibold text-slate-900">42 horas</span>
            </div>
            <div className="flex justify-between">
              <span>Franja Nocturna:</span>
              <span className="font-semibold text-slate-900">19:00 – 06:00</span>
            </div>
            <div className="flex justify-between">
              <span>Recargo Nocturno:</span>
              <span className="font-semibold text-emerald-700">+35%</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Horas Programadas:</span>
            <span className="font-bold text-slate-800">{totalWeeklyHours.toFixed(1)}h</span>
          </div>

          {overLimitCount > 0 && (
            <div className="p-2 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-700">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{overLimitCount} operario supera 42h</p>
                <p className="text-[10px] text-red-600">Revisar sobregiro en Malla de Turnos</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Footer: System Status */}
      <div className="p-4 border-t border-slate-200 space-y-2 bg-slate-50/50">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            Operarios Activos:
          </span>
          <span className="font-bold text-slate-700">{employees.length}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            Habeas Data (RNF-02):
          </span>
          <span className="font-bold text-emerald-600">Activo</span>
        </div>
      </div>
    </aside>
  );
};
