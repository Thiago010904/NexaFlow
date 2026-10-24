// src/data/mockData.ts

import { Employee, SedeInfo, DaySchedule, AuditLogEntry, BackupSnapshot, Puesto, PuestoAssignment, ShiftBlock } from '../types/index';

export const SEDES_ZONA_P: Record<1 | 2 | 3, SedeInfo> = {
  1: {
    id: 1,
    name: 'Parqueadero Centro - Calle 50',
    shortName: 'Sede 1: Centro',
    address: 'Calle 50 # 45-20, Medellín',
    colorBg: 'bg-blue-50',
    colorBorder: 'border-blue-200',
    colorText: 'text-blue-700',
    colorBadge: 'bg-blue-600',
  },
  2: {
    id: 2,
    name: 'Parqueadero Norte - Av. Poblado',
    shortName: 'Sede 2: Norte',
    address: 'Carrera 43A # 18-35, Medellín',
    colorBg: 'bg-emerald-50',
    colorBorder: 'border-emerald-200',
    colorText: 'text-emerald-700',
    colorBadge: 'bg-emerald-600',
  },
  3: {
    id: 3,
    name: 'Parqueadero Laureles - Circular 4',
    shortName: 'Sede 3: Laureles',
    address: 'Circular 4 # 73-10, Medellín',
    colorBg: 'bg-purple-50',
    colorBorder: 'border-purple-200',
    colorText: 'text-purple-700',
    colorBadge: 'bg-purple-600',
  },
};

/**
 * Operarios de Zona P con su respectiva paleta visual para identificación rápida en la malla
 */
