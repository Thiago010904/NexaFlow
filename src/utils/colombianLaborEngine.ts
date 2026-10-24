// src/utils/colombianLaborEngine.ts
/**
 * Motor de Cálculo Laboral Colombiano 2026 (RF-01 y RF-02)
 * Cumple estrictamente con la Ley 2101 de 2021 (reducción progresiva a 42h en 2026)
 * y la actualización de la franja nocturna de 19:00 a 06:00.
 */

import { ShiftBlock, DaySchedule, ShiftLaborCalculation, EmployeeWeeklyLaborCalculation } from '../types/index';

export const COLOMBIAN_LABOR_CONFIG_2026 = {
  WEEKLY_LEGAL_LIMIT_HOURS: 42,
  NIGHT_START_HOUR: 19, // 7:00 PM
  NIGHT_END_HOUR: 6,    // 6:00 AM
  DIURNAL_START_MINUTE: 6 * 60,   // 360 min (06:00)
  NIGHT_START_MINUTE: 19 * 60,    // 1140 min (19:00)
  MINUTES_IN_DAY: 24 * 60,        // 1440 min
  SURCHARGES: {
    ORDINARY_NIGHT_SURCHARGE_PCT: 35, // +35% Recargo Nocturno Ordinario (Art. 168 CST)
    EXTRA_DIURNAL_SURCHARGE_PCT: 25,  // +25% Hora Extra Diurna (Art. 168 CST)
    EXTRA_NOCTURNAL_SURCHARGE_PCT: 75,// +75% Hora Extra Nocturna (Art. 168 CST)
    SUNDAY_HOLIDAY_SURCHARGE_PCT: 75, // +75% Recargo Dominical Ordinario (Art. 179 CST / Ley 2026)
    SUNDAY_EXTRA_DIURNAL_PCT: 100,    // +100% Hora Extra Dominical Diurna
    SUNDAY_EXTRA_NOCTURNAL_PCT: 150,  // +150% Hora Extra Dominical Nocturna
  }
};

/**
 * Festivos oficiales en Colombia para el año de operación 2026 (Ley 51 de 1983 - Ley Emiliani)
 */
export const COLOMBIAN_HOLIDAYS_2026: Set<string> = new Set([
  '2026-01-01', // Año Nuevo
  '2026-01-12', // Reyes Magos
  '2026-03-23', // San José
  '2026-04-02', // Jueves Santo
  '2026-04-03', // Viernes Santo
  '2026-05-01', // Día del Trabajo
  '2026-05-18', // Ascensión de Jesús
  '2026-06-08', // Corpus Christi
  '2026-06-15', // Sagrado Corazón
  '2026-06-29', // San Pedro y San Pablo
  '2026-07-20', // Día de la Independencia
  '2026-08-07', // Batalla de Boyacá
  '2026-08-17', // Asunción de la Virgen
  '2026-10-12', // Día de la Raza
  '2026-11-02', // Todos los Santos
  '2026-11-16', // Independencia de Cartagena
  '2026-12-08', // Inmaculada Concepción
  '2026-12-25', // Navidad
]);

/**
 * Convierte una hora en formato "HH:mm" a minutos desde las 00:00
 */
export function timeStringToMinutes(timeStr: string): number {
  if (!timeStr || !timeStr.includes(':')) return 0;
  const [hStr, mStr] = timeStr.split(':');
  const h = parseInt(hStr, 10) || 0;
  const m = parseInt(mStr, 10) || 0;
  return h * 60 + m;
}

/**
 * Convierte minutos a formato decimal de horas con 2 decimales (ej. 450 min -> 7.50h)
 */
export function minutesToHours(minutes: number): number {
  return Math.round((minutes / 60) * 100) / 100;
}

/**
 * Convierte minutos a formato legible "Xh Ym"
 */
