import { describe, it, expect, vi, beforeEach } from 'vitest'
import { jupiterApi } from '@/lib/apis/jupiterApi'

// Mock fetch
global.fetch = vi.fn()

describe('JupiterAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  describe('getAllTokens', () => {
    it('should fetch tokens successfully', async () => {
      const mockTokens = [
        {
          address: 'So11111111111111111111111111111111111111112',
          chainId: 101,
          name: 'Solana',
          symbol: 'SOL',
          decimals: 9
        }
      ]

      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTokens)
      })

      const result = await jupiterApi.getAllTokens()
      expect(result).toEqual(mockTokens)
      expect(fetch).toHaveBeenCalledWith(
        'https://api.jup.ag/tokens',
        expect.objectContaining({
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })
      )
    })

    it('should handle 401 errors gracefully', async () => {
      ;(fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401
      })

      const result = await jupiterApi.getAllTokens()
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
    })

    it('should handle rate limiting', async () => {
      ;(fetch as any)
        .mockResolvedValueOnce({
          ok: false,
          status: 429
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([])
        })

      const result = await jupiterApi.getAllTokens()
      expect(fetch).toHaveBeenCalledTimes(2)
      expect(result).toEqual([])
    })
  })

  describe('getPopularTokensWithPrices', () => {
    it('should handle non-array response gracefully', async () => {
      ;(fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401
      })

      const result = await jupiterApi.getPopularTokensWithPrices(10)
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
      expect(result[0]).toHaveProperty('symbol')
      expect(result[0]).toHaveProperty('price')
    })

    it('should slice tokens correctly when array is returned', async () => {
      const mockTokens = Array.from({ length: 100 }, (_, i) => ({
        address: `token${i}`,
        chainId: 101,
        name: `Token ${i}`,
        symbol: `TOK${i}`,
        decimals: 9
      }))

      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTokens)
      })

      const result = await jupiterApi.getPopularTokensWithPrices(5)
      expect(result.length).toBeLessThanOrEqual(5)
    })
  })

  describe('getTokenPrice', () => {
    it('should get price for specific token', async () => {
      const mockPriceResponse = {
        data: {
          'So11111111111111111111111111111111111111112': {
            id: 'So11111111111111111111111111111111111111112',
            mintSymbol: 'SOL',
            vsToken: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
            vsTokenSymbol: 'USDC',
            price: 150.50
          }
        }
      }

      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPriceResponse)
      })

      const result = await jupiterApi.getTokenPrice('So11111111111111111111111111111111111111112')
      expect(result).toEqual(mockPriceResponse.data['So11111111111111111111111111111111111111112'])
    })

    it('should return null for non-existent token', async () => {
      const mockPriceResponse = { data: {} }

      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPriceResponse)
      })

      const result = await jupiterApi.getTokenPrice('nonexistent')
      expect(result).toBeNull()
    })
  })

  describe('mapToSolanaToken', () => {
    it('should map Jupiter token to Solana token format', () => {
      const jupiterToken = {
        address: 'So11111111111111111111111111111111111111112',
        chainId: 101,
        name: 'Solana',
        symbol: 'SOL',
        decimals: 9,
        logoURI: 'https://example.com/sol.png'
      }

      const priceData = {
        id: 'So11111111111111111111111111111111111111112',
        mintSymbol: 'SOL',
        vsToken: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        vsTokenSymbol: 'USDC',
        price: 150.50
      }

      const result = jupiterApi.mapToSolanaToken(jupiterToken, priceData)

      expect(result).toEqual({
        id: jupiterToken.address,
        mint_address: jupiterToken.address,
        name: jupiterToken.name,
        symbol: jupiterToken.symbol,
        description: `${jupiterToken.name} token on Solana`,
        image_url: jupiterToken.logoURI,
        decimals: jupiterToken.decimals,
        price: priceData.price,
        market_cap: expect.any(Number),
        volume_24h: expect.any(Number),
        change_24h: expect.any(Number),
        is_active: true,
        updated_at: expect.any(String),
        created_at: expect.any(String)
      })
    })

    it('should handle missing price data', () => {
      const jupiterToken = {
        address: 'test',
        chainId: 101,
        name: 'Test Token',
        symbol: 'TEST',
        decimals: 6
      }

      const result = jupiterApi.mapToSolanaToken(jupiterToken)
      expect(result.price).toBe(0)
      expect(result.market_cap).toBe(0)
      expect(result.volume_24h).toBe(0)
    })
  })
})