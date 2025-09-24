interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
}

export class CacheService {
  private static cache = new Map<string, CacheItem<any>>()
  private static readonly DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes

  static set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  static get<T>(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) return null
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return item.data as T
  }

  static has(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) return false
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return false
    }
    
    return true
  }

  static delete(key: string): void {
    this.cache.delete(key)
  }

  static clear(): void {
    this.cache.clear()
  }

  static cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
      }
    }
  }

  static getStats(): {
    size: number
    keys: string[]
    totalMemory: number
  } {
    let totalMemory = 0
    const keys: string[] = []
    
    for (const [key, item] of this.cache.entries()) {
      keys.push(key)
      totalMemory += JSON.stringify(item.data).length
    }
    
    return {
      size: this.cache.size,
      keys,
      totalMemory
    }
  }

  // Utility methods for common cache patterns
  static async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = this.DEFAULT_TTL
  ): Promise<T> {
    let data = this.get<T>(key)
    
    if (data === null) {
      data = await fetcher()
      this.set(key, data, ttl)
    }
    
    return data
  }

  static invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern)
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  // Agent-specific cache methods
  static setAgentData<T>(agentId: string, dataType: string, data: T, ttl?: number): void {
    this.set(`agent:${agentId}:${dataType}`, data, ttl)
  }

  static getAgentData<T>(agentId: string, dataType: string): T | null {
    return this.get<T>(`agent:${agentId}:${dataType}`)
  }

  static invalidateAgent(agentId: string): void {
    this.invalidatePattern(`^agent:${agentId}:`)
  }

  // User-specific cache methods
  static setUserData<T>(userId: string, dataType: string, data: T, ttl?: number): void {
    this.set(`user:${userId}:${dataType}`, data, ttl)
  }

  static getUserData<T>(userId: string, dataType: string): T | null {
    return this.get<T>(`user:${userId}:${dataType}`)
  }

  static invalidateUser(userId: string): void {
    this.invalidatePattern(`^user:${userId}:`)
  }

  // Market data cache methods
  static setMarketData<T>(symbol: string, dataType: string, data: T, ttl?: number): void {
    this.set(`market:${symbol}:${dataType}`, data, ttl)
  }

  static getMarketData<T>(symbol: string, dataType: string): T | null {
    return this.get<T>(`market:${symbol}:${dataType}`)
  }

  static invalidateMarketData(symbol?: string): void {
    if (symbol) {
      this.invalidatePattern(`^market:${symbol}:`)
    } else {
      this.invalidatePattern('^market:')
    }
  }
}

// Auto cleanup every 10 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    CacheService.cleanup()
  }, 10 * 60 * 1000)
}