export function formatMinutesToHourMin(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**
 * Determina si una fecha corresponde a Domingo o Festivo oficial en Colombia
 */
export function isSundayOrColombianHoliday(dateStr: string): boolean {
  if (!dateStr) return false;
  
  if (COLOMBIAN_HOLIDAYS_2026.has(dateStr)) {
    return true;
  }
  
  // Parse YYYY-MM-DD
  const parts = dateStr.split('-').map(Number);
  if (parts.length === 3) {
    // Note: month is 0-indexed in JS Date
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    return d.getDay() === 0; // 0 = Sunday
  }
  return false;
}

/**
 * Calcula con precisión de minutos cuántos caen en franja diurna (06:00 - 19:00)
 * y cuántos en franja nocturna (19:00 - 06:00) según la reforma laboral 2026.
 * Soporta turnos que cruzan la medianoche (ej. 22:00 a 06:00 o 18:00 a 02:00).
 */
export function calculateShiftMinutes(startTimeStr: string, endTimeStr: string): {
  totalMinutes: number;
  diurnalMinutes: number;
  nocturnalMinutes: number;
} {
  const startMin = timeStringToMinutes(startTimeStr);
  let endMin = timeStringToMinutes(endTimeStr);

  // Si endMin <= startMin, el turno cruza la medianoche (ej. 20:00 a 04:00)
  if (endMin <= startMin) {
    endMin += COLOMBIAN_LABOR_CONFIG_2026.MINUTES_IN_DAY;
  }

  const totalMinutes = endMin - startMin;
  let nocturnalMinutes = 0;
  let diurnalMinutes = 0;

  // Evaluación minuto a minuto precisa y libre de inconsistencias de redondeo
  for (let m = startMin; m < endMin; m++) {
    const minuteOfDay = m % COLOMBIAN_LABOR_CONFIG_2026.MINUTES_IN_DAY;
    
    // Franja nocturna: 19:00 a 06:00
    // minuteOfDay >= 1140 (19:00) o minuteOfDay < 360 (06:00)
    const isNight = 
      minuteOfDay >= COLOMBIAN_LABOR_CONFIG_2026.NIGHT_START_MINUTE || 
      minuteOfDay < COLOMBIAN_LABOR_CONFIG_2026.DIURNAL_START_MINUTE;

    if (isNight) {
      nocturnalMinutes++;
    } else {
      diurnalMinutes++;
    }
  }

  return {
    totalMinutes,
    diurnalMinutes,
    nocturnalMinutes,
  };
}

/**
 * Clasificación laboral de un turno individual (o sub-turno en una sede)
 */
export function calculateSingleShiftBlockLabor(
  block: ShiftBlock,
  dateStr: string
): ShiftLaborCalculation {
  const { totalMinutes, diurnalMinutes, nocturnalMinutes } = calculateShiftMinutes(
    block.startTime,
    block.endTime
  );

  const isSunHoliday = isSundayOrColombianHoliday(dateStr);

  return {
    totalMinutes,
    totalHours: minutesToHours(totalMinutes),
    diurnalMinutes,
    diurnalHours: minutesToHours(diurnalMinutes),
    nocturnalMinutes,
    nocturnalHours: minutesToHours(nocturnalMinutes),
    isSundayOrHoliday: isSunHoliday,
    notes: block.notes
  };
}

/**
 * Clasificación laboral agregada para un día (soporta rotación multi-sede: varios bloques en el mismo día)
 */
export function calculateDayScheduleLabor(
  blocks: ShiftBlock[],
  dateStr: string
): ShiftLaborCalculation {
  if (!blocks || blocks.length === 0) {
    return {
      totalMinutes: 0,
      totalHours: 0,
      diurnalMinutes: 0,
      diurnalHours: 0,
      nocturnalMinutes: 0,
      nocturnalHours: 0,
      isSundayOrHoliday: isSundayOrColombianHoliday(dateStr),
    };
  }

  let totalMinutes = 0;
  let diurnalMinutes = 0;
  let nocturnalMinutes = 0;

  for (const block of blocks) {
    const res = calculateShiftMinutes(block.startTime, block.endTime);
    totalMinutes += res.totalMinutes;
    diurnalMinutes += res.diurnalMinutes;
    nocturnalMinutes += res.nocturnalMinutes;
  }

  return {
    totalMinutes,
    totalHours: minutesToHours(totalMinutes),
    diurnalMinutes,
    diurnalHours: minutesToHours(diurnalMinutes),
    nocturnalMinutes,
    nocturnalHours: minutesToHours(nocturnalMinutes),
    isSundayOrHoliday: isSundayOrColombianHoliday(dateStr),
  };
}

/**
 * Motor Acumulado Semanal (RF-01 y RF-02):
 * - Aplica el tope legal semanal de 42 horas (2026).
 * - Clasifica:
 *   1. Horas Ordinarias (diurnas dentro del tope de 42h)
 *   2. Recargo Nocturno (horas en franja 19:00-06:00 dentro del tope de 42h)
 *   3. Horas Extras Diurnas (HED): horas diurnas que superan el tope legal semanal
 *   4. Horas Extras Nocturnas (HEN): horas nocturnas que superan el tope legal semanal
 *   5. Horas Dominicales y Festivas: horas laboradas en domingo o festivo oficial
 * - Marca isOverLimit: true si totalHours > 42
 */
export function calculateWeeklyLaborAccumulated(
  employeeId: string,
  weekDates: string[],
  schedules: DaySchedule[]
): EmployeeWeeklyLaborCalculation {
  const weekStart = weekDates[0] || '';
  const weekEnd = weekDates[weekDates.length - 1] || '';
  const legalLimitHours = COLOMBIAN_LABOR_CONFIG_2026.WEEKLY_LEGAL_LIMIT_HOURS;
  const legalLimitMinutes = legalLimitHours * 60; // 42 * 60 = 2520 minutos

  let totalMinutesAccumulated = 0;
  let accumulatedDiurnalMinutes = 0;
  let accumulatedNocturnalMinutes = 0;
  let accumulatedSundayHolidayMinutes = 0;

  // Evaluamos día a día en orden cronológico
  for (const dateStr of weekDates) {
    const daySchedule = schedules.find(
      s => s.employeeId === employeeId && s.date === dateStr
    );
    if (!daySchedule || !daySchedule.blocks || daySchedule.blocks.length === 0) {
      continue;
    }

    const isSunHoliday = isSundayOrColombianHoliday(dateStr);

    for (const block of daySchedule.blocks) {
      const { totalMinutes, diurnalMinutes, nocturnalMinutes } = calculateShiftMinutes(
        block.startTime,
        block.endTime
      );

      totalMinutesAccumulated += totalMinutes;
      accumulatedDiurnalMinutes += diurnalMinutes;
      accumulatedNocturnalMinutes += nocturnalMinutes;

      if (isSunHoliday) {
        accumulatedSundayHolidayMinutes += totalMinutes;
      }
    }
  }

  const isOverLimit = totalMinutesAccumulated > legalLimitMinutes;
  const overLimitMinutes = isOverLimit ? totalMinutesAccumulated - legalLimitMinutes : 0;

  // Desglose de horas ordinarias vs extras:
  // Si no supera las 42h:
  //   - Diurnas son ordinarias
  //   - Nocturnas tienen recargo nocturno ordinario (+35%)
  // Si supera las 42h:
  //   - El excedente se divide proporcionalmente entre extras diurnas y extras nocturnas
  let diurnalOvertimeMinutes = 0;
  let nocturnalOvertimeMinutes = 0;
  let ordinaryDiurnalMinutes = accumulatedDiurnalMinutes;
  let ordinaryNightSurchargeMinutes = accumulatedNocturnalMinutes;

  if (isOverLimit) {
    // Proporción de diurna vs nocturna en el excedente
    const nocturnalRatio = totalMinutesAccumulated > 0 
      ? accumulatedNocturnalMinutes / totalMinutesAccumulated 
      : 0;
    
    nocturnalOvertimeMinutes = Math.round(overLimitMinutes * nocturnalRatio);
    diurnalOvertimeMinutes = overLimitMinutes - nocturnalOvertimeMinutes;

    ordinaryDiurnalMinutes = Math.max(0, accumulatedDiurnalMinutes - diurnalOvertimeMinutes);
    ordinaryNightSurchargeMinutes = Math.max(0, accumulatedNocturnalMinutes - nocturnalOvertimeMinutes);
  }

  const totalHours = minutesToHours(totalMinutesAccumulated);
  const ordinaryHours = minutesToHours(ordinaryDiurnalMinutes);
  const nightSurchargeHours = minutesToHours(ordinaryNightSurchargeMinutes);
  const diurnalOvertimeHours = minutesToHours(diurnalOvertimeMinutes);
  const nocturnalOvertimeHours = minutesToHours(nocturnalOvertimeMinutes);
  const sundayHolidayHours = minutesToHours(accumulatedSundayHolidayMinutes);
  const overLimitHours = minutesToHours(overLimitMinutes);
  const percentageOfCapacity = Math.min(100, Math.round((totalHours / legalLimitHours) * 100));

  return {
    employeeId,
    weekStart,
    weekEnd,
    totalHours,
    ordinaryHours,
    nightSurchargeHours,
    diurnalOvertimeHours,
    nocturnalOvertimeHours,
    sundayHolidayHours,
    isOverLimit,
    overLimitHours,
    percentageOfCapacity,
  };
}

/**
 * Obtiene las fechas (YYYY-MM-DD) correspondientes a una semana completa (Lunes a Domingo)
 * centrada en una fecha de referencia
 */
export function getWeekDates(referenceDate: Date = new Date()): string[] {
  const d = new Date(referenceDate);
  const day = d.getDay();
  // En Colombia y estándar ISO, la semana laboral de planeación empieza en Lunes (1) y termina en Domingo (0)
  const diffToMonday = day === 0 ? -6 : 1 - day;
  
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);

  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const current = new Date(monday);
    current.setDate(monday.getDate() + i);
    const yyyy = current.getFullYear();
    const mm = String(current.getMonth() + 1).padStart(2, '0');
    const dd = String(current.getDate()).padStart(2, '0');
    dates.push(`${yyyy}-${mm}-${dd}`);
  }
  return dates;
}

/**
 * Nombres y formato de días para la UI de Malla de Turnos
 */
export const DAY_NAMES_ES = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo'
];

export function getDayLabel(dateStr: string): { dayName: string; dayNumber: string; isHolidayOrSunday: boolean } {
  const parts = dateStr.split('-').map(Number);
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  const dayIndex = (d.getDay() + 6) % 7; // Convert Sunday=0 to index 6, Monday=0
  return {
    dayName: DAY_NAMES_ES[dayIndex],
    dayNumber: `${parts[2]}/${parts[1]}`,
    isHolidayOrSunday: isSundayOrColombianHoliday(dateStr),
  };
}
