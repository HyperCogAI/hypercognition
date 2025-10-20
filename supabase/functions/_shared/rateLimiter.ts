// Phase 3.2: Rate limiter for edge functions

interface RateLimitConfig {
  maxRequests: number;
  windowMinutes: number;
}

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = { maxRequests: 60, windowMinutes: 1 }
): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const key = `${identifier}:${Math.floor(now / (config.windowMinutes * 60000))}`;
  
  const current = rateLimitStore.get(key);
  
  // Clean up old entries
  for (const [k, v] of rateLimitStore.entries()) {
    if (v.resetAt < now) {
      rateLimitStore.delete(k);
    }
  }
  
  if (!current) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + (config.windowMinutes * 60000)
    });
    return { allowed: true };
  }
  
  if (current.count >= config.maxRequests) {
    return {
      allowed: false,
      retryAfter: Math.ceil((current.resetAt - now) / 1000)
    };
  }
  
  current.count++;
  return { allowed: true };
}
