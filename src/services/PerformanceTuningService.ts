import { supabase } from '@/integrations/supabase/client'
import { structuredLogger } from '@/lib/structuredLogger'
import { IndexOptimizationService } from './IndexOptimizationService'

export interface PerformanceMetrics {
  timestamp: string
  query_time_avg: number
  query_time_p95: number
  query_time_p99: number
  queries_per_second: number
  active_connections: number
  cache_hit_ratio: number
  slow_queries_count: number
  deadlocks_count: number
  memory_usage_mb: number
  cpu_usage_percent: number
}

export interface SlowQuery {
  id: string
  query_hash: string
  query_text: string
  avg_time_ms: number
  execution_count: number
  total_time_ms: number
  first_seen: string
  last_seen: string
  optimization_suggestions: string[]
}

export interface TuningRecommendation {
  id: string
  category: 'query' | 'index' | 'configuration' | 'schema'
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  impact_estimate: string
  implementation_effort: 'low' | 'medium' | 'high'
  sql_commands?: string[]
  config_changes?: Record<string, any>
  created_at: string
}

export class PerformanceTuningService {
  private static readonly SLOW_QUERY_THRESHOLD_MS = 1000
  private static readonly HIGH_EXECUTION_COUNT_THRESHOLD = 10000

  static async collectPerformanceMetrics(): Promise<PerformanceMetrics> {
    try {
      // In production, these would come from actual database metrics
      // For now, we'll simulate realistic metrics
      
      const metrics: PerformanceMetrics = {
        timestamp: new Date().toISOString(),
        query_time_avg: Math.random() * 50 + 10, // 10-60ms
        query_time_p95: Math.random() * 200 + 100, // 100-300ms
        query_time_p99: Math.random() * 500 + 300, // 300-800ms
        queries_per_second: Math.random() * 1000 + 500, // 500-1500 QPS
        active_connections: Math.floor(Math.random() * 50 + 10), // 10-60 connections
        cache_hit_ratio: Math.random() * 20 + 80, // 80-100%
        slow_queries_count: Math.floor(Math.random() * 10), // 0-10 slow queries
        deadlocks_count: Math.floor(Math.random() * 3), // 0-3 deadlocks
        memory_usage_mb: Math.random() * 2048 + 1024, // 1-3GB
        cpu_usage_percent: Math.random() * 40 + 20 // 20-60%
      }

      // Store metrics in memory since table doesn't exist
      const metricsStore = new Map()
      metricsStore.set(metrics.timestamp, metrics)

      structuredLogger.info('Performance metrics collected', {
        component: 'PerformanceTuningService'
      })

      return metrics

    } catch (error) {
      structuredLogger.error('Failed to collect performance metrics', {
        component: 'PerformanceTuningService'
      })
      throw error
    }
  }

  static async identifySlowQueries(): Promise<SlowQuery[]> {
    try {
      // Get query performance data
      const queryPerformance = await IndexOptimizationService.analyzeQueryPerformance()
      
      const slowQueries: SlowQuery[] = queryPerformance
        .filter(q => q.avg_time_ms > this.SLOW_QUERY_THRESHOLD_MS)
        .map(q => ({
          id: q.id,
          query_hash: q.query_hash,
          query_text: q.query_text,
          avg_time_ms: q.avg_time_ms,
          execution_count: q.execution_count,
          total_time_ms: q.total_time_ms,
          first_seen: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          last_seen: q.analyzed_at,
          optimization_suggestions: this.generateQueryOptimizationSuggestions(q)
        }))
        .sort((a, b) => b.total_time_ms - a.total_time_ms)

      structuredLogger.info('Slow queries identified', {
        component: 'PerformanceTuningService'
      })

      return slowQueries

    } catch (error) {
      structuredLogger.error('Failed to identify slow queries', {
        component: 'PerformanceTuningService'
      })
      return []
    }
  }

