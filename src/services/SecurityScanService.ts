import { supabase } from '@/integrations/supabase/client'
import { structuredLogger } from '@/lib/structuredLogger'

export interface SecurityVulnerability {
  id: string
  type: 'sql_injection' | 'xss' | 'csrf' | 'auth_bypass' | 'data_exposure' | 'rate_limit_bypass' | 'brute_force' | 'path_traversal' | 'distributed_attack'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  location: string
  remediation: string
  created_at: string
}

export interface SecurityScan {
  id: string
  scan_type: 'comprehensive' | 'quick' | 'scheduled'
  status: 'running' | 'completed' | 'failed'
  vulnerabilities_found: number
  risk_score: number
  scan_duration: number
  created_at: string
}

export interface SecurityScanResults {
  vulnerabilities: SecurityVulnerability[]
  summary: {
    total_vulnerabilities: number
    critical_count: number
    high_count: number
    medium_count: number
    low_count: number
    risk_score: number
  }
  recommendations: string[]
  scan_metadata: {
    scan_id: string
    scan_type: string
    duration_ms: number
    timestamp: string
  }
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

  static async performComprehensiveScan(): Promise<SecurityScanResults> {
    const scanStartTime = Date.now()
    const scanId = crypto.randomUUID()

    try {
      const vulnerabilities: SecurityVulnerability[] = []

      // Scan user inputs
      const inputVulns = await this.scanUserInputs()
      vulnerabilities.push(...inputVulns)

      // Scan API endpoints
      const apiVulns = await this.scanApiEndpoints()
      vulnerabilities.push(...apiVulns)

      // Scan authentication
      const authVulns = await this.scanAuthentication()
      vulnerabilities.push(...authVulns)

      // Calculate summary
      const summary = {
        total_vulnerabilities: vulnerabilities.length,
        critical_count: vulnerabilities.filter(v => v.severity === 'critical').length,
        high_count: vulnerabilities.filter(v => v.severity === 'high').length,
        medium_count: vulnerabilities.filter(v => v.severity === 'medium').length,
        low_count: vulnerabilities.filter(v => v.severity === 'low').length,
        risk_score: this.calculateRiskScore(vulnerabilities)
      }

      const results: SecurityScanResults = {
        vulnerabilities,
        summary,
        recommendations: this.generateRecommendations(vulnerabilities),
        scan_metadata: {
          scan_id: scanId,
          scan_type: 'comprehensive',
          duration_ms: Date.now() - scanStartTime,
          timestamp: new Date().toISOString()
        }
      }

      // Log scan completion (mock storage since table doesn't exist)
      structuredLogger.info('Security scan completed', {
        component: 'SecurityScanService'
      })

      return results
    } catch (error) {
      structuredLogger.error('Security scan failed', {
        component: 'SecurityScanService'
      })
      throw error
    }
  }

  static async getVulnerabilities(severity?: 'low' | 'medium' | 'high' | 'critical'): Promise<SecurityVulnerability[]> {
    try {
      // Mock vulnerabilities since table doesn't exist
      const mockVulnerabilities: SecurityVulnerability[] = [
        {
          id: '1',
          type: 'sql_injection',
          severity: 'high',
          description: 'Potential SQL injection vulnerability detected',
          location: '/api/users',
          remediation: 'Use parameterized queries',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          type: 'xss',
          severity: 'medium',
          description: 'Cross-site scripting vulnerability',
          location: '/api/comments',
          remediation: 'Implement input sanitization',
          created_at: new Date().toISOString()
        }
      ]

      if (severity) {
        return mockVulnerabilities.filter(v => v.severity === severity)
      }

      return mockVulnerabilities
    } catch (error) {
      structuredLogger.error('Failed to fetch vulnerabilities', {
        component: 'SecurityScanService'
      })
      return []
    }
  }

