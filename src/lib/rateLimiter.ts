import { NextResponse } from 'next/server';

export interface RateLimitOptions {
  routeKey?: string;
  maxRequests?: number;
  windowSeconds?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfter: number;
  clientIp: string;
  headers: Record<string, string>;
}

interface ClientBucket {
  count: number;
  windowStart: number;
}

// Armazenamento em memória com limpeza periódica automática
class RateLimiterManager {
  private buckets = new Map<string, ClientBucket>();
  private isEnabled = true;
  private totalRequestsTracked = 0;
  private totalRequestsBlocked = 0;
  private startTime = Date.now();
  private lastCleanup = Date.now();

  constructor() {
    // Inicialização silenciosa
  }

  public setActive(active: boolean): void {
    this.isEnabled = active;
  }

  public getActive(): boolean {
    return this.isEnabled;
  }

  private cleanupStaleBuckets(windowSeconds: number): void {
    const now = Date.now();
    // Limpeza a cada 60 segundos
    if (now - this.lastCleanup < 60000) return;
    this.lastCleanup = now;

    const threshold = now - windowSeconds * 1000 * 2;
    for (const [key, bucket] of this.buckets.entries()) {
      if (bucket.windowStart < threshold) {
        this.buckets.delete(key);
      }
    }
  }

  public getClientIp(request: Request): string {
    const headers = request.headers;
    const xForwardedFor = headers.get('x-forwarded-for');
    if (xForwardedFor) {
      const firstIp = xForwardedFor.split(',')[0].trim();
      if (firstIp) return firstIp;
    }

    const xRealIp = headers.get('x-real-ip');
    if (xRealIp) return xRealIp.trim();

    const cfConnectingIp = headers.get('cf-connecting-ip');
    if (cfConnectingIp) return cfConnectingIp.trim();

    return 'client-anonymous';
  }

  public check(request: Request, options?: RateLimitOptions): RateLimitResult {
    this.totalRequestsTracked++;

    const maxRequests = options?.maxRequests ?? 120;
    const windowSeconds = options?.windowSeconds ?? 60;
    const routeKey = options?.routeKey ?? 'default';

    const clientIp = this.getClientIp(request);
    const bucketKey = `${routeKey}:${clientIp}`;

    const now = Date.now();
    const windowMs = windowSeconds * 1000;

    this.cleanupStaleBuckets(windowSeconds);

    if (!this.isEnabled) {
      return {
        allowed: true,
        limit: maxRequests,
        remaining: maxRequests,
        reset: Math.ceil((now + windowMs) / 1000),
        retryAfter: 0,
        clientIp,
        headers: {
          'X-RateLimit-Limit': String(maxRequests),
          'X-RateLimit-Remaining': String(maxRequests),
          'X-RateLimit-Reset': String(Math.ceil((now + windowMs) / 1000)),
          'X-RateLimit-Status': 'disabled',
        },
      };
    }

    let bucket = this.buckets.get(bucketKey);

    if (!bucket || now - bucket.windowStart >= windowMs) {
      bucket = {
        count: 1,
        windowStart: now,
      };
      this.buckets.set(bucketKey, bucket);

      const resetTimestamp = Math.ceil((now + windowMs) / 1000);
      return {
        allowed: true,
        limit: maxRequests,
        remaining: maxRequests - 1,
        reset: resetTimestamp,
        retryAfter: 0,
        clientIp,
        headers: {
          'X-RateLimit-Limit': String(maxRequests),
          'X-RateLimit-Remaining': String(maxRequests - 1),
          'X-RateLimit-Reset': String(resetTimestamp),
          'X-RateLimit-Policy': `${maxRequests};w=${windowSeconds}`,
          'X-RateLimit-Status': 'active',
        },
      };
    }

    // Incrementa contagem na janela existente
    bucket.count += 1;
    const remainingTimeSeconds = Math.max(
      1,
      Math.ceil((bucket.windowStart + windowMs - now) / 1000)
    );
    const resetTimestamp = Math.ceil((bucket.windowStart + windowMs) / 1000);

    if (bucket.count > maxRequests) {
      this.totalRequestsBlocked++;
      return {
        allowed: false,
        limit: maxRequests,
        remaining: 0,
        reset: resetTimestamp,
        retryAfter: remainingTimeSeconds,
        clientIp,
        headers: {
          'X-RateLimit-Limit': String(maxRequests),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(resetTimestamp),
          'X-RateLimit-Policy': `${maxRequests};w=${windowSeconds}`,
          'X-RateLimit-Status': 'exceeded',
          'Retry-After': String(remainingTimeSeconds),
        },
      };
    }

    const remaining = Math.max(0, maxRequests - bucket.count);
    return {
      allowed: true,
      limit: maxRequests,
      remaining,
      reset: resetTimestamp,
      retryAfter: 0,
      clientIp,
      headers: {
        'X-RateLimit-Limit': String(maxRequests),
        'X-RateLimit-Remaining': String(remaining),
        'X-RateLimit-Reset': String(resetTimestamp),
        'X-RateLimit-Policy': `${maxRequests};w=${windowSeconds}`,
        'X-RateLimit-Status': 'active',
      },
    };
  }

  public getMetrics() {
    return {
      enabled: this.isEnabled,
      activeBucketsCount: this.buckets.size,
      totalRequestsTracked: this.totalRequestsTracked,
      totalRequestsBlocked: this.totalRequestsBlocked,
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      limits: {
        proxy: '240 requisições / 60 segundos',
        api: '60 requisições / 60 segundos',
        catalogo: '90 requisições / 60 segundos',
      },
    };
  }
}

export const globalRateLimiter = new RateLimiterManager();

export function createRateLimitExceededResponse(result: RateLimitResult): NextResponse {
  return NextResponse.json(
    {
      error: 'Too Many Requests',
      message:
        'Limite de requisições excedido (Limits of Requests ativo). Aguarde antes de enviar novas requisições.',
      retryAfter: result.retryAfter,
      limit: result.limit,
      remaining: 0,
      reset: result.reset,
    },
    {
      status: 429,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        ...result.headers,
      },
    }
  );
}
