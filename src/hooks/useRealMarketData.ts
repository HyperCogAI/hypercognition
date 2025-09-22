import { useState, useEffect, useCallback } from 'react'
import { coinGeckoApi, type CoinGeckoPrice } from '@/lib/apis/coinGeckoApi'
import { jupiterApi } from '@/lib/apis/jupiterApi'
import { useSolanaRealtime } from './useSolanaRealtime'
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache'

interface MarketData {
  crypto: CoinGeckoPrice[]
  solana: any[]
  isLoading: boolean
  error: string | null
  lastUpdated: Date | null
}

interface PriceHistoryData {
  timestamp: string
  price: number
  volume: number
  market_cap: number
}

export const useRealMarketData = () => {
  const [marketData, setMarketData] = useState<MarketData>({
    crypto: [],
    solana: [],
    isLoading: true,
    error: null,
    lastUpdated: null
  })

  const { tokens: solanaTokens, isLoading: solanaLoading } = useSolanaRealtime()

  const fetchCryptoData = useCallback(async (): Promise<CoinGeckoPrice[]> => {
    const cacheKey = 'crypto_market_data'
    const cached = cache.get<CoinGeckoPrice[]>(cacheKey)
    if (cached) return cached

    try {
      const data = await coinGeckoApi.getTopCryptos(100)
      cache.set(cacheKey, data, 5 * 60 * 1000) // 5 minutes
      return data
    } catch (error) {
      console.error('Failed to fetch crypto data:', error)
      return []
    }
  }, [])

  const fetchSolanaData = useCallback(async (): Promise<any[]> => {
    const cacheKey = 'solana_market_data'
    const cached = cache.get<any[]>(cacheKey)
    if (cached) return cached

    try {
      const data = await jupiterApi.getPopularTokensWithPrices(50)
      cache.set(cacheKey, data, 5 * 60 * 1000) // 5 minutes
      return data
    } catch (error) {
      console.error('Failed to fetch Solana data:', error)
      return []
    }
  }, [])

  const fetchAllMarketData = useCallback(async () => {
    setMarketData(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const [cryptoData, solanaData] = await Promise.allSettled([
        fetchCryptoData(),
        fetchSolanaData()
      ])

      const crypto: CoinGeckoPrice[] = cryptoData.status === 'fulfilled' ? cryptoData.value : []
      const solana: any[] = solanaData.status === 'fulfilled' ? solanaData.value : []

      // Merge with Supabase Solana data if available
      const mergedSolana = solanaTokens.length > 0 ? solanaTokens : solana

      setMarketData({
        crypto,
        solana: mergedSolana,
        isLoading: false,
        error: cryptoData.status === 'rejected' && solanaData.status === 'rejected' 
          ? 'Failed to fetch market data' 
          : null,
        lastUpdated: new Date()
      })
    } catch (error) {
      setMarketData(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to fetch market data'
      }))
    }
  }, [fetchCryptoData, fetchSolanaData, solanaTokens])

  const refreshData = useCallback(() => {
    // Clear cache and refetch
    cache.invalidate('crypto_market_data')
    cache.invalidate('solana_market_data')
    fetchAllMarketData()
  }, [fetchAllMarketData])

  const getPriceHistory = useCallback(async (
    tokenId: string, 
    isSeolana: boolean = false, 
    days: number = 1
  ): Promise<PriceHistoryData[]> => {
    const cacheKey = `price_history_${tokenId}_${days}d`
    const cached = cache.get<PriceHistoryData[]>(cacheKey)
    if (cached) return cached

    try {
      let data: PriceHistoryData[] = []

      if (isSeolana) {
        // For Solana tokens, we'd need historical data from Jupiter or other sources
        // For now, generate some sample data based on current price
        const currentToken = marketData.solana.find(t => t.id === tokenId)
        if (currentToken) {
          data = generateSampleHistory(currentToken.price, days)
        }
      } else {
        // Use CoinGecko for crypto historical data
        const chartData = await coinGeckoApi.getMarketChart(tokenId, days)
        data = coinGeckoApi.mapToPriceHistory(chartData, tokenId)
      }

      cache.set(cacheKey, data, 1 * 60 * 1000) // 1 minute
      return data
    } catch (error) {
      console.error('Failed to fetch price history:', error)
      return [] as PriceHistoryData[]
    }
  }, [marketData.solana])

  const searchTokens = useCallback(async (query: string) => {
    try {
      // Search both crypto and Solana tokens
      const [cryptoResults, solanaResults] = await Promise.allSettled([
        coinGeckoApi.searchCoins(query),
        // For Solana, filter current tokens by name/symbol
        Promise.resolve(marketData.solana.filter(token => 
          token.name.toLowerCase().includes(query.toLowerCase()) ||
          token.symbol.toLowerCase().includes(query.toLowerCase())
        ))
      ])

      return {
        crypto: cryptoResults.status === 'fulfilled' ? cryptoResults.value.coins : [],
        solana: solanaResults.status === 'fulfilled' ? solanaResults.value : []
      }
    } catch (error) {
      console.error('Failed to search tokens:', error)
      return { crypto: [], solana: [] }
    }
  }, [marketData.solana])

  useEffect(() => {
    fetchAllMarketData()
    
    // Set up periodic refresh every 5 minutes
    const interval = setInterval(fetchAllMarketData, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [fetchAllMarketData])

  return {
    ...marketData,
    isLoading: marketData.isLoading || solanaLoading,
    refreshData,
    getPriceHistory,
    searchTokens,
    // Helper functions
    getCryptoById: (id: string) => marketData.crypto.find(c => c.id === id),
    getSolanaByMint: (mint: string) => marketData.solana.find(s => s.mint_address === mint),
    getAllTokens: () => [
      ...marketData.crypto.map(c => ({ ...c, type: 'crypto' })),
      ...marketData.solana.map(s => ({ ...s, type: 'solana' }))
    ]
  }
}

// Helper function to generate sample historical data
function generateSampleHistory(currentPrice: number, days: number): PriceHistoryData[] {
  const data: PriceHistoryData[] = []
  const now = new Date()
  const pointsPerDay = 24 // Hourly data
  const totalPoints = days * pointsPerDay

  for (let i = totalPoints; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000)
    const variation = (Math.random() - 0.5) * 0.1 // ±5% variation
    const price = currentPrice * (1 + variation * (i / totalPoints))
    
    data.push({
      timestamp: timestamp.toISOString(),
      price,
      volume: Math.random() * 100000,
      market_cap: price * (Math.random() * 1000000 + 100000)
    })
  }

  return data.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
}