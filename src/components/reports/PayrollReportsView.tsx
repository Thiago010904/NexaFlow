// src/components/reports/PayrollReportsView.tsx

import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Filter, 
  Search, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Moon, 
  Sun, 
  Building2,
  FileText,
  TrendingUp,
  FileCode
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SEDES_ZONA_P } from '../../data/mockData';
import { 
  PayrollRowData, 
  exportPayrollToExcel, 
  exportPayrollToCSV, 
  exportPayrollToTXT 
} from '../../utils/payrollExportService';

export const PayrollReportsView: React.FC = () => {
  const { 
    employees, 
    employeeWeeklyLabor, 
    weekDates,
    selectedSedeFilter,
    setSelectedSedeFilter,
    addToast
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'fortnight' | 'month'>('week');

  // Build rows for all employees
  const reportRows: PayrollRowData[] = useMemo(() => {
    return employees.map(emp => {
      const labor = employeeWeeklyLabor[emp.id] || {
        totalHours: 0,
        ordinaryHours: 0,
        nightSurchargeHours: 0,
        diurnalOvertimeHours: 0,
        nocturnalOvertimeHours: 0,
        sundayHolidayHours: 0,
        isOverLimit: false,
        overLimitHours: 0,
        percentageOfCapacity: 0,
      };

      const sede = SEDES_ZONA_P[emp.sedeDefault];

      return {
        cedula: emp.cedula,
        nombre: emp.name,
        cargo: emp.role,
        sedePrincipal: sede.name,
        totalHoras: labor.totalHours,
        horasOrdinarias: labor.ordinaryHours,
        recargosNocturnos: labor.nightSurchargeHours,
        extrasDiurnas: labor.diurnalOvertimeHours,
        extrasNocturnas: labor.nocturnalOvertimeHours,
        dominicalesFestivas: labor.sundayHolidayHours,
        estadoTope42h: labor.isOverLimit ? `Excede 42h (+${labor.overLimitHours}h)` : 'Conforme 42h',
      };
    });
  }, [employees, employeeWeeklyLabor]);

  // Apply filters
  const filteredRows = useMemo(() => {
    return reportRows.filter(r => {
      const matchesSearch = 
        r.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.cedula.includes(searchTerm) ||
        r.cargo.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSede = 
        selectedSedeFilter === 'all' || 
        r.sedePrincipal.includes(selectedSedeFilter === 1 ? 'Centro' : selectedSedeFilter === 2 ? 'Norte' : 'Laureles');

      return matchesSearch && matchesSede;
    });
  }, [reportRows, searchTerm, selectedSedeFilter]);

  // Totals
  const totals = useMemo(() => {
    return filteredRows.reduce((acc, curr) => ({
      totalHoras: acc.totalHoras + curr.totalHoras,
      horasOrdinarias: acc.horasOrdinarias + curr.horasOrdinarias,
      recargosNocturnos: acc.recargosNocturnos + curr.recargosNocturnos,
      extrasDiurnas: acc.extrasDiurnas + curr.extrasDiurnas,
      extrasNocturnas: acc.extrasNocturnas + curr.extrasNocturnas,
      dominicalesFestivas: acc.dominicalesFestivas + curr.dominicalesFestivas,
    }), {
      totalHoras: 0,
      horasOrdinarias: 0,
      recargosNocturnos: 0,
      extrasDiurnas: 0,
      extrasNocturnas: 0,
      dominicalesFestivas: 0,
    });
  }, [filteredRows]);

  const periodRangeLabel = `${weekDates[0]} al ${weekDates[6]}`;

  // Export Handlers
  const handleExportExcel = () => {
    exportPayrollToExcel(filteredRows, periodRangeLabel, `ZonaP_Nomina_${weekDates[0]}.xlsx`);
    addToast({
      type: 'success',
      title: 'Archivo Excel Generado',
      message: 'Se descargó el reporte consolidado (.xlsx) en su navegador.'
    });
  };

  const handleExportCSV = () => {
    exportPayrollToCSV(filteredRows, `ZonaP_Nomina_${weekDates[0]}.csv`);
    addToast({
      type: 'success',
      title: 'Archivo CSV Generado',
      message: 'Se descargó el archivo (.csv) con codificación UTF-8 BOM.'
    });
  };

  const handleExportTXT = () => {
    exportPayrollToTXT(filteredRows, weekDates[6], `ZonaP_Interfase_Nomina_${weekDates[6]}.txt`);
    addToast({
      type: 'success',
      title: 'Archivo Plano TXT Generado',
      message: 'Se descargó el archivo estructurado (.txt) para ERP de Nómina.'
    });
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50 p-6 space-y-6">
      
      {/* Top Header (Everhour Time Reports Style) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Reportes Consolidados de Nómina
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              RF-04
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cálculos automáticos bajo la normativa laboral colombiana 2026 (Tope 42h, Franja 19:00–06:00, CST Art. 168 y 179)
          </p>
        </div>

        {/* Three Functional Download Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
            title="Descargar archivo Excel con tablas y fórmulas"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel (.xlsx)</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition-all active:scale-95"
            title="Descargar archivo CSV delimitado por comas UTF-8"
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>CSV (.csv)</span>
          </button>

          <button
            onClick={handleExportTXT}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
            title="Descargar archivo plano estructurado para ERP (Novasoft/Siigo/Helisa)"
          >
            <FileCode className="w-4 h-4 text-emerald-400" />
            <span>TXT ERP (.txt)</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Horas</span>
            <Clock className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <p className="text-xl font-extrabold text-slate-900 mt-1">
            {totals.totalHoras.toFixed(1)}h
          </p>
          <span className="text-[10px] text-slate-400">Total período</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Ordinarias Diurnas</span>
            <Sun className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <p className="text-xl font-extrabold text-emerald-700 mt-1">
            {totals.horasOrdinarias.toFixed(1)}h
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">Tope 42h/sem</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Recargos Nocturnos</span>
            <Moon className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <p className="text-xl font-extrabold text-purple-700 mt-1">
            {totals.recargosNocturnos.toFixed(1)}h
          </p>
          <span className="text-[10px] text-purple-600 font-semibold">+35% (19:00-06:00)</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Extras Diurnas (HED)</span>
            <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <p className="text-xl font-extrabold text-blue-700 mt-1">
            {totals.extrasDiurnas.toFixed(1)}h
          </p>
          <span className="text-[10px] text-blue-600 font-semibold">+25% Recargo</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Extras Nocturnas (HEN)</span>
            <Moon className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <p className="text-xl font-extrabold text-indigo-700 mt-1">
            {totals.extrasNocturnas.toFixed(1)}h
          </p>
          <span className="text-[10px] text-indigo-600 font-semibold">+75% Recargo</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Dominicales / Festivos</span>
            <Calendar className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <p className="text-xl font-extrabold text-rose-700 mt-1">
            {totals.dominicalesFestivas.toFixed(1)}h
          </p>
          <span className="text-[10px] text-rose-600 font-semibold">+75% / +100% Recargo</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por operario, cédula o cargo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-3">
          {/* Period selector */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setSelectedPeriod('week')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                selectedPeriod === 'week' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'
              }`}
            >
              Semana Actual
            </button>
            <button
              onClick={() => setSelectedPeriod('fortnight')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                selectedPeriod === 'fortnight' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'
              }`}
            >
              Quincena
            </button>
            <button
              onClick={() => setSelectedPeriod('month')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                selectedPeriod === 'month' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'
              }`}
            >
              Mes Completo
            </button>
          </div>

          {/* Sede selector */}
          <select
            value={selectedSedeFilter}
            onChange={(e) => setSelectedSedeFilter(e.target.value === 'all' ? 'all' : Number(e.target.value) as 1 | 2 | 3)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 outline-none"
          >
            <option value="all">Todas las Sedes</option>
            <option value="1">Sede 1: Centro</option>
            <option value="2">Sede 2: Norte</option>
            <option value="3">Sede 3: Laureles</option>
          </select>
        </div>
      </div>

      {/* Main Consolidated Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="p-3.5">Colaborador</th>
                <th className="p-3.5">Documento</th>
                <th className="p-3.5">Sede Principal</th>
                <th className="p-3.5 text-right">Total Horas</th>
                <th className="p-3.5 text-right">Ordinarias</th>
                <th className="p-3.5 text-right">Recargo Noct. (19-06)</th>
                <th className="p-3.5 text-right">Extra Diurna (HED)</th>
                <th className="p-3.5 text-right">Extra Noct. (HEN)</th>
                <th className="p-3.5 text-right">Dominical / Fest.</th>
                <th className="p-3.5 text-center">Estado Legal 42h</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {filteredRows.map((row, idx) => {
                const isOver = row.totalHoras > 42;

                return (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{row.nombre}</div>
                      <div className="text-[11px] text-slate-500">{row.cargo}</div>
                    </td>
                    <td className="p-3.5 font-mono text-slate-600 font-medium">
                      {row.cedula}
                    </td>
                    <td className="p-3.5">
                      <span className="text-slate-800 font-medium">{row.sedePrincipal}</span>
                    </td>
                    <td className="p-3.5 text-right font-extrabold text-slate-900">
                      {row.totalHoras.toFixed(1)}h
                    </td>
                    <td className="p-3.5 text-right font-semibold text-emerald-700">
                      {row.horasOrdinarias.toFixed(1)}h
                    </td>
                    <td className="p-3.5 text-right font-semibold text-purple-700">
                      {row.recargosNocturnos > 0 ? `${row.recargosNocturnos.toFixed(1)}h` : '—'}
                    </td>
                    <td className="p-3.5 text-right font-semibold text-blue-700">
                      {row.extrasDiurnas > 0 ? `${row.extrasDiurnas.toFixed(1)}h` : '—'}
                    </td>
                    <td className="p-3.5 text-right font-semibold text-indigo-700">
                      {row.extrasNocturnas > 0 ? `${row.extrasNocturnas.toFixed(1)}h` : '—'}
                    </td>
                    <td className="p-3.5 text-right font-semibold text-rose-700">
                      {row.dominicalesFestivas > 0 ? `${row.dominicalesFestivas.toFixed(1)}h` : '—'}
                    </td>
                    <td className="p-3.5 text-center">
                      {isOver ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                          <AlertTriangle className="w-3 h-3" />
                          {row.estadoTope42h}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Conforme 42h
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Table Summary Footer */}
            <tfoot>
              <tr className="bg-slate-100/80 border-t-2 border-slate-300 font-bold text-slate-900">
                <td colSpan={3} className="p-3.5 text-slate-800">
                  TOTALES CONSOLIDADOS DEL PERÍODO:
                </td>
                <td className="p-3.5 text-right font-extrabold text-emerald-900">
                  {totals.totalHoras.toFixed(1)}h
                </td>
                <td className="p-3.5 text-right text-emerald-800">
                  {totals.horasOrdinarias.toFixed(1)}h
                </td>
                <td className="p-3.5 text-right text-purple-800">
                  {totals.recargosNocturnos.toFixed(1)}h
                </td>
                <td className="p-3.5 text-right text-blue-800">
                  {totals.extrasDiurnas.toFixed(1)}h
                </td>
                <td className="p-3.5 text-right text-indigo-800">
                  {totals.extrasNocturnas.toFixed(1)}h
                </td>
                <td className="p-3.5 text-right text-rose-800">
                  {totals.dominicalesFestivas.toFixed(1)}h
                </td>
                <td className="p-3.5 text-center text-slate-500 font-normal text-[11px]">
                  Corte: {weekDates[6]}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

    </div>
  );
};
