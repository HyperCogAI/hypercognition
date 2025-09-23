import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useErrorHandler, AppError, createError, handleError } from '@/lib/errorHandling'

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn()
}))

// Mock the logger
vi.mock('@/lib/environment', () => ({
  logger: {
    error: vi.fn()
  }
}))

describe('Error Handling', () => {
  describe('AppError', () => {
    it('creates an error with correct properties', () => {
      const error = new AppError(
        'Test error',
        'TEST_ERROR',
        { component: 'TestComponent' },
        true,
        'high'
      )

      expect(error.message).toBe('Test error')
      expect(error.code).toBe('TEST_ERROR')
      expect(error.context.component).toBe('TestComponent')
      expect(error.isUserFacing).toBe(true)
      expect(error.severity).toBe('high')
    })

    it('uses default values when not provided', () => {
      const error = new AppError('Test error')

      expect(error.code).toBe('UNKNOWN_ERROR')
      expect(error.context).toEqual({})
      expect(error.isUserFacing).toBe(true)
      expect(error.severity).toBe('medium')
    })
  })

  describe('createError helpers', () => {
    it('creates network error correctly', () => {
      const error = createError.network('Connection failed')
      
      expect(error.code).toBe('NETWORK_ERROR')
      expect(error.severity).toBe('medium')
      expect(error.isUserFacing).toBe(true)
    })

    it('creates validation error correctly', () => {
      const error = createError.validation('Invalid input')
      
      expect(error.code).toBe('VALIDATION_ERROR')
      expect(error.severity).toBe('low')
    })

    it('creates auth error correctly', () => {
      const error = createError.auth('Authentication required')
      
      expect(error.code).toBe('AUTH_ERROR')
      expect(error.severity).toBe('high')
    })

    it('creates trading error correctly', () => {
      const error = createError.trading('Order failed')
      
      expect(error.code).toBe('TRADING_ERROR')
      expect(error.severity).toBe('high')
    })
  })

  describe('useErrorHandler hook', () => {
    it('captures and manages errors', () => {
      const { result } = renderHook(() => useErrorHandler())

      expect(result.current.hasErrors).toBe(false)
      expect(result.current.errors).toEqual([])

      act(() => {
        result.current.captureError(new Error('Test error'))
      })

      expect(result.current.hasErrors).toBe(true)
      expect(result.current.errors).toHaveLength(1)
      expect(result.current.lastError?.message).toBe('Test error')
    })

    it('clears errors', () => {
      const { result } = renderHook(() => useErrorHandler())

      act(() => {
        result.current.captureError(new Error('Test error'))
      })

      expect(result.current.hasErrors).toBe(true)

      act(() => {
        result.current.clearErrors()
      })

      expect(result.current.hasErrors).toBe(false)
      expect(result.current.errors).toEqual([])
    })

    it('limits error history to 10', () => {
      const { result } = renderHook(() => useErrorHandler())

      act(() => {
        for (let i = 0; i < 15; i++) {
          result.current.captureError(new Error(`Error ${i}`))
        }
      })

      expect(result.current.errors).toHaveLength(10)
      expect(result.current.lastError?.message).toBe('Error 14')
    })
  })

  describe('handleError function', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('handles AppError instances', () => {
      const appError = new AppError('Test error', 'TEST_ERROR')
      const result = handleError(appError)

      expect(result).toBe(appError)
    })

    it('converts regular Error to AppError', () => {
      const error = new Error('Regular error')
      const result = handleError(error)

      expect(result).toBeInstanceOf(AppError)
      expect(result.message).toBe('Regular error')
      expect(result.code).toBe('UNKNOWN_ERROR')
    })

    it('handles unknown error types', () => {
      const result = handleError('string error')

      expect(result).toBeInstanceOf(AppError)
      expect(result.message).toBe('An unknown error occurred')
      expect(result.code).toBe('UNKNOWN_ERROR')
    })
  })
})