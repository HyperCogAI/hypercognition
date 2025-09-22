import { BaseExchange, ExchangeConfig, MarketData, OrderBook, TradeOrder, Balance } from './baseExchange'

export class KrakenExchange extends BaseExchange {
  private isConnected = false
  private symbols: string[] = ['XXBTZUSD', 'XETHZUSD', 'ADAUSD', 'SOLUSD']

  getName(): string {
    return 'Kraken'
  }

  async connect(): Promise<void> {
    await this.checkRateLimit('connect')
    
    // Mock connection validation
    if (!this.config.apiKey || !this.config.apiSecret) {
      throw new Error('API credentials are required for Kraken connection')
    }

    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1200))
    
    this.isConnected = true
    console.log('Connected to Kraken')
  }

  async disconnect(): Promise<void> {
    this.isConnected = false
    console.log('Disconnected from Kraken')
  }

  private ensureConnected(): void {
    if (!this.isConnected) {
      throw new Error('Not connected to Kraken')
    }
  }

  private formatKrakenSymbol(symbol: string): string {
    const symbolMap: Record<string, string> = {
      'BTCUSDT': 'XXBTZUSD',
      'ETHUSDT': 'XETHZUSD',
      'ADAUSDT': 'ADAUSD',
      'SOLUSDT': 'SOLUSD'
    }
    return symbolMap[symbol] || symbol
  }

  async getMarketData(symbols: string[]): Promise<MarketData[]> {
    this.ensureConnected()
    await this.checkRateLimit('market_data')

    return symbols
      .map(symbol => this.formatKrakenSymbol(symbol))
      .filter(symbol => this.symbols.includes(symbol))
      .map(symbol => {
        const basePrice = this.getBasePrice(symbol)
        const variation = (Math.random() - 0.5) * 0.015 // ±0.75% variation
        const price = basePrice * (1 + variation)
        
        return {
          symbol,
          price,
          volume24h: Math.random() * 30000000, // Lower volume than Binance/Coinbase
          change24h: (Math.random() - 0.5) * 800,
          high24h: price * 1.04,
          low24h: price * 0.96,
          timestamp: Date.now()
        }
      })
  }

  async getOrderBook(symbol: string, limit = 50): Promise<OrderBook> {
    this.ensureConnected()
    await this.checkRateLimit('order_book')

    const krakenSymbol = this.formatKrakenSymbol(symbol)
    const marketData = await this.getMarketData([symbol])
    const price = marketData[0]?.price || 50000

    const bids = Array.from({ length: limit }, (_, i) => ({
      price: price * (1 - (i + 1) * 0.00015), // Slightly wider spreads
      quantity: Math.random() * 8,
      total: 0
    }))

    const asks = Array.from({ length: limit }, (_, i) => ({
      price: price * (1 + (i + 1) * 0.00015),
      quantity: Math.random() * 8,
      total: 0
    }))

    // Calculate totals
    bids.forEach((bid, i) => {
      bid.total = bids.slice(0, i + 1).reduce((sum, b) => sum + b.quantity, 0)
    })

    asks.forEach((ask, i) => {
      ask.total = asks.slice(0, i + 1).reduce((sum, a) => sum + a.quantity, 0)
    })

    return {
      symbol: krakenSymbol,
      bids,
      asks,
      timestamp: Date.now()
    }
  }

  async getBalances(): Promise<Balance[]> {
    this.ensureConnected()
    await this.checkRateLimit('balances')

    // Mock balances with Kraken-style asset names
    return [
      {
        asset: 'ZUSD',
        free: Math.random() * 8000,
        locked: Math.random() * 800,
        total: 0
      },
      {
        asset: 'XXBT',
        free: Math.random() * 3,
        locked: Math.random() * 0.3,
        total: 0
      },
      {
        asset: 'XETH',
        free: Math.random() * 30,
        locked: Math.random() * 3,
        total: 0
      },
      {
        asset: 'ADA',
        free: Math.random() * 10000,
        locked: Math.random() * 1000,
        total: 0
      }
    ].map(balance => ({
      ...balance,
      total: balance.free + balance.locked
    }))
  }

  async placeOrder(order: Omit<TradeOrder, 'id' | 'status' | 'filled' | 'remaining' | 'timestamp'>): Promise<TradeOrder> {
    this.ensureConnected()
    await this.checkRateLimit('place_order')
    this.validateOrder(order)

    // Kraken-specific order processing
    const orderId = `kraken_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Simulate longer order processing time
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const executed = Math.random() > 0.05 // 95% execution rate (higher than others)
    
    return {
      id: orderId,
      symbol: this.formatKrakenSymbol(order.symbol),
      side: order.side,
      type: order.type,
      amount: order.amount,
      price: order.price,
      status: executed ? 'filled' : 'pending',
      filled: executed ? order.amount : 0,
      remaining: executed ? 0 : order.amount,
      timestamp: Date.now()
    }
  }

  async cancelOrder(orderId: string): Promise<boolean> {
    this.ensureConnected()
    await this.checkRateLimit('cancel_order')

    // Mock cancellation - 98% success rate (highest)
    return Math.random() > 0.02
  }

  async getOrderStatus(orderId: string): Promise<TradeOrder> {
    this.ensureConnected()
    await this.checkRateLimit('order_status')

    // Mock order status
    return {
      id: orderId,
      symbol: 'XXBTZUSD',
      side: 'buy',
      type: 'limit',
      amount: 1,
      price: 49000,
      status: 'filled',
      filled: 1,
      remaining: 0,
      timestamp: Date.now() - 90000
    }
  }

  async getTradeHistory(symbol?: string, limit = 100): Promise<TradeOrder[]> {
    this.ensureConnected()
    await this.checkRateLimit('trade_history')

    // Mock trade history
    const krakenSymbol = symbol ? this.formatKrakenSymbol(symbol) : 'XXBTZUSD'
    
    return Array.from({ length: Math.min(limit, 15) }, (_, i) => ({
      id: `kraken_${Date.now() - i * 90000}_trade`,
      symbol: krakenSymbol,
      side: Math.random() > 0.5 ? 'buy' : 'sell',
      type: 'limit',
      amount: Math.random() * 3,
      price: this.getBasePrice(krakenSymbol) * (1 + (Math.random() - 0.5) * 0.08),
      status: 'filled',
      filled: Math.random() * 3,
      remaining: 0,
      timestamp: Date.now() - i * 90000
    }))
  }

  private getBasePrice(symbol: string): number {
    const priceMap: Record<string, number> = {
      'XXBTZUSD': 49000,
      'BTCUSDT': 49000,
      'XETHZUSD': 2480,
      'ETHUSDT': 2480,
      'ADAUSD': 0.34,
      'ADAUSDT': 0.34,
      'SOLUSD': 93,
      'SOLUSDT': 93
    }
    return priceMap[symbol] || 1
  }
}