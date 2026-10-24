-- ==============================================================================
-- DATOS INICIALES (SEED) PARA ZONA P EN SQLITE
-- Carga las 3 sedes, cuadrilla completa de operarios y matriz de puestos
-- ==============================================================================

-- 1. SEDES
INSERT OR IGNORE INTO sedes (id, nombre, nombre_corto, direccion, ciudad, color_tema) VALUES
(1, 'Parqueadero Centro - Calle 50', 'Sede 1: Centro', 'Calle 50 # 45-20', 'Medellín', '#3B82F6'),
(2, 'Parqueadero Norte - Av. Poblado', 'Sede 2: Norte', 'Carrera 43A # 18-35', 'Medellín', '#10B981'),
(3, 'Parqueadero Laureles - Circular 4', 'Sede 3: Laureles', 'Circular 4 # 73-10', 'Medellín', '#8B5CF6');

-- 2. EMPLEADOS / OPERARIOS CON SUS RESPECTIVOS COLORES VISUALES
INSERT OR IGNORE INTO empleados (id, cedula, nombres, cargo, rol_sistema, sede_default_id, telefono, email, color_badge_bg, color_badge_text, color_badge_border) VALUES
('emp-oswaldo', '1.020.450.890', 'Oswaldo Alvarez', 'Operario de Puesto', 'operario', 1, '+57 310 445 8892', 'oswaldo.alvarez@zonap.co', '#E0F2FE', '#0369A1', '#BAE6FD'),
('emp-yoiner', '1.036.780.123', 'Yoiner Beltran', 'Operario Control', 'operario', 1, '+57 312 889 1234', 'yoiner.beltran@zonap.co', '#BAE6FD', '#0284C7', '#7DD3FC'),
('emp-edwin', '71.340.560', 'Edwin Acevedo', 'Operario Cierre', 'operario', 1, '+57 300 901 2345', 'edwin.acevedo@zonap.co', '#DCFCE7', '#15803D', '#BBF7D0'),
('emp-cristian', '1.028.910.234', 'Cristian Sanchez', 'Operario Relevo / Novedad', 'operario', 1, '+57 315 678 9012', 'cristian.sanchez@zonap.co', '#F0ABFC', '#701A75', '#E879F9'),
('emp-sekley', '1.018.990.112', 'Sekley Blanco', 'Operario Fin de Semana', 'operario', 1, '+57 320 567 8901', 'sekley.blanco@zonap.co', '#EF4444', '#FFFFFF', '#DC2626'),
('emp-luz', '1.037.890.456', 'Luz A Sepulveda', 'Cajera & Operaria', 'operario', 2, '+57 318 345 6789', 'luz.sepulveda@zonap.co', '#E0F7FA', '#006064', '#B2EBF2'),
('emp-alexander-h', '1.017.654.321', 'Alexander Hdez', 'Valet & Operario', 'operario', 2, '+57 301 234 5678', 'alexander.hdez@zonap.co', '#155E75', '#FFFFFF', '#0E7490'),
('emp-juan-david', '1.025.776.321', 'Juan david prens', 'Operario Volante', 'operario', 2, '+57 311 234 5678', 'juandavid.prens@zonap.co', '#E879F9', '#4A044E', '#D946EF'),
('emp-carolina', '1.038.223.456', 'Carolina Isaza', 'Operaria de Acceso', 'operario', 2, '+57 313 456 7890', 'carolina.isaza@zonap.co', '#0284C7', '#FFFFFF', '#0369A1'),
('emp-victor', '1.019.554.678', 'Victor López', 'Operario de Pista', 'operario', 2, '+57 314 567 8901', 'victor.lopez@zonap.co', '#BBF7D0', '#14532D', '#86EFAC'),
('emp-andrea', '1.042.889.012', 'Andrea Mora', 'Operaria de Puesto', 'operario', 3, '+57 316 789 0123', 'andrea.mora@zonap.co', '#FEF3C7', '#78350F', '#FDE68A'),
('emp-oscar', '70.890.123', 'Oscar Barrientos', 'Operario Mixto', 'operario', 3, '+57 317 890 1234', 'oscar.barrientos@zonap.co', '#FED7AA', '#7C2D12', '#FDBA74'),
('emp-ludy', '1.035.123.789', 'Ludy', 'Operaria de Puesto', 'operario', 3, '+57 319 901 2345', 'ludy@zonap.co', '#FECDD3', '#881337', '#FDA4AF'),
('emp-angelo', '1.022.334.556', 'Angelo Mazo', 'Operario de Puesto', 'operario', 3, '+57 321 012 3456', 'angelo.mazo@zonap.co', '#C2410C', '#FFFFFF', '#9A3412'),
('emp-andres-o', '1.015.667.889', 'Andres otalvaro', 'Operario Relevos', 'operario', 1, '+57 322 123 4567', 'andres.otalvaro@zonap.co', '#F97316', '#FFFFFF', '#EA580C'),
('emp-santiago', '1.026.889.001', 'Santiago Agudelo', 'Operario Control', 'operario', 1, '+57 323 234 5678', 'santiago.agudelo@zonap.co', '#78350F', '#FFFFFF', '#451A03'),
('emp-paola', '1.039.445.667', 'Paola Suaza', 'Operaria de Acceso', 'operario', 2, '+57 324 345 6789', 'paola.suaza@zonap.co', '#4ADE80', '#052E16', '#22C55E'),
('emp-luis-c', '71.556.778', 'Luis Cuesta', 'Operario Turno Tarde', 'operario', 2, '+57 325 456 7890', 'luis.cuesta@zonap.co', '#EAB308', '#422006', '#CA8A04'),
('emp-richar', '1.024.112.334', 'Richar Rodriguez', 'Operario de Relevo', 'operario', 2, '+57 326 567 8901', 'richar.rodriguez@zonap.co', '#E879F9', '#701A75', '#C026D3'),
('emp-felipe', '1.016.998.776', 'Felipe Aviles', 'Operario de Refuerzo', 'operario', 2, '+57 327 678 9012', 'felipe.aviles@zonap.co', '#E879F9', '#701A75', '#C026D3'),
('emp-alexander-c', '1.021.334.889', 'Alexander Caraballo', 'Operario de Acceso', 'operario', 3, '+57 328 789 0123', 'alexander.caraballo@zonap.co', '#581C87', '#FFFFFF', '#3B0764'),
('emp-yolanda', '1.034.556.221', 'Yolanda Giraldo', 'Operaria de Control', 'operario', 3, '+57 329 890 1234', 'yolanda.giraldo@zonap.co', '#7E22CE', '#FFFFFF', '#6B21A8'),
('emp-jose-b', '71.445.667', 'Jose Balladales', 'Operario de Seguridad', 'operario', 3, '+57 330 901 2345', 'jose.balladales@zonap.co', '#14532D', '#FFFFFF', '#052E16'),
('emp-erika', '1.040.667.112', 'Erika Quintero', 'Operaria de Puesto', 'operario', 1, '+57 331 012 3456', 'erika.quintero@zonap.co', '#854D0E', '#FFFFFF', '#713F12'),
('emp-isaac', '1.014.223.889', 'Isaac Santana', 'Operario de Puesto', 'operario', 1, '+57 332 123 4567', 'isaac.santana@zonap.co', '#1E3A8A', '#FFFFFF', '#172554'),
('emp-jose-t', '70.112.334', 'Jose taborda', 'Operario Refuerzo', 'operario', 1, '+57 333 234 5678', 'jose.taborda@zonap.co', '#0E7490', '#FFFFFF', '#155E75'),
('emp-andres-p', '1.027.445.990', 'Andres Perea', 'Operario Mañana', 'operario', 2, '+57 334 345 6789', 'andres.perea@zonap.co', '#C7D2FE', '#312E81', '#A5B4FC'),
('emp-diana-l', '1.033.778.991', 'Diana Londoño', 'Operaria Cierre', 'operario', 2, '+57 335 456 7890', 'diana.londono@zonap.co', '#F1F5F9', '#0F172A', '#CBD5E1'),
('emp-manuel', '71.889.001', 'Manuel Jose', 'Rondero Principal', 'operario', 2, '+57 336 567 8901', 'manuel.jose@zonap.co', '#6B21A8', '#FFFFFF', '#581C87'),
('emp-valery', '1.041.556.778', 'Valery Lloreda', 'Operaria Puesto Privado', 'operario', 3, '+57 337 678 9012', 'valery.lloreda@zonap.co', '#09090B', '#FFFFFF', '#27272A'),
('emp-yenny', '1.036.889.334', 'Yenny Zapata', 'Operaria de Acceso', 'operario', 3, '+57 338 789 0123', 'yenny.zapata@zonap.co', '#FBCFE8', '#831843', '#F9A8D4'),
('emp-jesus', '1.018.445.667', 'Jesus Acosta', 'Operario Relevo', 'operario', 3, '+57 339 890 1234', 'jesus.acosta@zonap.co', '#E879F9', '#701A75', '#C026D3'),
-- Usuarios Administrativos
('coord-mauricio', '1.010.222.333', 'Mauricio Restrepo', 'Coordinador General', 'coordinador', 1, '+57 300 111 2233', 'mauricio.restrepo@zonap.co', '#F8FAFC', '#0F172A', '#E2E8F0'),
('admin-sistema', '1.000.000.001', 'Administrador Zona P', 'Director de Operaciones', 'admin', 1, '+57 300 000 0000', 'admin@zonap.co', '#ECFDF5', '#065F46', '#A7F3D0');

