import { TODOS_OS_CANAIS_CATALOGO, deduplicateCanais } from '../src/data/channelsCatalog';
import { isDeadOrPlaceholderStream } from '../src/utils/streamUtils';
import * as fs from 'fs';

interface ChannelStatus {
  id: string;
  nome: string;
  categoria: string;
  url: string;
  status: 'ONLINE' | 'OFFLINE' | 'TIMEOUT' | 'ERROR' | 'DEAD_PATTERN' | 'YOUTUBE';
  statusCode?: number;
  error?: string;
}

async function checkUrl(url: string, timeoutMs = 3500): Promise<{ status: ChannelStatus['status']; statusCode?: number; error?: string }> {
  if (!url || typeof url !== 'string' || url.trim().length === 0) {
    return { status: 'DEAD_PATTERN', error: 'Empty URL' };
  }

  if (isDeadOrPlaceholderStream(url)) {
    return { status: 'DEAD_PATTERN', error: 'Dead IP or placeholder pattern' };
  }

  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return { status: 'YOUTUBE' };
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Range': 'bytes=0-512'
      },
      signal: controller.signal
    });
    clearTimeout(timer);

    if (res.status >= 200 && res.status < 400) {
      return { status: 'ONLINE', statusCode: res.status };
    } else {
      return { status: 'OFFLINE', statusCode: res.status, error: `HTTP ${res.status}` };
    }
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return { status: 'TIMEOUT', error: 'Timeout (>3.5s)' };
    }
    return { status: 'ERROR', error: err.message || String(err) };
  }
}

async function run() {
  const channels = deduplicateCanais(TODOS_OS_CANAIS_CATALOGO);
  const results: ChannelStatus[] = [];
  const concurrency = 30;

  for (let i = 0; i < channels.length; i += concurrency) {
    const chunk = channels.slice(i, i + concurrency);
    const chunkPromises = chunk.map(async (ch) => {
      const res = await checkUrl(ch.url);
      return {
        id: ch.id,
        nome: ch.nome,
        categoria: ch.categoria,
        url: ch.url,
        status: res.status,
        statusCode: res.statusCode,
        error: res.error,
      };
    });

    results.push(...(await Promise.all(chunkPromises)));
  }

  fs.writeFileSync('scripts/verification_report.json', JSON.stringify(results, null, 2));

  // Category summary
  const catSummary: Record<string, { total: number; online: number; dead: number }> = {};
  for (const r of results) {
    if (!catSummary[r.categoria]) {
      catSummary[r.categoria] = { total: 0, online: 0, dead: 0 };
    }
    catSummary[r.categoria].total++;
    if (r.status === 'ONLINE' || r.status === 'YOUTUBE') {
      catSummary[r.categoria].online++;
    } else {
      catSummary[r.categoria].dead++;
    }
  }

  console.log('STATUS POR CATEGORIA:');
  console.table(catSummary);

  const totalOnline = results.filter(r => r.status === 'ONLINE' || r.status === 'YOUTUBE').length;
  const totalDead = results.length - totalOnline;
  console.log(`TOTAL: ${results.length} canais | ONLINE: ${totalOnline} | PRECISA DE AJUSTE/FALLBACK: ${totalDead}`);
}

run();
