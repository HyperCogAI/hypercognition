interface CoinGeckoPrice {
  id: string
  symbol: string
  name: string
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
  private rateLimitDelay = 1000 // 1 second between requests for free tier
  private lastRequestTime = 0

  private async rateLimit() {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime
    if (timeSinceLastRequest < this.rateLimitDelay) {
      await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest))
    }
    this.lastRequestTime = Date.now()
  }

  private async fetchWithErrorHandling<T>(url: string): Promise<T> {
    await this.rateLimit()
    
    try {
      const response = await fetch(url)
      
      if (!response.ok) {
        if (response.status === 429) {
          // Rate limited, wait and retry once
          await new Promise(resolve => setTimeout(resolve, 5000))
          const retryResponse = await fetch(url)
          if (!retryResponse.ok) {
            throw new Error(`CoinGecko API error: ${retryResponse.status}`)
          }
          return retryResponse.json()
        }
        throw new Error(`CoinGecko API error: ${response.status}`)
      }
      
      return response.json()
    } catch (error) {
      console.error('CoinGecko API request failed:', error)
      throw error
    }
  }

  async getTopCryptos(limit: number = 100, page: number = 1): Promise<CoinGeckoPrice[]> {
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
}

export const coinGeckoApi = new CoinGeckoAPI()
export type { CoinGeckoPrice, CoinGeckoMarketChart, CoinGeckoSearchResult }