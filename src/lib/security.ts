// Security utilities and helpers
import { useAuth } from '@/contexts/AuthContext'
import { useState, useEffect } from 'react'

// Content Security Policy
export const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://cdn.jsdelivr.net'],
  'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  'img-src': ["'self'", 'data:', 'https:', 'blob:'],
  'font-src': ["'self'", 'https://fonts.gstatic.com'],
  'connect-src': ["'self'", 'https://*.supabase.co', 'wss://*.supabase.co', 'https://api.coingecko.com'],
  'frame-src': ["'none'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': []
}

// XSS Protection
export const sanitizeHtml = (html: string): string => {
  const div = document.createElement('div')
  div.textContent = html
  return div.innerHTML
}

export const escapeHtml = (text: string): string => {
  const div = document.createElement('div')
  div.appendChild(document.createTextNode(text))
  return div.innerHTML
}

// Secure random string generation
export const generateSecureToken = (length: number = 32): string => {
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

// Permission system
export interface Permission {
  resource: string
  action: string
  condition?: (context: any) => boolean
}

export class PermissionManager {
  private permissions: Permission[] = []
  
  addPermission(permission: Permission) {
    this.permissions.push(permission)
  }
  
  hasPermission(resource: string, action: string, context?: any): boolean {
    return this.permissions.some(permission => 
      permission.resource === resource && 
      permission.action === action &&
      (!permission.condition || permission.condition(context))
    )
  }
  
  checkPermission(resource: string, action: string, context?: any) {
    if (!this.hasPermission(resource, action, context)) {
      throw new Error(`Permission denied: ${action} on ${resource}`)
    }
  }
}

// Default permissions
export const defaultPermissions = [
  { resource: 'agent', action: 'view' },
  { resource: 'agent', action: 'rate', condition: (ctx: any) => !!ctx.user },
  { resource: 'agent', action: 'comment', condition: (ctx: any) => !!ctx.user },
  { resource: 'trading', action: 'view' },
  { resource: 'trading', action: 'execute', condition: (ctx: any) => !!ctx.user && ctx.isConnected },
  { resource: 'portfolio', action: 'view', condition: (ctx: any) => !!ctx.user },
  { resource: 'portfolio', action: 'manage', condition: (ctx: any) => !!ctx.user && ctx.isConnected }
]

// Security hook
export const useSecurity = () => {
  const { user, isConnected } = useAuth()
  const [permissionManager] = useState(() => {
    const manager = new PermissionManager()
    defaultPermissions.forEach(permission => manager.addPermission(permission))
    return manager
  })
  
  const hasPermission = (resource: string, action: string) => {
    return permissionManager.hasPermission(resource, action, { user, isConnected })
  }
  
  const requirePermission = (resource: string, action: string) => {
    if (!hasPermission(resource, action)) {
      throw new Error(`Permission denied: ${action} on ${resource}`)
    }
  }
  
  return {
    hasPermission,
    requirePermission,
    isAuthenticated: !!user,
    isWalletConnected: isConnected
  }
}

// Audit logging
export interface AuditEvent {
  userId?: string
  action: string
  resource: string
  details?: any
  timestamp: Date
  ipAddress?: string
  userAgent?: string
}

class AuditLogger {
  private events: AuditEvent[] = []
  private maxEvents = 1000
  
  log(event: Omit<AuditEvent, 'timestamp'>) {
    const auditEvent: AuditEvent = {
      ...event,
      timestamp: new Date()
    }
    
    this.events.unshift(auditEvent)
    
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(0, this.maxEvents)
    }
    
    // In production, send to backend
    console.log('Audit:', auditEvent)
  }
  
  getEvents(userId?: string): AuditEvent[] {
    if (userId) {
      return this.events.filter(event => event.userId === userId)
    }
    return this.events
  }
}

export const auditLogger = new AuditLogger()

// Enhanced Security Middleware with Rate Limiting and Validation
interface SecurityMiddlewareOptions {
  endpoint: string;
  requireAuth?: boolean;
  maxRequestSize?: number;
  validateContent?: boolean;
}

export const createSecurityMiddleware = (options: SecurityMiddlewareOptions) => {
  return {
    beforeRequest: async (request: any) => {
      // Check authentication if required
      if (options.requireAuth) {
        const token = request.headers?.authorization;
        if (!token) {
          throw new Error('Authentication required');
        }
      }

      // Check request size
      if (options.maxRequestSize && request.body) {
        const size = JSON.stringify(request.body).length;
        if (size > options.maxRequestSize) {
          throw new Error(`Request too large: ${size} bytes`);
        }
      }

      // Validate content if required
      if (options.validateContent && request.body) {
        const contentString = typeof request.body === 'string' 
          ? request.body 
          : JSON.stringify(request.body);
        
        // Check for suspicious patterns
        const suspiciousPatterns = [
          /<script|javascript:|data:|vbscript:/i,
          /union\s+select|insert\s+into|drop\s+table/i,
          /eval\s*\(|setTimeout\s*\(|setInterval\s*\(/i
        ];

        for (const pattern of suspiciousPatterns) {
          if (pattern.test(contentString)) {
            auditLogger.log({
              userId: 'unknown',
              action: 'suspicious_content_blocked',
              resource: options.endpoint,
              details: { pattern: pattern.source, contentLength: contentString.length }
            });
            throw new Error('Content validation failed');
          }
        }
      }

      // Add security headers
      request.headers = {
        ...request.headers,
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block'
      };

      auditLogger.log({
        userId: 'system',
        action: 'request_processed',
        resource: options.endpoint,
        details: { 
          method: request.method,
          hasAuth: !!request.headers?.authorization,
          contentLength: request.body ? JSON.stringify(request.body).length : 0
        }
      });

      return request;
    },

    afterResponse: (response: any) => {
      auditLogger.log({
        userId: 'system',
        action: 'response_sent',
        resource: options.endpoint,
        details: { 
          status: response.status,
          hasData: !!response.data
        }
      });
      return response;
    },

    onError: (error: any) => {
      auditLogger.log({
        userId: 'system',
        action: 'request_error',
        resource: options.endpoint,
        details: { 
          error: error.message,
          stack: error.stack?.substring(0, 500)
        }
      });
      throw error;
    }
  };
};

// Pre-configured middleware for different endpoint types
export const tradingMiddleware = createSecurityMiddleware({
  endpoint: 'trading',
  requireAuth: true,
  maxRequestSize: 10000,
  validateContent: true
});

export const socialMiddleware = createSecurityMiddleware({
  endpoint: 'social',
  requireAuth: true,
  maxRequestSize: 50000,
  validateContent: true
});

export const adminMiddleware = createSecurityMiddleware({
  endpoint: 'admin',
  requireAuth: true,
  maxRequestSize: 100000,
  validateContent: true
});

export const publicMiddleware = createSecurityMiddleware({
  endpoint: 'public',
  requireAuth: false,
  maxRequestSize: 5000,
  validateContent: true
});

// Legacy security middleware for backward compatibility
export const securityMiddleware = {
  beforeRequest: (config: any) => {
    config.headers = {
      ...config.headers,
      'X-Requested-With': 'XMLHttpRequest',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block'
    }
    return config
  },
  
  afterResponse: (response: any) => {
    auditLogger.log({
      action: 'api_request',
      resource: response.config?.url || 'unknown',
      details: { status: response.status }
    })
    return response
  },
  
  onError: (error: any) => {
    auditLogger.log({
      action: 'api_error',
      resource: error.config?.url || 'unknown',
      details: { error: error.message }
    })
    throw error
  }
}