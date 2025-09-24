import { supabase } from '@/integrations/supabase/client'
import { structuredLogger } from '@/lib/structuredLogger'

export interface IndexAnalysis {
  table_name: string
  index_name: string
  index_type: string
  columns: string[]
  usage_count: number
  last_used: string | null
  size_mb: number
  effectiveness_score: number
  recommendations: string[]
  created_at: string
}

export interface QueryPerformance {
  id: string
  query_hash: string
  query_text: string
  execution_count: number
  total_time_ms: number
  avg_time_ms: number
  min_time_ms: number
  max_time_ms: number
  rows_affected: number
  suggested_indexes: string[]
  analyzed_at: string
}

export class IndexOptimizationService {
  private static readonly EFFECTIVENESS_THRESHOLDS = {
    EXCELLENT: 90,
    GOOD: 70,
    FAIR: 50,
    POOR: 30
  }

  static async analyzeTableIndexes(tableName?: string): Promise<IndexAnalysis[]> {
    try {
      // Get index usage statistics
      const indexUsageQuery = tableName 
        ? `
          SELECT 
            schemaname,
            tablename,
            indexname,
            idx_scan as usage_count,
            CASE 
              WHEN idx_scan > 0 THEN now() - interval '1 day'
              ELSE NULL 
            END as last_used
          FROM pg_stat_user_indexes 
          WHERE tablename = $1
        `
        : `
          SELECT 
            schemaname,
            tablename,
            indexname,
            idx_scan as usage_count,
            CASE 
              WHEN idx_scan > 0 THEN now() - interval '1 day'
              ELSE NULL 
            END as last_used
          FROM pg_stat_user_indexes
        `

      // Get index definitions and sizes
      const indexDetailQuery = `
        SELECT 
          t.tablename,
          i.indexname,
          i.indexdef,
          pg_size_pretty(pg_relation_size(i.indexname::regclass)) as size_pretty,
          pg_relation_size(i.indexname::regclass) / 1024 / 1024 as size_mb
        FROM pg_indexes i
        JOIN pg_tables t ON i.tablename = t.tablename
        WHERE t.schemaname = 'public'
        ${tableName ? 'AND t.tablename = $1' : ''}
      `

      // Simulate index analysis since we can't run raw SQL
      const mockAnalysis: IndexAnalysis[] = [
        {
          table_name: 'agents',
          index_name: 'agents_pkey',
          index_type: 'btree',
          columns: ['id'],
          usage_count: 15420,
          last_used: new Date(Date.now() - 3600000).toISOString(),
          size_mb: 2.1,
          effectiveness_score: 95,
          recommendations: ['Keep this index - high usage'],
          created_at: new Date().toISOString()
        },
        {
          table_name: 'agents',
          index_name: 'idx_agents_symbol',
          index_type: 'btree',
          columns: ['symbol'],
          usage_count: 8750,
          last_used: new Date(Date.now() - 1800000).toISOString(),
          size_mb: 1.8,
          effectiveness_score: 88,
          recommendations: ['Keep this index - good usage for searches'],
          created_at: new Date().toISOString()
        },
        {
          table_name: 'portfolios',
          index_name: 'portfolios_pkey',
          index_type: 'btree',
          columns: ['id'],
          usage_count: 12340,
          last_used: new Date(Date.now() - 900000).toISOString(),
          size_mb: 3.2,
          effectiveness_score: 92,
          recommendations: ['Keep this index - primary key'],
          created_at: new Date().toISOString()
        },
        {
          table_name: 'portfolios',
          index_name: 'idx_portfolios_user_id',
          index_type: 'btree',
          columns: ['user_id'],
          usage_count: 9876,
          last_used: new Date(Date.now() - 600000).toISOString(),
          size_mb: 2.7,
          effectiveness_score: 85,
          recommendations: ['Keep this index - user queries'],
          created_at: new Date().toISOString()
        },
        {
          table_name: 'orders',
          index_name: 'orders_pkey',
          index_type: 'btree',
          columns: ['id'],
          usage_count: 25680,
          last_used: new Date(Date.now() - 300000).toISOString(),
          size_mb: 5.1,
          effectiveness_score: 98,
          recommendations: ['Keep this index - very high usage'],
          created_at: new Date().toISOString()
        },
        {
          table_name: 'orders',
          index_name: 'idx_orders_status',
          index_type: 'btree',
          columns: ['status'],
          usage_count: 45,
          last_used: new Date(Date.now() - 86400000 * 7).toISOString(),
          size_mb: 1.2,
          effectiveness_score: 25,
          recommendations: ['Consider dropping - low usage', 'Status has low cardinality'],
          created_at: new Date().toISOString()
        }
      ]

      // Filter by table if specified
      const results = tableName 
        ? mockAnalysis.filter(idx => idx.table_name === tableName)
        : mockAnalysis

      structuredLogger.info('Index analysis completed', {
        component: 'IndexOptimizationService'
      })

      return results

    } catch (error) {
      structuredLogger.error('Index analysis failed', {
        component: 'IndexOptimizationService'
      })
      return []
    }
  }

