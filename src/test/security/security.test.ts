import { describe, it, expect } from 'vitest'
import { sanitizeInput, validateWalletAddress, validateEmail } from '@/lib/validation'
import { RateLimiter } from '@/lib/rateLimiter'

describe('Security Tests', () => {
  describe('Input Sanitization', () => {
    it('removes dangerous scripts', () => {
      const maliciousInput = '<script>alert("XSS")</script>Hello'
      const sanitized = sanitizeInput(maliciousInput)
      expect(sanitized).toBe('Hello')
      expect(sanitized).not.toContain('<script>')
    })

    it('removes dangerous HTML attributes', () => {
      const maliciousInput = '<div onclick="maliciousFunction()">Content</div>'
      const sanitized = sanitizeInput(maliciousInput)
      expect(sanitized).toBe('Content')
      expect(sanitized).not.toContain('onclick')
    })

    it('preserves safe content', () => {
      const safeInput = 'This is safe text with numbers 123'
      const sanitized = sanitizeInput(safeInput)
      expect(sanitized).toBe(safeInput)
    })
  })

  describe('Address Validation', () => {
    it('accepts valid Ethereum addresses', () => {
      const validAddress = '0x742d35cc6435c0532925a3b8c17890c5a4d63c5e'
      expect(validateWalletAddress(validAddress)).toBe(true)
    })

    it('rejects invalid addresses', () => {
      expect(validateWalletAddress('invalid')).toBe(false)
      expect(validateWalletAddress('0x123')).toBe(false)
      expect(validateWalletAddress('')).toBe(false)
    })
  })

  describe('Rate Limiting', () => {
    it('enforces rate limits correctly', () => {
      const rateLimiter = new RateLimiter(2, 1000) // 2 requests per second
      
      expect(rateLimiter.checkLimit('user1')).toBe(true)
      expect(rateLimiter.checkLimit('user1')).toBe(true)
      expect(rateLimiter.checkLimit('user1')).toBe(false) // Should be blocked
    })

    it('resets limits after time window', async () => {
      const rateLimiter = new RateLimiter(1, 100) // 1 request per 100ms
      
      expect(rateLimiter.checkLimit('user1')).toBe(true)
      expect(rateLimiter.checkLimit('user1')).toBe(false)
      
      // Wait for reset
      await new Promise(resolve => setTimeout(resolve, 150))
      
      expect(rateLimiter.checkLimit('user1')).toBe(true)
    })
  })

  describe('Email Validation', () => {
    it('validates correct emails', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true)
    })

    it('rejects invalid emails', () => {
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
      expect(validateEmail('@domain.com')).toBe(false)
    })
  })
})