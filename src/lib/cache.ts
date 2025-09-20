interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
}

class CacheManager {
  private cache = new Map<string, CacheItem<any>>()
  
  set<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    })
  }
  
  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return item.data
  }
  
  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear()
      return
    }
    
    const regex = new RegExp(pattern)
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }
  
  size(): number {
    return this.cache.size
  }
}

export const cache = new CacheManager()

// Cache keys
export const CACHE_KEYS = {
  AGENTS: 'agents',
  AGENT_DETAIL: (id: string) => `agent_detail_${id}`,
  PRICE_HISTORY: (id: string) => `price_history_${id}`,
  USER_PORTFOLIO: (userId: string) => `portfolio_${userId}`,
  USER_HOLDINGS: (userId: string) => `holdings_${userId}`,
  USER_TRANSACTIONS: (userId: string) => `transactions_${userId}`,
  AGENT_RATINGS: (id: string) => `ratings_${id}`,
  AGENT_COMMENTS: (id: string) => `comments_${id}`,
  NOTIFICATIONS: (userId: string) => `notifications_${userId}`,
  ORDERS: (userId: string) => `orders_${userId}`
} as const

// Cache TTL constants (in milliseconds)
export const CACHE_TTL = {
  AGENTS: 2 * 60 * 1000,        // 2 minutes
  AGENT_DETAIL: 5 * 60 * 1000,   // 5 minutes
  PRICE_HISTORY: 30 * 1000,      // 30 seconds
  USER_DATA: 60 * 1000,          // 1 minute
  SOCIAL_DATA: 2 * 60 * 1000,    // 2 minutes
  REAL_TIME: 10 * 1000           // 10 seconds
} as const