import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useJupiterSwap } from '@/hooks/useJupiterSwap'
import * as jupiterApiModule from '@/lib/apis/jupiterApi'

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}))

// Mock Jupiter API
const mockJupiterApi = {
  getSwapRoute: vi.fn()
}

vi.mock('@/lib/apis/jupiterApi', () => ({
  jupiterApi: mockJupiterApi
}))

describe('useJupiterSwap', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useJupiterSwap())

    expect(result.current.isLoading).toBe(false)
    expect(result.current.routes).toEqual([])
    expect(typeof result.current.getSwapRoutes).toBe('function')
    expect(typeof result.current.executeSwap).toBe('function')
  })

  it('should fetch swap routes successfully', async () => {
    const mockRoutes = [
      {
        inputMint: 'So11111111111111111111111111111111111111112',
        outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        outAmount: '1000000',
        priceImpactPct: '0.1'
      }
    ]

    mockJupiterApi.getSwapRoute.mockResolvedValue(mockRoutes)

    const { result } = renderHook(() => useJupiterSwap())

    await act(async () => {
      const routes = await result.current.getSwapRoutes({
        inputMint: 'So11111111111111111111111111111111111111112',
        outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        amount: 1,
        slippageBps: 50
      })

      expect(routes).toEqual(mockRoutes)
    })

    expect(result.current.routes).toEqual(mockRoutes)
    expect(mockJupiterApi.getSwapRoute).toHaveBeenCalledWith(
      'So11111111111111111111111111111111111111112',
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      1000000000, // 1 * 1e9
      50
    )
  })

  it('should handle swap route errors', async () => {
    mockJupiterApi.getSwapRoute.mockRejectedValue(new Error('API Error'))

    const { result } = renderHook(() => useJupiterSwap())

    await act(async () => {
      const routes = await result.current.getSwapRoutes({
        inputMint: 'test1',
        outputMint: 'test2',
        amount: 1
      })

      expect(routes).toEqual([])
    })

    expect(result.current.routes).toEqual([])
  })

  it('should execute swap simulation', async () => {
    const { result } = renderHook(() => useJupiterSwap())

    const mockRoute = {
      outAmount: '1000000',
      priceImpactPct: '0.1'
    }

    await act(async () => {
      const swapResult = await result.current.executeSwap(mockRoute)
      expect(swapResult.success).toBe(true)
      expect(swapResult.signature).toBe('demo-signature')
    })
  })

  it('should get best route correctly', () => {
    const { result } = renderHook(() => useJupiterSwap())

    const routes = [
      { outAmount: '1000000' },
      { outAmount: '2000000' },
      { outAmount: '1500000' }
    ]

    const bestRoute = result.current.getBestRoute(routes)
    expect(bestRoute.outAmount).toBe('2000000')
  })

  it('should calculate price impact', () => {
    const { result } = renderHook(() => useJupiterSwap())

    const route = { priceImpactPct: '2.5' }
    const impact = result.current.calculatePriceImpact(route)
    expect(impact).toBe(2.5)
  })

  it('should calculate output amount', () => {
    const { result } = renderHook(() => useJupiterSwap())

    const route = { outAmount: '1000000000' } // 1 SOL in lamports
    const amount = result.current.getOutputAmount(route, 9)
    expect(amount).toBe(1)
  })

  it('should calculate minimum received with slippage', () => {
    const { result } = renderHook(() => useJupiterSwap())

    const route = { outAmount: '1000000000' } // 1 SOL in lamports
    const minReceived = result.current.getMinimumReceived(route, 50, 9) // 0.5% slippage
    expect(minReceived).toBe(0.995) // 1 - 0.005
  })
})