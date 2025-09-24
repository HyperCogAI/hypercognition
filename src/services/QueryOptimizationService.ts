import { supabase } from '@/integrations/supabase/client'
import { CacheService } from './CacheService'

export interface QueryPerformanceMetrics {
  query: string
  execution_time: number
  timestamp: string
  cache_hit: boolean
  rows_returned: number
}

export class QueryOptimizationService {
  private static performanceMetrics: QueryPerformanceMetrics[] = []
  private static readonly MAX_METRICS_HISTORY = 1000

  static async optimizedQuery<T>(
    queryKey: string,
    queryFunction: () => Promise<{ data: T | null, error: any }>,
    cacheOptions?: {
      ttl?: number
      useCache?: boolean
    }
  ): Promise<{ data: T | null, error: any, fromCache: boolean, executionTime: number }> {
    const startTime = Date.now()
    const useCache = cacheOptions?.useCache ?? true
    const ttl = cacheOptions?.ttl ?? 5 * 60 * 1000 // 5 minutes default

    // Check cache first
    if (useCache) {
      const cachedData = CacheService.get<T>(queryKey)
      if (cachedData !== null) {
        this.recordMetrics(queryKey, Date.now() - startTime, true, 1)
        return {
          data: cachedData,
          error: null,
          fromCache: true,
          executionTime: Date.now() - startTime
        }
      }
    }

    // Execute query
    const result = await queryFunction()
    const executionTime = Date.now() - startTime

    // Cache successful results
    if (useCache && !result.error && result.data !== null) {
      CacheService.set(queryKey, result.data, ttl)
    }

    // Record metrics
    const rowsReturned = Array.isArray(result.data) ? result.data.length : result.data ? 1 : 0
    this.recordMetrics(queryKey, executionTime, false, rowsReturned)

    return {
      ...result,
      fromCache: false,
      executionTime
    }
  }

  static async batchQuery<T>(
    queries: Array<{
      key: string
      query: () => Promise<{ data: T | null, error: any }>
      cacheOptions?: { ttl?: number, useCache?: boolean }
    }>
  ): Promise<Array<{ data: T | null, error: any, fromCache: boolean, executionTime: number }>> {
    const results = await Promise.all(
      queries.map(({ key, query, cacheOptions }) =>
        this.optimizedQuery(key, query, cacheOptions)
      )
    )

    return results
  }

  static async preloadData(userId: string): Promise<void> {
    // Preload commonly accessed data for a user - simplified to avoid complex joins
    try {
      // Preload portfolio
      await this.optimizedQuery(
        `user:${userId}:portfolio`,
        async () => {
          const { data, error } = await supabase
            .from('portfolios')
            .select('*')
            .eq('user_id', userId)
          return { data, error }
        },
        { ttl: 2 * 60 * 1000 } // 2 minutes
      )

      // Preload active orders
      await this.optimizedQuery(
        `user:${userId}:orders:active`,
        async () => {
          const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', userId)
            .in('status', ['pending', 'partially_filled'])
            .limit(50)
          return { data, error }
        },
        { ttl: 1 * 60 * 1000 } // 1 minute
      )

      // Preload unread notifications
      await this.optimizedQuery(
        `user:${userId}:notifications:unread`,
        async () => {
          const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .eq('read', false)
            .limit(20)
          return { data, error }
        },
        { ttl: 30 * 1000 } // 30 seconds
      )
    } catch (error) {
      console.error('Error preloading data:', error)
    }
  }

