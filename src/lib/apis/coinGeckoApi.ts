interface CoinGeckoPrice {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  market_cap: number
  market_cap_rank: number
  fully_diluted_valuation: number | null
  total_volume: number
  high_24h: number
  low_24h: number
  price_change_24h: number
  price_change_percentage_24h: number
  market_cap_change_24h: number
  market_cap_change_percentage_24h: number
  circulating_supply: number
  total_supply: number | null
  max_supply: number | null
  ath: number
  ath_change_percentage: number
  ath_date: string
  atl: number
  atl_change_percentage: number
  atl_date: string
  last_updated: string
}

interface CoinGeckoMarketChart {
  prices: [number, number][]
  market_caps: [number, number][]
  total_volumes: [number, number][]
}

interface CoinGeckoSearchResult {
  coins: Array<{
    id: string
    name: string
    symbol: string
    market_cap_rank: number | null
    thumb: string
    large: string
  }>
}

class CoinGeckoAPI {
  private baseUrl = 'https://api.coingecko.com/api/v3'
  private rateLimitDelay = 1500 // 1.5 seconds between requests for free tier
  private lastRequestTime = 0
  private cache = new Map<string, { data: any; timestamp: number }>()
  private pendingRequests = new Map<string, Promise<any>>()
  private cacheDuration = 30000 // Cache for 30 seconds

  private getCacheKey(url: string): string {
    return url
  }

  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.data as T
    }
    this.cache.delete(key)
    return null
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  private async rateLimit() {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime
    if (timeSinceLastRequest < this.rateLimitDelay) {
      await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest))
    }
    this.lastRequestTime = Date.now()
  }

  private async fetchWithErrorHandling<T>(url: string): Promise<T> {
    const cacheKey = this.getCacheKey(url)
    
    // Check cache first
    const cachedData = this.getCachedData<T>(cacheKey)
    if (cachedData) {
      return cachedData
    }

    // Check if there's already a pending request for this URL
    const pendingRequest = this.pendingRequests.get(cacheKey)
    if (pendingRequest) {
      return pendingRequest
    }

    // Create new request using edge function proxy
    const requestPromise = (async () => {
      try {
        // Extract the endpoint path from the full URL
        const urlObj = new URL(url)
        const endpoint = urlObj.pathname + urlObj.search
        
        // Call edge function proxy to bypass CORS and leverage server-side caching
        const proxyUrl = `https://xdinlkmqmjlrmunsjswf.supabase.co/functions/v1/coingecko-proxy?endpoint=${encodeURIComponent(endpoint)}`
        
        const response = await fetch(proxyUrl)
        
        if (!response.ok) {
          // Fallback to direct API call if proxy fails
          console.warn('Proxy failed, falling back to direct API call')
          await this.rateLimit()
          const directResponse = await fetch(url)
          
          if (!directResponse.ok) {
            if (directResponse.status === 429) {
              console.warn('CoinGecko rate limit hit, waiting 10 seconds...')
              await new Promise(resolve => setTimeout(resolve, 10000))
              const retryResponse = await fetch(url)
              if (!retryResponse.ok) {
                throw new Error(`CoinGecko API error: ${retryResponse.status}`)
              }
              const data = await retryResponse.json()
              this.setCachedData(cacheKey, data)
              return data
            }
            throw new Error(`CoinGecko API error: ${directResponse.status}`)
          }
          
          const data = await directResponse.json()
          this.setCachedData(cacheKey, data)
          return data
        }
        
        const data = await response.json()
        this.setCachedData(cacheKey, data)
        return data
      } catch (error) {
        console.error('CoinGecko API request failed:', error)
        throw error
      } finally {
        this.pendingRequests.delete(cacheKey)
      }
    })()

    this.pendingRequests.set(cacheKey, requestPromise)
    return requestPromise
  }

  async getTopCryptos(limit: number = 50, page: number = 1): Promise<CoinGeckoPrice[]> {
    const url = `${this.baseUrl}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=${page}&sparkline=false`
    return this.fetchWithErrorHandling<CoinGeckoPrice[]>(url)
  }

  async getCryptoById(id: string): Promise<CoinGeckoPrice> {
    const url = `${this.baseUrl}/coins/markets?vs_currency=usd&ids=${id}&sparkline=false`
    const data = await this.fetchWithErrorHandling<CoinGeckoPrice[]>(url)
    if (!data || data.length === 0) {
      throw new Error(`Crypto with id ${id} not found`)
    }
    return data[0]
  }

  async getCryptosByIds(ids: string[]): Promise<CoinGeckoPrice[]> {
    const idsString = ids.join(',')
    const url = `${this.baseUrl}/coins/markets?vs_currency=usd&ids=${idsString}&sparkline=false`
    return this.fetchWithErrorHandling<CoinGeckoPrice[]>(url)
  }

  async getMarketChart(id: string, days: number = 1): Promise<CoinGeckoMarketChart> {
    const url = `${this.baseUrl}/coins/${id}/market_chart?vs_currency=usd&days=${days}`
    return this.fetchWithErrorHandling<CoinGeckoMarketChart>(url)
  }

  async searchCoins(query: string): Promise<CoinGeckoSearchResult> {
    const url = `${this.baseUrl}/search?query=${encodeURIComponent(query)}`
    return this.fetchWithErrorHandling<CoinGeckoSearchResult>(url)
  }

  async getTrendingCoins(): Promise<any> {
    const url = `${this.baseUrl}/search/trending`
    return this.fetchWithErrorHandling(url)
  }

  async getGlobalMarketData(): Promise<any> {
    const url = `${this.baseUrl}/global`
    return this.fetchWithErrorHandling(url)
  }

  // Convert CoinGecko data to our agent format
  mapToAgent(coinData: CoinGeckoPrice): any {
    return {
      id: coinData.id,
      symbol: coinData.symbol.toUpperCase(),
      name: coinData.name,
      price: coinData.current_price,
      change_24h: coinData.price_change_24h,
      change_percent_24h: coinData.price_change_percentage_24h,
      volume_24h: coinData.total_volume,
      market_cap: coinData.market_cap,
      high_24h: coinData.high_24h,
      low_24h: coinData.low_24h,
      description: `${coinData.name} (${coinData.symbol.toUpperCase()}) cryptocurrency`,
      chain: 'Multi-chain',
      avatar_url: null,
      updated_at: new Date().toISOString(),
      created_at: coinData.ath_date
    }
  }

  // Convert market chart data to our price history format
  mapToPriceHistory(chartData: CoinGeckoMarketChart, coinId: string): any[] {
    return chartData.prices.map(([timestamp, price], index) => ({
      id: `${coinId}_${timestamp}`,
      agent_id: coinId,
      timestamp: new Date(timestamp).toISOString(),
      price,
      volume: chartData.total_volumes[index]?.[1] || 0,
      market_cap: chartData.market_caps[index]?.[1] || 0
    }))
  }
  public clearCache(): void {
    this.cache.clear();
    this.pendingRequests.clear();
    this.lastRequestTime = 0;
  }
}

export const coinGeckoApi = new CoinGeckoAPI()
export type { CoinGeckoPrice, CoinGeckoMarketChart, CoinGeckoSearchResult }