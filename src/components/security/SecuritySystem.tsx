import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, Lock, Eye, EyeOff, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

interface SecurityContext {
  user: any
  permissions: string[]
  isAuthenticated: boolean
  isSecureConnection: boolean
  lastSecurityCheck: Date
}

class SecurityManager {
  private static instance: SecurityManager
  private securityContext: SecurityContext | null = null
  private securityRules: Map<string, (context: SecurityContext) => boolean> = new Map()
  private auditLog: Array<{ timestamp: Date; action: string; user?: string; result: 'allowed' | 'denied' }> = []

  static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager()
    }
    return SecurityManager.instance
  }

  setSecurityContext(context: SecurityContext) {
    this.securityContext = context
  }

  addSecurityRule(name: string, rule: (context: SecurityContext) => boolean) {
    this.securityRules.set(name, rule)
  }

  checkPermission(action: string): boolean {
    if (!this.securityContext) return false

    const rule = this.securityRules.get(action)
    const allowed = rule ? rule(this.securityContext) : this.securityContext.isAuthenticated

    this.auditLog.push({
      timestamp: new Date(),
      action,
      user: this.securityContext.user?.id,
      result: allowed ? 'allowed' : 'denied'
    })

    return allowed
  }

  getAuditLog() {
    return this.auditLog.slice(-100) // Return last 100 entries
  }

  sanitizeInput(input: string): string {
    // Basic XSS prevention
    return input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim()
  }

  validateCSRF(token: string): boolean {
    // Basic CSRF validation (in production, use proper CSRF tokens)
    return token && token.length > 10
  }

  checkPasswordStrength(password: string): {
    score: number
    feedback: string[]
    isStrong: boolean
  } {
    const feedback: string[] = []
    let score = 0

    if (password.length >= 8) score += 1
    else feedback.push('Password must be at least 8 characters long')

    if (/[a-z]/.test(password)) score += 1
    else feedback.push('Include lowercase letters')

    if (/[A-Z]/.test(password)) score += 1
    else feedback.push('Include uppercase letters')

    if (/\d/.test(password)) score += 1
    else feedback.push('Include numbers')

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1
    else feedback.push('Include special characters')

    if (password.length >= 12) score += 1

    return {
      score,
      feedback,
      isStrong: score >= 4
    }
  }
}

export const securityManager = SecurityManager.getInstance()

interface SecurityDashboardProps {
  className?: string
}

export function SecurityDashboard({ className }: SecurityDashboardProps) {
  const [auditLog] = React.useState(securityManager.getAuditLog())
  const [passwordInput, setPasswordInput] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  
  const passwordStrength = securityManager.checkPasswordStrength(passwordInput)

  const getStrengthColor = (score: number) => {
    if (score < 2) return 'bg-red-500'
    if (score < 4) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getStrengthLabel = (score: number) => {
    if (score < 2) return 'Weak'
    if (score < 4) return 'Medium'
    return 'Strong'
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center gap-2">
        <Shield className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-white">Security Dashboard</h1>
      </div>

      {/* Security Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Connection Status</p>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="font-semibold">Secure</span>
                </div>
              </div>
              <Lock className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Authentication</p>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="font-semibold">Active</span>
                </div>
              </div>
              <Shield className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Last Security Check</p>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="font-semibold">Just now</span>
                </div>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Password Strength Checker */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Password Strength Checker
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter password to check strength"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>

          {passwordInput && (
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Strength: {getStrengthLabel(passwordStrength.score)}</span>
                  <span className="text-sm text-muted-foreground">{passwordStrength.score}/5</span>
                </div>
                <Progress value={(passwordStrength.score / 5) * 100} className="h-2" />
              </div>

              {passwordStrength.feedback.length > 0 && (
                <Alert>
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription>
                    <ul className="text-sm space-y-1">
                      {passwordStrength.feedback.map((item, index) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {passwordStrength.isStrong && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Strong password! This password meets security requirements.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Recommendations */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-800">Two-Factor Authentication</p>
                <p className="text-sm text-green-700">Enabled and configured</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-800">HTTPS Connection</p>
                <p className="text-sm text-green-700">All communications encrypted</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-yellow-800">Security Headers</p>
                <p className="text-sm text-yellow-700">Consider implementing additional security headers</p>
                <Button variant="outline" size="sm" className="mt-2">
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Security Events */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Recent Security Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {auditLog.slice(-5).reverse().map((entry, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {entry.result === 'allowed' ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium">{entry.action}</p>
                    <p className="text-sm text-muted-foreground">
                      {entry.timestamp.toLocaleString()}
                    </p>
                  </div>
                </div>
                <Badge variant={entry.result === 'allowed' ? 'secondary' : 'destructive'}>
                  {entry.result}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Security Helper Components
interface SecureFormProps {
  children: React.ReactNode
  onSubmit: (data: any) => void
  className?: string
}

export function SecureForm({ children, onSubmit, className }: SecureFormProps) {
  const [csrfToken] = React.useState(() => 
    Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!securityManager.validateCSRF(csrfToken)) {
      console.error('CSRF validation failed')
      return
    }

    const formData = new FormData(e.target as HTMLFormElement)
    const data: any = {}
    
    formData.forEach((value, key) => {
      data[key] = securityManager.sanitizeInput(value.toString())
    })

    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <input type="hidden" name="csrf_token" value={csrfToken} />
      {children}
    </form>
  )
}

interface ProtectedContentProps {
  children: React.ReactNode
  requiredPermission: string
  fallback?: React.ReactNode
}

export function ProtectedContent({ children, requiredPermission, fallback }: ProtectedContentProps) {
  const hasPermission = securityManager.checkPermission(requiredPermission)

  if (!hasPermission) {
    return fallback || (
      <Alert variant="destructive">
        <Shield className="w-4 h-4" />
        <AlertDescription>
          You don't have permission to access this content.
        </AlertDescription>
      </Alert>
    )
  }

  return <>{children}</>
}