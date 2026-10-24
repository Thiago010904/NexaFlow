-- ==============================================================================
-- SISTEMA DE AUTOMATIZACIÓN DE FLUJO LABORAL Y GESTIÓN DE TURNOS — ZONA P
-- Esquema de Base de Datos para SQLite 3
-- Cumple con: Matriz de Puestos, Normativa Laboral 2026 (42h), Auditoría y n8n
-- ==============================================================================

PRAGMA foreign_keys = ON;

-- ------------------------------------------------------------------------------
-- 1. TABLA: sedes (Parqueaderos de la empresa)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sedes (
    id INTEGER PRIMARY KEY,
    nombre TEXT NOT NULL,
    nombre_corto TEXT NOT NULL,
    direccion TEXT,
    ciudad TEXT DEFAULT 'Medellín',
    color_tema TEXT DEFAULT '#10B981',
    activo INTEGER DEFAULT 1 CHECK(activo IN (0, 1)),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 2. TABLA: empleados (Operarios, Cajeros, Coordinadores y Administradores)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS empleados (
    id TEXT PRIMARY KEY, -- UUID o identificador único (ej: 'emp-oswaldo')
    cedula TEXT UNIQUE NOT NULL,
    nombres TEXT NOT NULL,
    cargo TEXT NOT NULL,
    rol_sistema TEXT DEFAULT 'operario' CHECK(rol_sistema IN ('admin', 'coordinador', 'operario', 'auditor_rrhh')),
    sede_default_id INTEGER REFERENCES sedes(id) ON DELETE SET NULL,
    telefono TEXT,
    email TEXT,
    color_badge_bg TEXT DEFAULT '#E0F2FE',   -- Color de fondo celda en la matriz
    color_badge_text TEXT DEFAULT '#0369A1', -- Color de texto legible
    color_badge_border TEXT DEFAULT '#BAE6FD',
    activo INTEGER DEFAULT 1 CHECK(activo IN (0, 1)),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 3. TABLA: puestos (Puestos de trabajo configurables y editables por el Coordinador)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS puestos (
    id TEXT PRIMARY KEY, -- UUID (ej: 'puesto-1')
    sede_id INTEGER NOT NULL REFERENCES sedes(id) ON DELETE RESTRICT,
    nombre TEXT NOT NULL, -- Editable: 'puesto # 1', 'Rondero', 'Puesto # 12 Privado', etc.
    orden INTEGER DEFAULT 0,
    activo INTEGER DEFAULT 1 CHECK(activo IN (0, 1)),
    created_by_user TEXT REFERENCES empleados(id) ON DELETE SET NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 4. TABLA: horarios_puesto (Franjas horarias asociadas a cada puesto)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS horarios_puesto (
    id TEXT PRIMARY KEY, -- UUID (ej: 'h-1-1')
    puesto_id TEXT NOT NULL REFERENCES puestos(id) ON DELETE CASCADE,
    hora_inicio TEXT NOT NULL, -- Formato 'HH:MM' (ej: '06:00')
    hora_fin TEXT NOT NULL,    -- Formato 'HH:MM' (ej: '13:00' o '24:00' para medianoche)
    dias_activos TEXT NOT NULL, -- JSON array con días operativos: '[1,2,3,4,5]' o '[6,0]'
    descripcion TEXT,          -- Ej: 'Turno Mañana Apertura'
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 5. TABLA: asignaciones_turno (Matriz Operativa: Puesto + Horario + Fecha + Empleado)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS asignaciones_turno (
    id TEXT PRIMARY KEY, -- UUID (ej: 'asg-puesto-1-h-1-1-2026-10-26')
    puesto_id TEXT NOT NULL REFERENCES puestos(id) ON DELETE CASCADE,
    horario_id TEXT NOT NULL REFERENCES horarios_puesto(id) ON DELETE CASCADE,
    fecha_turno TEXT NOT NULL, -- Formato ISO 'YYYY-MM-DD' (ej: '2026-10-26')
    empleado_id TEXT REFERENCES empleados(id) ON DELETE SET NULL, -- NULL si está vacante
    nota_celda TEXT, -- Ej: '08-15', 'Relevo', 'Refuerzo'
    es_reemplazo_novedad INTEGER DEFAULT 0 CHECK(es_reemplazo_novedad IN (0, 1)),
    asignado_por TEXT REFERENCES empleados(id) ON DELETE SET NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    -- Restricción fundamental: una sola asignación por slot y fecha
    UNIQUE(puesto_id, horario_id, fecha_turno)
);

-- ------------------------------------------------------------------------------
-- 6. TABLA: bitacora_novedades (Registro Inmutable de Auditoría - RF-03)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bitacora_novedades (
    id TEXT PRIMARY KEY, -- UUID (ej: 'aud-1792694000')
    asignacion_id TEXT REFERENCES asignaciones_turno(id) ON DELETE SET NULL,
    empleado_id TEXT NOT NULL REFERENCES empleados(id) ON DELETE RESTRICT,
    coordinador_id TEXT NOT NULL REFERENCES empleados(id) ON DELETE RESTRICT,
    fecha_turno TEXT NOT NULL, -- Fecha del turno alterado (YYYY-MM-DD)
    motivo TEXT NOT NULL CHECK(motivo IN (
        'Calamidad doméstica',
        'Inclemencias del clima',
        'Fuerza mayor',
        'Ausentismo',
        'Otro'
    )),
    observaciones TEXT,
    turno_anterior_json TEXT, -- Serialización JSON del estado previo
    turno_nuevo_json TEXT,    -- Serialización JSON del nuevo estado
    es_prioridad_alta INTEGER DEFAULT 0 CHECK(es_prioridad_alta IN (0, 1)), -- 1 si es hoy/mañana
    n8n_dispatched INTEGER DEFAULT 0 CHECK(n8n_dispatched IN (0, 1)),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 7. TABLA: acumulados_laborales_2026 (Motor de Cálculo Laboral - RF-01 / RF-02)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS acumulados_laborales_2026 (
    id TEXT PRIMARY KEY,
    empleado_id TEXT NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
    semana_inicio TEXT NOT NULL, -- Lunes 'YYYY-MM-DD'
    semana_fin TEXT NOT NULL,    -- Domingo 'YYYY-MM-DD'
    horas_totales REAL DEFAULT 0.0,
    horas_ordinarias REAL DEFAULT 0.0,      -- Hasta 42h diurnas legales
    recargo_nocturno_19_06 REAL DEFAULT 0.0, -- Franja 19:00 - 06:00 (+35%)
    extras_diurnas_hed REAL DEFAULT 0.0,     -- Horas Extras Diurnas (+25%)
    extras_nocturnas_hen REAL DEFAULT 0.0,   -- Horas Extras Nocturnas (+75%)
    dominicales_festivas REAL DEFAULT 0.0,   -- Dominicales / Festivos (+75% / +100%)
    is_over_limit_42h INTEGER DEFAULT 0 CHECK(is_over_limit_42h IN (0, 1)),
    overtime_excess_hours REAL DEFAULT 0.0,  -- Excedente sobre las 42h
    calculado_en TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(empleado_id, semana_inicio)
);

-- ------------------------------------------------------------------------------
-- 8. TABLA: notificaciones_n8n_logs (Observabilidad de Webhooks WhatsApp - RF-05)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notificaciones_n8n_logs (
    id TEXT PRIMARY KEY,
    tipo_evento TEXT NOT NULL CHECK(tipo_evento IN (
        'SCHEDULE_DISPATCH',
        'HIGH_PRIORITY_ALERT',
        'BACKUP_SYNC'
    )),
    destinatario_phone TEXT,
    destinatario_email TEXT,
    payload_json TEXT, -- Carga útil transmitida al webhook
    estado TEXT DEFAULT 'PENDING' CHECK(estado IN ('SUCCESS', 'PENDING', 'FAILED', 'RETRYING')),
    http_status INTEGER,
    retry_count INTEGER DEFAULT 0,
    respuesta_n8n TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 9. TABLA: copias_seguridad (Respaldos Históricos 90 días - RF-06 & Flujo 8)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS copias_seguridad (
    id TEXT PRIMARY KEY,
    tipo TEXT NOT NULL CHECK(tipo IN ('AUTOMATIC_N8N_CRON', 'MANUAL_ADMIN')),
    archivo_nombre TEXT NOT NULL,
    tamanio_bytes INTEGER NOT NULL,
    checksum_sha256 TEXT NOT NULL,
    payload_snapshot TEXT, -- Archivo JSON comprimido de la malla
    retention_days_left INTEGER DEFAULT 90,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- ÍNDICES DE ALTO RENDIMIENTO
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_asg_fecha ON asignaciones_turno(fecha_turno);
CREATE INDEX IF NOT EXISTS idx_asg_empleado_fecha ON asignaciones_turno(empleado_id, fecha_turno);
CREATE INDEX IF NOT EXISTS idx_asg_puesto_fecha ON asignaciones_turno(puesto_id, fecha_turno);
CREATE INDEX IF NOT EXISTS idx_puestos_sede ON puestos(sede_id, activo);
CREATE INDEX IF NOT EXISTS idx_horarios_puesto ON horarios_puesto(puesto_id);
CREATE INDEX IF NOT EXISTS idx_bitacora_fecha ON bitacora_novedades(fecha_turno);
CREATE INDEX IF NOT EXISTS idx_bitacora_empleado ON bitacora_novedades(empleado_id);
CREATE INDEX IF NOT EXISTS idx_acumulados_semana ON acumulados_laborales_2026(semana_inicio, semana_fin);

-- ==============================================================================
-- VISTAS SQL PARA REPORTES Y CONSULTAS RÁPIDAS
-- ==============================================================================

-- Vista 1: Matriz Completa de Turnos con Nombres y Horas
CREATE VIEW IF NOT EXISTS v_matriz_turnos_completa AS
SELECT 
    a.id AS asignacion_id,
    a.fecha_turno,
    s.nombre_corto AS sede,
    p.id AS puesto_id,
    p.nombre AS puesto_nombre,
    p.orden AS puesto_orden,
    h.id AS horario_id,
    h.hora_inicio,
    h.hora_fin,
    h.dias_activos,
    e.id AS empleado_id,
    e.nombres AS empleado_nombre,
    e.cedula AS empleado_cedula,
    e.cargo AS empleado_cargo,
    e.color_badge_bg,
    e.color_badge_text,
    a.nota_celda,
    a.es_reemplazo_novedad
FROM asignaciones_turno a
JOIN puestos p ON a.puesto_id = p.id
JOIN sedes s ON p.sede_id = s.id
JOIN horarios_puesto h ON a.horario_id = h.id
LEFT JOIN empleados e ON a.empleado_id = e.id;

-- Vista 2: Reporte Consolidado de Nómina Semanal
CREATE VIEW IF NOT EXISTS v_reporte_nomina_consolidado AS
SELECT 
    e.cedula,
    e.nombres,
    e.cargo,
    s.nombre AS sede_principal,
    a.semana_inicio,
    a.semana_fin,
    a.horas_totales,
    a.horas_ordinarias,
    a.recargo_nocturno_19_06,
    a.extras_diurnas_hed,
    a.extras_nocturnas_hen,
    a.dominicales_festivas,
    a.is_over_limit_42h,
    a.overtime_excess_hours
FROM acumulados_laborales_2026 a
JOIN empleados e ON a.empleado_id = e.id
LEFT JOIN sedes s ON e.sede_default_id = s.id;
