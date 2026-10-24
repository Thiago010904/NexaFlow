// server/apiRouter.js
/**
 * Router API HTTP para SQLite
 * Conecta las peticiones del frontend con sqliteService.js
 * Compatible con Vite configureServer y servidores Express/Connect
 */

import * as sqliteService from './sqliteService.js';

function parseJsonBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
}

function sendJson(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

export async function handleApiRequest(req, res, next) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;
  const method = req.method;

  // Solo interceptar rutas /api/*
  if (!pathname.startsWith('/api/')) {
    return next ? next() : res.end();
  }

  try {
    // 1. Estado y Salud de la Base de Datos
    if (pathname === '/api/status' || pathname === '/api/health') {
      const health = sqliteService.getDbHealth();
      return sendJson(res, 200, health);
    }

    // 2. Carga Inicial de Datos (Sedes, Empleados, Puestos, Asignaciones, Bitácora)
    if (pathname === '/api/initial-data' && method === 'GET') {
      const data = sqliteService.getAllData();
      return sendJson(res, 200, data);
    }

    // 2.1 Empleados (Guardar / Crear / Actualizar / Eliminar)
    if (pathname === '/api/empleados' && method === 'POST') {
      const body = await parseJsonBody(req);
      const result = sqliteService.saveEmployee(body);
      return sendJson(res, 200, result);
    }

    if (pathname.startsWith('/api/empleados/') && method === 'PUT') {
      const empId = pathname.replace('/api/empleados/', '');
      const body = await parseJsonBody(req);
      const result = sqliteService.saveEmployee({ ...body, id: empId });
      return sendJson(res, 200, result);
    }

    if (pathname.startsWith('/api/empleados/') && method === 'DELETE') {
      const empId = pathname.replace('/api/empleados/', '');
      const result = sqliteService.deleteEmployee(empId);
      return sendJson(res, 200, result);
    }

    // 3. Puestos (Guardar / Renombrar / Crear)
    if (pathname === '/api/puestos' && method === 'POST') {
      const body = await parseJsonBody(req);
      const result = sqliteService.savePuesto(body);
      return sendJson(res, 200, result);
    }

    if (pathname.startsWith('/api/puestos/') && method === 'PUT') {
      const puestoId = pathname.replace('/api/puestos/', '');
      const body = await parseJsonBody(req);
      const result = sqliteService.savePuesto({ ...body, id: puestoId });
      return sendJson(res, 200, result);
    }

    if (pathname.startsWith('/api/puestos/') && method === 'DELETE') {
      const puestoId = pathname.replace('/api/puestos/', '');
      const result = sqliteService.deletePuesto(puestoId);
      return sendJson(res, 200, result);
    }

    // 4. Asignaciones de Turnos (Matriz Operativa)
    if (pathname === '/api/asignaciones' && method === 'POST') {
      const body = await parseJsonBody(req);
      const result = sqliteService.saveAsignacion(body);
      return sendJson(res, 200, result);
    }

    if (pathname === '/api/asignaciones' && method === 'DELETE') {
      const body = await parseJsonBody(req);
      const result = sqliteService.removeAsignacion(body.puestoId, body.horarioId, body.date);
      return sendJson(res, 200, result);
    }

    // 5. Bitácora de Novedades (Auditoría Inmutable)
    if (pathname === '/api/bitacora' && method === 'POST') {
      const body = await parseJsonBody(req);
      const result = sqliteService.saveBitacoraNovedad(body);
      return sendJson(res, 200, result);
    }

    // Si la ruta no coincide
    return sendJson(res, 404, { error: 'Ruta no encontrada', path: pathname });

  } catch (error) {
    console.error('[SQLite API Error]:', error);
    return sendJson(res, 500, { error: error.message || 'Error en el servidor de base de datos' });
  }
}
