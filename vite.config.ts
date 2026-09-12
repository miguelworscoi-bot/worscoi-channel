import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

function apiCanaisPlugin(): Plugin {
  return {
    name: 'api-canais-plugin',
    configureServer(server) {
      server.middlewares.use('/api/canais', async (req, res) => {
        try {
          const { GET } = await server.ssrLoadModule('/src/app/api/canais/route.ts');
          const fullUrl = `http://localhost:3000${req.originalUrl || req.url || '/api/canais'}`;
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
    plugins: [react(), tailwindcss(), apiCanaisPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        'next/server': path.resolve(__dirname, './src/shims/next-server.ts'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
