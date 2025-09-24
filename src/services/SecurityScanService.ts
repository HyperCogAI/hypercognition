import { supabase } from '@/integrations/supabase/client'
import { structuredLogger } from '@/lib/structuredLogger'

export interface SecurityVulnerability {
  id: string
  type: 'sql_injection' | 'xss' | 'csrf' | 'auth_bypass' | 'data_exposure' | 'rate_limit_bypass'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  affected_component: string
  recommendation: string
  detected_at: string
  resolved_at?: string
  status: 'open' | 'investigating' | 'resolved' | 'false_positive'
  metadata: Record<string, any>
}

export interface SecurityScanResult {
  id: string
  scan_type: 'automated' | 'manual' | 'scheduled'
  status: 'running' | 'completed' | 'failed'
  started_at: string
  completed_at?: string
  vulnerabilities_found: number
  critical_count: number
  high_count: number
  medium_count: number
  low_count: number
  scan_config: Record<string, any>
  results: Record<string, any>
}

export class SecurityScanService {
  private static readonly SCAN_PATTERNS = {
    sql_injection: [
      /(\bUNION\b.*\bSELECT\b)/i,
      /(\bINSERT\b.*\bINTO\b)/i,
      /(\bDROP\b.*\bTABLE\b)/i,
      /(\bDELETE\b.*\bFROM\b)/i,
      /('.*OR.*'.*=.*')/i
    ],
    xss: [
      /<script[^>]*>/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe[^>]*>/i,
      /eval\s*\(/i
    ],
    path_traversal: [
      /\.\.\//,
      /\.\.\\/, 
      /%2e%2e%2f/i,
      /%2e%2e%5c/i
    ]
  }

  static async startSecurityScan(scanConfig: {
    scan_type: 'automated' | 'manual' | 'scheduled'
    components?: string[]
    include_dependencies?: boolean
    scan_depth?: 'shallow' | 'deep'
  }): Promise<string> {
    try {
      const scanId = crypto.randomUUID()
      
      const { error } = await supabase
        .from('security_scans')
        .insert({
          id: scanId,
          scan_type: scanConfig.scan_type,
          status: 'running',
          started_at: new Date().toISOString(),
          scan_config: scanConfig,
          vulnerabilities_found: 0,
          critical_count: 0,
          high_count: 0,
          medium_count: 0,
          low_count: 0,
          results: {}
        })

      if (error) throw error

      structuredLogger.info('Security scan started', {
        component: 'SecurityScanService',
        scanId,
        scanType: scanConfig.scan_type
      })

      // Start async scan process
      this.performSecurityScan(scanId, scanConfig).catch(error => {
        structuredLogger.error('Security scan failed', {
          component: 'SecurityScanService',
          scanId,
          error
        })
      })

      return scanId
    } catch (error) {
      structuredLogger.error('Failed to start security scan', {
        component: 'SecurityScanService',
        error
      })
      throw error
    }
  }

  private static async performSecurityScan(scanId: string, config: any) {
    const vulnerabilities: SecurityVulnerability[] = []

    try {
      // Scan for input validation vulnerabilities
      const inputVulns = await this.scanInputValidation()
      vulnerabilities.push(...inputVulns)

      // Scan for authentication issues
      const authVulns = await this.scanAuthentication()
      vulnerabilities.push(...authVulns)

      // Scan for data exposure
      const dataVulns = await this.scanDataExposure()
      vulnerabilities.push(...dataVulns)

      // Scan for rate limiting issues
      const rateLimitVulns = await this.scanRateLimiting()
      vulnerabilities.push(...rateLimitVulns)

      // Save vulnerabilities
      if (vulnerabilities.length > 0) {
        const { error: vulnError } = await supabase
          .from('security_vulnerabilities')
          .insert(vulnerabilities)

        if (vulnError) throw vulnError
      }

      // Update scan results
      const counts = this.countVulnerabilitiesBySeverity(vulnerabilities)
      
      const { error: updateError } = await supabase
        .from('security_scans')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          vulnerabilities_found: vulnerabilities.length,
          ...counts,
          results: {
            summary: `Found ${vulnerabilities.length} vulnerabilities`,
            scan_completed: true
          }
        })
        .eq('id', scanId)

      if (updateError) throw updateError

      structuredLogger.info('Security scan completed', {
        component: 'SecurityScanService',
        scanId,
        vulnerabilitiesFound: vulnerabilities.length
      })

    } catch (error) {
      // Mark scan as failed
      await supabase
        .from('security_scans')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          results: { error: error.message }
        })
        .eq('id', scanId)

