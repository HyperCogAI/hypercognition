import { describe, it, expect } from 'vitest'
import { 
  validateEmail, 
  validateWalletAddress, 
  validateTradeAmount, 
  sanitizeInput,
  tradeOrderSchema 
} from '@/lib/validation'

describe('Validation Functions', () => {
  describe('validateEmail', () => {
    it('validates correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true)
    })

    it('rejects invalid email addresses', () => {
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
      expect(validateEmail('@domain.com')).toBe(false)
      expect(validateEmail('')).toBe(false)
    })
  })

  describe('validateWalletAddress', () => {
    it('validates Ethereum addresses', () => {
      expect(validateWalletAddress('0x742d35cc6435c0532925a3b8c17890c5a4d63c5e')).toBe(true)
      expect(validateWalletAddress('0x742D35CC6435C0532925A3B8C17890C5A4D63C5E')).toBe(true)
    })

    it('rejects invalid wallet addresses', () => {
      expect(validateWalletAddress('0x123')).toBe(false)
      expect(validateWalletAddress('742d35cc6435c0532925a3b8c17890c5a4d63c5e')).toBe(false)
      expect(validateWalletAddress('')).toBe(false)
    })
  })

  describe('validateTradeAmount', () => {
    it('validates positive trade amounts', () => {
      expect(validateTradeAmount(100, 50)).toBe(true)
      expect(validateTradeAmount(1000, 999)).toBe(true)
    })

    it('rejects invalid trade amounts', () => {
      expect(validateTradeAmount(100, 150)).toBe(false) // Exceeds balance
      expect(validateTradeAmount(100, 0)).toBe(false) // Zero amount
      expect(validateTradeAmount(100, -50)).toBe(false) // Negative amount
    })
  })

  describe('sanitizeInput', () => {
    it('removes XSS attacks', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe('')
      expect(sanitizeInput('Hello <b>world</b>')).toBe('Hello world')
      expect(sanitizeInput('Safe text')).toBe('Safe text')
    })

    it('handles empty input', () => {
      expect(sanitizeInput('')).toBe('')
      expect(sanitizeInput(null as any)).toBe('')
      expect(sanitizeInput(undefined as any)).toBe('')
    })
  })

  describe('tradeOrderSchema', () => {
    it('validates correct trade orders', () => {
      const validOrder = {
        agentId: 'agent-123',
        type: 'buy',
        amount: 100,
        price: 50,
        orderType: 'market'
      }

      expect(() => tradeOrderSchema.validate(validOrder)).not.toThrow()
    })

    it('rejects invalid trade orders', () => {
      const invalidOrder = {
        agentId: '',
        type: 'invalid',
        amount: -100,
        price: 0
      }

      expect(() => tradeOrderSchema.validate(invalidOrder)).toThrow()
    })
  })
})