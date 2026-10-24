// src/utils/payrollExportService.ts

import * as XLSX from 'xlsx';
import { Employee, EmployeeWeeklyLaborCalculation } from '../types';

export interface PayrollRowData {
  cedula: string;
  nombre: string;
  cargo: string;
  sedePrincipal: string;
  totalHoras: number;
  horasOrdinarias: number;
  recargosNocturnos: number; // 19:00 - 06:00
  extrasDiurnas: number;    // HED
  extrasNocturnas: number;  // HEN
  dominicalesFestivas: number; // DOM / FEST
  estadoTope42h: string;
}

/**
 * Dispara la descarga directa de un archivo Blob en el navegador
 */
function downloadFileBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 1. Genera y descarga archivo Excel (.xlsx) estructurado
 */
export function exportPayrollToExcel(
  data: PayrollRowData[],
  periodRange: string,
  fileName = 'ZonaP_Reporte_Nomina_2026.xlsx'
) {
  const worksheetData = data.map(row => ({
    'Cédula': row.cedula,
    'Empleado': row.nombre,
    'Cargo': row.cargo,
    'Sede': row.sedePrincipal,
    'Total Horas': row.totalHoras,
    'Horas Ordinarias': row.horasOrdinarias,
    'Recargo Nocturno (19:00-06:00)': row.recargosNocturnos,
    'Extras Diurnas (HED)': row.extrasDiurnas,
    'Extras Nocturnas (HEN)': row.extrasNocturnas,
    'Dominicales / Festivos': row.dominicalesFestivas,
    'Estado Cumplimiento (42h)': row.estadoTope42h,
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 15 }, // Cedula
    { wch: 25 }, // Empleado
    { wch: 22 }, // Cargo
    { wch: 18 }, // Sede
    { wch: 12 }, // Total
    { wch: 16 }, // Ordinarias
    { wch: 26 }, // Recargo
    { wch: 18 }, // HED
    { wch: 18 }, // HEN
    { wch: 20 }, // Dominical
    { wch: 22 }, // Estado
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Consolidado Nomina');

  // Generate buffer and trigger browser download
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' 
  });
  downloadFileBlob(blob, fileName);
}

/**
 * 2. Genera y descarga archivo CSV (.csv) con BOM UTF-8
 */
export function exportPayrollToCSV(
  data: PayrollRowData[],
  fileName = 'ZonaP_Reporte_Nomina_2026.csv'
) {
  const headers = [
    'Cedula',
    'Empleado',
    'Cargo',
    'Sede',
    'TotalHoras',
    'HorasOrdinarias',
    'RecargoNocturno',
    'HorasExtrasDiurnas',
    'HorasExtrasNocturnas',
    'DominicalesFestivas',
    'EstadoNorma42h'
  ];

  const rows = data.map(r => [
    `"${r.cedula}"`,
    `"${r.nombre.replace(/"/g, '""')}"`,
    `"${r.cargo.replace(/"/g, '""')}"`,
    `"${r.sedePrincipal.replace(/"/g, '""')}"`,
    r.totalHoras.toFixed(2),
    r.horasOrdinarias.toFixed(2),
    r.recargosNocturnos.toFixed(2),
    r.extrasDiurnas.toFixed(2),
    r.extrasNocturnas.toFixed(2),
    r.dominicalesFestivas.toFixed(2),
    `"${r.estadoTope42h}"`
  ]);

  // UTF-8 BOM (\uFEFF) para compatibilidad inmediata con Microsoft Excel
  const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(row => row.join(';'))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadFileBlob(blob, fileName);
}

/**
 * 3. Genera y descarga archivo TXT plano (.txt) estructurado para ERPs de nómina colombiana
 * Formato plano estándar Novasoft / Siigo / Helisa / Kactus:
 * COMPAÑIA|CEDULA|CONCEPTO_NOMINA|CANTIDAD_HORAS|FECHA_CORTE
 */
export function exportPayrollToTXT(
  data: PayrollRowData[],
  cutoffDate: string,
  fileName = 'ZonaP_Interfase_Nomina_2026.txt'
) {
  const NIT_ZONAP = '901.458.990-1';
  const lines: string[] = [];

  // Header de control
  lines.push(`## INTERFASE NOMINA ZONA P - LEY 2101 DE 2021 (42H) - FECHA CORTE: ${cutoffDate} ##`);
  lines.push(`NIT|DOCUMENTO|CONCEPTO|HORAS|FECHA`);

  data.forEach(r => {
    const cleanCedula = r.cedula.replace(/[^0-9]/g, '');

    if (r.horasOrdinarias > 0) {
      lines.push(`${NIT_ZONAP}|${cleanCedula}|HORD|${r.horasOrdinarias.toFixed(2)}|${cutoffDate}`);
    }
    if (r.recargosNocturnos > 0) {
      lines.push(`${NIT_ZONAP}|${cleanCedula}|RNOC|${r.recargosNocturnos.toFixed(2)}|${cutoffDate}`);
    }
    if (r.extrasDiurnas > 0) {
      lines.push(`${NIT_ZONAP}|${cleanCedula}|HED|${r.extrasDiurnas.toFixed(2)}|${cutoffDate}`);
    }
    if (r.extrasNocturnas > 0) {
      lines.push(`${NIT_ZONAP}|${cleanCedula}|HEN|${r.extrasNocturnas.toFixed(2)}|${cutoffDate}`);
    }
    if (r.dominicalesFestivas > 0) {
      lines.push(`${NIT_ZONAP}|${cleanCedula}|DOMF|${r.dominicalesFestivas.toFixed(2)}|${cutoffDate}`);
    }
  });

  const txtContent = lines.join('\r\n');
  const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' });
  downloadFileBlob(blob, fileName);
}