-- 3. PUESTOS CONFIGURADOS POR EL COORDINADOR
INSERT OR IGNORE INTO puestos (id, sede_id, nombre, orden) VALUES
('puesto-1', 1, 'puesto # 1', 1),
('puesto-2', 1, 'Puesto # 2', 2),
('puesto-4', 1, 'Puesto # 4', 3),
('puesto-5', 2, 'Puesto # 5', 4),
('puesto-6', 2, 'Puesto # 6', 5),
('puesto-7', 2, 'Puesto # 7', 6),
('puesto-8', 3, 'puesto # 8', 7),
('puesto-9', 3, 'Puesto # 9', 8),
('puesto-10', 3, 'Puesto # 10', 9),
('puesto-11', 1, 'Puesto # 11', 10),
('puesto-rondero', 2, 'Rondero', 11),
('puesto-12', 3, 'Puesto #12 Privado', 12);

-- 4. HORARIOS Y FRANJAS POR PUESTO
INSERT OR IGNORE INTO horarios_puesto (id, puesto_id, hora_inicio, hora_fin, dias_activos, descripcion) VALUES
-- Puesto # 1
('h-1-1', 'puesto-1', '06:00', '13:00', '[1,2,3,4,5]', 'Lunes a Viernes Mañana'),
('h-1-2', 'puesto-1', '06:00', '15:00', '[6,0]', 'Fin de Semana Mañana'),
('h-1-3', 'puesto-1', '13:00', '20:00', '[1,2,3,4,5]', 'Lunes a Viernes Tarde'),
('h-1-4', 'puesto-1', '20:00', '24:00', '[1,2,3,4,5]', 'Lunes a Viernes Noche'),
('h-1-5', 'puesto-1', '15:00', '24:00', '[6,0]', 'Fin de Semana Tarde/Noche'),
-- Puesto # 2
('h-2-1', 'puesto-2', '09:00', '15:00', '[1,2,3,4,5,6]', 'Lunes a Sábado'),
('h-2-2', 'puesto-2', '14:00', '21:00', '[1,2,3,4,5,6]', 'Lunes a Sábado Tarde'),
('h-2-3', 'puesto-2', '12:00', '20:00', '[0]', 'Domingo Continuo'),
-- Puesto # 4
('h-4-1', 'puesto-4', '07:00', '14:00', '[1,2,3,4,5,6]', 'Lunes a Sábado'),
('h-4-2', 'puesto-4', '14:00', '21:00', '[1,2,3,4,5,6]', 'Lunes a Sábado Tarde'),
('h-4-3', 'puesto-4', '10:00', '20:00', '[0]', 'Domingo'),
-- Puesto # 5
('h-5-1', 'puesto-5', '08:00', '15:00', '[1,2,3,4,5,6,0]', 'Todos los días'),
('h-5-2', 'puesto-5', '16:00', '21:00', '[1,2,3,4,5]', 'Lunes a Viernes'),
('h-5-3', 'puesto-5', '14:00', '21:00', '[6,0]', 'Fin de Semana'),
-- Puesto # 6
('h-6-1', 'puesto-6', '08:00', '15:00', '[1,2,3,4,5,6,0]', 'Todos los días Mañana'),
('h-6-2', 'puesto-6', '14:00', '20:00', '[1,2,3,4,5,6,0]', 'Todos los días Tarde'),
-- Puesto # 7
('h-7-1', 'puesto-7', '11:00', '12:00', '[1,2,3,4,5]', 'Relevo Almuerzo'),
('h-7-2', 'puesto-7', '12:00', '19:00', '[1,2,3,4,5]', 'Tarde'),
('h-7-3', 'puesto-7', '10:00', '18:00', '[6,0]', 'Fin de Semana'),
-- Puesto # 8
('h-8-1', 'puesto-8', '08:00', '15:00', '[1,2,3,4,5,6,0]', 'Todos los días'),
('h-8-2', 'puesto-8', '14:00', '21:00', '[1,2,3,4,5,6,0]', 'Todos los días Tarde'),
-- Puesto # 9
('h-9-1', 'puesto-9', '07:00', '14:00', '[1,2,3,4,5]', 'Mañana'),
('h-9-2', 'puesto-9', '14:00', '16:00', '[1,2,3,4,5]', 'Intermedio'),
('h-9-3', 'puesto-9', '16:00', '17:00', '[1,2,3,4,5]', 'Relevo'),
('h-9-4', 'puesto-9', '17:00', '24:00', '[1,2,3,4,5]', 'Cierre Noche'),
('h-9-5', 'puesto-9', '07:00', '16:00', '[6,0]', 'Fin de Semana Mañana'),
('h-9-6', 'puesto-9', '16:00', '24:00', '[6,0]', 'Fin de Semana Noche'),
-- Puesto # 10
('h-10-1', 'puesto-10', '07:00', '14:00', '[1,2,3,4,5,6,0]', 'Todos los días'),
('h-10-2', 'puesto-10', '14:00', '21:00', '[1,2,3,4,5,6,0]', 'Todos los días Tarde'),
-- Puesto # 11
('h-11-1', 'puesto-11', '06:00', '13:00', '[1,2,3,4,5]', 'Mañana L-V'),
('h-11-2', 'puesto-11', '13:00', '17:00', '[1,2,3,4,5]', 'Tarde L-V'),
('h-11-3', 'puesto-11', '17:00', '24:00', '[1,2,3,4,5]', 'Noche L-V'),
('h-11-4', 'puesto-11', '06:00', '15:00', '[6,0]', 'Mañana S-D'),
('h-11-5', 'puesto-11', '15:00', '24:00', '[6,0]', 'Noche S-D'),
-- Rondero
('h-ron-1', 'puesto-rondero', '11:00', '18:00', '[1,2,3,4,5]', 'Ronda L-V'),
('h-ron-2', 'puesto-rondero', '18:00', '19:00', '[1,2,3,4,5]', 'Refuerzo Pico'),
('h-ron-3', 'puesto-rondero', '12:00', '20:00', '[6,0]', 'Ronda Fin de Semana'),
-- Puesto # 12 Privado
('h-12-1', 'puesto-12', '07:00', '11:00', '[1,2,3,4,5]', 'Apertura Privada'),
('h-12-2', 'puesto-12', '11:00', '17:00', '[1,2,3,4,5]', 'Control Acceso'),
('h-12-3', 'puesto-12', '17:00', '19:00', '[1,2,3,4,5]', 'Cierre Privado'),
('h-12-4', 'puesto-12', '07:00', '13:00', '[6]', 'Sábado Especial');

