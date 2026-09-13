import { NextResponse } from 'next/server';

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

function resolveAndProxy(uri: string, baseUrl: string): string {
  try {
    const trimmed = uri.trim();
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
  const lines = content.split('\n');
  return lines
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return line;

      // Linhas com tags M3U8: reescreve atributos URI="..." (como em #EXT-X-MEDIA, #EXT-X-MAP, #EXT-X-KEY)
      if (trimmed.startsWith('#')) {
        return line.replace(
          /URI=(["'])(.*?)(["'])/g,
          (_match, q1, uri, q2) => `URI=${q1}${resolveAndProxy(uri, baseUrl)}${q2}`
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
      headers['Origin'] = origin;
    }

    // Encaminha cabeçalho de Range caso exista (essencial para streaming e seek)
    const rangeHeader = request.headers.get('range');
    if (rangeHeader) {
      headers['Range'] = rangeHeader;
    }

    const response = await fetch(targetUrl, {
      signal: AbortSignal.timeout(12000),
      headers,
      redirect: 'follow',
    });

    const finalUrl = response.url || targetUrl;
    const rawContentType = response.headers.get('content-type') || '';
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
          status: response.status,
          headers: {
            'Content-Type': 'application/vnd.apple.mpegurl; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
            'Access-Control-Allow-Headers': '*',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
        });
      }
    }

    // Fluxo binário (segmentos .ts, .fmp4, áudio .aac, chaves)
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
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch stream through proxy' },
      { status: 502 }
    );
  }
}
