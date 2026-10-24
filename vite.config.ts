import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

// Plugin para servir la API de SQLite directamente en el servidor de desarrollo de Vite
function sqliteApiPlugin(): Plugin {
  return {
    name: 'sqlite-api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/')) {
          try {
            // @ts-expect-error dynamic JS import in Vite middleware
            const { handleApiRequest } = await import('./server/apiRouter.js');
            return handleApiRequest(req, res, next);
          } catch (err) {
            console.error('[Vite SQLite Middleware Error]:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Error en el middleware SQLite' }));
            return;
          }
        }
        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    sqliteApiPlugin()
  ],
})