export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-oswaldo',
    name: 'Oswaldo Alvarez',
    cedula: '1.020.450.890',
    role: 'Operario de Puesto',
    sedeDefault: 1,
    phone: '+57 310 445 8892',
    email: 'oswaldo.alvarez@zonap.co',
    active: true,
    colorBg: '#E0F2FE',
    colorText: '#0369A1',
    colorBorder: '#BAE6FD',
  },
  {
    id: 'emp-yoiner',
    name: 'Yoiner Beltran',
    cedula: '1.036.780.123',
    role: 'Operario Control',
    sedeDefault: 1,
    phone: '+57 312 889 1234',
    email: 'yoiner.beltran@zonap.co',
    active: true,
    colorBg: '#BAE6FD',
    colorText: '#0284C7',
    colorBorder: '#7DD3FC',
  },
  {
    id: 'emp-edwin',
    name: 'Edwin Acevedo',
    cedula: '71.340.560',
    role: 'Operario Cierre',
    sedeDefault: 1,
    phone: '+57 300 901 2345',
    email: 'edwin.acevedo@zonap.co',
    active: true,
    colorBg: '#DCFCE7',
    colorText: '#15803D',
    colorBorder: '#BBF7D0',
  },
  {
    id: 'emp-cristian',
    name: 'Cristian Sanchez',
    cedula: '1.028.910.234',
    role: 'Operario Relevo / Novedad',
    sedeDefault: 1,
    phone: '+57 315 678 9012',
    email: 'cristian.sanchez@zonap.co',
    active: true,
    colorBg: '#F0ABFC',
    colorText: '#701A75',
    colorBorder: '#E879F9',
  },
  {
    id: 'emp-sekley',
    name: 'Sekley Blanco',
    cedula: '1.018.990.112',
    role: 'Operario Fin de Semana',
    sedeDefault: 1,
    phone: '+57 320 567 8901',
    email: 'sekley.blanco@zonap.co',
    active: true,
    colorBg: '#EF4444',
    colorText: '#FFFFFF',
    colorBorder: '#DC2626',
  },
  {
    id: 'emp-luz',
    name: 'Luz A Sepulveda',
    cedula: '1.037.890.456',
    role: 'Cajera & Operaria',
    sedeDefault: 2,
    phone: '+57 318 345 6789',
    email: 'luz.sepulveda@zonap.co',
    active: true,
    colorBg: '#E0F7FA',
    colorText: '#006064',
    colorBorder: '#B2EBF2',
  },
  {
    id: 'emp-alexander-h',
    name: 'Alexander Hdez',
    cedula: '1.017.654.321',
    role: 'Valet & Operario',
    sedeDefault: 2,
    phone: '+57 301 234 5678',
    email: 'alexander.hdez@zonap.co',
    active: true,
    colorBg: '#155E75',
    colorText: '#FFFFFF',
    colorBorder: '#0E7490',
  },
  {
    id: 'emp-juan-david',
    name: 'Juan david prens',
    cedula: '1.025.776.321',
    role: 'Operario Volante',
    sedeDefault: 2,
    phone: '+57 311 234 5678',
    email: 'juandavid.prens@zonap.co',
    active: true,
    colorBg: '#E879F9',
    colorText: '#4A044E',
    colorBorder: '#D946EF',
  },
  {
    id: 'emp-carolina',
    name: 'Carolina Isaza',
    cedula: '1.038.223.456',
    role: 'Operaria de Acceso',
    sedeDefault: 2,
    phone: '+57 313 456 7890',
    email: 'carolina.isaza@zonap.co',
    active: true,
    colorBg: '#0284C7',
    colorText: '#FFFFFF',
    colorBorder: '#0369A1',
  },
  {
    id: 'emp-victor',
    name: 'Victor López',
    cedula: '1.019.554.678',
    role: 'Operario de Pista',
    sedeDefault: 2,
    phone: '+57 314 567 8901',
    email: 'victor.lopez@zonap.co',
    active: true,
    colorBg: '#BBF7D0',
    colorText: '#14532D',
    colorBorder: '#86EFAC',
  },
  {
    id: 'emp-andrea',
    name: 'Andrea Mora',
    cedula: '1.042.889.012',
    role: 'Operaria de Puesto',
    sedeDefault: 3,
    phone: '+57 316 789 0123',
    email: 'andrea.mora@zonap.co',
    active: true,
    colorBg: '#FEF3C7',
    colorText: '#78350F',
    colorBorder: '#FDE68A',
  },
  {
    id: 'emp-oscar',
    name: 'Oscar Barrientos',
    cedula: '70.890.123',
    role: 'Operario Mixto',
    sedeDefault: 3,
    phone: '+57 317 890 1234',
    email: 'oscar.barrientos@zonap.co',
    active: true,
    colorBg: '#FED7AA',
    colorText: '#7C2D12',
    colorBorder: '#FDBA74',
  },
  {
    id: 'emp-ludy',
    name: 'Ludy',
    cedula: '1.035.123.789',
    role: 'Operaria de Puesto',
    sedeDefault: 3,
    phone: '+57 319 901 2345',
    email: 'ludy@zonap.co',
    active: true,
    colorBg: '#FECDD3',
    colorText: '#881337',
    colorBorder: '#FDA4AF',
  },
  {
    id: 'emp-angelo',
    name: 'Angelo Mazo',
    cedula: '1.022.334.556',
    role: 'Operario de Puesto',
    sedeDefault: 3,
    phone: '+57 321 012 3456',
    email: 'angelo.mazo@zonap.co',
    active: true,
    colorBg: '#C2410C',
    colorText: '#FFFFFF',
    colorBorder: '#9A3412',
  },
  {
    id: 'emp-andres-o',
    name: 'Andres otalvaro',
    cedula: '1.015.667.889',
    role: 'Operario Relevos',
    sedeDefault: 1,
    phone: '+57 322 123 4567',
    email: 'andres.otalvaro@zonap.co',
    active: true,
    colorBg: '#F97316',
    colorText: '#FFFFFF',
    colorBorder: '#EA580C',
  },
  {
    id: 'emp-santiago',
    name: 'Santiago Agudelo',
    cedula: '1.026.889.001',
    role: 'Operario Control',
    sedeDefault: 1,
    phone: '+57 323 234 5678',
    email: 'santiago.agudelo@zonap.co',
    active: true,
    colorBg: '#78350F',
    colorText: '#FFFFFF',
    colorBorder: '#451A03',
  },
  {
    id: 'emp-paola',
    name: 'Paola Suaza',
    cedula: '1.039.445.667',
    role: 'Operaria de Acceso',
    sedeDefault: 2,
    phone: '+57 324 345 6789',
    email: 'paola.suaza@zonap.co',
    active: true,
    colorBg: '#4ADE80',
    colorText: '#052E16',
    colorBorder: '#22C55E',
  },
  {
    id: 'emp-luis-c',
    name: 'Luis Cuesta',
    cedula: '71.556.778',
    role: 'Operario Turno Tarde',
    sedeDefault: 2,
    phone: '+57 325 456 7890',
    email: 'luis.cuesta@zonap.co',
    active: true,
    colorBg: '#EAB308',
    colorText: '#422006',
    colorBorder: '#CA8A04',
  },
  {
    id: 'emp-richar',
    name: 'Richar Rodriguez',
    cedula: '1.024.112.334',
    role: 'Operario de Relevo',
    sedeDefault: 2,
    phone: '+57 326 567 8901',
    email: 'richar.rodriguez@zonap.co',
    active: true,
    colorBg: '#E879F9',
    colorText: '#701A75',
    colorBorder: '#C026D3',
  },
  {
    id: 'emp-felipe',
    name: 'Felipe Aviles',
    cedula: '1.016.998.776',
    role: 'Operario de Refuerzo',
    sedeDefault: 2,
    phone: '+57 327 678 9012',
    email: 'felipe.aviles@zonap.co',
    active: true,
    colorBg: '#E879F9',
    colorText: '#701A75',
    colorBorder: '#C026D3',
  },
  {
    id: 'emp-alexander-c',
    name: 'Alexander Caraballo',
    cedula: '1.021.334.889',
    role: 'Operario de Acceso',
    sedeDefault: 3,
    phone: '+57 328 789 0123',
    email: 'alexander.caraballo@zonap.co',
    active: true,
    colorBg: '#581C87',
    colorText: '#FFFFFF',
    colorBorder: '#3B0764',
  },
  {
    id: 'emp-yolanda',
    name: 'Yolanda Giraldo',
    cedula: '1.034.556.221',
    role: 'Operaria de Control',
    sedeDefault: 3,
    phone: '+57 329 890 1234',
    email: 'yolanda.giraldo@zonap.co',
    active: true,
    colorBg: '#7E22CE',
    colorText: '#FFFFFF',
    colorBorder: '#6B21A8',
  },
  {
    id: 'emp-jose-b',
    name: 'Jose Balladales',
    cedula: '71.445.667',
    role: 'Operario de Seguridad',
    sedeDefault: 3,
    phone: '+57 330 901 2345',
    email: 'jose.balladales@zonap.co',
    active: true,
    colorBg: '#14532D',
    colorText: '#FFFFFF',
    colorBorder: '#052E16',
  },
  {
    id: 'emp-erika',
    name: 'Erika Quintero',
    cedula: '1.040.667.112',
    role: 'Operaria de Puesto',
    sedeDefault: 1,
    phone: '+57 331 012 3456',
    email: 'erika.quintero@zonap.co',
    active: true,
    colorBg: '#854D0E',
    colorText: '#FFFFFF',
    colorBorder: '#713F12',
  },
  {
    id: 'emp-isaac',
    name: 'Isaac Santana',
    cedula: '1.014.223.889',
    role: 'Operario de Puesto',
    sedeDefault: 1,
    phone: '+57 332 123 4567',
    email: 'isaac.santana@zonap.co',
    active: true,
    colorBg: '#1E3A8A',
    colorText: '#FFFFFF',
    colorBorder: '#172554',
  },
  {
    id: 'emp-jose-t',
    name: 'Jose taborda',
    cedula: '70.112.334',
    role: 'Operario Refuerzo',
    sedeDefault: 1,
    phone: '+57 333 234 5678',
    email: 'jose.taborda@zonap.co',
    active: true,
    colorBg: '#0E7490',
    colorText: '#FFFFFF',
    colorBorder: '#155E75',
  },
  {
    id: 'emp-andres-p',
    name: 'Andres Perea',
    cedula: '1.027.445.990',
    role: 'Operario Mañana',
    sedeDefault: 2,
    phone: '+57 334 345 6789',
    email: 'andres.perea@zonap.co',
    active: true,
    colorBg: '#C7D2FE',
    colorText: '#312E81',
    colorBorder: '#A5B4FC',
  },
  {
    id: 'emp-diana-l',
    name: 'Diana Londoño',
    cedula: '1.033.778.991',
    role: 'Operaria Cierre',
    sedeDefault: 2,
    phone: '+57 335 456 7890',
    email: 'diana.londono@zonap.co',
    active: true,
    colorBg: '#F1F5F9',
    colorText: '#0F172A',
    colorBorder: '#CBD5E1',
  },
  {
    id: 'emp-manuel',
    name: 'Manuel Jose',
    cedula: '71.889.001',
    role: 'Rondero Principal',
    sedeDefault: 2,
    phone: '+57 336 567 8901',
    email: 'manuel.jose@zonap.co',
    active: true,
    colorBg: '#6B21A8',
    colorText: '#FFFFFF',
    colorBorder: '#581C87',
  },
  {
    id: 'emp-valery',
    name: 'Valery Lloreda',
    cedula: '1.041.556.778',
    role: 'Operaria Puesto Privado',
    sedeDefault: 3,
    phone: '+57 337 678 9012',
    email: 'valery.lloreda@zonap.co',
    active: true,
    colorBg: '#09090B',
    colorText: '#FFFFFF',
    colorBorder: '#27272A',
  },
  {
    id: 'emp-yenny',
    name: 'Yenny Zapata',
    cedula: '1.036.889.334',
    role: 'Operaria de Acceso',
    sedeDefault: 3,
    phone: '+57 338 789 0123',
    email: 'yenny.zapata@zonap.co',
    active: true,
    colorBg: '#FBCFE8',
    colorText: '#831843',
    colorBorder: '#F9A8D4',
  },
  {
    id: 'emp-jesus',
    name: 'Jesus Acosta',
    cedula: '1.018.445.667',
    role: 'Operario Relevo',
    sedeDefault: 3,
    phone: '+57 339 890 1234',
    email: 'jesus.acosta@zonap.co',
    active: true,
    colorBg: '#E879F9',
    colorText: '#701A75',
    colorBorder: '#C026D3',
  },
];

