// server/index.js
/**
 * Servidor HTTP Node.js para Zona P
 * Conecta la base de datos SQLite con el Frontend React
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { handleApiRequest } from './apiRouter.js';
import * as sqliteService from './sqliteService.js';

const PORT = process.env.PORT || 3001;
const distPath = path.resolve(process.cwd(), 'dist');

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

const server = http.createServer(async (req, res) => {
  // Configuración de CORS para desarrollo
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-ZonaP-Application');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  // Interceptar rutas de la API de Base de Datos
  if (req.url.startsWith('/api/')) {
    return handleApiRequest(req, res);
  }

  // Servir archivos estáticos de producción si existen
  let filePath = path.join(distPath, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
  
  if (!fs.existsSync(filePath) && fs.existsSync(path.join(distPath, 'index.html'))) {
    filePath = path.join(distPath, 'index.html'); // SPA fallback
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    res.setHeader('Content-Type', MIME_TYPES[ext] || 'application/octet-stream');
    return fs.createReadStream(filePath).pipe(res);
  }

  res.statusCode = 404;
  res.end('Not Found');
});

server.listen(PORT, () => {
  const health = sqliteService.getDbHealth();
  console.log('====================================================');
  console.log(`🚀 SERVIDOR SQLITE ZONA P ACTIVO EN: http://localhost:${PORT}`);
  console.log(`📁 Base de Datos Conectada: ${health.databaseFile}`);
  console.log(`📊 Puestos: ${health.counts.puestos} | Operarios: ${health.counts.empleados} | Asignaciones: ${health.counts.asignaciones}`);
  console.log('====================================================');
});
