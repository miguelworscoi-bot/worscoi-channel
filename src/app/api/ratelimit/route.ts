import { NextResponse } from 'next/server';
import { globalRateLimiter } from '@/lib/rateLimiter';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    },
  });
}

export async function GET(request: Request) {
  const rateLimitCheck = globalRateLimiter.check(request, {
    routeKey: 'ratelimit-info',
    maxRequests: 30,
    windowSeconds: 60,
  });

  const metrics = globalRateLimiter.getMetrics();

  return NextResponse.json(
    {
      status: 'success',
      rateLimiter: metrics,
      client: {
        ip: rateLimitCheck.clientIp,
        remainingRequests: rateLimitCheck.remaining,
        limit: rateLimitCheck.limit,
      },
    },
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        ...rateLimitCheck.headers,
      },
    }
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (typeof body.enabled === 'boolean') {
      globalRateLimiter.setActive(body.enabled);
    }
    return NextResponse.json({
      status: 'success',
      metrics: globalRateLimiter.getMetrics(),
    });
  } catch {
    return NextResponse.json(
      { error: 'Formato inválido' },
      { status: 400 }
    );
  }
}