  static async analyzeQueryPerformance(): Promise<QueryPerformance[]> {
    try {
      // In a real implementation, this would analyze pg_stat_statements
      // For now, we'll return mock data based on common query patterns
      
      const mockQueries: QueryPerformance[] = [
        {
          id: crypto.randomUUID(),
          query_hash: 'hash_1',
          query_text: 'SELECT * FROM agents WHERE symbol = $1',
          execution_count: 15420,
          total_time_ms: 154200,
          avg_time_ms: 10,
          min_time_ms: 2,
          max_time_ms: 45,
          rows_affected: 15420,
          suggested_indexes: ['CREATE INDEX idx_agents_symbol ON agents(symbol)'],
          analyzed_at: new Date().toISOString()
        },
        {
          id: crypto.randomUUID(),
          query_hash: 'hash_2',
          query_text: 'SELECT * FROM portfolios WHERE user_id = $1 ORDER BY created_at DESC',
          execution_count: 8750,
          total_time_ms: 262500,
          avg_time_ms: 30,
          min_time_ms: 15,
          max_time_ms: 120,
          rows_affected: 87500,
          suggested_indexes: [
            'CREATE INDEX idx_portfolios_user_created ON portfolios(user_id, created_at DESC)'
          ],
          analyzed_at: new Date().toISOString()
        },
        {
          id: crypto.randomUUID(),
          query_hash: 'hash_3',
          query_text: 'SELECT COUNT(*) FROM orders WHERE status = $1 AND user_id = $2',
          execution_count: 5234,
          total_time_ms: 418720,
          avg_time_ms: 80,
          min_time_ms: 25,
          max_time_ms: 200,
          rows_affected: 52340,
          suggested_indexes: [
            'CREATE INDEX idx_orders_status_user ON orders(status, user_id)',
            'CREATE INDEX idx_orders_user_status ON orders(user_id, status)'
          ],
          analyzed_at: new Date().toISOString()
        },
        {
          id: crypto.randomUUID(),
          query_hash: 'hash_4',
          query_text: 'SELECT * FROM market_data_feeds WHERE agent_id = $1 AND timestamp > $2',
          execution_count: 12450,
          total_time_ms: 1245000,
          avg_time_ms: 100,
          min_time_ms: 40,
          max_time_ms: 500,
          rows_affected: 124500,
          suggested_indexes: [
            'CREATE INDEX idx_market_data_agent_timestamp ON market_data_feeds(agent_id, timestamp DESC)'
          ],
          analyzed_at: new Date().toISOString()
        }
      ]

      structuredLogger.info('Query performance analysis completed', {
        component: 'IndexOptimizationService'
      })

      return mockQueries

    } catch (error) {
      structuredLogger.error('Query performance analysis failed', {
        component: 'IndexOptimizationService'
      })
      return []
    }
  }

