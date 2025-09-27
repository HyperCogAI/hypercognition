import { apiErrorHandler, safeFetch } from '@/lib/apiErrorHandler'
import { structuredLogger } from '@/lib/structuredLogger'

interface CoinGeckoTokenInfo {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  market_cap: number
  market_cap_rank: number
  fully_diluted_valuation: number
  total_volume: number
  high_24h: number
  low_24h: number
  price_change_24h: number
  price_change_percentage_24h: number
  market_cap_change_24h: number
  market_cap_change_percentage_24h: number
  circulating_supply: number
  total_supply: number
  max_supply: number
  ath: number
  ath_change_percentage: number
  ath_date: string
  atl: number
  atl_change_percentage: number
  atl_date: string
  last_updated: string
}

interface CoinGeckoPriceHistory {
  prices: [number, number][]
  market_caps: [number, number][]
  total_volumes: [number, number][]
}

class CoinGeckoSolanaAPI {
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
      structuredLogger.apiRequest(url, 'GET', { component: 'CoinGeckoSolanaAPI' })
      
      const response = await safeFetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })

      structuredLogger.apiResponse(url, (response as Response).status, { component: 'CoinGeckoSolanaAPI' })

      if (!(response as Response).ok) {
        structuredLogger.warn(`CoinGecko API error ${(response as Response).status}, using fallback data`, {
          component: 'CoinGeckoSolanaAPI'
        })
        return this.getFallbackData() as T
      }

      const data = await (response as Response).json()
      return data

    } catch (error) {
      structuredLogger.warn('CoinGecko API network error, using demo data', {
        component: 'CoinGeckoSolanaAPI'
      })
      return this.getFallbackData() as T
    }
  }

  private getFallbackData(): any {
    // Return sample Solana ecosystem tokens
    return [
      {
        id: 'solana',
        symbol: 'sol',
        name: 'Solana',
        image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
        current_price: 95.42,
        market_cap: 44582930147,
        total_volume: 2847293847,
        price_change_percentage_24h: 2.34,
        high_24h: 98.15,
        low_24h: 92.87
      },
      {
        id: 'serum',
        symbol: 'srm',
        name: 'Serum',
        image: 'https://assets.coingecko.com/coins/images/11970/large/serum-logo.png',
        current_price: 0.2845,
        market_cap: 58472938,
        total_volume: 3847293,
        price_change_percentage_24h: -1.23,
        high_24h: 0.3012,
        low_24h: 0.2734
      },
      {
        id: 'raydium',
        symbol: 'ray',
        name: 'Raydium',
        image: 'https://assets.coingecko.com/coins/images/13928/large/PSigc4ia_400x400.jpg',
        current_price: 1.87,
        market_cap: 487293847,
        total_volume: 28473847,
        price_change_percentage_24h: 4.56,
        high_24h: 1.92,
        low_24h: 1.78
      }
    ]
  }

  // Get Solana ecosystem tokens
  async getSolanaTokens(): Promise<CoinGeckoTokenInfo[]> {
    const url = `${this.baseUrl}/coins/markets?vs_currency=usd&category=solana-ecosystem&order=market_cap_desc&per_page=50&page=1&sparkline=false`
    return this.fetchWithErrorHandling<CoinGeckoTokenInfo[]>(url)
  }

  // Get specific token data
  async getTokenData(tokenId: string): Promise<CoinGeckoTokenInfo | null> {
    try {
      const url = `${this.baseUrl}/coins/${tokenId}`
      const data = await this.fetchWithErrorHandling<any>(url)
      
      if (data.market_data) {
        return {
          id: data.id,
          symbol: data.symbol,
          name: data.name,
          image: data.image?.large || data.image?.small,
          current_price: data.market_data.current_price?.usd || 0,
          market_cap: data.market_data.market_cap?.usd || 0,
          total_volume: data.market_data.total_volume?.usd || 0,
          price_change_percentage_24h: data.market_data.price_change_percentage_24h || 0,
          high_24h: data.market_data.high_24h?.usd || 0,
          low_24h: data.market_data.low_24h?.usd || 0,
          market_cap_rank: data.market_cap_rank || 0,
          fully_diluted_valuation: data.market_data.fully_diluted_valuation?.usd || 0,
          price_change_24h: data.market_data.price_change_24h || 0,
          market_cap_change_24h: data.market_data.market_cap_change_24h || 0,
          market_cap_change_percentage_24h: data.market_data.market_cap_change_percentage_24h || 0,
          circulating_supply: data.market_data.circulating_supply || 0,
          total_supply: data.market_data.total_supply || 0,
          max_supply: data.market_data.max_supply || 0,
          ath: data.market_data.ath?.usd || 0,
          ath_change_percentage: data.market_data.ath_change_percentage?.usd || 0,
          ath_date: data.market_data.ath_date?.usd || '',
          atl: data.market_data.atl?.usd || 0,
          atl_change_percentage: data.market_data.atl_change_percentage?.usd || 0,
          atl_date: data.market_data.atl_date?.usd || '',
          last_updated: data.last_updated || ''
        }
      }
      return null
    } catch (error) {
      structuredLogger.warn('Error fetching token data', {
        component: 'CoinGeckoSolanaAPI'
      })
      return null
    }
  }

  // Get price history for charts
  async getPriceHistory(tokenId: string, days: number = 1): Promise<CoinGeckoPriceHistory | null> {
    try {
      const url = `${this.baseUrl}/coins/${tokenId}/market_chart?vs_currency=usd&days=${days}&interval=${days <= 1 ? 'hourly' : 'daily'}`
      return await this.fetchWithErrorHandling<CoinGeckoPriceHistory>(url)
    } catch (error) {
      structuredLogger.warn('Error fetching price history', {
        component: 'CoinGeckoSolanaAPI'
      })
      
      // Return sample data for fallback
      const now = Date.now()
      const interval = days <= 1 ? 3600000 : 86400000 // 1 hour or 1 day
      const points = days <= 1 ? 24 : days
      
      const prices: [number, number][] = []
      const volumes: [number, number][] = []
      const marketCaps: [number, number][] = []
      
      for (let i = 0; i < points; i++) {
        const timestamp = now - (points - i) * interval
        const basePrice = 95.42 // Base SOL price
        const priceVariation = (Math.random() - 0.5) * 0.1
        const price = basePrice * (1 + priceVariation)
        
        prices.push([timestamp, price])
        volumes.push([timestamp, Math.random() * 1000000000])
        marketCaps.push([timestamp, price * 400000000]) // Rough SOL supply
      }
      
      return {
        prices,
        market_caps: marketCaps,
        total_volumes: volumes
      }
    }
  }

  // Convert CoinGecko data to our internal format
  mapToSolanaToken(tokenData: CoinGeckoTokenInfo): any {
    return {
      id: tokenData.id,
      mint_address: tokenData.id, // Using ID as placeholder
      name: tokenData.name,
      symbol: tokenData.symbol.toUpperCase(),
      decimals: 9, // Default for most Solana tokens
      price: tokenData.current_price,
      market_cap: tokenData.market_cap,
      volume_24h: tokenData.total_volume,
      change_24h: tokenData.price_change_percentage_24h,
      image_url: tokenData.image,
      is_active: true,
      description: `${tokenData.name} token on Solana`,
      high_24h: tokenData.high_24h,
      low_24h: tokenData.low_24h
    }
  }

  // Common Solana token IDs for CoinGecko
  static readonly POPULAR_TOKENS = {
    SOL: 'solana',
    USDC: 'usd-coin',
    RAY: 'raydium',
    SRM: 'serum',
    COPE: 'cope',
    FIDA: 'bonfida',
    KIN: 'kin',
    MAPS: 'maps',
    MEDIA: 'media-network',
    ROPE: 'rope-token'
  } as const
}

export const coinGeckoSolanaApi = new CoinGeckoSolanaAPI()
export type { CoinGeckoTokenInfo, CoinGeckoPriceHistory }