import { supabase } from '@/integrations/supabase/client'
import { structuredLogger } from '@/lib/structuredLogger'
import { RateLimitingService } from './RateLimitingService'

export interface RateLimitRule {
  id: string
  endpoint: string
  method: string
  limit: number
  window_minutes: number
  is_active: boolean
  description?: string
  created_at: string
  updated_at: string
}

export interface RateLimitViolation {
  id: string
  identifier: string
  endpoint: string
  method: string
  request_count: number
  limit: number
  window_start: string
  ip_address?: string
  user_agent?: string
  blocked_until?: string
  created_at: string
}

export interface RateLimitStats {
  total_requests: number
  total_violations: number
  top_endpoints: Array<{
    endpoint: string
    request_count: number
    violation_count: number
  }>
  top_violators: Array<{
    identifier: string
    violation_count: number
    last_violation: string
  }>
  hourly_stats: Array<{
    hour: string
    requests: number
    violations: number
  }>
}

export interface DashboardMetrics {
  active_rules: number
  total_violations_24h: number
  blocked_requests_24h: number
  top_violated_endpoints: Array<{
    endpoint: string
    violations: number
  }>
  violation_trends: {
    trend: 'up' | 'down' | 'stable'
    percentage_change: number
  }
}

export class ApiRateLimitDashboardService {
  private static rules: RateLimitRule[] = []
  private static violations: RateLimitViolation[] = []

  static async initializeDefaultRules(): Promise<void> {
    try {
      const defaultRules: Omit<RateLimitRule, 'id' | 'created_at' | 'updated_at'>[] = [
        {
          endpoint: '/api/auth/login',
          method: 'POST',
          limit: 5,
          window_minutes: 15,
          is_active: true,
          description: 'Login attempts'
        },
        {
          endpoint: '/api/agents',
          method: 'GET',
          limit: 100,
          window_minutes: 1,
          is_active: true,
          description: 'Agent listing'
        },
        {
          endpoint: '/api/portfolio',
          method: 'GET',
          limit: 60,
          window_minutes: 1,
          is_active: true,
          description: 'Portfolio data'
        },
        {
          endpoint: '/api/orders',
          method: 'POST',
          limit: 10,
          window_minutes: 1,
          is_active: true,
          description: 'Order creation'
        },
        {
          endpoint: '/api/search',
          method: 'GET',
          limit: 30,
          window_minutes: 1,
          is_active: true,
          description: 'Search queries'
        }
      ]

      for (const rule of defaultRules) {
        await this.createRule(rule)
      }

      structuredLogger.info('Default rate limit rules initialized', {
        component: 'ApiRateLimitDashboardService'
      })
    } catch (error) {
      structuredLogger.error('Failed to initialize default rules', {
        component: 'ApiRateLimitDashboardService'
      })
    }
  }

  static async createRule(ruleData: Omit<RateLimitRule, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    try {
      const rule: RateLimitRule = {
        id: crypto.randomUUID(),
        ...ruleData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      this.rules.push(rule)

      structuredLogger.info('Rate limit rule created', {
        component: 'ApiRateLimitDashboardService'
      })

      return rule.id
    } catch (error) {
      structuredLogger.error('Failed to create rate limit rule', {
        component: 'ApiRateLimitDashboardService'
      })
      throw error
    }
  }

  static async updateRule(ruleId: string, updates: Partial<RateLimitRule>): Promise<void> {
    try {
      const ruleIndex = this.rules.findIndex(r => r.id === ruleId)
      if (ruleIndex === -1) {
        throw new Error('Rule not found')
      }

      this.rules[ruleIndex] = {
        ...this.rules[ruleIndex],
        ...updates,
        updated_at: new Date().toISOString()
      }

      structuredLogger.info('Rate limit rule updated', {
        component: 'ApiRateLimitDashboardService'
      })
    } catch (error) {
      structuredLogger.error('Failed to update rate limit rule', {
        component: 'ApiRateLimitDashboardService'
      })
      throw error
    }
  }

  static async deleteRule(ruleId: string): Promise<void> {
    try {
      const ruleIndex = this.rules.findIndex(r => r.id === ruleId)
      if (ruleIndex === -1) {
        throw new Error('Rule not found')
      }

      this.rules.splice(ruleIndex, 1)

      structuredLogger.info('Rate limit rule deleted', {
        component: 'ApiRateLimitDashboardService'
      })
    } catch (error) {
      structuredLogger.error('Failed to delete rate limit rule', {
        component: 'ApiRateLimitDashboardService'
      })
      throw error
    }
  }

  static async getRules(): Promise<RateLimitRule[]> {
    return this.rules
  }

  static async getActiveRules(): Promise<RateLimitRule[]> {
    return this.rules.filter(rule => rule.is_active)
  }

  static async recordViolation(violationData: {
    identifier: string
    endpoint: string
    method: string
    request_count: number
    limit: number
    window_start: string
    ip_address?: string
    user_agent?: string
    blocked_duration_minutes?: number
  }): Promise<void> {
    try {
      const violation: RateLimitViolation = {
        id: crypto.randomUUID(),
        ...violationData,
        blocked_until: violationData.blocked_duration_minutes 
          ? new Date(Date.now() + violationData.blocked_duration_minutes * 60 * 1000).toISOString()
          : undefined,
        created_at: new Date().toISOString()
      }

      this.violations.push(violation)

      structuredLogger.warn('Rate limit violation recorded', {
        component: 'ApiRateLimitDashboardService'
      })
    } catch (error) {
      structuredLogger.error('Failed to record rate limit violation', {
        component: 'ApiRateLimitDashboardService'
      })
    }
  }

  static async getViolations(limit: number = 100): Promise<RateLimitViolation[]> {
    return this.violations
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit)
  }