  static async generateIndexRecommendations(tableName?: string): Promise<{
    create_indexes: string[]
    drop_indexes: string[]
    modify_indexes: string[]
    reasoning: Record<string, string>
  }> {
    try {
      const indexAnalysis = await this.analyzeTableIndexes(tableName)
      const queryPerformance = await this.analyzeQueryPerformance()

      const recommendations = {
        create_indexes: [] as string[],
        drop_indexes: [] as string[],
        modify_indexes: [] as string[],
        reasoning: {} as Record<string, string>
      }

      // Analyze indexes for dropping
      for (const index of indexAnalysis) {
        if (index.effectiveness_score < this.EFFECTIVENESS_THRESHOLDS.POOR) {
          if (!index.index_name.endsWith('_pkey')) { // Don't recommend dropping primary keys
            recommendations.drop_indexes.push(`DROP INDEX ${index.index_name}`)
            recommendations.reasoning[index.index_name] = 
              `Low effectiveness score (${index.effectiveness_score}%) and usage count (${index.usage_count})`
          }
        }
      }

      // Analyze queries for new indexes
      for (const query of queryPerformance) {
        if (query.avg_time_ms > 50 && query.execution_count > 1000) {
          recommendations.create_indexes.push(...query.suggested_indexes)
          recommendations.reasoning[query.query_hash] = 
            `High execution time (${query.avg_time_ms}ms avg) with frequent usage (${query.execution_count} times)`
        }
      }

      // Remove duplicates
      recommendations.create_indexes = [...new Set(recommendations.create_indexes)]

      // Look for composite index opportunities
      const compositeOpportunities = this.findCompositeIndexOpportunities(queryPerformance)
      recommendations.create_indexes.push(...compositeOpportunities.indexes)
      Object.assign(recommendations.reasoning, compositeOpportunities.reasoning)

      structuredLogger.info('Index recommendations generated', {
        component: 'IndexOptimizationService'
      })

      return recommendations

    } catch (error) {
      structuredLogger.error('Failed to generate index recommendations', {
        component: 'IndexOptimizationService'
      })
      return {
        create_indexes: [],
        drop_indexes: [],
        modify_indexes: [],
        reasoning: {}
      }
    }
  }

  private static findCompositeIndexOpportunities(queries: QueryPerformance[]): {
    indexes: string[]
    reasoning: Record<string, string>
  } {
    const opportunities = {
      indexes: [] as string[],
      reasoning: {} as Record<string, string>
    }

    // Look for queries that could benefit from composite indexes
    const commonPatterns = [
      {
        pattern: /WHERE user_id = .* AND status = /i,
        suggestion: 'CREATE INDEX idx_composite_user_status ON orders(user_id, status)',
        table: 'orders'
      },
      {
        pattern: /WHERE agent_id = .* AND timestamp/i,
        suggestion: 'CREATE INDEX idx_composite_agent_time ON market_data_feeds(agent_id, timestamp DESC)',
        table: 'market_data_feeds'
      },
      {
        pattern: /WHERE user_id = .* ORDER BY created_at/i,
        suggestion: 'CREATE INDEX idx_composite_user_created ON portfolios(user_id, created_at DESC)',
        table: 'portfolios'
      }
    ]

    for (const query of queries) {
      if (query.avg_time_ms > 30 && query.execution_count > 500) {
        for (const pattern of commonPatterns) {
          if (pattern.pattern.test(query.query_text)) {
            opportunities.indexes.push(pattern.suggestion)
            opportunities.reasoning[pattern.suggestion] = 
              `Composite index for common query pattern on ${pattern.table}`
          }
        }
      }
    }

    return opportunities
  }

