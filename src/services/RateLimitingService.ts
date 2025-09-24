import { supabase } from '@/integrations/supabase/client'
import { structuredLogger } from '@/lib/structuredLogger'

export interface RateLimit {
  id: string
  identifier: string
  endpoint: string
  window_start: string
  request_count: number
  created_at: string
}

export interface RateLimitConfig {
  endpoint: string
  max_requests: number
  window_minutes: number
  enabled: boolean
}

export class RateLimitingService {
  private static readonly DEFAULT_LIMITS = {
    '/api/auth': { max_requests: 10, window_minutes: 15 },
    '/api/trading': { max_requests: 100, window_minutes: 1 },
    '/api/market-data': { max_requests: 1000, window_minutes: 1 },
    '/api/portfolio': { max_requests: 50, window_minutes: 1 },
    default: { max_requests: 100, window_minutes: 15 }
  }

  static async checkRateLimit(
    identifier: string, 
    endpoint: string, 
    customLimits?: { max_requests: number; window_minutes: number }
  ): Promise<{ allowed: boolean; remainingRequests: number; resetTime: Date }> {
    try {
      const limits = customLimits || this.DEFAULT_LIMITS[endpoint] || this.DEFAULT_LIMITS.default

      // Use Supabase function for rate limiting
      const { data, error } = await supabase.rpc('check_rate_limit', {
        identifier_param: identifier,
        endpoint_param: endpoint,
        max_requests: limits.max_requests,
        window_minutes: limits.window_minutes
      })

      if (error) throw error

      const allowed = data as boolean

      // Get current request count for remaining calculation
      const remainingRequests = await this.getRemainingRequests(
        identifier, 
        endpoint, 
        limits.max_requests, 
        limits.window_minutes
      )

      const resetTime = this.calculateResetTime(limits.window_minutes)

      if (!allowed) {
        structuredLogger.warn('Rate limit exceeded', {
          component: 'RateLimitingService',
          identifier,
          endpoint,
          limits
        })
      }

      return {
        allowed,
        remainingRequests,
        resetTime
      }
    } catch (error) {
      structuredLogger.error('Rate limit check failed', {
        component: 'RateLimitingService',
        error,
        identifier,
        endpoint
      })
      
      // Fail open - allow request if rate limiting fails
      return {
        allowed: true,
        remainingRequests: 0,
        resetTime: new Date()
      }
    }
  }

  private static async getRemainingRequests(
    identifier: string,
    endpoint: string,
    maxRequests: number,
    windowMinutes: number
  ): Promise<number> {
    try {
      const windowStart = this.calculateWindowStart(windowMinutes)
      
      const { data, error } = await supabase
        .from('rate_limits')
        .select('request_count')
        .eq('identifier', identifier)
        .eq('endpoint', endpoint)
        .gte('window_start', windowStart.toISOString())

      if (error) throw error

      const totalRequests = data?.reduce((sum, record) => sum + record.request_count, 0) || 0
      return Math.max(0, maxRequests - totalRequests)
    } catch (error) {
      return 0
    }
  }

  private static calculateWindowStart(windowMinutes: number): Date {
    const now = new Date()
    const minutes = now.getMinutes()
    const windowStart = new Date(now)
    windowStart.setMinutes(minutes - (minutes % windowMinutes), 0, 0)
    return windowStart
  }

  private static calculateResetTime(windowMinutes: number): Date {
    const windowStart = this.calculateWindowStart(windowMinutes)
    return new Date(windowStart.getTime() + windowMinutes * 60 * 1000)
  }

  static async getRateLimitStatus(identifier: string, endpoint: string) {
    try {
      const { data, error } = await supabase
        .from('rate_limits')
        .select('*')
        .eq('identifier', identifier)
        .eq('endpoint', endpoint)
        .gte('window_start', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('window_start', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      structuredLogger.error('Failed to get rate limit status', {
        component: 'RateLimitingService',
        error
      })
      return []
    }
  }

  static async cleanupExpiredLimits() {
    try {
      await supabase.rpc('cleanup_rate_limits')
      
      structuredLogger.info('Rate limit cleanup completed', {
        component: 'RateLimitingService'
      })
    } catch (error) {
      structuredLogger.error('Rate limit cleanup failed', {
        component: 'RateLimitingService',
        error
      })
    }
  }

  static async updateRateLimitConfig(config: RateLimitConfig) {
    try {
      const { data, error } = await supabase
        .from('rate_limit_configs')
        .upsert(config, { onConflict: 'endpoint' })
        .select()
        .single()

      if (error) throw error

      structuredLogger.info('Rate limit config updated', {
        component: 'RateLimitingService',
        endpoint: config.endpoint,
        maxRequests: config.max_requests
      })

      return data
    } catch (error) {
      structuredLogger.error('Failed to update rate limit config', {
        component: 'RateLimitingService',
        error
      })
      throw error
    }
  }

  static async getRateLimitConfigs(): Promise<RateLimitConfig[]> {
    try {
      const { data, error } = await supabase
        .from('rate_limit_configs')
        .select('*')
        .eq('enabled', true)

      if (error) throw error
      return data || []
    } catch (error) {
      structuredLogger.error('Failed to get rate limit configs', {
        component: 'RateLimitingService',
        error
      })
      return []
    }
  }

  static getDefaultLimits() {
    return this.DEFAULT_LIMITS
  }

  static async blockIdentifier(identifier: string, reason: string, durationMinutes: number = 60) {
    try {
      const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000)
      
      const { error } = await supabase
        .from('blocked_identifiers')
        .insert({
          identifier,
          reason,
          expires_at: expiresAt.toISOString(),
          created_at: new Date().toISOString()
        })

      if (error) throw error

      structuredLogger.warn('Identifier blocked', {
        component: 'RateLimitingService',
        identifier,
        reason,
        durationMinutes
      })
    } catch (error) {
      structuredLogger.error('Failed to block identifier', {
        component: 'RateLimitingService',
        error
      })
    }
  }

  static async isIdentifierBlocked(identifier: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('blocked_identifiers')
        .select('id')
        .eq('identifier', identifier)
        .gt('expires_at', new Date().toISOString())
        .limit(1)

      if (error) throw error
      return (data?.length || 0) > 0
    } catch (error) {
      return false
    }
  }
}