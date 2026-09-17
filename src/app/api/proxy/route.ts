import { NextResponse } from 'next/server';
import { globalRateLimiter, createRateLimitExceededResponse } from '@/lib/rateLimiter';

// Permite conexões com certificados auto-assinados ou expirados comuns em emissoras de IPTV e streams legados
if (typeof process !== 'undefined' && process.env) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    },
  });
}

export async function HEAD(request?: Request) {
  if (!request?.url) {
    return new NextResponse(null, {
      status: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  }
  const urlObj = new URL(request.url);
  const targetUrl = urlObj.searchParams.get('url');
  if (!targetUrl) {
    return new NextResponse(null, {
      status: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  }

  try {
    const response = await fetch(targetUrl, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000),
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: '*/*',
      },
    });

    // Se o servidor remoto não aceitar HEAD (405 / 501), responde status 200 para não quebrar testes de ping
    const statusToReturn = response.status === 405 || response.status === 501 ? 200 : response.status;

    return new NextResponse(null, {
      status: statusToReturn,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache',
      },
    });
  } catch {
    return new NextResponse(null, {
      status: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  }
}

function resolveAndProxy(uri: string, baseUrl: string): string {
  try {
    const trimmed = uri.trim().replace(/^["']|["']$/g, '');
    if (!trimmed) return trimmed;
    // Se já está roteado pelo proxy, preserva
    if (trimmed.startsWith('/api/proxy')) return trimmed;
    const abs = new URL(trimmed, baseUrl).toString();
    return `/api/proxy?url=${encodeURIComponent(abs)}`;
  } catch {
    return uri;
  }
}

function rewriteM3U8(content: string, baseUrl: string): string {
  // Normaliza quebras de linha independentemente de CRLF ou LF
  const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized.split('\n');

  return lines
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return '';

      // Linhas com tags M3U8: reescreve atributos URI="..." ou URI=...
      if (trimmed.startsWith('#')) {
        return trimmed.replace(
          /URI=(["']?)([^"',\s>]+)(["']?)/g,
          (_match, q1, uri, q2) => {
            const quote = q1 || q2 || '"';
            return `URI=${quote}${resolveAndProxy(uri, baseUrl)}${quote}`;
          }
        );
      }

      // Linhas que não começam com #: são URLs diretas de segmentos ou playlists filhas
      return resolveAndProxy(trimmed, baseUrl);
    })
    .join('\n');
}

export async function GET(request?: Request) {
  if (!request?.url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  // Ativação do limite de requisições (Limits of Requests) para o proxy
  const rateLimitResult = globalRateLimiter.check(request, {
    routeKey: 'proxy-stream',
    maxRequests: 240, // 240 requisições/min por IP: amplo para HLS regular, bloqueia abusos e scrapers
    windowSeconds: 60,
  });

  if (!rateLimitResult.allowed) {
    return createRateLimitExceededResponse(rateLimitResult);
  }

  const urlObj = new URL(request.url);
  const targetUrl = urlObj.searchParams.get('url');

  if (!targetUrl) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    return NextResponse.json({ error: 'Invalid URL scheme' }, { status: 400 });
  }

  try {
    let origin = '';
    try {
      origin = new URL(targetUrl).origin;
    } catch {
      // Ignora erro de parse de origin
    }

    const headers: Record<string, string> = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      Accept: '*/*',
    };

    if (origin) {
      headers['Referer'] = `${origin}/`;
    }

    // Encaminha cabeçalho de Range caso exista (essencial para streaming e seek)
    const rangeHeader = request.headers.get('range');
    if (rangeHeader) {
      headers['Range'] = rangeHeader;
    }

    // Timeout otimizado: 8s para playlists .m3u8 (failover rápido se servidor estiver fora), 12s para segmentos
    const isPlaylistRequest = targetUrl.includes('.m3u8');
    const timeoutMs = isPlaylistRequest ? 8000 : 12000;

    const response = await fetch(targetUrl, {
      signal: AbortSignal.timeout(timeoutMs),
      headers,
      redirect: 'follow',
    });

    const finalUrl = response.url || targetUrl;
    const rawContentType = (response.headers.get('content-type') || '').toLowerCase();
    const isM3U8Url =
      targetUrl.toLowerCase().includes('.m3u8') ||
      finalUrl.toLowerCase().includes('.m3u8');
    const isM3U8Type =
      rawContentType.includes('mpegurl') ||
      rawContentType.includes('application/x-mpegurl') ||
      rawContentType.includes('text/plain') ||
      rawContentType.includes('text/html');

    // Se for manifesto M3U8, reescreve sub-playlists e segmentos para passarem pelo proxy sem mixed-content e sem CORS
    if (isM3U8Url || isM3U8Type) {
      const text = await response.text();
      if (text.includes('#EXTM3U') || text.includes('#EXT-X-')) {
        const rewritten = rewriteM3U8(text, finalUrl);
        return new NextResponse(rewritten, {
          status: response.status >= 200 && response.status < 300 ? 200 : response.status,
          headers: {
            'Content-Type': 'application/vnd.apple.mpegurl; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
            'Access-Control-Allow-Headers': '*',
            'Cache-Control': 'public, max-age=2, must-revalidate',
          },
        });
      }
    }

    // Fluxo binário (segmentos .ts, .fmp4, .m4s, áudio .aac, chaves)
    const data = await response.arrayBuffer();
    const responseHeaders: Record<string, string> = {
      'Content-Type': rawContentType || 'video/mp2t',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': '*',
      'Cache-Control': 'public, max-age=180',
    };

    const contentRange = response.headers.get('content-range');
    if (contentRange) {
      responseHeaders['Content-Range'] = contentRange;
    }
    const acceptRanges = response.headers.get('accept-ranges');
    if (acceptRanges) {
      responseHeaders['Accept-Ranges'] = acceptRanges;
    }

    return new NextResponse(data, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.warn(`[Proxy Warning] Falha na transmissão de ${targetUrl}:`, errorMsg);
    return NextResponse.json(
      { error: 'Falha ao transmitir stream pelo proxy', details: errorMsg },
      {
        status: 502,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
          'Access-Control-Allow-Headers': '*',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  }
}

