import express, { Request as ExpressReq, Response as ExpressRes } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

import { GET as getCanais } from './src/app/api/canais/route';
import { GET as getJogos } from './src/app/api/jogos/route';
import { GET as getEpg } from './src/app/api/epg/route';
import { GET as getGuia } from './src/app/api/guia/route';
import { GET as getFilmes } from './src/app/api/filmes/route';
import {
  GET as getProxy,
  HEAD as headProxy,
  OPTIONS as optionsProxy,
} from './src/app/api/proxy/route';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper to adapt Web standard Request/Response route handlers to Express
async function handleWebRoute(
  handler: (req: Request) => Promise<Response>,
  req: ExpressReq,
  res: ExpressRes
) {
  try {
    const protocol = req.protocol || 'http';
    const host = req.get('host') || 'localhost:3000';
    const fullUrl = `${protocol}://${host}${req.originalUrl || req.url}`;

    const headers = new Headers();
    for (const [key, val] of Object.entries(req.headers)) {
      if (val !== undefined) {
        if (Array.isArray(val)) {
          val.forEach((v) => headers.append(key, v));
        } else {
          headers.set(key, val);
        }
      }
    }

    const webReq = new Request(fullUrl, {
      method: req.method,
      headers,
    });

    const response = await handler(webReq);
    res.status(response.status);
    response.headers.forEach((val, key) => {
      res.setHeader(key, val);
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    res.end(buffer);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error';
    console.error(`Error handling ${req.method} ${req.url}:`, msg);
    if (!res.headersSent) {
      res.status(500).json({ error: msg });
    }
  }
}

// Health check endpoint
app.get('/api/health', (_req: ExpressReq, res: ExpressRes) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.options(['/api/proxy', '/api/proxy.m3u8'], async (req, res) => {
  await handleWebRoute(optionsProxy, req, res);
});
app.head(['/api/proxy', '/api/proxy.m3u8'], async (req, res) => {
  await handleWebRoute(headProxy, req, res);
});
app.get(['/api/proxy', '/api/proxy.m3u8'], async (req, res) => {
  await handleWebRoute(getProxy, req, res);
});

app.get('/api/canais', async (req, res) => {
  await handleWebRoute(getCanais, req, res);
});

app.get('/api/jogos', async (req, res) => {
  await handleWebRoute(getJogos, req, res);
});

app.get('/api/epg', async (req, res) => {
  await handleWebRoute(getEpg, req, res);
});

app.get('/api/guia', async (req, res) => {
  await handleWebRoute(getGuia, req, res);
});

app.get('/api/filmes', async (req, res) => {
  await handleWebRoute(getFilmes, req, res);
});

// ============================================================================
// VITE MIDDLEWARE (DEV) & STATIC FILE SERVING (PROD)
// ============================================================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: ExpressReq, res: ExpressRes) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Worscoi server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
