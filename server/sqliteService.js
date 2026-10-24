// server/sqliteService.js
/**
 * Servicio de Acceso a Datos SQLite para Zona P
 * Usa el módulo nativo node:sqlite de Node.js v22+
 * Conecta directamente con database/zonap.db
 */

import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const dbPath = path.resolve(process.cwd(), 'database/zonap.db');

// Asegurar que la base de datos existe; si no, inicializarla
if (!fs.existsSync(dbPath)) {
  console.log('[SQLite Service] Base de datos no encontrada. Inicializando database/zonap.db...');
  const initScript = path.resolve(process.cwd(), 'database/init_sqlite.js');
  if (fs.existsSync(initScript)) {
    await import('../database/init_sqlite.js');
  }
}

export function getDatabase() {
  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA foreign_keys = ON;');
  return db;
}

/**
 * Obtiene el estado de salud de la base de datos y conteo de tablas
 */
export function getDbHealth() {
  const db = getDatabase();
  try {
    const sedesCount = db.prepare('SELECT COUNT(*) as c FROM sedes').get().c;
    const empleadosCount = db.prepare('SELECT COUNT(*) as c FROM empleados').get().c;
    const puestosCount = db.prepare('SELECT COUNT(*) as c FROM puestos').get().c;
    const horariosCount = db.prepare('SELECT COUNT(*) as c FROM horarios_puesto').get().c;
    const asignacionesCount = db.prepare('SELECT COUNT(*) as c FROM asignaciones_turno').get().c;
    const bitacoraCount = db.prepare('SELECT COUNT(*) as c FROM bitacora_novedades').get().c;

    return {
      connected: true,
      engine: 'SQLite 3 (node:sqlite native)',
      databaseFile: 'database/zonap.db',
      absolutePath: dbPath,
      counts: {
        sedes: sedesCount,
        empleados: empleadosCount,
        puestos: puestosCount,
        horarios: horariosCount,
        asignaciones: asignacionesCount,
        bitacora: bitacoraCount,
      }
    };
  } finally {
    db.close();
  }
}

/**
 * Carga todo el estado inicial para la aplicación React
 */
export function getAllData() {
  const db = getDatabase();
  try {
    const sedes = db.prepare('SELECT * FROM sedes WHERE activo = 1 ORDER BY id ASC').all();
    const empleadosRaw = db.prepare('SELECT * FROM empleados WHERE activo = 1 ORDER BY nombres ASC').all();
    const puestosRaw = db.prepare('SELECT * FROM puestos WHERE activo = 1 ORDER BY orden ASC').all();
    const horariosRaw = db.prepare('SELECT * FROM horarios_puesto').all();
    const asignacionesRaw = db.prepare('SELECT * FROM asignaciones_turno').all();
    const bitacoraRaw = db.prepare('SELECT * FROM bitacora_novedades ORDER BY created_at DESC').all();
    const backupsRaw = db.prepare('SELECT * FROM copias_seguridad ORDER BY created_at DESC').all();

    // Mapear puestos con sus respectivos horarios
    const puestos = puestosRaw.map(p => {
      const pHorarios = horariosRaw
        .filter(h => h.puesto_id === p.id)
        .map(h => {
          let activeDays = [1, 2, 3, 4, 5];
          try {
            activeDays = JSON.parse(h.dias_activos);
          } catch (e) {}
          return {
            id: h.id,
            startTime: h.hora_inicio,
            endTime: h.hora_fin,
            activeDays,
            label: h.descripcion || undefined
          };
        });

      return {
        id: p.id,
        name: p.nombre,
        sedeId: p.sede_id,
        order: p.orden,
        horarios: pHorarios
      };
    });

    // Mapear empleados al formato TypeScript del frontend
    const roleMapFromDb = {
      admin: 'admin',
      coordinador: 'coordinator',
      coordinator: 'coordinator',
      operario: 'operator',
      operator: 'operator',
      auditor_rrhh: 'hr_auditor',
      hr_auditor: 'hr_auditor'
    };

    const empleados = empleadosRaw.map(e => ({
      id: e.id,
      name: e.nombres,
      cedula: e.cedula,
      role: e.cargo,
      systemRole: roleMapFromDb[e.rol_sistema] || 'operator',
      sedeDefault: e.sede_default_id || 1,
      phone: e.telefono || '',
      email: e.email || '',
      active: Boolean(e.activo),
      colorBg: e.color_badge_bg || '#E0F2FE',
      colorText: e.color_badge_text || '#0369A1',
      colorBorder: e.color_badge_border || '#BAE6FD',
    }));

    // Mapear asignaciones
    const asignaciones = asignacionesRaw.map(a => ({
      id: a.id,
      puestoId: a.puesto_id,
      horarioId: a.horario_id,
      date: a.fecha_turno,
      employeeId: a.empleado_id,
      customNote: a.nota_celda || undefined,
      isCoveredByNovelty: Boolean(a.es_reemplazo_novedad)
    }));

    // Mapear bitácora
    const bitacora = bitacoraRaw.map(b => {
      let prevBlocks = [];
      let newBlocks = [];
      try {
        if (b.turno_anterior_json) prevBlocks = JSON.parse(b.turno_anterior_json);
        if (b.turno_nuevo_json) newBlocks = JSON.parse(b.turno_nuevo_json);
      } catch (e) {}

      return {
        id: b.id,
        timestamp: b.created_at,
        formattedDate: b.created_at,
        coordinatorId: b.coordinador_id,
        coordinatorName: 'Coordinador Zona P',
        employeeId: b.empleado_id,
        employeeName: empleados.find(e => e.id === b.empleado_id)?.name || 'Operario',
        shiftDate: b.fecha_turno,
        reason: b.motivo,
        notes: b.observaciones || '',
        previousBlocks: prevBlocks,
        newBlocks: newBlocks,
        isHighPriorityAlert: Boolean(b.es_prioridad_alta),
        n8nNotificationDispatched: Boolean(b.n8n_dispatched)
      };
    });

    return {
      sedes,
      empleados,
      puestos,
      asignaciones,
      bitacora,
      backups: backupsRaw
    };
  } finally {
    db.close();
  }
}