  static async getScanHistory(): Promise<SecurityScan[]> {
    try {
      // Mock scan history since table doesn't exist
      return [
        {
          id: '1',
          scan_type: 'comprehensive',
          status: 'completed',
          vulnerabilities_found: 3,
          risk_score: 75,
          scan_duration: 45000,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          scan_type: 'quick',
          status: 'completed',
          vulnerabilities_found: 1,
          risk_score: 25,
          scan_duration: 15000,
          created_at: new Date(Date.now() - 86400000).toISOString()
        }
      ]
    } catch (error) {
      structuredLogger.error('Failed to fetch scan history', {
        component: 'SecurityScanService'
      })
      return []
    }
  }

  static async updateScanStatus(scanId: string, status: 'running' | 'completed' | 'failed') {
    try {
      // Mock update since table doesn't exist
      structuredLogger.info('Mock scan status update', {
        component: 'SecurityScanService'
      })
    } catch (error) {
      structuredLogger.error('Failed to update scan status', {
        component: 'SecurityScanService'
      })
    }
  }

  private static async scanUserInputs(): Promise<SecurityVulnerability[]> {
    const vulnerabilities: SecurityVulnerability[] = []

    try {
      // Mock user input scanning since form_submissions table doesn't exist
      // In a real implementation, this would scan actual form submissions
      const mockSubmissions = [
        { id: '1', data: { comment: 'Normal user comment' } },
        { id: '2', data: { search: '<script>alert("xss")</script>' } },
        { id: '3', data: { query: "'; DROP TABLE users; --" } }
      ]

      mockSubmissions.forEach(submission => {
        const content = JSON.stringify(submission.data)
        
        // Check for XSS patterns
        for (const pattern of this.SCAN_PATTERNS.xss) {
          if (pattern.test(content)) {
            vulnerabilities.push({
              id: `xss-${submission.id}`,
              type: 'xss',
              severity: 'high',
              description: 'Potential XSS attack detected in form submission',
              location: `Form submission ${submission.id}`,
              remediation: 'Implement proper input sanitization',
              created_at: new Date().toISOString()
            })
          }
        }

        // Check for SQL injection patterns
        for (const pattern of this.SCAN_PATTERNS.sql_injection) {
          if (pattern.test(content)) {
            vulnerabilities.push({
              id: `sqli-${submission.id}`,
              type: 'sql_injection',
              severity: 'critical',
              description: 'Potential SQL injection detected in form submission',
              location: `Form submission ${submission.id}`,
              remediation: 'Use parameterized queries and input validation',
              created_at: new Date().toISOString()
            })
          }
        }
      })
    } catch (error) {
      structuredLogger.error('Error scanning user inputs', {
        component: 'SecurityScanService'
      })
    }

    return vulnerabilities
  }

