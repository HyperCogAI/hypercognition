import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useSecurityMiddleware } from '@/hooks/useSecurityMiddleware'
import { supabase } from '@/integrations/supabase/client'
import { renderHook, waitFor } from '@testing-library/react'

// Mock Supabase
vi.mock('@/integrations/supabase/client')
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' }
  })
}))

const mockSupabase = vi.mocked(supabase)

describe('Security Middleware Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock functions.invoke with proper vi.fn()
    const mockInvoke = vi.fn()
    mockSupabase.functions = {
      invoke: mockInvoke
    } as any
  })

  describe('Security Checks', () => {
    it('allows valid requests', async () => {
      const mockInvoke = vi.fn().mockResolvedValue({
        data: {
          allowed: true,
          reason: 'allowed',
          rateLimitStatus: { remaining: 99, resetTime: Date.now() + 900000 }
        },
        error: null
      })
      mockSupabase.functions.invoke = mockInvoke

      const { result } = renderHook(() => useSecurityMiddleware())
      
      const securityResult = await result.current.checkSecurity('trading', 'valid content')
      
      expect(securityResult.allowed).toBe(true)
      expect(mockInvoke).toHaveBeenCalledWith('security-middleware', {
        body: {
          endpoint: 'trading',
          identifier: 'test-user-id',
          userAgent: navigator.userAgent,
          contentToValidate: 'valid content'
        }
      })
    })

    it('blocks requests that exceed rate limits', async () => {
      const mockInvoke = vi.fn().mockResolvedValue({
        data: {
          allowed: false,
          reason: 'rate_limit_exceeded',
          retryAfter: 900
        },
        error: null
      })
      mockSupabase.functions.invoke = mockInvoke

      const { result } = renderHook(() => useSecurityMiddleware())
      
      const securityResult = await result.current.checkSecurity('trading')
      
      expect(securityResult.allowed).toBe(false)
      expect(securityResult.reason).toBe('rate_limit_exceeded')
      expect(securityResult.retryAfter).toBe(900)
    })

    it('blocks requests with invalid content', async () => {
      const mockInvoke = vi.fn().mockResolvedValue({
        data: {
          allowed: false,
          reason: 'invalid_content',
          securityFlags: { contentFiltered: true, suspicious: false }
        },
        error: null
      })
      mockSupabase.functions.invoke = mockInvoke

      const { result } = renderHook(() => useSecurityMiddleware())
      
      const maliciousContent = '<script>alert("xss")</script>'
      const securityResult = await result.current.checkSecurity('social', maliciousContent)
      
      expect(securityResult.allowed).toBe(false)
      expect(securityResult.reason).toBe('invalid_content')
    })
  })

  describe('With Security Check Wrapper', () => {
    it('executes operation when security check passes', async () => {
      const mockInvoke = vi.fn().mockResolvedValue({
        data: { allowed: true, reason: 'allowed' },
        error: null
      })
      mockSupabase.functions.invoke = mockInvoke

      const { result } = renderHook(() => useSecurityMiddleware())
      
      const mockOperation = vi.fn().mockResolvedValue('operation result')
      
      const operationResult = await result.current.withSecurityCheck(
        'admin',
        mockOperation,
        'safe content'
      )
      
      expect(operationResult).toBe('operation result')
      expect(mockOperation).toHaveBeenCalled()
    })

    it('throws error when security check fails', async () => {
      const mockInvoke = vi.fn().mockResolvedValue({
        data: {
          allowed: false,
          reason: 'rate_limit_exceeded',
          retryAfter: 300
        },
        error: null
      })
      mockSupabase.functions.invoke = mockInvoke

      const { result } = renderHook(() => useSecurityMiddleware())
      
      const mockOperation = vi.fn().mockResolvedValue('operation result')
      
      await expect(
        result.current.withSecurityCheck('trading', mockOperation)
      ).rejects.toThrow('Security check failed: rate_limit_exceeded')
      
      expect(mockOperation).not.toHaveBeenCalled()
    })

    it('includes retryAfter in error for rate limited requests', async () => {
      const mockInvoke = vi.fn().mockResolvedValue({
        data: {
          allowed: false,
          reason: 'rate_limit_exceeded',
          retryAfter: 600
        },
        error: null
      })
      mockSupabase.functions.invoke = mockInvoke

      const { result } = renderHook(() => useSecurityMiddleware())
      
      try {
        await result.current.withSecurityCheck('trading', async () => 'test')
      } catch (error: any) {
        expect(error.retryAfter).toBe(600)
      }
    })
  })

  describe('Error Handling', () => {
    it('handles network errors gracefully', async () => {
      const mockInvoke = vi.fn().mockRejectedValue(new Error('Network error'))
      mockSupabase.functions.invoke = mockInvoke

      const { result } = renderHook(() => useSecurityMiddleware())
      
      const securityResult = await result.current.checkSecurity('trading')
      
      expect(securityResult.allowed).toBe(false)
      expect(securityResult.reason).toBe('network_error')
    })

    it('handles Supabase function errors', async () => {
      const mockInvoke = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Function error' }
      })
      mockSupabase.functions.invoke = mockInvoke

      const { result } = renderHook(() => useSecurityMiddleware())
      
      const securityResult = await result.current.checkSecurity('admin')
      
      expect(securityResult.allowed).toBe(false)
      expect(securityResult.reason).toBe('security_check_failed')
    })
  })

  describe('Loading State', () => {
    it('manages loading state correctly', async () => {
      let resolvePromise: (value: any) => void
      const pendingPromise = new Promise(resolve => {
        resolvePromise = resolve
      })

      const mockInvoke = vi.fn().mockReturnValue(pendingPromise)
      mockSupabase.functions.invoke = mockInvoke

      const { result } = renderHook(() => useSecurityMiddleware())
      
      // Start security check
      const checkPromise = result.current.checkSecurity('trading')
      
      // Should be loading
      expect(result.current.isChecking).toBe(true)
      
      // Resolve the promise
      resolvePromise!({
        data: { allowed: true, reason: 'allowed' },
        error: null
      })
      
      await waitFor(() => {
        expect(result.current.isChecking).toBe(false)
      })
      
      await checkPromise
    })
  })
})