/**
 * Crea o actualiza un empleado en la base de datos SQLite
 */
export function saveEmployee(empData) {
  const db = getDatabase();
  try {
    const roleMapToDb = {
      admin: 'admin',
      coordinator: 'coordinador',
      coordinador: 'coordinador',
      operator: 'operario',
      operario: 'operario',
      hr_auditor: 'auditor_rrhh',
      auditor_rrhh: 'auditor_rrhh'
    };
    const dbRole = roleMapToDb[empData.systemRole] || 'operario';

    const existing = db.prepare('SELECT id FROM empleados WHERE id = ?').get(empData.id);

    if (existing) {
      db.prepare(`
        UPDATE empleados 
        SET cedula = ?, nombres = ?, cargo = ?, rol_sistema = ?, sede_default_id = ?, 
            telefono = ?, email = ?, color_badge_bg = ?, color_badge_text = ?, color_badge_border = ?, 
            activo = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        empData.cedula || '000000',
        empData.name,
        empData.role || 'Operario de Parqueadero',
        dbRole,
        empData.sedeDefault || 1,
        empData.phone || '',
        empData.email || '',
        empData.colorBg || '#E0F2FE',
        empData.colorText || '#0369A1',
        empData.colorBorder || '#BAE6FD',
        empData.active !== false ? 1 : 0,
        empData.id
      );
    } else {
      db.prepare(`
        INSERT INTO empleados (
          id, cedula, nombres, cargo, rol_sistema, sede_default_id,
          telefono, email, color_badge_bg, color_badge_text, color_badge_border, activo
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        empData.id,
        empData.cedula || `CC-${Date.now().toString().slice(-6)}`,
        empData.name,
        empData.role || 'Operario de Parqueadero',
        dbRole,
        empData.sedeDefault || 1,
        empData.phone || '',
        empData.email || '',
        empData.colorBg || '#E0F2FE',
        empData.colorText || '#0369A1',
        empData.colorBorder || '#BAE6FD',
        empData.active !== false ? 1 : 0
      );
    }

    return { success: true, id: empData.id };
  } finally {
    db.close();
  }
}

/**
 * Elimina un empleado o lo desactiva respetando integridad referencial
 */
export function deleteEmployee(empId) {
  const db = getDatabase();
  try {
    // 1. Limpiar asignaciones activas de este empleado en la matriz
    db.prepare('UPDATE asignaciones_turno SET empleado_id = NULL WHERE empleado_id = ?').run(empId);
    // 2. Eliminar acumulados laborales de este empleado
    db.prepare('DELETE FROM acumulados_laborales_2026 WHERE empleado_id = ?').run(empId);
    // 3. Intentar eliminación física de la tabla empleados
    try {
      db.prepare('DELETE FROM empleados WHERE id = ?').run(empId);
    } catch (e) {
      // Si tiene registros históricos en bitácora inmutable (ON DELETE RESTRICT), desactivarlo
      db.prepare('UPDATE empleados SET activo = 0 WHERE id = ?').run(empId);
    }
    return { success: true, id: empId };
  } finally {
    db.close();
  }
}

/**
 * Crea o renombra un puesto en la base de datos
 */
export function savePuesto(puestoData) {
  const db = getDatabase();
  try {
    const existing = db.prepare('SELECT id FROM puestos WHERE id = ?').get(puestoData.id);

    if (existing) {
      // Actualizar puesto
      db.prepare(`
        UPDATE puestos 
        SET nombre = ?, sede_id = ?, orden = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `).run(puestoData.name, puestoData.sedeId || 1, puestoData.order || 0, puestoData.id);
    } else {
      // Insertar nuevo puesto
      db.prepare(`
        INSERT INTO puestos (id, sede_id, nombre, orden) 
        VALUES (?, ?, ?, ?)
      `).run(puestoData.id, puestoData.sedeId || 1, puestoData.name, puestoData.order || 0);
    }

    // Si se enviaron horarios, sincronizarlos
    if (Array.isArray(puestoData.horarios)) {
      for (const h of puestoData.horarios) {
        saveHorario(puestoData.id, h);
      }
    }

    return { success: true, id: puestoData.id };
  } finally {
    db.close();
  }
}

/**
 * Elimina un puesto
 */
export function deletePuesto(puestoId) {
  const db = getDatabase();
  try {
    db.prepare('DELETE FROM puestos WHERE id = ?').run(puestoId);
    return { success: true };
  } finally {
    db.close();
  }
}

/**
 * Guarda o actualiza un horario
 */
export function saveHorario(puestoId, horarioData) {
  const db = getDatabase();
  try {
    const existing = db.prepare('SELECT id FROM horarios_puesto WHERE id = ?').get(horarioData.id);
    const diasJson = JSON.stringify(horarioData.activeDays || [1, 2, 3, 4, 5]);

    if (existing) {
      db.prepare(`
        UPDATE horarios_puesto 
        SET hora_inicio = ?, hora_fin = ?, dias_activos = ?, descripcion = ?
        WHERE id = ?
      `).run(horarioData.startTime, horarioData.endTime, diasJson, horarioData.label || null, horarioData.id);
    } else {
      db.prepare(`
        INSERT INTO horarios_puesto (id, puesto_id, hora_inicio, hora_fin, dias_activos, descripcion)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(horarioData.id, puestoId, horarioData.startTime, horarioData.endTime, diasJson, horarioData.label || null);
    }

    return { success: true, id: horarioData.id };
  } finally {
    db.close();
  }
}

/**
 * Guarda una asignación en la matriz de turnos
 */
export function saveAsignacion(asg) {
  const db = getDatabase();
  try {
    const id = asg.id || `asg-${asg.puestoId}-${asg.horarioId}-${asg.date}`;

    db.prepare(`
      INSERT INTO asignaciones_turno (
        id, puesto_id, horario_id, fecha_turno, empleado_id, nota_celda, es_reemplazo_novedad, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(puesto_id, horario_id, fecha_turno) DO UPDATE SET
        empleado_id = excluded.empleado_id,
        nota_celda = excluded.nota_celda,
        es_reemplazo_novedad = excluded.es_reemplazo_novedad,
        updated_at = CURRENT_TIMESTAMP
    `).run(
      id,
      asg.puestoId,
      asg.horarioId,
      asg.date,
      asg.employeeId || null,
      asg.customNote || null,
      asg.isCoveredByNovelty ? 1 : 0
    );

    return { success: true, id };
  } finally {
    db.close();
  }
}

/**
 * Desasigna o limpia una celda
 */
export function removeAsignacion(puestoId, horarioId, date) {
  const db = getDatabase();
  try {
    db.prepare(`
      DELETE FROM asignaciones_turno 
      WHERE puesto_id = ? AND horario_id = ? AND fecha_turno = ?
    `).run(puestoId, horarioId, date);
    return { success: true };
  } finally {
    db.close();
  }
}

/**
 * Registra una novedad inmutable en la bitácora (RF-03)
 */
export function saveBitacoraNovedad(novelty) {
  const db = getDatabase();
  try {
    const id = novelty.id || `aud-${Date.now()}`;
    const prevJson = novelty.previousBlocks ? JSON.stringify(novelty.previousBlocks) : null;
    const newJson = novelty.newBlocks ? JSON.stringify(novelty.newBlocks) : null;

    db.prepare(`
      INSERT INTO bitacora_novedades (
        id, empleado_id, coordinador_id, fecha_turno, motivo, observaciones,
        turno_anterior_json, turno_nuevo_json, es_prioridad_alta, n8n_dispatched
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      novelty.employeeId || 'emp-oswaldo',
      novelty.coordinatorId || 'coord-mauricio',
      novelty.shiftDate,
      novelty.reason || 'Otro',
      novelty.notes || '',
      prevJson,
      newJson,
      novelty.isHighPriorityAlert ? 1 : 0,
      novelty.n8nNotificationDispatched ? 1 : 0
    );

    return { success: true, id };
  } finally {
    db.close();
  }
}
