interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
  tags: string[]
}

interface CacheOptions {
  ttl?: number
  tags?: string[]
  priority?: 'low' | 'medium' | 'high'
}

class EnhancedCacheManager {
  private cache = new Map<string, CacheItem<any>>()
  private maxSize = 1000
  private hitCount = 0
  private missCount = 0
  
  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const { ttl = 5 * 60 * 1000, tags = [], priority = 'medium' } = options
    
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictLRU()
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      tags
    })
  }
  
  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) {
      this.missCount++
      return null
    }
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      this.missCount++
      return null
    }
    
    this.hitCount++
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
  
  invalidateByTag(tag: string): void {
    for (const [key, item] of this.cache.entries()) {
      if (item.tags.includes(tag)) {
        this.cache.delete(key)
      }
    }
  }
  
  invalidateByTags(tags: string[]): void {
    for (const [key, item] of this.cache.entries()) {
      if (tags.some(tag => item.tags.includes(tag))) {
        this.cache.delete(key)
      }
    }
  }
  
  private evictLRU(): void {
    let oldestKey = ''
    let oldestTime = Date.now()
    
    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp
        oldestKey = key
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }
  
  getStats() {
    const hitRate = this.hitCount / (this.hitCount + this.missCount) || 0
    return {
      size: this.cache.size,
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate: Math.round(hitRate * 100) / 100,
      maxSize: this.maxSize
    }
  }
  
  size(): number {
    return this.cache.size
  }
  
  clear(): void {
    this.cache.clear()
    this.hitCount = 0
    this.missCount = 0
  }
  
  // Preload strategy for critical data
  preload<T>(key: string, dataLoader: () => Promise<T>, options: CacheOptions = {}): Promise<T> {
    const cached = this.get<T>(key)
    if (cached) {
      return Promise.resolve(cached)
    }
    
    return dataLoader().then(data => {
      this.set(key, data, options)
      return data
    })
  }
}

export const cache = new EnhancedCacheManager()

// Enhanced cache keys with granular invalidation
export const CACHE_KEYS = {
  // Agent data
  AGENTS: 'agents',
  AGENTS_LIST: (page: number, filters?: string) => `agents_list_${page}_${filters || 'all'}`,
  AGENT_DETAIL: (id: string) => `agent_detail_${id}`,
  AGENT_PERFORMANCE: (id: string, period: string) => `agent_performance_${id}_${period}`,
  AGENT_RATINGS: (id: string) => `agent_ratings_${id}`,
  AGENT_COMMENTS: (id: string, page: number) => `agent_comments_${id}_${page}`,
  
  // Market data
  PRICE_HISTORY: (symbol: string, interval: string) => `price_history_${symbol}_${interval}`,
  MARKET_DATA: (symbol: string) => `market_data_${symbol}`,
  ORDERBOOK: (symbol: string) => `orderbook_${symbol}`,
  TRADES: (symbol: string, limit: number) => `trades_${symbol}_${limit}`,
  
  // User data
  USER_PROFILE: (userId: string) => `user_profile_${userId}`,
  USER_PORTFOLIO: (userId: string) => `portfolio_${userId}`,
  USER_HOLDINGS: (userId: string) => `holdings_${userId}`,
  USER_TRANSACTIONS: (userId: string, page: number) => `transactions_${userId}_${page}`,
  USER_ORDERS: (userId: string, status?: string) => `orders_${userId}_${status || 'all'}`,
  ORDERS: (userId: string) => `orders_${userId}`,
  USER_NOTIFICATIONS: (userId: string, page: number) => `notifications_${userId}_${page}`,
  
  // Social data
  SOCIAL_FEED: (userId: string, page: number) => `social_feed_${userId}_${page}`,
  TRADER_RANKINGS: (period: string) => `trader_rankings_${period}`,
  COPY_TRADING: (traderId: string) => `copy_trading_${traderId}`,
  
  // Exchange data
  EXCHANGE_STATUS: (exchange: string) => `exchange_status_${exchange}`,
  EXCHANGE_PAIRS: (exchange: string) => `exchange_pairs_${exchange}`,
  
  // Analytics
  PORTFOLIO_ANALYTICS: (userId: string, period: string) => `portfolio_analytics_${userId}_${period}`,
  PERFORMANCE_METRICS: (userId: string) => `performance_metrics_${userId}`,
} as const

// Enhanced cache TTL with different strategies
export const CACHE_TTL = {
  // Real-time data (short TTL)
  REAL_TIME: 5 * 1000,           // 5 seconds
  PRICE_DATA: 10 * 1000,         // 10 seconds
  ORDERBOOK: 2 * 1000,           // 2 seconds
  
  // Frequently updated data
  MARKET_DATA: 30 * 1000,        // 30 seconds
  USER_PORTFOLIO: 60 * 1000,     // 1 minute
  NOTIFICATIONS: 2 * 60 * 1000,  // 2 minutes
  
  // Moderately updated data
  AGENT_DATA: 5 * 60 * 1000,     // 5 minutes
  USER_PROFILE: 10 * 60 * 1000,  // 10 minutes
  SOCIAL_DATA: 5 * 60 * 1000,    // 5 minutes
  
  // Static or rarely updated data
  AGENT_DETAILS: 15 * 60 * 1000, // 15 minutes
  AGENT_DETAIL: 15 * 60 * 1000,  // 15 minutes (alias)
  EXCHANGE_INFO: 30 * 60 * 1000, // 30 minutes
  ANALYTICS: 10 * 60 * 1000,     // 10 minutes
  AGENTS: 5 * 60 * 1000,         // 5 minutes
  PRICE_HISTORY: 30 * 1000,      // 30 seconds
  USER_DATA: 60 * 1000,          // 1 minute
} as const

// Cache tags for granular invalidation
export const CACHE_TAGS = {
  AGENTS: 'agents',
  USERS: 'users',
  PORTFOLIO: 'portfolio',
  ORDERS: 'orders',
  MARKET_DATA: 'market',
  SOCIAL: 'social',
  ANALYTICS: 'analytics',
  EXCHANGE: 'exchange'
} as const