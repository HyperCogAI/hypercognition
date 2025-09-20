import { BaseExchange, ExchangeConfig, MarketData, OrderBook, TradeOrder, Balance } from './baseExchange'
import { BinanceExchange } from './binanceExchange'

export type ExchangeType = 'binance' | 'coinbase' | 'kraken'

interface ExchangeInstance {
  exchange: BaseExchange
  isConnected: boolean
  lastHeartbeat: number
}

class ExchangeManager {
  private exchanges: Map<ExchangeType, ExchangeInstance> = new Map()
  private activeExchange: ExchangeType | null = null
  private heartbeatInterval: NodeJS.Timeout | null = null

  // Initialize exchange connection
  async addExchange(type: ExchangeType, config: ExchangeConfig): Promise<void> {
    try {
      let exchange: BaseExchange

      switch (type) {
        case 'binance':
          exchange = new BinanceExchange(config)
          break
        case 'coinbase':
          throw new Error('Coinbase integration coming soon')
        case 'kraken':
          throw new Error('Kraken integration coming soon')
        default:
          throw new Error(`Unsupported exchange: ${type}`)
      }

      await exchange.connect()
      
      this.exchanges.set(type, {
        exchange,
        isConnected: true,
        lastHeartbeat: Date.now()
      })

      if (!this.activeExchange) {
        this.activeExchange = type
      }

      console.log(`${exchange.getName()} exchange connected successfully`)
    } catch (error) {
      console.error(`Failed to add ${type} exchange:`, error)
      throw error
    }
  }

  // Remove exchange connection
  async removeExchange(type: ExchangeType): Promise<void> {
    const instance = this.exchanges.get(type)
    if (instance) {
      await instance.exchange.disconnect()
      this.exchanges.delete(type)
      
      if (this.activeExchange === type) {
        // Switch to another available exchange
        const availableExchanges = Array.from(this.exchanges.keys())
        this.activeExchange = availableExchanges.length > 0 ? availableExchanges[0] : null
      }
    }
  }

  // Get active exchange instance
  private getActiveExchange(): BaseExchange {
    if (!this.activeExchange) {
      throw new Error('No active exchange available')
    }

    const instance = this.exchanges.get(this.activeExchange)
    if (!instance || !instance.isConnected) {
      throw new Error('Active exchange is not connected')
    }

    return instance.exchange
  }

  // Switch active exchange
  setActiveExchange(type: ExchangeType): void {
    const instance = this.exchanges.get(type)
    if (!instance || !instance.isConnected) {
      throw new Error(`Exchange ${type} is not available`)
    }
    this.activeExchange = type
  }

  // Get all connected exchanges
  getConnectedExchanges(): ExchangeType[] {
    return Array.from(this.exchanges.entries())
      .filter(([_, instance]) => instance.isConnected)
      .map(([type]) => type)
  }

  // Market data operations
  async getMarketData(symbols: string[]): Promise<MarketData[]> {
    return await this.getActiveExchange().getMarketData(symbols)
  }

  async getOrderBook(symbol: string, limit?: number): Promise<OrderBook> {
    return await this.getActiveExchange().getOrderBook(symbol, limit)
  }

  // Trading operations
  async getBalances(): Promise<Balance[]> {
    return await this.getActiveExchange().getBalances()
  }

  async placeOrder(order: Omit<TradeOrder, 'id' | 'status' | 'filled' | 'remaining' | 'timestamp'>): Promise<TradeOrder> {
    return await this.getActiveExchange().placeOrder(order)
  }

  async cancelOrder(orderId: string): Promise<boolean> {
    return await this.getActiveExchange().cancelOrder(orderId)
  }

  async getOrderStatus(orderId: string): Promise<TradeOrder> {
    return await this.getActiveExchange().getOrderStatus(orderId)
  }

  async getTradeHistory(symbol?: string, limit?: number): Promise<TradeOrder[]> {
    return await this.getActiveExchange().getTradeHistory(symbol, limit)
  }

  // Aggregated market data from multiple exchanges
  async getAggregatedMarketData(symbols: string[]): Promise<Record<ExchangeType, MarketData[]>> {
    const results: Record<ExchangeType, MarketData[]> = {} as any
    
    for (const [type, instance] of this.exchanges.entries()) {
      if (instance.isConnected) {
        try {
          results[type] = await instance.exchange.getMarketData(symbols)
        } catch (error) {
          console.error(`Failed to get market data from ${type}:`, error)
          results[type] = []
        }
      }
    }

    return results
  }

  // Best price discovery across exchanges
  async getBestPrice(symbol: string, side: 'buy' | 'sell'): Promise<{ exchange: ExchangeType; price: number } | null> {
    const marketData = await this.getAggregatedMarketData([symbol])
    let bestPrice: number | null = null
    let bestExchange: ExchangeType | null = null

    for (const [exchange, data] of Object.entries(marketData)) {
      const symbolData = data.find(d => d.symbol === symbol)
      if (symbolData) {
        if (bestPrice === null || 
            (side === 'buy' && symbolData.price < bestPrice) ||
            (side === 'sell' && symbolData.price > bestPrice)) {
          bestPrice = symbolData.price
          bestExchange = exchange as ExchangeType
        }
      }
    }

    return bestPrice && bestExchange ? { exchange: bestExchange, price: bestPrice } : null
  }

  // Health monitoring
  startHealthMonitoring(): void {
    this.heartbeatInterval = setInterval(async () => {
      for (const [type, instance] of this.exchanges.entries()) {
        try {
          // Simple ping to check connection health
          await instance.exchange.getMarketData(['BTCUSDT'])
          instance.lastHeartbeat = Date.now()
          instance.isConnected = true
        } catch (error) {
          console.error(`Health check failed for ${type}:`, error)
          instance.isConnected = false
        }
      }
    }, 30000) // Check every 30 seconds
  }

  stopHealthMonitoring(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  // Cleanup
  async shutdown(): Promise<void> {
    this.stopHealthMonitoring()
    
    for (const [type, instance] of this.exchanges.entries()) {
      try {
        await instance.exchange.disconnect()
      } catch (error) {
        console.error(`Failed to disconnect ${type}:`, error)
      }
    }
    
    this.exchanges.clear()
    this.activeExchange = null
  }
}

// Singleton instance
export const exchangeManager = new ExchangeManager()

// Exchange status hook
import { useState, useEffect } from 'react'

export const useExchangeStatus = () => {
  const [connectedExchanges, setConnectedExchanges] = useState<ExchangeType[]>([])
  const [activeExchange, setActiveExchangeState] = useState<ExchangeType | null>(null)

  useEffect(() => {
    const updateStatus = () => {
      setConnectedExchanges(exchangeManager.getConnectedExchanges())
      // Update active exchange state
    }

    const interval = setInterval(updateStatus, 5000)
    updateStatus()

    return () => clearInterval(interval)
  }, [])

  return {
    connectedExchanges,
    activeExchange,
    setActiveExchange: (type: ExchangeType) => {
      exchangeManager.setActiveExchange(type)
      setActiveExchangeState(type)
    }
  }
}