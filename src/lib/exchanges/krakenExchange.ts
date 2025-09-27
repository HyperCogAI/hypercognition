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
        const variation = (crypto.getRandomValues(new Uint32Array(1))[0] % 300) / 20000 - 0.0075 // ±0.75% variation
        const price = basePrice * (1 + variation)
        
        return {
          symbol,
          price,
          volume24h: basePrice * 15000 + (crypto.getRandomValues(new Uint32Array(1))[0] % 15000000), // Lower volume than Binance/Coinbase
          change24h: (crypto.getRandomValues(new Uint32Array(1))[0] % 1600) / 100 - 8,
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
      quantity: (crypto.getRandomValues(new Uint32Array(1))[0] % 8000) / 1000,
      total: 0
    }))

    const asks = Array.from({ length: limit }, (_, i) => ({
      price: price * (1 + (i + 1) * 0.00015),
      quantity: (crypto.getRandomValues(new Uint32Array(1))[0] % 8000) / 1000,
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
        free: 4000 + (crypto.getRandomValues(new Uint32Array(1))[0] % 4000),
        locked: 400 + (crypto.getRandomValues(new Uint32Array(1))[0] % 400),
        total: 0
      },
      {
        asset: 'XXBT',
        free: 1 + (crypto.getRandomValues(new Uint32Array(1))[0] % 200) / 100,
        locked: 0.1 + (crypto.getRandomValues(new Uint32Array(1))[0] % 20) / 100,
        total: 0
      },
      {
        asset: 'XETH',
        free: 15 + (crypto.getRandomValues(new Uint32Array(1))[0] % 1500) / 100,
        locked: 1.5 + (crypto.getRandomValues(new Uint32Array(1))[0] % 150) / 100,
        total: 0
      },
      {
        asset: 'ADA',
        free: 5000 + (crypto.getRandomValues(new Uint32Array(1))[0] % 5000),
        locked: 500 + (crypto.getRandomValues(new Uint32Array(1))[0] % 500),
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
    const orderId = `kraken_${Date.now()}_${crypto.getRandomValues(new Uint32Array(1))[0].toString(36)}`
    
    // Simulate longer order processing time
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const executed = crypto.getRandomValues(new Uint32Array(1))[0] % 20 < 19 // 95% execution rate
    
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
    return crypto.getRandomValues(new Uint32Array(1))[0] % 50 < 49
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
      side: crypto.getRandomValues(new Uint32Array(1))[0] % 2 === 0 ? 'buy' : 'sell',
      type: 'limit',
      amount: 1 + (crypto.getRandomValues(new Uint32Array(1))[0] % 200) / 100,
      price: this.getBasePrice(krakenSymbol) * (1 + (crypto.getRandomValues(new Int32Array(1))[0] % 1600 - 800) / 10000),
      status: 'filled',
      filled: 1 + (crypto.getRandomValues(new Uint32Array(1))[0] % 200) / 100,
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