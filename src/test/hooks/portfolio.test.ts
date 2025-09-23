import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { usePortfolioData, usePortfolioTransactions, usePortfolioStats } from '@/hooks/usePortfolioData'
import { useTradingOperations, useOrderValidation } from '@/hooks/useTradingOperations'

// Mock Supabase
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        order: vi.fn(() => ({
          range: vi.fn(() => ({
            then: vi.fn()
          })),
          limit: vi.fn(() => ({
            then: vi.fn()
          })),
          then: vi.fn()
        })),
        then: vi.fn()
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            then: vi.fn()
          }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => ({
                then: vi.fn()
              }))
            }))
          }))
        }))
      }))
    }))
  }))
}

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase
}))

vi.mock('@/lib/errorHandling', () => ({
  withErrorHandling: vi.fn((fn) => fn()),
  createError: {
    database: vi.fn((msg) => new Error(msg)),
    auth: vi.fn((msg) => new Error(msg)),
    validation: vi.fn((msg) => new Error(msg)),
    trading: vi.fn((msg) => new Error(msg))
  },
  useErrorHandler: () => ({
    captureError: vi.fn()
  })
}))

vi.mock('@/lib/cache', () => ({
  cache: {
    get: vi.fn(),
    set: vi.fn(),
    invalidateByTags: vi.fn()
  },
  CACHE_KEYS: {
    USER_HOLDINGS: (userId: string) => `holdings_${userId}`,
    USER_TRANSACTIONS: (userId: string, page: number) => `transactions_${userId}_${page}`,
    USER_ORDERS: (userId: string, status?: string) => `orders_${userId}_${status}`
  },
  CACHE_TTL: {
    USER_PORTFOLIO: 60000,
    USER_DATA: 60000
  },
  CACHE_TAGS: {
    PORTFOLIO: 'portfolio',
    USERS: 'users',
    ORDERS: 'orders'
  }
}))

describe('Portfolio Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('usePortfolioData', () => {
    it('fetches holdings successfully', async () => {
      const mockHoldings = [
        {
          id: '1',
          user_id: 'user1',
          agent_id: 'agent1',
          total_amount: 100,
          average_cost: 10,
          total_invested: 1000,
          unrealized_pnl: 50,
          last_updated: '2023-01-01',
          agent: { id: 'agent1', name: 'Test Agent', price: 12 }
        }
      ]

      mockSupabase.from().select().eq.mockResolvedValue({
        data: mockHoldings,
        error: null
      })

      const { result } = renderHook(() => usePortfolioData('user1'))

      act(() => {
        result.current.fetchHoldings()
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.holdings).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: '1',
            total_amount: 100
          })
        ])
      )
    })

    it('handles empty user id', async () => {
      const { result } = renderHook(() => usePortfolioData())

      const holdings = await result.current.fetchHoldings()
      expect(holdings).toEqual([])
    })
  })

  describe('usePortfolioStats', () => {
    it('calculates portfolio statistics correctly', () => {
      const holdings = [
        {
          id: '1',
          user_id: 'user1',
          agent_id: 'agent1',
          total_amount: 100,
          average_cost: 10,
          total_invested: 1000,
          unrealized_pnl: 200,
          last_updated: '2023-01-01',
          agent: { id: 'agent1', price: 12 }
        },
        {
          id: '2',
          user_id: 'user1',
          agent_id: 'agent2',
          total_amount: 50,
          average_cost: 20,
          total_invested: 1000,
          unrealized_pnl: -100,
          last_updated: '2023-01-01',
          agent: { id: 'agent2', price: 18 }
        }
      ]

      const { result } = renderHook(() => usePortfolioStats(holdings))

      expect(result.current.totalValue).toBe(2100) // (100 * 12) + (50 * 18)
      expect(result.current.holdingsCount).toBe(2)
      expect(result.current.totalPnL).toBe(100) // 200 + (-100)
      expect(result.current.totalInvested).toBe(2000) // 1000 + 1000
      expect(result.current.pnlPercentage).toBe(5) // (100 / 2000) * 100
      expect(result.current.bestPerformer?.id).toBe('1')
      expect(result.current.worstPerformer?.id).toBe('2')
    })

    it('handles empty holdings array', () => {
      const { result } = renderHook(() => usePortfolioStats([]))

      expect(result.current.totalValue).toBe(0)
      expect(result.current.holdingsCount).toBe(0)
      expect(result.current.totalPnL).toBe(0)
      expect(result.current.totalInvested).toBe(0)
      expect(result.current.pnlPercentage).toBe(0)
      expect(result.current.bestPerformer).toBeNull()
      expect(result.current.worstPerformer).toBeNull()
    })
  })
})

describe('Trading Operations', () => {
  describe('useOrderValidation', () => {
    it('validates order data correctly', () => {
      const { result } = renderHook(() => useOrderValidation())

      // Valid order
      const validOrder = {
        agent_id: 'agent1',
        type: 'market' as const,
        side: 'buy' as const,
        amount: 100
      }

      const validResult = result.current.validateOrderData(validOrder)
      expect(validResult.isValid).toBe(true)
      expect(validResult.errors).toEqual([])

      // Invalid order - zero amount
      const invalidOrder = {
        agent_id: 'agent1',
        type: 'market' as const,
        side: 'buy' as const,
        amount: 0
      }

      const invalidResult = result.current.validateOrderData(invalidOrder)
      expect(invalidResult.isValid).toBe(false)
      expect(invalidResult.errors).toContain('Amount must be greater than 0')

      // Limit order without price
      const limitOrderWithoutPrice = {
        agent_id: 'agent1',
        type: 'limit' as const,
        side: 'buy' as const,
        amount: 100
      }

      const limitResult = result.current.validateOrderData(limitOrderWithoutPrice)
      expect(limitResult.isValid).toBe(false)
      expect(limitResult.errors).toContain('Limit orders require a price')
    })

    it('validates stop loss orders', () => {
      const { result } = renderHook(() => useOrderValidation())

      const stopLossOrder = {
        agent_id: 'agent1',
        type: 'stop_loss' as const,
        side: 'sell' as const,
        amount: 100
      }

      const result1 = result.current.validateOrderData(stopLossOrder)
      expect(result1.isValid).toBe(false)
      expect(result1.errors).toContain('Stop loss orders require a trigger price')

      const validStopLossOrder = {
        ...stopLossOrder,
        trigger_price: 95
      }

      const result2 = result.current.validateOrderData(validStopLossOrder)
      expect(result2.isValid).toBe(true)
    })

    it('validates trailing stop percentage', () => {
      const { result } = renderHook(() => useOrderValidation())

      const orderWithInvalidTrailingStop = {
        agent_id: 'agent1',
        type: 'market' as const,
        side: 'sell' as const,
        amount: 100,
        trailing_stop_percent: 150 // Invalid - over 100%
      }

      const result1 = result.current.validateOrderData(orderWithInvalidTrailingStop)
      expect(result1.isValid).toBe(false)
      expect(result1.errors).toContain('Trailing stop percentage must be between 0 and 100')

      const validOrder = {
        ...orderWithInvalidTrailingStop,
        trailing_stop_percent: 10 // Valid
      }

      const result2 = result.current.validateOrderData(validOrder)
      expect(result2.isValid).toBe(true)
    })
  })
})