/**
 * PUESTOS OPERATIVOS DE ZONA P (Agregados y editables por el coordinador)
 * Reproduce exactamente la estructura de las imágenes provistas por el usuario
 */
export const INITIAL_PUESTOS: Puesto[] = [
  {
    id: 'puesto-1',
    name: 'puesto # 1',
    sedeId: 1,
    order: 1,
    horarios: [
      { id: 'h-1-1', startTime: '06:00', endTime: '13:00', activeDays: [1, 2, 3, 4, 5] },
      { id: 'h-1-2', startTime: '06:00', endTime: '15:00', activeDays: [6, 0] },
      { id: 'h-1-3', startTime: '13:00', endTime: '20:00', activeDays: [1, 2, 3, 4, 5] },
      { id: 'h-1-4', startTime: '20:00', endTime: '24:00', activeDays: [1, 2, 3, 4, 5] },
      { id: 'h-1-5', startTime: '15:00', endTime: '24:00', activeDays: [6, 0] },
    ]
  },
  {
    id: 'puesto-2',
    name: 'Puesto # 2',
    sedeId: 1,
    order: 2,
    horarios: [
      { id: 'h-2-1', startTime: '09:00', endTime: '15:00', activeDays: [1, 2, 3, 4, 5, 6] },
      { id: 'h-2-2', startTime: '14:00', endTime: '21:00', activeDays: [1, 2, 3, 4, 5, 6] },
      { id: 'h-2-3', startTime: '12:00', endTime: '20:00', activeDays: [0] },
    ]
  },
  {
    id: 'puesto-4',
    name: 'Puesto # 4',
    sedeId: 1,
    order: 3,
    horarios: [
      { id: 'h-4-1', startTime: '07:00', endTime: '14:00', activeDays: [1, 2, 3, 4, 5, 6] },
      { id: 'h-4-2', startTime: '14:00', endTime: '21:00', activeDays: [1, 2, 3, 4, 5, 6] },
      { id: 'h-4-3', startTime: '10:00', endTime: '20:00', activeDays: [0] },
    ]
  },
  {
    id: 'puesto-5',
    name: 'Puesto # 5',
    sedeId: 2,
    order: 4,
    horarios: [
      { id: 'h-5-1', startTime: '08:00', endTime: '15:00', activeDays: [1, 2, 3, 4, 5, 6, 0] },
      { id: 'h-5-2', startTime: '16:00', endTime: '21:00', activeDays: [1, 2, 3, 4, 5] },
      { id: 'h-5-3', startTime: '14:00', endTime: '21:00', activeDays: [6, 0] },
    ]
  },
  {
    id: 'puesto-6',
    name: 'Puesto # 6',
    sedeId: 2,
    order: 5,
    horarios: [
      { id: 'h-6-1', startTime: '08:00', endTime: '15:00', activeDays: [1, 2, 3, 4, 5, 6, 0] },
      { id: 'h-6-2', startTime: '14:00', endTime: '20:00', activeDays: [1, 2, 3, 4, 5, 6, 0] },
    ]
  },
  {
    id: 'puesto-7',
    name: 'Puesto # 7',
    sedeId: 2,
    order: 6,
    horarios: [
      { id: 'h-7-1', startTime: '11:00', endTime: '12:00', activeDays: [1, 2, 3, 4, 5] },
      { id: 'h-7-2', startTime: '12:00', endTime: '19:00', activeDays: [1, 2, 3, 4, 5] },
      { id: 'h-7-3', startTime: '10:00', endTime: '18:00', activeDays: [6, 0] },
    ]
  },
  {
    id: 'puesto-8',
    name: 'puesto # 8',
    sedeId: 3,
    order: 7,
    horarios: [
      { id: 'h-8-1', startTime: '08:00', endTime: '15:00', activeDays: [1, 2, 3, 4, 5, 6, 0] },
      { id: 'h-8-2', startTime: '14:00', endTime: '21:00', activeDays: [1, 2, 3, 4, 5, 6, 0] },
    ]
  },
  {
    id: 'puesto-9',
    name: 'Puesto # 9',
    sedeId: 3,
    order: 8,
    horarios: [
      { id: 'h-9-1', startTime: '07:00', endTime: '14:00', activeDays: [1, 2, 3, 4, 5] },
      { id: 'h-9-2', startTime: '14:00', endTime: '16:00', activeDays: [1, 2, 3, 4, 5] },
      { id: 'h-9-3', startTime: '16:00', endTime: '17:00', activeDays: [1, 2, 3, 4, 5] },
      { id: 'h-9-4', startTime: '17:00', endTime: '24:00', activeDays: [1, 2, 3, 4, 5] },
      { id: 'h-9-5', startTime: '07:00', endTime: '16:00', activeDays: [6, 0] },
      { id: 'h-9-6', startTime: '16:00', endTime: '24:00', activeDays: [6, 0] },
    ]
  },
  {
    id: 'puesto-10',
    name: 'Puesto # 10',
    sedeId: 3,
    order: 9,
    horarios: [
      { id: 'h-10-1', startTime: '07:00', endTime: '14:00', activeDays: [1, 2, 3, 4, 5, 6, 0] },
      { id: 'h-10-2', startTime: '14:00', endTime: '21:00', activeDays: [1, 2, 3, 4, 5, 6, 0] },
    ]
  },
  {
    id: 'puesto-11',
    name: 'Puesto # 11',
    sedeId: 1,
    order: 10,
    horarios: [
      { id: 'h-11-1', startTime: '06:00', endTime: '13:00', activeDays: [1, 2, 3, 4, 5] },
      { id: 'h-11-2', startTime: '13:00', endTime: '17:00', activeDays: [1, 2, 3, 4, 5] },
      { id: 'h-11-3', startTime: '17:00', endTime: '24:00', activeDays: [1, 2, 3, 4, 5] },
      { id: 'h-11-4', startTime: '06:00', endTime: '15:00', activeDays: [6, 0] },
      { id: 'h-11-5', startTime: '15:00', endTime: '24:00', activeDays: [6, 0] },
    ]
  },
  {
    id: 'puesto-rondero',
    name: 'Rondero',
    sedeId: 2,
    order: 11,
    horarios: [
      { id: 'h-ron-1', startTime: '11:00', endTime: '18:00', activeDays: [1, 2, 3, 4, 5] },
      { id: 'h-ron-2', startTime: '18:00', endTime: '19:00', activeDays: [1, 2, 3, 4, 5] },
      { id: 'h-ron-3', startTime: '12:00', endTime: '20:00', activeDays: [6, 0] },
    ]
  },
  {
    id: 'puesto-12',
    name: 'Puesto #12 Privado',
    sedeId: 3,
    order: 12,
    horarios: [
      { id: 'h-12-1', startTime: '07:00', endTime: '11:00', activeDays: [1, 2, 3, 4, 5] },
      { id: 'h-12-2', startTime: '11:00', endTime: '17:00', activeDays: [1, 2, 3, 4, 5] },
      { id: 'h-12-3', startTime: '17:00', endTime: '19:00', activeDays: [1, 2, 3, 4, 5] },
      { id: 'h-12-4', startTime: '07:00', endTime: '13:00', activeDays: [6] },
    ]
  },
];

