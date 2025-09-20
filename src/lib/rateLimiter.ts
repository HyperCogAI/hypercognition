// Rate limiting implementation
interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  keyGenerator?: (req: any) => string
}

export class RateLimiter {
  private windows = new Map<string, { count: number; resetTime: number }>()
  private config: RateLimitConfig
  
  constructor(configOrMax: RateLimitConfig | number, windowMs?: number) {
    if (typeof configOrMax === 'number') {
      this.config = { maxRequests: configOrMax, windowMs: windowMs! }
    } else {
      this.config = configOrMax
    }
  }
  
  checkLimit(key: string): boolean {
    return this.isAllowed(key)
  }
  
  isAllowed(key: string): boolean {
    const now = Date.now()
    const window = this.windows.get(key)
    
    if (!window || now > window.resetTime) {
      this.windows.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs
      })
      return true
    }
    
    if (window.count >= this.config.maxRequests) {
      return false
    }
    
    window.count++
    return true
  }
  
  getRemainingRequests(key: string): number {
    const window = this.windows.get(key)
    if (!window || Date.now() > window.resetTime) {
      return this.config.maxRequests
    }
    return Math.max(0, this.config.maxRequests - window.count)
  }
  
  getResetTime(key: string): number {
    const window = this.windows.get(key)
    return window?.resetTime || Date.now()
  }
  
  cleanup(): void {
    const now = Date.now()
    for (const [key, window] of this.windows.entries()) {
      if (now > window.resetTime) {
        this.windows.delete(key)
      }
    }
  }
}

// Rate limiters for different endpoints
export const apiRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100
})

export const tradingRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10
})

export const socialRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30
})

// Cleanup intervals
setInterval(() => {
  apiRateLimiter.cleanup()
  tradingRateLimiter.cleanup()
  socialRateLimiter.cleanup()
}, 5 * 60 * 1000) // Clean up every 5 minutes