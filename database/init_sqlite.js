// database/init_sqlite.js
/**
 * Inicializador Automático de Base de Datos SQLite para Zona P
 * Usa el módulo nativo node:sqlite disponible en Node.js v22+
 * Ejecuta schema.sql y seed.sql creando el archivo 'database/zonap.db'
 */

import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'zonap.db');
const schemaPath = path.join(__dirname, 'schema.sql');
const seedPath = path.join(__dirname, 'seed.sql');

console.log('====================================================');
console.log('   INICIALIZANDO BASE DE DATOS SQLITE — ZONA P     ');
console.log('====================================================');

const db = new DatabaseSync(dbPath);

// Habilitar claves foráneas
db.exec('PRAGMA foreign_keys = ON;');

console.log('1. Ejecutando DDL (schema.sql)...');
const schemaSql = fs.readFileSync(schemaPath, 'utf8');
db.exec(schemaSql);
console.log('   ✓ Tablas, índices y vistas creadas correctamente.');

console.log('2. Insertando datos semilla (seed.sql)...');
const seedSql = fs.readFileSync(seedPath, 'utf8');
db.exec(seedSql);
console.log('   ✓ Sedes, operarios, puestos y horarios cargados.');

console.log('\n3. Resumen de Registros en la Base de Datos:');
const tables = [
  'sedes',
  'empleados',
  'puestos',
  'horarios_puesto',
  'asignaciones_turno',
  'bitacora_novedades',
  'acumulados_laborales_2026',
  'notificaciones_n8n_logs',
  'copias_seguridad'
];

for (const table of tables) {
  const row = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get();
  console.log(`   - ${table.padEnd(28)}: ${row.count} registros`);
}

console.log('\n4. Prueba de Consulta sobre Vista v_matriz_turnos_completa:');
const sample = db.prepare(`
  SELECT puesto_nombre, hora_inicio, hora_fin, fecha_turno, empleado_nombre 
  FROM v_matriz_turnos_completa 
  LIMIT 3
`).all();
console.table(sample);

console.log('\n✓ BASE DE DATOS LISTA: ' + dbPath);
db.close();