/**
 * Genera la asignación inicial de la semana de trabajo real 26/10/2026 al 01/11/2026
 * tal como aparece exactamente en las imágenes de Zona P
 */
export function getInitialPuestoAssignments(): PuestoAssignment[] {
  const dates = [
    '2026-10-26', // Lunes (1)
    '2026-10-27', // Martes (2)
    '2026-10-28', // Miércoles (3)
    '2026-10-29', // Jueves (4)
    '2026-10-30', // Viernes (5)
    '2026-10-31', // Sábado (6)
    '2026-11-01', // Domingo (0)
  ];

  const assignments: PuestoAssignment[] = [];

  const add = (
    puestoId: string,
    horarioId: string,
    dayIndex: number, // 0 = Lunes, 1 = Martes ... 6 = Domingo
    employeeId: string | null,
    customNote?: string,
    isCoveredByNovelty?: boolean
  ) => {
    assignments.push({
      id: `asg-${puestoId}-${horarioId}-${dates[dayIndex]}`,
      puestoId,
      horarioId,
      date: dates[dayIndex],
      employeeId,
      customNote,
      isCoveredByNovelty
    });
  };

  // --- PUESTO # 1 ---
  // 06:00 - 13:00 (Lunes a Viernes: Oswaldo Alvarez)
  for (let i = 0; i < 5; i++) add('puesto-1', 'h-1-1', i, 'emp-oswaldo');
  // 06:00 - 15:00 (Sabado: Sekley Blanco, Domingo: Oswaldo Alvarez)
  add('puesto-1', 'h-1-2', 5, 'emp-sekley');
  add('puesto-1', 'h-1-2', 6, 'emp-oswaldo');
  // 13:00 - 20:00 (L-V: Yoiner Beltran, Martes novedad: Cristian Sanchez)
  add('puesto-1', 'h-1-3', 0, 'emp-yoiner');
  add('puesto-1', 'h-1-3', 1, 'emp-cristian', undefined, true);
  add('puesto-1', 'h-1-3', 2, 'emp-yoiner');
  add('puesto-1', 'h-1-3', 3, 'emp-yoiner');
  add('puesto-1', 'h-1-3', 4, 'emp-yoiner');
  // 20:00 - 24:00 (L-V: Edwin Acevedo)
  for (let i = 0; i < 5; i++) add('puesto-1', 'h-1-4', i, 'emp-edwin');
  // 15:00 - 24:00 (Sábado y Domingo: Edwin Acevedo)
  add('puesto-1', 'h-1-5', 5, 'emp-edwin');
  add('puesto-1', 'h-1-5', 6, 'emp-edwin');

  // --- PUESTO # 2 ---
  // 09:00 - 15:00 (L-V: Luz A Sepulveda, Sábado: Yoiner Beltran 08-15)
  for (let i = 0; i < 5; i++) add('puesto-2', 'h-2-1', i, 'emp-luz');
  add('puesto-2', 'h-2-1', 5, 'emp-yoiner', '08-15');
  // 14:00 - 21:00 (L-V: Alexander Hdez, Sábado: Cristian Sanchez)
  for (let i = 0; i < 5; i++) add('puesto-2', 'h-2-2', i, 'emp-alexander-h');
  add('puesto-2', 'h-2-2', 5, 'emp-cristian', undefined, true);
  // 12:00 - 20:00 (Domingo: Alexander Hdez)
  add('puesto-2', 'h-2-3', 6, 'emp-alexander-h');

  // --- PUESTO # 4 ---
  // 07:00 - 14:00 (Lunes: Juan david prens, Martes-Sab: Carolina Isaza)
  add('puesto-4', 'h-4-1', 0, 'emp-juan-david', undefined, true);
  for (let i = 1; i <= 5; i++) add('puesto-4', 'h-4-1', i, 'emp-carolina');
  // 14:00 - 21:00 (Lunes-Miér: Victor López, Jue-Vie: Juan david prens, Sáb: Victor López)
  add('puesto-4', 'h-4-2', 0, 'emp-victor');
  add('puesto-4', 'h-4-2', 1, 'emp-victor');
  add('puesto-4', 'h-4-2', 2, 'emp-victor');
  add('puesto-4', 'h-4-2', 3, 'emp-juan-david', undefined, true);
  add('puesto-4', 'h-4-2', 4, 'emp-juan-david', undefined, true);
  add('puesto-4', 'h-4-2', 5, 'emp-victor');
  // 10:00 - 20:00 (Domingo: Luz A Sepulveda)
  add('puesto-4', 'h-4-3', 6, 'emp-luz');

  // --- PUESTO # 5 ---
  // 08:00 - 15:00 (Lunes a Domingo: Andrea Mora)
  for (let i = 0; i < 7; i++) add('puesto-5', 'h-5-1', i, 'emp-andrea');
  // 16:00 - 21:00 (Lunes a Viernes: Oscar Barrientos)
  for (let i = 0; i < 5; i++) add('puesto-5', 'h-5-2', i, 'emp-oscar');
  // 14:00 - 21:00 (Sábado y Domingo: Oscar Barrientos)
  add('puesto-5', 'h-5-3', 5, 'emp-oscar');
  add('puesto-5', 'h-5-3', 6, 'emp-oscar');

  // --- PUESTO # 6 ---
  // 08:00 - 15:00 (Ludy, Jueves: Cristian Sanchez)
  add('puesto-6', 'h-6-1', 0, 'emp-ludy');
  add('puesto-6', 'h-6-1', 1, 'emp-ludy');
  add('puesto-6', 'h-6-1', 2, 'emp-ludy');
  add('puesto-6', 'h-6-1', 3, 'emp-cristian', undefined, true);
  add('puesto-6', 'h-6-1', 4, 'emp-ludy');
  add('puesto-6', 'h-6-1', 5, 'emp-ludy');
  add('puesto-6', 'h-6-1', 6, 'emp-ludy');
  // 14:00 - 20:00 (Angelo Mazo, Viernes: Cristian Sanchez)
  for (let i = 0; i < 7; i++) {
    if (i === 4) add('puesto-6', 'h-6-2', i, 'emp-cristian', undefined, true);
    else add('puesto-6', 'h-6-2', i, 'emp-angelo');
  }

  // --- PUESTO # 7 ---
  // 11:00 - 12:00 (L-V: Andres otalvaro)
  for (let i = 0; i < 5; i++) add('puesto-7', 'h-7-1', i, 'emp-andres-o');
  // 12:00 - 19:00 (L-J: Santiago Agudelo, Viernes: Jesus Acosta)
  for (let i = 0; i < 4; i++) add('puesto-7', 'h-7-2', i, 'emp-santiago');
  add('puesto-7', 'h-7-2', 4, 'emp-jesus', undefined, true);
  // 10:00 - 18:00 (Sábado y Domingo: Santiago Agudelo)
  add('puesto-7', 'h-7-3', 5, 'emp-santiago');
  add('puesto-7', 'h-7-3', 6, 'emp-santiago');

  // --- PUESTO # 8 ---
  // 08:00 - 15:00 (Paola Suaza, Miércoles: Juan david prens, Domingo: Felipe Aviles)
  for (let i = 0; i < 7; i++) {
    if (i === 2) add('puesto-8', 'h-8-1', i, 'emp-juan-david', undefined, true);
    else if (i === 6) add('puesto-8', 'h-8-1', i, 'emp-felipe', undefined, true);
    else add('puesto-8', 'h-8-1', i, 'emp-paola');
  }
  // 14:00 - 21:00 (Lunes: Richar Rodriguez, Martes a Sábado: Luis Cuesta, Domingo: Sekley Blanco)
  add('puesto-8', 'h-8-2', 0, 'emp-richar', undefined, true);
  for (let i = 1; i <= 5; i++) add('puesto-8', 'h-8-2', i, 'emp-luis-c');
  add('puesto-8', 'h-8-2', 6, 'emp-sekley');

  // --- PUESTO # 9 ---
  // 07:00 - 14:00 (L-V: Alexander Caraballo)
  for (let i = 0; i < 5; i++) add('puesto-9', 'h-9-1', i, 'emp-oscar'); // oscar / caraballo
  // 14:00 - 16:00 (L-V: Oscar Barrientos)
  for (let i = 0; i < 5; i++) add('puesto-9', 'h-9-2', i, 'emp-oscar');
  // 16:00 - 17:00 (L-V: Yolanda Giraldo)
  for (let i = 0; i < 5; i++) add('puesto-9', 'h-9-3', i, 'emp-yolanda');
  // 17:00 - 24:00 (L-V: Jose Balladales, Jueves: Richar Rodriguez)
  for (let i = 0; i < 5; i++) {
    if (i === 3) add('puesto-9', 'h-9-4', i, 'emp-richar', undefined, true);
    else add('puesto-9', 'h-9-4', i, 'emp-jose-b');
  }
  // 07:00 - 16:00 (Sábado: Alexander Caraballo, Domingo: Alexander Caraballo)
  add('puesto-9', 'h-9-5', 5, 'emp-alexander-c');
  add('puesto-9', 'h-9-5', 6, 'emp-alexander-c');
  // 16:00 - 24:00 (Sábado: Jose Balladales, Domingo: Richar Rodriguez)
  add('puesto-9', 'h-9-6', 5, 'emp-jose-b');
  add('puesto-9', 'h-9-6', 6, 'emp-richar', undefined, true);

  // --- PUESTO # 10 ---
  // 07:00 - 14:00 (L-S: Erika Quintero, Martes: Richar Rodriguez, Domingo: Jose taborda)
  for (let i = 0; i < 7; i++) {
    if (i === 1) add('puesto-10', 'h-10-1', i, 'emp-richar', undefined, true);
    else if (i === 6) add('puesto-10', 'h-10-1', i, 'emp-jose-t');
    else add('puesto-10', 'h-10-1', i, 'emp-erika');
  }
  // 14:00 - 21:00 (Isaac Santana, Miércoles: Richar Rodriguez, Domingo: Cristian Sanchez)
  for (let i = 0; i < 7; i++) {
    if (i === 2) add('puesto-10', 'h-10-2', i, 'emp-richar', undefined, true);
    else if (i === 6) add('puesto-10', 'h-10-2', i, 'emp-cristian', undefined, true);
    else add('puesto-10', 'h-10-2', i, 'emp-isaac');
  }

  // --- PUESTO # 11 ---
  // 06:00 - 13:00 (L-V: Andres Perea)
  for (let i = 0; i < 5; i++) add('puesto-11', 'h-11-1', i, 'emp-andres-p');
  // 13:00 - 17:00 (Lunes: Cristian Sanchez, Martes a Viernes: Sekley Blanco)
  add('puesto-11', 'h-11-2', 0, 'emp-cristian', undefined, true);
  for (let i = 1; i < 5; i++) add('puesto-11', 'h-11-2', i, 'emp-sekley');
  // 17:00 - 24:00 (L-V: Diana Londoño)
  for (let i = 0; i < 5; i++) add('puesto-11', 'h-11-3', i, 'emp-diana-l');
  // 06:00 - 15:00 (Sábado: Richar Rodriguez, Domingo: Andres Perea)
  add('puesto-11', 'h-11-4', 5, 'emp-richar', undefined, true);
  add('puesto-11', 'h-11-4', 6, 'emp-andres-p');
  // 15:00 - 24:00 (Sábado y Domingo: Diana Londoño)
  add('puesto-11', 'h-11-5', 5, 'emp-diana-l');
  add('puesto-11', 'h-11-5', 6, 'emp-diana-l');

  // --- RONDERO ---
  // 11:00 - 18:00 (L-V: Manuel Jose)
  for (let i = 0; i < 5; i++) add('puesto-rondero', 'h-ron-1', i, 'emp-manuel');
  // 18:00 - 19:00 (L-V: Yolanda Giraldo, Miércoles: Cristian Sanchez)
  for (let i = 0; i < 5; i++) {
    if (i === 2) add('puesto-rondero', 'h-ron-2', i, 'emp-cristian', undefined, true);
    else add('puesto-rondero', 'h-ron-2', i, 'emp-yolanda');
  }
  // 12:00 - 20:00 (Sábado: Juan david prens, Domingo: Manuel Jose)
  add('puesto-rondero', 'h-ron-3', 5, 'emp-juan-david', undefined, true);
  add('puesto-rondero', 'h-ron-3', 6, 'emp-manuel');

  // --- PUESTO # 12 PRIVADO ---
  // 07:00 - 11:00 (L-V: Andres otalvaro)
  for (let i = 0; i < 5; i++) add('puesto-12', 'h-12-1', i, 'emp-andres-o');
  // 11:00 - 17:00 (L-V: Valery Lloreda)
  for (let i = 0; i < 5; i++) add('puesto-12', 'h-12-2', i, 'emp-valery');
  // 17:00 - 19:00 (L-V: Yenny Zapata, Jueves: Jesus Acosta)
  for (let i = 0; i < 5; i++) {
    if (i === 3) add('puesto-12', 'h-12-3', i, 'emp-jesus', undefined, true);
    else add('puesto-12', 'h-12-3', i, 'emp-yenny');
  }
  // 07:00 - 13:00 (Sábado: Valery Lloreda)
  add('puesto-12', 'h-12-4', 5, 'emp-valery');

  return assignments;
}