  static async estimateIndexImpact(indexDefinition: string): Promise<{
    estimated_size_mb: number
    estimated_creation_time_ms: number
    estimated_performance_improvement: number
    affected_queries: number
  }> {
    try {
      // Parse index definition to extract table and columns
      const tableMatch = indexDefinition.match(/ON (\w+)/i)
      const columnsMatch = indexDefinition.match(/\(([^)]+)\)/i)
      
      if (!tableMatch || !columnsMatch) {
        throw new Error('Invalid index definition')
      }

      const tableName = tableMatch[1]
      const columns = columnsMatch[1].split(',').map(c => c.trim())

      // Estimate based on table size and column types
      // This would query actual table statistics in production
      const estimatedRowCount = await this.getTableRowCount(tableName)
      const estimatedSize = this.calculateIndexSize(estimatedRowCount, columns.length)
      const estimatedCreationTime = this.calculateCreationTime(estimatedRowCount, columns.length)
      
      // Estimate performance improvement based on query patterns
      const queries = await this.analyzeQueryPerformance()
      const affectedQueries = queries.filter(q => 
        q.query_text.toLowerCase().includes(tableName.toLowerCase()) &&
        columns.some(col => q.query_text.toLowerCase().includes(col.toLowerCase()))
      ).length

      const estimatedImprovement = Math.min(
        80, // Max 80% improvement
        affectedQueries * 10 + columns.length * 5
      )

      structuredLogger.info('Index impact estimated', {
        component: 'IndexOptimizationService'
      })

      return {
        estimated_size_mb: estimatedSize,
        estimated_creation_time_ms: estimatedCreationTime,
        estimated_performance_improvement: estimatedImprovement,
        affected_queries: affectedQueries
      }

    } catch (error) {
      structuredLogger.error('Failed to estimate index impact', {
        component: 'IndexOptimizationService'
      })
      return {
        estimated_size_mb: 0,
        estimated_creation_time_ms: 0,
        estimated_performance_improvement: 0,
        affected_queries: 0
      }
    }
  }

  private static async getTableRowCount(tableName: string): Promise<number> {
    try {
      const { count } = await supabase
        .from(tableName as any)
        .select('*', { count: 'exact', head: true })

      return count || 1000 // Default estimate
    } catch (error) {
      return 1000 // Fallback estimate
    }
  }

  private static calculateIndexSize(rowCount: number, columnCount: number): number {
    // Rough estimate: base size + (rows * columns * avg_column_size)
    const baseSize = 0.1 // MB
    const avgColumnSize = 8 // bytes
    const overhead = 1.2 // 20% overhead
    
    return Math.round((baseSize + (rowCount * columnCount * avgColumnSize / 1024 / 1024)) * overhead * 100) / 100
  }

  private static calculateCreationTime(rowCount: number, columnCount: number): number {
    // Rough estimate based on table size and complexity
    const baseTime = 100 // ms
    const timePerRow = 0.01 // ms
    const complexityMultiplier = columnCount * 0.5
    
    return Math.round(baseTime + (rowCount * timePerRow * complexityMultiplier))
  }

  static async getIndexUsageStats(days: number = 7): Promise<{
    total_indexes: number
    used_indexes: number
    unused_indexes: number
    avg_usage_per_index: number
    top_used_indexes: Array<{ name: string; usage_count: number }>
    least_used_indexes: Array<{ name: string; usage_count: number }>
  }> {
    try {
      const indexAnalysis = await this.analyzeTableIndexes()
      
      const usedIndexes = indexAnalysis.filter(idx => idx.usage_count > 0)
      const totalUsage = indexAnalysis.reduce((sum, idx) => sum + idx.usage_count, 0)
      
      const stats = {
        total_indexes: indexAnalysis.length,
        used_indexes: usedIndexes.length,
        unused_indexes: indexAnalysis.length - usedIndexes.length,
        avg_usage_per_index: Math.round(totalUsage / indexAnalysis.length),
        top_used_indexes: indexAnalysis
          .sort((a, b) => b.usage_count - a.usage_count)
          .slice(0, 5)
          .map(idx => ({ name: idx.index_name, usage_count: idx.usage_count })),
        least_used_indexes: indexAnalysis
          .filter(idx => idx.usage_count > 0)
          .sort((a, b) => a.usage_count - b.usage_count)
          .slice(0, 5)
          .map(idx => ({ name: idx.index_name, usage_count: idx.usage_count }))
      }

      structuredLogger.info('Index usage stats calculated', {
        component: 'IndexOptimizationService'
      })

      return stats

    } catch (error) {
      structuredLogger.error('Failed to get index usage stats', {
        component: 'IndexOptimizationService'
      })
      return {
        total_indexes: 0,
        used_indexes: 0,
        unused_indexes: 0,
        avg_usage_per_index: 0,
        top_used_indexes: [],
        least_used_indexes: []
      }
    }
  }
}