  static async getViolationsByIdentifier(identifier: string): Promise<RateLimitViolation[]> {
    return this.violations
      .filter(v => v.identifier === identifier)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  static async getViolationsByEndpoint(endpoint: string): Promise<RateLimitViolation[]> {
    return this.violations
      .filter(v => v.endpoint === endpoint)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  static async getRateLimitStats(hours: number = 24): Promise<RateLimitStats> {
    try {
      const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000)
      const recentViolations = this.violations.filter(
        v => new Date(v.created_at) >= cutoffTime
      )

      // Mock request data since we don't have actual request logs
      const totalRequests = Math.floor(Math.random() * 100000) + 10000

      // Calculate top endpoints
      const endpointStats = new Map<string, { requests: number, violations: number }>()
      
      recentViolations.forEach(violation => {
        const key = violation.endpoint
        const current = endpointStats.get(key) || { requests: 0, violations: 0 }
        current.violations++
        current.requests += Math.floor(Math.random() * 1000) + 100
        endpointStats.set(key, current)
      })

      const topEndpoints = Array.from(endpointStats.entries())
        .map(([endpoint, stats]) => ({
          endpoint,
          request_count: stats.requests,
          violation_count: stats.violations
        }))
        .sort((a, b) => b.violation_count - a.violation_count)
        .slice(0, 10)

      // Calculate top violators
      const violatorStats = new Map<string, { count: number, lastViolation: string }>()
      
      recentViolations.forEach(violation => {
        const current = violatorStats.get(violation.identifier) || { count: 0, lastViolation: '' }
        current.count++
        if (!current.lastViolation || violation.created_at > current.lastViolation) {
          current.lastViolation = violation.created_at
        }
        violatorStats.set(violation.identifier, current)
      })

      const topViolators = Array.from(violatorStats.entries())
        .map(([identifier, stats]) => ({
          identifier,
          violation_count: stats.count,
          last_violation: stats.lastViolation
        }))
        .sort((a, b) => b.violation_count - a.violation_count)
        .slice(0, 10)

      // Generate hourly stats
      const hourlyStats = []
      for (let i = hours - 1; i >= 0; i--) {
        const hourStart = new Date(Date.now() - i * 60 * 60 * 1000)
        const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000)
        
        const hourViolations = recentViolations.filter(
          v => new Date(v.created_at) >= hourStart && new Date(v.created_at) < hourEnd
        ).length

        hourlyStats.push({
          hour: hourStart.toISOString(),
          requests: Math.floor(Math.random() * 5000) + 500,
          violations: hourViolations
        })
      }

      return {
        total_requests: totalRequests,
        total_violations: recentViolations.length,
        top_endpoints: topEndpoints,
        top_violators: topViolators,
        hourly_stats: hourlyStats
      }
    } catch (error) {
      structuredLogger.error('Failed to get rate limit stats', {
        component: 'ApiRateLimitDashboardService'
      })
      throw error
    }
  }

  static async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      const activeRules = this.rules.filter(r => r.is_active)
      const recentViolations = this.violations.filter(
        v => new Date(v.created_at) >= new Date(Date.now() - 24 * 60 * 60 * 1000)
      )
      