/**
 * Convierte las asignaciones de Puestos a la estructura `DaySchedule[]`
 * para alimentar automáticamente al Motor Laboral Colombiano (RF-01, RF-02)
 */
export function syncPuestoAssignmentsToDaySchedules(
  assignments: PuestoAssignment[],
  puestos: Puesto[]
): DaySchedule[] {
  // Mapa agrupado por employeeId + date
  const scheduleMap = new Map<string, { employeeId: string; date: string; blocks: ShiftBlock[] }>();

  assignments.forEach((asg) => {
    if (!asg.employeeId) return;

    const puesto = puestos.find((p) => p.id === asg.puestoId);
    if (!puesto) return;

    const horario = puesto.horarios.find((h) => h.id === asg.horarioId);
    if (!horario) return;

    const key = `${asg.employeeId}_${asg.date}`;

    if (!scheduleMap.has(key)) {
      scheduleMap.set(key, {
        employeeId: asg.employeeId,
        date: asg.date,
        blocks: [],
      });
    }

    const entry = scheduleMap.get(key)!;
    entry.blocks.push({
      id: `b-${asg.id}`,
      sedeId: puesto.sedeId,
      puestoId: puesto.id,
      puestoName: puesto.name,
      startTime: horario.startTime,
      endTime: horario.endTime,
      notes: asg.customNote ? `${puesto.name} (${asg.customNote})` : puesto.name,
    });
  });

  const schedules: DaySchedule[] = [];
  scheduleMap.forEach((val, key) => {
    schedules.push({
      id: `sch-${key}`,
      employeeId: val.employeeId,
      date: val.date,
      blocks: val.blocks,
    });
  });

  return schedules;
}

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud-001',
    timestamp: '2026-10-25T14:20:10Z',
    formattedDate: '25/10/2026 09:20 AM',
    coordinatorId: 'coord-01',
    coordinatorName: 'Mauricio Restrepo (Coord. General Zona P)',
    employeeId: 'emp-cristian',
    employeeName: 'Cristian Sanchez',
    shiftDate: '2026-10-27',
    reason: 'Fuerza mayor',
    notes: 'Reasignación a Puesto # 1 (13:00-20:00) para cubrir cita médica programada.',
    previousBlocks: [
      { id: 'b-prev-1', sedeId: 1, startTime: '13:00', endTime: '20:00', notes: 'Turno estándar Yoiner Beltran' }
    ],
    newBlocks: [
      { id: 'b-new-1', sedeId: 1, startTime: '13:00', endTime: '20:00', notes: 'Relevo Cristian Sanchez' }
    ],
    isHighPriorityAlert: true,
    n8nNotificationDispatched: true,
  },
  {
    id: 'aud-002',
    timestamp: '2026-10-26T07:15:00Z',
    formattedDate: '26/10/2026 02:15 AM',
    coordinatorId: 'coord-02',
    coordinatorName: 'Carolina Echeverri (Coord. Operaciones)',
    employeeId: 'emp-juan-david',
    employeeName: 'Juan david prens',
    shiftDate: '2026-10-26',
    reason: 'Inclemencias del clima',
    notes: 'Asignación de turno de apertura en Puesto # 4 por contingencia vial.',
    previousBlocks: [],
    newBlocks: [
      { id: 'b-new-2a', sedeId: 1, startTime: '07:00', endTime: '14:00', notes: 'Puesto # 4 Apertura' },
    ],
    isHighPriorityAlert: true,
    n8nNotificationDispatched: true,
  },
];

export const INITIAL_BACKUPS: BackupSnapshot[] = [
  {
    id: 'bkp-2026-10-26',
    timestamp: '2026-10-26T04:59:00Z',
    formattedDate: '26/10/2026 23:59:00 COT',
    type: 'AUTOMATIC_N8N_CRON',
    fileName: 'zonap_backup_20261026_daily.json',
    fileSizeBytes: 32450,
    checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    totalShiftsCount: 52,
    totalAuditLogsCount: 2,
    status: 'SUCCESS',
    retentionDaysRemaining: 90,
  },
  {
    id: 'bkp-2026-10-25',
    timestamp: '2026-10-25T04:59:00Z',
    formattedDate: '25/10/2026 23:59:00 COT',
    type: 'AUTOMATIC_N8N_CRON',
    fileName: 'zonap_backup_20261025_daily.json',
    fileSizeBytes: 31200,
    checksum: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    totalShiftsCount: 50,
    totalAuditLogsCount: 1,
    status: 'SUCCESS',
    retentionDaysRemaining: 89,
  },
];
