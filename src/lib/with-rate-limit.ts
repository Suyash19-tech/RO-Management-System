import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, RateLimitConfig } from './rate-limit';

export function withRateLimit(
  handler: (req: NextRequest, ...args: any[]) => Promise<NextResponse>,
  config: RateLimitConfig = { limit: 30, windowMs: 60_000 } // default: 30 req/min
) {
  return async (req: NextRequest, ...args: any[]) => {
    // Use IP + path as identifier
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      'anonymous';
    const identifier = `${ip}:${req.nextUrl.pathname}`;

    const result = rateLimit(identifier, config);

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Too many requests. Please slow down.',
          retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((result.resetAt - Date.now()) / 1000)),
            'X-RateLimit-Limit': String(config.limit),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    const response = await handler(req, ...args);
    response.headers.set('X-RateLimit-Remaining', String(result.remaining));
    return response;
  };
}
