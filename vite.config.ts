import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

function apiRoutesPlugin(): Plugin {
  return {
    name: 'api-routes-plugin',
    configureServer(server) {
      server.middlewares.use('/api/proxy', async (req, res) => {
        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', '*');
          res.end();
          return;
        }

        try {
          const { GET } = await server.ssrLoadModule('/src/app/api/proxy/route.ts');
          const pathAndQuery = req.originalUrl || `/api/proxy${req.url?.startsWith('?') ? req.url : `/${req.url || ''}`}`;
          const fullUrl = `http://localhost:3000${pathAndQuery.startsWith('/') ? pathAndQuery : `/${pathAndQuery}`}`;
          const webRequest = new Request(fullUrl);
          const response = await GET(webRequest);

          res.statusCode = response.status;
          response.headers.forEach((val, key) => {
            res.setHeader(key, val);
          });

          const buffer = Buffer.from(await response.arrayBuffer());
          res.end(buffer);
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Erro no proxy de stream';
          res.statusCode = 502;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: message }));
        }
      });

      server.middlewares.use('/api/canais', async (req, res) => {
        try {
          const { GET } = await server.ssrLoadModule('/src/app/api/canais/route.ts');
          const pathAndQuery = req.originalUrl || `/api/canais${req.url?.startsWith('?') ? req.url : `/${req.url || ''}`}`;
          const fullUrl = `http://localhost:3000${pathAndQuery.startsWith('/') ? pathAndQuery : `/${pathAndQuery}`}`;
          const webRequest = new Request(fullUrl);
          const response = await GET(webRequest);
          const json = await response.json();
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(json));
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Erro ao carregar canais';
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: message }));
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiRoutesPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        'next/server': path.resolve(__dirname, './src/shims/next-server.ts'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: true as const,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
