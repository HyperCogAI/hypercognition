/**
 * Real-time Price WebSocket Service
 * Provides live cryptocurrency price updates using CoinGecko WebSocket
 */

export interface PriceUpdate {
  id: string
  symbol: string
  name: string
  current_price: number
  price_change_24h: number
  price_change_percentage_24h: number
  market_cap: number
  total_volume: number
  high_24h: number
  low_24h: number
  timestamp: number
}

type PriceUpdateCallback = (update: PriceUpdate) => void

class RealtimePriceService {
  private subscribers: Map<string, Set<PriceUpdateCallback>> = new Map()
  private priceCache: Map<string, PriceUpdate> = new Map()
  private updateInterval: NodeJS.Timeout | null = null
  private isRunning: boolean = false

  /**
   * Start the real-time price update service
   */
  start() {
    if (this.isRunning) return

    this.isRunning = true
    console.log('[RealtimePrice] Service started')

    // Fetch initial prices
    this.fetchPrices()

    // Poll for updates every 30 seconds
    this.updateInterval = setInterval(() => {
      this.fetchPrices()
    }, 30000)
  }

  /**
   * Stop the real-time price update service
   */
  stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
    this.isRunning = false
    console.log('[RealtimePrice] Service stopped')
  }

  /**
   * Subscribe to price updates for specific cryptocurrencies
   */
  subscribe(cryptoIds: string[], callback: PriceUpdateCallback): () => void {
    cryptoIds.forEach(id => {
      if (!this.subscribers.has(id)) {
        this.subscribers.set(id, new Set())
      }
      this.subscribers.get(id)!.add(callback)

      // Send cached price immediately if available
      const cachedPrice = this.priceCache.get(id)
      if (cachedPrice) {
        callback(cachedPrice)
      }
    })

    // Return unsubscribe function
    return () => {
      cryptoIds.forEach(id => {
        this.subscribers.get(id)?.delete(callback)
        if (this.subscribers.get(id)?.size === 0) {
          this.subscribers.delete(id)
        }
      })
    }
  }

  /**
   * Get cached price for a cryptocurrency
   */
  getPrice(cryptoId: string): PriceUpdate | undefined {
    return this.priceCache.get(cryptoId)
  }

  /**
   * Fetch latest prices from CoinGecko API
   */
  private async fetchPrices() {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&sparkline=false'
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const timestamp = Date.now()

      data.forEach((coin: any) => {
        const update: PriceUpdate = {
          id: coin.id,
          symbol: coin.symbol,
          name: coin.name,
          current_price: coin.current_price,
          price_change_24h: coin.price_change_24h || 0,
          price_change_percentage_24h: coin.price_change_percentage_24h || 0,
          market_cap: coin.market_cap || 0,
          total_volume: coin.total_volume || 0,
          high_24h: coin.high_24h || coin.current_price,
          low_24h: coin.low_24h || coin.current_price,
          timestamp
        }

        // Update cache
        this.priceCache.set(coin.id, update)

        // Notify subscribers
        const subscribers = this.subscribers.get(coin.id)
        if (subscribers) {
          subscribers.forEach(callback => callback(update))
        }
      })

      console.log(`[RealtimePrice] Updated ${data.length} prices`)
    } catch (error) {
      console.error('[RealtimePrice] Error fetching prices:', error)
    }
  }

  /**
   * Force an immediate price update
   */
  async refresh() {
    await this.fetchPrices()
  }
}

// Export singleton instance
export const realtimePriceService = new RealtimePriceService()