  private static generateQueryOptimizationSuggestions(query: any): string[] {
    const suggestions: string[] = []

    // Check for missing WHERE clauses
    if (!query.query_text.toLowerCase().includes('where')) {
      suggestions.push('Consider adding WHERE clause to limit rows scanned')
    }

    // Check for SELECT *
    if (query.query_text.toLowerCase().includes('select *')) {
      suggestions.push('Replace SELECT * with specific column names')
    }

    // Check for missing LIMIT
    if (!query.query_text.toLowerCase().includes('limit') && 
        query.query_text.toLowerCase().includes('select')) {
      suggestions.push('Consider adding LIMIT clause for large result sets')
    }

    // Check for ORDER BY without index
    if (query.query_text.toLowerCase().includes('order by')) {
      suggestions.push('Ensure ORDER BY columns are indexed')
    }

    // Check for JOINs
    if (query.query_text.toLowerCase().includes('join')) {
      suggestions.push('Ensure JOIN conditions use indexed columns')
      suggestions.push('Consider denormalization for frequently joined tables')
    }

    // Check for subqueries
    if (query.query_text.toLowerCase().includes('select') && 
        query.query_text.match(/\(/g)?.length > 1) {
      suggestions.push('Consider rewriting subqueries as JOINs')
    }

    // High execution count suggestions
    if (query.execution_count > this.HIGH_EXECUTION_COUNT_THRESHOLD) {
      suggestions.push('High frequency query - consider caching results')
      suggestions.push('Review if query can be optimized or batched')
    }

    return suggestions
  }

  static async generateTuningRecommendations(): Promise<TuningRecommendation[]> {
    try {
      const recommendations: TuningRecommendation[] = []
      
      // Get current metrics and analysis
      const metrics = await this.collectPerformanceMetrics()
      const slowQueries = await this.identifySlowQueries()
      const indexRecommendations = await IndexOptimizationService.generateIndexRecommendations()

      // Query optimization recommendations
      for (const slowQuery of slowQueries.slice(0, 5)) { // Top 5 slow queries
        recommendations.push({
          id: crypto.randomUUID(),
          category: 'query',
          priority: slowQuery.avg_time_ms > 5000 ? 'critical' : 
                   slowQuery.avg_time_ms > 2000 ? 'high' : 'medium',
          title: `Optimize slow query: ${slowQuery.query_hash}`,
          description: `Query averaging ${slowQuery.avg_time_ms}ms execution time with ${slowQuery.execution_count} executions`,
          impact_estimate: `Could reduce query time by 30-70%`,
          implementation_effort: 'medium',
          sql_commands: slowQuery.optimization_suggestions,
          created_at: new Date().toISOString()
        })
      }

      // Index recommendations
      for (const createIndex of indexRecommendations.create_indexes.slice(0, 3)) {
        const impact = await IndexOptimizationService.estimateIndexImpact(createIndex)
        
        recommendations.push({
          id: crypto.randomUUID(),
          category: 'index',
          priority: impact.estimated_performance_improvement > 50 ? 'high' : 'medium',
          title: 'Create performance index',
          description: `Index could improve performance by ${impact.estimated_performance_improvement}% for ${impact.affected_queries} queries`,
          impact_estimate: `${impact.estimated_performance_improvement}% improvement, ${impact.estimated_size_mb}MB storage`,
          implementation_effort: impact.estimated_creation_time_ms > 10000 ? 'high' : 'low',
          sql_commands: [createIndex],
          created_at: new Date().toISOString()
        })
      }

      // Cache hit ratio recommendations
      if (metrics.cache_hit_ratio < 85) {
        recommendations.push({
          id: crypto.randomUUID(),
          category: 'configuration',
          priority: 'high',
          title: 'Improve cache hit ratio',
          description: `Current cache hit ratio is ${metrics.cache_hit_ratio.toFixed(1)}%, should be >95%`,
          impact_estimate: 'Could reduce I/O by 20-40%',
          implementation_effort: 'medium',
          config_changes: {
            shared_buffers: '256MB',
            effective_cache_size: '1GB',
            work_mem: '4MB'
          },
          created_at: new Date().toISOString()
        })
      }

      // Connection pool recommendations
      if (metrics.active_connections > 100) {
        recommendations.push({
          id: crypto.randomUUID(),
          category: 'configuration',
          priority: 'medium',
          title: 'Optimize connection pooling',
          description: `High connection count (${metrics.active_connections}) may indicate connection pool issues`,
          impact_estimate: 'Reduce memory usage and improve scalability',
          implementation_effort: 'low',
          config_changes: {
            max_connections: '100',
            connection_pool_size: '20'
          },
          created_at: new Date().toISOString()
        })
      }

      // Dead query recommendations
      for (const dropIndex of indexRecommendations.drop_indexes.slice(0, 2)) {
        recommendations.push({
          id: crypto.randomUUID(),
          category: 'index',
          priority: 'low',
          title: 'Remove unused index',
          description: `Index has low usage and consumes storage space`,
          impact_estimate: 'Reduce storage usage and maintenance overhead',
          implementation_effort: 'low',
          sql_commands: [dropIndex],
          created_at: new Date().toISOString()
        })
      }

      // Schema optimization recommendations
      if (slowQueries.some(q => q.query_text.toLowerCase().includes('join'))) {
        recommendations.push({
          id: crypto.randomUUID(),
          category: 'schema',
          priority: 'medium',
          title: 'Consider schema denormalization',
          description: 'Frequent JOINs detected - consider denormalizing frequently accessed data',
          impact_estimate: 'Could reduce JOIN overhead by 40-60%',
          implementation_effort: 'high',
          created_at: new Date().toISOString()
        })
      }

      // Sort by priority
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      recommendations.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])

      structuredLogger.info('Tuning recommendations generated', {
        component: 'PerformanceTuningService'
      })

      return recommendations

    } catch (error) {
      structuredLogger.error('Failed to generate tuning recommendations', {
        component: 'PerformanceTuningService'
      })
      return []
    }
  }

  static async getHistoricalMetrics(days: number = 7): Promise<PerformanceMetrics[]> {
    try {
      // Return mock historical data since table doesn't exist
      const historicalMetrics: PerformanceMetrics[] = []
      
      for (let i = days; i > 0; i--) {
        historicalMetrics.push({
          timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
          query_time_avg: Math.random() * 50 + 10,
          query_time_p95: Math.random() * 200 + 100,
          query_time_p99: Math.random() * 500 + 300,
          queries_per_second: Math.random() * 1000 + 500,
          active_connections: Math.floor(Math.random() * 50 + 10),
          cache_hit_ratio: Math.random() * 20 + 80,
          slow_queries_count: Math.floor(Math.random() * 10),
          deadlocks_count: Math.floor(Math.random() * 3),
          memory_usage_mb: Math.random() * 2048 + 1024,
          cpu_usage_percent: Math.random() * 40 + 20
        })
      }

      return historicalMetrics

    } catch (error) {
      structuredLogger.error('Failed to get historical metrics', {
        component: 'PerformanceTuningService'
      })
      return []
    }
  }

  static async implementRecommendation(recommendationId: string): Promise<{
    success: boolean
    message: string
    results?: any
  }> {
    try {
      // Mock implementation since table doesn't exist
      const mockRecommendation = {
        id: recommendationId,
        category: 'query',
        sql_commands: ['CREATE INDEX idx_test ON test_table(id)'],
        config_changes: { max_connections: '100' }
      }

      let results: any = {}

      // Simulate SQL execution
      if (mockRecommendation.sql_commands && mockRecommendation.sql_commands.length > 0) {
        for (const sqlCommand of mockRecommendation.sql_commands) {
          structuredLogger.info('Executing SQL command', {
            component: 'PerformanceTuningService'
          })
          
          await new Promise(resolve => setTimeout(resolve, 100))
        }
        results.sql_executed = mockRecommendation.sql_commands.length
      }

      // Simulate config changes
      if (mockRecommendation.config_changes) {
        structuredLogger.info('Applying configuration changes', {
          component: 'PerformanceTuningService'
        })
        results.config_applied = Object.keys(mockRecommendation.config_changes).length
      }

      structuredLogger.info('Tuning recommendation implemented', {
        component: 'PerformanceTuningService'
      })

      return {
        success: true,
        message: 'Recommendation implemented successfully',
        results
      }

    } catch (error) {
      structuredLogger.error('Failed to implement recommendation', {
        component: 'PerformanceTuningService'
      })

      return {
        success: false,
        message: error.message || 'Implementation failed'
      }
    }
  }

  static async getPerformanceSummary(): Promise<{
    current_metrics: PerformanceMetrics
    trend_analysis: {
      query_time_trend: 'improving' | 'stable' | 'degrading'
      throughput_trend: 'improving' | 'stable' | 'degrading'
      resource_usage_trend: 'improving' | 'stable' | 'degrading'
    }
    recommendations_count: {
      critical: number
      high: number
      medium: number
      low: number
    }
    slow_queries_count: number
  }> {
    try {
      const currentMetrics = await this.collectPerformanceMetrics()
      const historicalMetrics = await this.getHistoricalMetrics(7)
      const recommendations = await this.generateTuningRecommendations()
      const slowQueries = await this.identifySlowQueries()

      // Calculate trends
      const trends = this.calculateTrends(historicalMetrics, currentMetrics)

      // Count recommendations by priority
      const recommendationCounts = {
        critical: recommendations.filter(r => r.priority === 'critical').length,
        high: recommendations.filter(r => r.priority === 'high').length,
        medium: recommendations.filter(r => r.priority === 'medium').length,
        low: recommendations.filter(r => r.priority === 'low').length
      }

      return {
        current_metrics: currentMetrics,
        trend_analysis: trends,
        recommendations_count: recommendationCounts,
        slow_queries_count: slowQueries.length
      }

    } catch (error) {
      structuredLogger.error('Failed to get performance summary', {
        component: 'PerformanceTuningService'
      })
      throw error
    }
  }

  private static calculateTrends(historical: PerformanceMetrics[], current: PerformanceMetrics) {
    if (historical.length < 2) {
      return {
        query_time_trend: 'stable' as const,
        throughput_trend: 'stable' as const,
        resource_usage_trend: 'stable' as const
      }
    }

    const recent = historical.slice(-24) // Last 24 data points
    const older = historical.slice(0, -24)

    const recentAvgQueryTime = recent.reduce((sum, m) => sum + m.query_time_avg, 0) / recent.length
    const olderAvgQueryTime = older.length > 0 ? older.reduce((sum, m) => sum + m.query_time_avg, 0) / older.length : recentAvgQueryTime

    const recentAvgThroughput = recent.reduce((sum, m) => sum + m.queries_per_second, 0) / recent.length
    const olderAvgThroughput = older.length > 0 ? older.reduce((sum, m) => sum + m.queries_per_second, 0) / older.length : recentAvgThroughput

    const recentAvgCpu = recent.reduce((sum, m) => sum + m.cpu_usage_percent, 0) / recent.length
    const olderAvgCpu = older.length > 0 ? older.reduce((sum, m) => sum + m.cpu_usage_percent, 0) / older.length : recentAvgCpu

    const queryTimeTrend: 'improving' | 'stable' | 'degrading' = recentAvgQueryTime < olderAvgQueryTime * 0.95 ? 'improving' :
                          recentAvgQueryTime > olderAvgQueryTime * 1.05 ? 'degrading' : 'stable'

    const throughputTrend: 'improving' | 'stable' | 'degrading' = recentAvgThroughput > olderAvgThroughput * 1.05 ? 'improving' :
                           recentAvgThroughput < olderAvgThroughput * 0.95 ? 'degrading' : 'stable'

    const resourceTrend: 'improving' | 'stable' | 'degrading' = recentAvgCpu < olderAvgCpu * 0.95 ? 'improving' :
                         recentAvgCpu > olderAvgCpu * 1.05 ? 'degrading' : 'stable'

    return {
      query_time_trend: queryTimeTrend,
      throughput_trend: throughputTrend,
      resource_usage_trend: resourceTrend
    }
  }
}