  static async optimizedPagination<T>(
    tableName: 'portfolios' | 'orders' | 'agents' | 'notifications',
    options: {
      select?: string
      filters?: Record<string, any>
      orderBy?: { column: string, ascending?: boolean }
      page: number
      pageSize: number
      cacheKey?: string
    }
  ): Promise<{
    data: T[]
    count: number | null
    hasMore: boolean
    fromCache: boolean
    executionTime: number
  }> {
    const { select = '*', filters = {}, orderBy, page, pageSize, cacheKey } = options
    const offset = (page - 1) * pageSize
    const queryKey = cacheKey || `pagination:${tableName}:${JSON.stringify({ filters, orderBy, page, pageSize })}`

    const result = await this.optimizedQuery(
      queryKey,
      async () => {
        try {
          let query = supabase
            .from(tableName as any)
            .select(select, { count: 'exact' })
            .range(offset, offset + pageSize - 1)

          // Apply filters
          Object.entries(filters).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              query = query.in(key, value)
            } else {
              query = query.eq(key, value)
            }
          })

          // Apply ordering
          if (orderBy) {
            query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true })
          }

          const response = await query
          return { data: response.data, error: response.error }
        } catch (error) {
          return { data: null, error }
        }
      },
      { ttl: 2 * 60 * 1000 } // 2 minutes for pagination
    )

    const data = result.data as any
    const count = data?.count || 0
    const rows = data?.data || []

    return {
      data: rows,
      count,
      hasMore: offset + pageSize < count,
      fromCache: result.fromCache,
      executionTime: result.executionTime
    }
  }

  static async smartInvalidation(event: {
    table: string
    eventType: 'INSERT' | 'UPDATE' | 'DELETE'
    old?: any
    new?: any
  }): Promise<void> {
    const { table, eventType, old, new: newRecord } = event

    switch (table) {
      case 'portfolios':
        if (newRecord?.user_id || old?.user_id) {
          const userId = newRecord?.user_id || old?.user_id
          CacheService.invalidateUser(userId)
        }
        if (newRecord?.agent_id || old?.agent_id) {
          const agentId = newRecord?.agent_id || old?.agent_id
          CacheService.invalidateAgent(agentId)
        }
        break

      case 'orders':
        if (newRecord?.user_id || old?.user_id) {
          const userId = newRecord?.user_id || old?.user_id
          CacheService.invalidateUser(userId)
        }
        break

      case 'agents':
        if (newRecord?.id || old?.id) {
          const agentId = newRecord?.id || old?.id
          CacheService.invalidateAgent(agentId)
          CacheService.invalidatePattern('^market:')
        }
        break

      case 'market_tickers':
      case 'market_data_feeds':
        if (newRecord?.agent_id || old?.agent_id) {
          const agentId = newRecord?.agent_id || old?.agent_id
          CacheService.invalidateAgent(agentId)
          CacheService.invalidateMarketData()
        }
        break

      case 'notifications':
        if (newRecord?.user_id || old?.user_id) {
          const userId = newRecord?.user_id || old?.user_id
          CacheService.invalidatePattern(`^user:${userId}:notifications`)
        }
        break
    }
  }

  private static recordMetrics(
    query: string,
    executionTime: number,
    cacheHit: boolean,
    rowsReturned: number
  ): void {
    const metric: QueryPerformanceMetrics = {
      query,
      execution_time: executionTime,
      timestamp: new Date().toISOString(),
      cache_hit: cacheHit,
      rows_returned: rowsReturned
    }

    this.performanceMetrics.push(metric)

    // Keep only the last MAX_METRICS_HISTORY entries
    if (this.performanceMetrics.length > this.MAX_METRICS_HISTORY) {
      this.performanceMetrics.shift()
    }
  }

  static getPerformanceMetrics(): QueryPerformanceMetrics[] {
    return [...this.performanceMetrics]
  }

  static getSlowQueries(thresholdMs: number = 1000): QueryPerformanceMetrics[] {
    return this.performanceMetrics.filter(metric => 
      metric.execution_time > thresholdMs && !metric.cache_hit
    )
  }

  static getCacheHitRate(): number {
    if (this.performanceMetrics.length === 0) return 0
    
    const cacheHits = this.performanceMetrics.filter(m => m.cache_hit).length
    return (cacheHits / this.performanceMetrics.length) * 100
  }

  static getAverageExecutionTime(): number {
    const nonCachedQueries = this.performanceMetrics.filter(m => !m.cache_hit)
    if (nonCachedQueries.length === 0) return 0
    
    const totalTime = nonCachedQueries.reduce((sum, metric) => sum + metric.execution_time, 0)
    return totalTime / nonCachedQueries.length
  }

  static clearMetrics(): void {
    this.performanceMetrics = []
  }
}
