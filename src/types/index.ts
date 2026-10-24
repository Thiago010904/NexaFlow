// src/types/index.ts

export type UserRole = 'admin' | 'coordinator' | 'operator' | 'hr_auditor';

export type NavigationModule = 'schedule' | 'reports' | 'audit' | 'admin' | 'employees';

export interface SedeInfo {
  id: 1 | 2 | 3;
  name: string;
  shortName: string;
  address: string;
  colorBg: string;
  colorBorder: string;
  colorText: string;
  colorBadge: string;
}

export interface Employee {
  id: string;
  name: string;
  cedula: string;
  role: string; // e.g. "Operario de Parqueadero", "Valet Parking", "Cajero"
  systemRole?: UserRole;
  sedeDefault: 1 | 2 | 3;
  phone: string;
  email: string;
  active: boolean;
  avatar?: string;
  colorBg?: string;   // Color de fondo para la celda tipo Zona P
  colorText?: string; // Color de texto legible
  colorBorder?: string;
}

export interface HorarioSlot {
  id: string;
  startTime: string; // HH:mm (e.g. "06:00")
  endTime: string;   // HH:mm (e.g. "13:00" o "24:00" / "00:00")
  activeDays: number[]; // [1, 2, 3, 4, 5] (L-V), [6, 0] (S-D), o [0, 1, 2, 3, 4, 5, 6] (Todos)
  label?: string;
}

export interface Puesto {
  id: string;
  name: string; // Editable por el coordinador (e.g. "puesto # 1", "Rondero", "Puesto #12 Privado", "Entrada Principal")
  sedeId: 1 | 2 | 3;
  horarios: HorarioSlot[];
  order: number;
}

export interface PuestoAssignment {
  id: string;
  puestoId: string;
  horarioId: string;
  date: string; // YYYY-MM-DD
  employeeId: string | null;
  customNote?: string; // e.g. "08-15" o notas especiales
  isCoveredByNovelty?: boolean; // Highlight de reemplazo/novedad en color magenta
}

export interface ShiftBlock {
  id: string;
  sedeId: 1 | 2 | 3;
  puestoId?: string;
  puestoName?: string;
  startTime: string; // HH:mm (e.g. "06:00")
  endTime: string;   // HH:mm (e.g. "14:00" or "02:00" next day)
  notes?: string;
}

export interface DaySchedule {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD (ISO date string)
  blocks: ShiftBlock[];
}

export type NoveltyReason = 
  | 'Calamidad doméstica'
  | 'Inclemencias del clima'
  | 'Fuerza mayor'
  | 'Ausentismo'
  | 'Otro';

export interface AuditLogEntry {
  id: string;
  timestamp: string; // ISO 8601
  formattedDate: string; // e.g. "19/10/2026 16:30:00"
  coordinatorId: string;
  coordinatorName: string;
  employeeId: string;
  employeeName: string;
  shiftDate: string;
  reason: NoveltyReason;
  notes: string;
  previousBlocks: ShiftBlock[];
  newBlocks: ShiftBlock[];
  isHighPriorityAlert: boolean; // true if change affects today or tomorrow
  n8nNotificationDispatched: boolean;
}

export interface ShiftLaborCalculation {
  totalMinutes: number;
  totalHours: number;
  diurnalMinutes: number;
  diurnalHours: number;
  nocturnalMinutes: number; // 19:00 - 06:00
  nocturnalHours: number;
  isSundayOrHoliday: boolean;
  notes?: string;
}

export interface EmployeeWeeklyLaborCalculation {
  employeeId: string;
  weekStart: string;
  weekEnd: string;
  totalHours: number;
  ordinaryHours: number;           // Up to 42h diurnal
  nightSurchargeHours: number;     // Recargo nocturno (19:00-06:00 within 42h)
  diurnalOvertimeHours: number;    // HED (Horas extras diurnas >42h or >legal daily)
  nocturnalOvertimeHours: number;  // HEN (Horas extras nocturnas >42h or >legal daily)
  sundayHolidayHours: number;      // Horas dominicales / festivas
  isOverLimit: boolean;            // true if totalHours > 42
  overLimitHours: number;          // Exceso sobre 42h
  percentageOfCapacity: number;    // (totalHours / 42) * 100
}

export interface WebhookConfig {
  sendScheduleUrl: string;
  highPriorityAlertUrl: string;
  backupUrl: string;
  enableSimulationMode: boolean; // if true, simulates n8n response with network latency
  enableDataPrivacyMasking: boolean; // RNF-02: masks phone and email in UI & payloads
}

export interface NotificationLog {
  id: string;
  timestamp: string;
  type: 'SCHEDULE_DISPATCH' | 'HIGH_PRIORITY_ALERT' | 'BACKUP_SYNC';
  recipientId?: string;
  recipientName?: string;
  recipientPhone: string;
  recipientEmail: string;
  payloadSummary: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED' | 'RETRYING';
  httpStatus?: number;
  retryCount: number;
  responseMessage?: string;
}

export interface BackupSnapshot {
  id: string;
  timestamp: string;
  formattedDate: string;
  type: 'AUTOMATIC_N8N_CRON' | 'MANUAL_ADMIN';
  fileName: string;
  fileSizeBytes: number;
  checksum: string; // SHA-256 simulation
  totalShiftsCount: number;
  totalAuditLogsCount: number;
  status: 'SUCCESS' | 'FAILED';
  retentionDaysRemaining: number; // 90 days retention
  snapshotData?: string; // Serialized JSON
}
