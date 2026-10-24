// src/App.tsx

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { ScheduleView } from './components/schedule/ScheduleView';
import { EmployeesView } from './components/employees/EmployeesView';
import { PayrollReportsView } from './components/reports/PayrollReportsView';
import { AuditLogView } from './components/audit/AuditLogView';
import { AdminConfigView } from './components/admin/AdminConfigView';
import { ToastContainer } from './components/common/ToastContainer';

const MainLayout: React.FC = () => {
  const { activeModule, currentRole, employees, selectedOperatorId, setSelectedOperatorId } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Top Header */}
      <Header />

      {/* Operator Role Simulator Bar (Visible only when role === 'operator') */}
      {currentRole === 'operator' && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <span className="font-bold">Vista Operario Activa:</span>
            <span>Estás visualizando la interfaz como un colaborador en campo (solo lectura de turnos).</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600">Operario simulado:</span>
            <select
              value={selectedOperatorId}
              onChange={(e) => setSelectedOperatorId(e.target.value)}
              className="bg-white border border-amber-300 rounded px-2 py-1 text-xs font-semibold text-slate-800 outline-none"
            >
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.role})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Body Area: Sidebar + Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto flex flex-col">
          {activeModule === 'schedule' && <ScheduleView />}
          {activeModule === 'employees' && <EmployeesView />}
          {activeModule === 'reports' && <PayrollReportsView />}
          {activeModule === 'audit' && <AuditLogView />}
          {activeModule === 'admin' && <AdminConfigView />}
        </main>
      </div>

      {/* Real-time Toasts */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