-- 5. ASIGNACIONES DE LA SEMANA REAL (2026-10-26 AL 2026-11-01) - MUESTRA REPRESENTATIVA
INSERT OR IGNORE INTO asignaciones_turno (id, puesto_id, horario_id, fecha_turno, empleado_id, nota_celda, es_reemplazo_novedad) VALUES
-- Puesto # 1
('asg-p1-h1-20261026', 'puesto-1', 'h-1-1', '2026-10-26', 'emp-oswaldo', NULL, 0),
('asg-p1-h1-20261027', 'puesto-1', 'h-1-1', '2026-10-27', 'emp-oswaldo', NULL, 0),
('asg-p1-h1-20261028', 'puesto-1', 'h-1-1', '2026-10-28', 'emp-oswaldo', NULL, 0),
('asg-p1-h1-20261029', 'puesto-1', 'h-1-1', '2026-10-29', 'emp-oswaldo', NULL, 0),
('asg-p1-h1-20261030', 'puesto-1', 'h-1-1', '2026-10-30', 'emp-oswaldo', NULL, 0),
('asg-p1-h2-20261031', 'puesto-1', 'h-1-2', '2026-10-31', 'emp-sekley', NULL, 0),
('asg-p1-h2-20261101', 'puesto-1', 'h-1-2', '2026-11-01', 'emp-oswaldo', NULL, 0),
('asg-p1-h3-20261026', 'puesto-1', 'h-1-3', '2026-10-26', 'emp-yoiner', NULL, 0),
('asg-p1-h3-20261027', 'puesto-1', 'h-1-3', '2026-10-27', 'emp-cristian', NULL, 1), -- Novedad
('asg-p1-h3-20261028', 'puesto-1', 'h-1-3', '2026-10-28', 'emp-yoiner', NULL, 0),
('asg-p1-h4-20261026', 'puesto-1', 'h-1-4', '2026-10-26', 'emp-edwin', NULL, 0),
('asg-p1-h5-20261031', 'puesto-1', 'h-1-5', '2026-10-31', 'emp-edwin', NULL, 0),
('asg-p1-h5-20261101', 'puesto-1', 'h-1-5', '2026-11-01', 'emp-edwin', NULL, 0),
-- Puesto # 2
('asg-p2-h1-20261026', 'puesto-2', 'h-2-1', '2026-10-26', 'emp-luz', NULL, 0),
('asg-p2-h1-20261031', 'puesto-2', 'h-2-1', '2026-10-31', 'emp-yoiner', '08-15', 0),
('asg-p2-h2-20261026', 'puesto-2', 'h-2-2', '2026-10-26', 'emp-alexander-h', NULL, 0),
('asg-p2-h2-20261031', 'puesto-2', 'h-2-2', '2026-10-31', 'emp-cristian', NULL, 1),
('asg-p2-h3-20261101', 'puesto-2', 'h-2-3', '2026-11-01', 'emp-alexander-h', NULL, 0);

-- 6. AUDITORÍA INMUTABLE (RF-03)
INSERT OR IGNORE INTO bitacora_novedades (id, asignacion_id, empleado_id, coordinador_id, fecha_turno, motivo, observaciones, es_prioridad_alta, n8n_dispatched) VALUES
('aud-001', 'asg-p1-h3-20261027', 'emp-cristian', 'coord-mauricio', '2026-10-27', 'Fuerza mayor', 'Relevo a Yoiner Beltrán por cita médica prioritaria.', 1, 1);