  private static async scanApiEndpoints(): Promise<SecurityVulnerability[]> {
    const vulnerabilities: SecurityVulnerability[] = []

    try {
      // Mock API endpoint scanning since api_requests table doesn't exist
      const mockRequests = [
        { id: '1', ip_address: '192.168.1.1', path: '/api/users', created_at: new Date().toISOString() },
        { id: '2', ip_address: '192.168.1.1', path: '/api/../../../etc/passwd', created_at: new Date().toISOString() },
        { id: '3', ip_address: '10.0.0.1', path: '/api/data', created_at: new Date().toISOString() },
        { id: '4', ip_address: '192.168.1.1', path: '/api/login', created_at: new Date().toISOString() }
      ]

      // Group requests by IP to detect potential attacks
      const requestsByIP = mockRequests.reduce((acc, req) => {
        acc[req.ip_address] = (acc[req.ip_address] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Check for suspicious patterns
      Object.entries(requestsByIP).forEach(([ip, count]) => {
        if (count > 2) { // Simplified threshold for demo
          vulnerabilities.push({
            id: `rate-limit-${ip}`,
            type: 'brute_force',
            severity: 'medium',
            description: `High request volume detected from IP: ${ip}`,
            location: `API endpoints`,
            remediation: 'Implement rate limiting and IP blocking',
            created_at: new Date().toISOString()
          })
        }
      })

      // Check for suspicious paths
      mockRequests.forEach(req => {
        if (req.path.includes('../') || req.path.includes('..\\')) {
          vulnerabilities.push({
            id: `path-traversal-${req.id}`,
            type: 'path_traversal',
            severity: 'high',
            description: 'Potential path traversal attack detected',
            location: req.path,
            remediation: 'Validate and sanitize file paths',
            created_at: new Date().toISOString()
          })
        }
      })
    } catch (error) {
      structuredLogger.error('Error scanning API endpoints', {
        component: 'SecurityScanService'
      })
    }

    return vulnerabilities
  }

  private static async scanAuthentication(): Promise<SecurityVulnerability[]> {
    const vulnerabilities: SecurityVulnerability[] = []

    try {
      // Mock authentication scanning since auth_logs table doesn't exist
      const mockAttempts = [
        { id: '1', user_email: 'test@example.com', ip_address: '192.168.1.1', created_at: new Date().toISOString() },
        { id: '2', user_email: 'test@example.com', ip_address: '192.168.1.1', created_at: new Date().toISOString() },
        { id: '3', user_email: 'admin@example.com', ip_address: '10.0.0.1', created_at: new Date().toISOString() },
        { id: '4', user_email: 'test@example.com', ip_address: '172.16.0.1', created_at: new Date().toISOString() }
      ]

      // Group failed attempts by identifier (email/username)
      const failedAttempts = mockAttempts.reduce((acc, attempt) => {
        const identifier = attempt.user_email
        acc[identifier] = (acc[identifier] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Check for brute force patterns
      Object.entries(failedAttempts).forEach(([identifier, count]) => {
        if (count > 2) { // Simplified threshold for demo
          vulnerabilities.push({
            id: `brute-force-${identifier}`,
            type: 'brute_force',
            severity: 'high',
            description: `Multiple failed login attempts detected for: ${identifier}`,
            location: 'Authentication system',
            remediation: 'Implement account lockout and CAPTCHA',
            created_at: new Date().toISOString()
          })
        }
      })

      // Check for unusual login patterns (simplified)
      const uniqueIPs = new Set(mockAttempts.map(a => a.ip_address))
      if (uniqueIPs.size > 2) {
        vulnerabilities.push({
          id: 'distributed-attack',
          type: 'distributed_attack',
          severity: 'medium',
          description: 'Multiple IP addresses detected in login attempts',
          location: 'Authentication system',
          remediation: 'Monitor for distributed attacks',
          created_at: new Date().toISOString()
        })
      }
    } catch (error) {
      structuredLogger.error('Error scanning authentication', {
        component: 'SecurityScanService'
      })
    }

    return vulnerabilities
  }

  private static calculateRiskScore(vulnerabilities: SecurityVulnerability[]): number {
    const weights = { critical: 10, high: 7, medium: 4, low: 1 }
    const totalScore = vulnerabilities.reduce((score, vuln) => {
      return score + weights[vuln.severity]
    }, 0)
    
    // Normalize to 0-100 scale
    return Math.min(100, totalScore * 2)
  }

  private static generateRecommendations(vulnerabilities: SecurityVulnerability[]): string[] {
    const recommendations: string[] = []
    
    if (vulnerabilities.some(v => v.type === 'sql_injection')) {
      recommendations.push('Implement parameterized queries to prevent SQL injection')
    }
    
    if (vulnerabilities.some(v => v.type === 'xss')) {
      recommendations.push('Enable input validation and output encoding to prevent XSS')
    }
    
    if (vulnerabilities.some(v => v.type === 'brute_force')) {
      recommendations.push('Implement rate limiting and account lockout mechanisms')
    }
    
    if (vulnerabilities.some(v => v.type === 'path_traversal')) {
      recommendations.push('Validate and sanitize all file path inputs')
    }
    
    recommendations.push('Regular security scans should be performed')
    recommendations.push('Keep all dependencies and frameworks up to date')
    
    return recommendations
  }
}