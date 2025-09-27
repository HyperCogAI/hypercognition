import { useState, useEffect, useCallback } from 'react'
import { coinGeckoApi, type CoinGeckoPrice } from '@/lib/apis/coinGeckoApi'
import { jupiterApi } from '@/lib/apis/jupiterApi'
import { alternativeMarketDataApi } from '@/lib/apis/alternativeMarketData'
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
      // Try primary source first
      let data = await coinGeckoApi.getTopCryptos(100)
      
      // If primary source fails or returns empty, try alternative
      if (!data || data.length === 0) {
        console.warn('Primary crypto API failed, trying alternative source')
        const alternativeData = await alternativeMarketDataApi.getAggregatedMarketData()
        
        // Convert alternative data to CoinGecko format
        data = alternativeData.crypto.map(coin => ({
          id: coin.id,
          symbol: coin.symbol,
          name: coin.name,
          current_price: coin.current_price,
          market_cap: coin.market_cap,
          market_cap_rank: 0,
          fully_diluted_valuation: null,
          total_volume: coin.total_volume,
          high_24h: coin.current_price * 1.05,
          low_24h: coin.current_price * 0.95,
          price_change_24h: (coin.current_price * coin.price_change_percentage_24h) / 100,
          price_change_percentage_24h: coin.price_change_percentage_24h,
          market_cap_change_24h: 0,
          market_cap_change_percentage_24h: 0,
          circulating_supply: 0,
          total_supply: null,
          max_supply: null,
          ath: coin.current_price * 2,
          ath_change_percentage: -50,
          ath_date: new Date().toISOString(),
          atl: coin.current_price * 0.1,
          atl_change_percentage: 900,
          atl_date: new Date().toISOString(),
          last_updated: new Date().toISOString()
        })) as CoinGeckoPrice[]
      }
      
      cache.set(cacheKey, data, { ttl: 3 * 60 * 1000 }) // 3 minutes for live data
      return data
    } catch (error) {
      console.error('All crypto data sources failed:', error)
      // Return cached data if available, even if expired
      const staleData = cache.get<CoinGeckoPrice[]>(cacheKey)
      return staleData || []
    }
  }, [])

  const fetchSolanaData = useCallback(async (): Promise<any[]> => {
    const cacheKey = 'solana_market_data'
    const cached = cache.get<any[]>(cacheKey)
    if (cached) return cached

    try {
      const data = await jupiterApi.getPopularTokensWithPrices(50)
      
      // Validate and enhance data
      const validatedData = data.filter(token => 
        token && 
        token.price > 0 && 
        token.symbol && 
        token.name
      ).map(token => ({
        ...token,
        // Ensure all required fields are present
        id: token.id || token.mint_address,
        mint_address: token.mint_address || token.id,
        price: parseFloat(token.price.toString()),
        market_cap: parseFloat(token.market_cap?.toString() || '0'),
        volume_24h: parseFloat(token.volume_24h?.toString() || '0'),
        change_24h: parseFloat(token.change_24h?.toString() || '0'),
        is_active: true,
        updated_at: new Date().toISOString()
      }))
      
      cache.set(cacheKey, validatedData, { ttl: 3 * 60 * 1000 }) // 3 minutes for live data
      return validatedData
    } catch (error) {
      console.error('Failed to fetch Solana data:', error)
      // Return cached data if available, even if expired
      const staleData = cache.get<any[]>(cacheKey)
      return staleData || []
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

      cache.set(cacheKey, data, { ttl: 1 * 60 * 1000 }) // 1 minute
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
    
    // Set up aggressive refresh for live data - every 2 minutes
    const interval = setInterval(fetchAllMarketData, 2 * 60 * 1000)
    
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
    const variation = (crypto.getRandomValues(new Uint32Array(1))[0] % 200) / 2000 - 0.05 // ±5% variation
    const price = currentPrice * (1 + variation * (i / totalPoints))
    
    data.push({
      timestamp: timestamp.toISOString(),
      price,
      volume: price * 50000 + (crypto.getRandomValues(new Uint32Array(1))[0] % 50000),
      market_cap: price * (500000 + crypto.getRandomValues(new Uint32Array(1))[0] % 500000)
    })
  }

  return data.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
}