      throw error
    }
  }

  private static async scanInputValidation(): Promise<SecurityVulnerability[]> {
    const vulnerabilities: SecurityVulnerability[] = []

    // Check for missing input validation in forms
    const { data: forms } = await supabase
      .from('form_submissions')
      .select('*')
      .limit(100)

    if (forms) {
      for (const form of forms) {
        const content = JSON.stringify(form)
        
        // Check for SQL injection patterns
        for (const pattern of this.SCAN_PATTERNS.sql_injection) {
          if (pattern.test(content)) {
            vulnerabilities.push({
              id: crypto.randomUUID(),
              type: 'sql_injection',
              severity: 'high',
              description: 'Potential SQL injection vulnerability detected in form submission',
              affected_component: `form_submissions.${form.id}`,
              recommendation: 'Implement proper input validation and parameterized queries',
              detected_at: new Date().toISOString(),
              status: 'open',
              metadata: { form_id: form.id, pattern: pattern.toString() }
            })
          }
        }

        // Check for XSS patterns
        for (const pattern of this.SCAN_PATTERNS.xss) {
          if (pattern.test(content)) {
            vulnerabilities.push({
              id: crypto.randomUUID(),
              type: 'xss',
              severity: 'high',
              description: 'Potential XSS vulnerability detected in form submission',
              affected_component: `form_submissions.${form.id}`,
              recommendation: 'Implement proper input sanitization and output encoding',
              detected_at: new Date().toISOString(),
              status: 'open',
              metadata: { form_id: form.id, pattern: pattern.toString() }
            })
          }
        }
      }
    }

    return vulnerabilities
  }

  private static async scanAuthentication(): Promise<SecurityVulnerability[]> {
    const vulnerabilities: SecurityVulnerability[] = []

    // Check for weak authentication
    const { data: sessions } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('is_active', true)
      .limit(100)

    if (sessions) {
      for (const session of sessions) {
        // Check for long-lived sessions
        const sessionAge = Date.now() - new Date(session.created_at).getTime()
        const maxAge = 24 * 60 * 60 * 1000 // 24 hours

        if (sessionAge > maxAge) {
          vulnerabilities.push({
            id: crypto.randomUUID(),
            type: 'auth_bypass',
            severity: 'medium',
            description: 'Long-lived session detected',
            affected_component: `user_sessions.${session.id}`,
            recommendation: 'Implement session timeout and refresh mechanisms',
            detected_at: new Date().toISOString(),
            status: 'open',
            metadata: { session_id: session.id, age_hours: sessionAge / (60 * 60 * 1000) }
          })
        }
      }
    }

    return vulnerabilities
  }

  private static async scanDataExposure(): Promise<SecurityVulnerability[]> {
    const vulnerabilities: SecurityVulnerability[] = []

    // Check for potential data exposure in API responses
    const { data: apiLogs } = await supabase
      .from('api_requests')
      .select('*')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .limit(100)

    if (apiLogs) {
      for (const log of apiLogs) {
        // Check for sensitive data in responses
        const responseData = JSON.stringify(log)
        
        if (responseData.includes('password') || responseData.includes('secret') || responseData.includes('token')) {
          vulnerabilities.push({
            id: crypto.randomUUID(),
            type: 'data_exposure',
            severity: 'critical',
            description: 'Potential sensitive data exposure in API response',
            affected_component: `api_requests.${log.id}`,
            recommendation: 'Remove sensitive data from API responses and implement proper data filtering',
            detected_at: new Date().toISOString(),
            status: 'open',
            metadata: { request_id: log.id, endpoint: log.path }
          })
        }
      }
    }

    return vulnerabilities
  }

  private static async scanRateLimiting(): Promise<SecurityVulnerability[]> {
    const vulnerabilities: SecurityVulnerability[] = []

    // Check for endpoints without rate limiting
    const { data: endpoints } = await supabase
      .from('api_endpoints')
      .select('*')
      .eq('is_active', true)

    const { data: rateLimits } = await supabase
      .from('rate_limit_configs')
      .select('endpoint')

    if (endpoints && rateLimits) {
      const protectedEndpoints = new Set(rateLimits.map(rl => rl.endpoint))
      
      for (const endpoint of endpoints) {
        if (!protectedEndpoints.has(endpoint.path)) {
          vulnerabilities.push({
            id: crypto.randomUUID(),
            type: 'rate_limit_bypass',
            severity: 'medium',
            description: 'Endpoint missing rate limiting protection',
            affected_component: `api_endpoints.${endpoint.path}`,
            recommendation: 'Implement rate limiting for this endpoint',
            detected_at: new Date().toISOString(),
            status: 'open',
            metadata: { endpoint: endpoint.path, method: endpoint.method }
          })
        }
      }
    }

    return vulnerabilities
  }

  private static countVulnerabilitiesBySeverity(vulnerabilities: SecurityVulnerability[]) {
    return {
      critical_count: vulnerabilities.filter(v => v.severity === 'critical').length,
      high_count: vulnerabilities.filter(v => v.severity === 'high').length,
      medium_count: vulnerabilities.filter(v => v.severity === 'medium').length,
      low_count: vulnerabilities.filter(v => v.severity === 'low').length
    }
  }

  static async getScanResults(scanId: string): Promise<SecurityScanResult | null> {
    try {
      const { data, error } = await supabase
        .from('security_scans')
        .select('*')
        .eq('id', scanId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      structuredLogger.error('Failed to get scan results', {
        component: 'SecurityScanService',
        error
      })
      return null
    }
  }

  static async getVulnerabilities(filters: {
    status?: string
    severity?: string
    type?: string
    limit?: number
  } = {}): Promise<SecurityVulnerability[]> {
    try {
      let query = supabase
        .from('security_vulnerabilities')
        .select('*')

      if (filters.status) query = query.eq('status', filters.status)
      if (filters.severity) query = query.eq('severity', filters.severity)
      if (filters.type) query = query.eq('type', filters.type)

      query = query
        .order('detected_at', { ascending: false })
        .limit(filters.limit || 100)

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      structuredLogger.error('Failed to get vulnerabilities', {
        component: 'SecurityScanService',
        error
      })
      return []
    }
  }

  static async updateVulnerabilityStatus(
    vulnerabilityId: string, 
    status: 'open' | 'investigating' | 'resolved' | 'false_positive',
    resolution?: string
  ) {
    try {
      const updates: any = { status }
      
      if (status === 'resolved') {
        updates.resolved_at = new Date().toISOString()
        if (resolution) updates.resolution = resolution
      }

      const { error } = await supabase
        .from('security_vulnerabilities')
        .update(updates)
        .eq('id', vulnerabilityId)

      if (error) throw error

      structuredLogger.info('Vulnerability status updated', {
        component: 'SecurityScanService',
        vulnerabilityId,
        status
      })
    } catch (error) {
      structuredLogger.error('Failed to update vulnerability status', {
        component: 'SecurityScanService',
        error
      })
      throw error
    }
  }
}