      const previousDayViolations = this.violations.filter(
        v => {
          const violationDate = new Date(v.created_at)
          const yesterday = new Date(Date.now() - 48 * 60 * 60 * 1000)
          const dayBeforeYesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
          return violationDate >= yesterday && violationDate < dayBeforeYesterday
        }
      )

      // Calculate trend
      const currentCount = recentViolations.length
      const previousCount = previousDayViolations.length
      
      let trend: 'up' | 'down' | 'stable' = 'stable'
      let percentageChange = 0
      
      if (previousCount > 0) {
        percentageChange = ((currentCount - previousCount) / previousCount) * 100
        if (Math.abs(percentageChange) > 10) {
          trend = percentageChange > 0 ? 'up' : 'down'
        }
      }

      // Top violated endpoints
      const endpointViolations = new Map<string, number>()
      recentViolations.forEach(violation => {
        endpointViolations.set(
          violation.endpoint,
          (endpointViolations.get(violation.endpoint) || 0) + 1
        )
      })

      const topViolatedEndpoints = Array.from(endpointViolations.entries())
        .map(([endpoint, violations]) => ({ endpoint, violations }))
        .sort((a, b) => b.violations - a.violations)
        .slice(0, 5)

      return {
        active_rules: activeRules.length,
        total_violations_24h: recentViolations.length,
        blocked_requests_24h: recentViolations.length, // Assuming all violations result in blocks
        top_violated_endpoints: topViolatedEndpoints,
        violation_trends: {
          trend,
          percentage_change: Math.abs(percentageChange)
        }
      }
    } catch (error) {
      structuredLogger.error('Failed to get dashboard metrics', {
        component: 'ApiRateLimitDashboardService'
      })
      throw error
    }
  }

  static async testRuleAgainstTraffic(ruleId: string): Promise<{
    wouldBlock: number
    wouldAllow: number
    sampleViolations: Array<{
      identifier: string
      requestCount: number
      timeWindow: string
    }>
  }> {
    try {
      const rule = this.rules.find(r => r.id === ruleId)
      if (!rule) {
        throw new Error('Rule not found')
      }

      // Simulate traffic analysis
      const wouldBlock = Math.floor(Math.random() * 50) + 5
      const wouldAllow = Math.floor(Math.random() * 1000) + 100

      const sampleViolations = Array.from({ length: Math.min(wouldBlock, 5) }, (_, i) => ({
        identifier: `user_${i + 1}`,
        requestCount: rule.limit + Math.floor(Math.random() * 20) + 1,
        timeWindow: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
      }))

      return {
        wouldBlock,
        wouldAllow,
        sampleViolations
      }
    } catch (error) {
      structuredLogger.error('Failed to test rule against traffic', {
        component: 'ApiRateLimitDashboardService'
      })
      throw error
    }
  }

  static async exportViolations(format: 'csv' | 'json' = 'csv'): Promise<string> {
    try {
      const violations = await this.getViolations(1000) // Get last 1000 violations

      if (format === 'json') {
        return JSON.stringify(violations, null, 2)
      }

      // CSV format
      const headers = ['ID', 'Identifier', 'Endpoint', 'Method', 'Request Count', 'Limit', 'Window Start', 'IP Address', 'Created At']
      const csvRows = [headers.join(',')]

      violations.forEach(violation => {
        const row = [
          violation.id,
          violation.identifier,
          violation.endpoint,
          violation.method,
          violation.request_count,
          violation.limit,
          violation.window_start,
          violation.ip_address || '',
          violation.created_at
        ].map(field => `"${field}"`)
        
        csvRows.push(row.join(','))
      })

      return csvRows.join('\n')
    } catch (error) {
      structuredLogger.error('Failed to export violations', {
        component: 'ApiRateLimitDashboardService'
      })
      throw error
    }
  }

  static async clearViolations(olderThanHours: number = 168): Promise<number> {
    try {
      const cutoffTime = new Date(Date.now() - olderThanHours * 60 * 60 * 1000)
      const initialCount = this.violations.length
      
      this.violations = this.violations.filter(
        v => new Date(v.created_at) >= cutoffTime
      )
      
      const clearedCount = initialCount - this.violations.length

      structuredLogger.info('Violations cleared', {
        component: 'ApiRateLimitDashboardService'
      })

      return clearedCount
    } catch (error) {
      structuredLogger.error('Failed to clear violations', {
        component: 'ApiRateLimitDashboardService'
      })
      throw error
    }
  }
}