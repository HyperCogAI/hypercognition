import { createHash, randomBytes } from 'crypto';
import DOMPurify from 'dompurify';

// Enhanced security utilities with improved validation and protection

export interface SecurityValidationResult {
  valid: boolean;
  sanitized: string;
  errors: string[];
  originalLength: number;
  sanitizedLength: number;
}

export interface EnhancedSecurityConfig {
  maxLength: number;
  allowHtml: boolean;
  strictMode: boolean;
  enableXssProtection: boolean;
  enableSqlProtection: boolean;
}

export class EnhancedSecurityValidator {
  private static readonly DEFAULT_CONFIG: EnhancedSecurityConfig = {
    maxLength: 1000,
    allowHtml: false,
    strictMode: true,
    enableXssProtection: true,
    enableSqlProtection: true
  };

  static validateAndSanitize(
    input: string, 
    config: Partial<EnhancedSecurityConfig> = {}
  ): SecurityValidationResult {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
    let sanitized = input;
    const errors: string[] = [];
    let isValid = true;

    // Check for null or empty
    if (!input || input.trim() === '') {
      return {
        valid: false,
        sanitized: '',
        errors: ['Input cannot be empty'],
        originalLength: 0,
        sanitizedLength: 0
      };
    }

    // Length validation
    if (input.length > finalConfig.maxLength) {
      isValid = false;
      errors.push(`Input exceeds maximum length of ${finalConfig.maxLength} characters`);
    }

    // XSS Protection
    if (finalConfig.enableXssProtection) {
      if (finalConfig.allowHtml) {
        // Use DOMPurify for HTML sanitization
        sanitized = DOMPurify.sanitize(sanitized, {
          ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li'],
          ALLOWED_ATTR: []
        });
      } else {
        // Remove all HTML tags and dangerous patterns
        sanitized = sanitized
          .replace(/<script[^>]*>.*?<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/data:/gi, '')
          .replace(/vbscript:/gi, '')
          .replace(/on\w+\s*=/gi, '');

        if (finalConfig.strictMode) {
          sanitized = sanitized.replace(/<[^>]*>/g, '');
        }
      }
    }

    // SQL Injection Protection
    if (finalConfig.enableSqlProtection) {
      const sqlPatterns = [
        /(\bunion\b|\bselect\b|\binsert\b|\bupdate\b|\bdelete\b|\bdrop\b|\bcreate\b|\balter\b|\bexec\b|\bexecute\b)\s+/i
      ];
      
      for (const pattern of sqlPatterns) {
        if (pattern.test(sanitized)) {
          isValid = false;
          errors.push('Input contains potentially dangerous SQL patterns');
          break;
        }
      }
    }

    // File system traversal protection
    if (/(\.\.|\/etc\/|\/proc\/|\/dev\/|\/sys\/)/i.test(sanitized)) {
      isValid = false;
      errors.push('Input contains potentially dangerous file system patterns');
    }

    return {
      valid: isValid,
      sanitized,
      errors,
      originalLength: input.length,
      sanitizedLength: sanitized.length
    };
  }

  static generateSecureToken(length: number = 32): string {
    return randomBytes(length).toString('hex');
  }

  static hashData(data: string, salt?: string): string {
    const actualSalt = salt || this.generateSecureToken(16);
    return createHash('sha256').update(data + actualSalt).digest('hex');
  }

  static validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 14) {
      errors.push('Password must be at least 14 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    // Check for common patterns
    const commonPatterns = ['password', '123456', 'qwerty', 'admin', 'letmein'];
    if (commonPatterns.some(pattern => password.toLowerCase().includes(pattern))) {
      errors.push('Password contains common patterns and is not secure');
    }

    // Check for repeated characters
    if (/(.)\1{2,}/.test(password)) {
      errors.push('Password should not contain more than 2 repeated characters');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 255;
  }

  static validateWalletAddress(address: string): boolean {
    // Ethereum address validation
    const ethRegex = /^0x[a-fA-F0-9]{40}$/;
    // Solana address validation (base58, 32-44 characters)
    const solRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    
    return ethRegex.test(address) || solRegex.test(address);
  }
}

// Content Security Policy helper
export const generateCSPHeader = (): string => {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https: wss: ws:",
    "frame-src 'self' https:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'"
  ].join('; ');
};

// Security headers
export const getSecurityHeaders = (): Record<string, string> => {
  return {
    'Content-Security-Policy': generateCSPHeader(),
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
  };
};