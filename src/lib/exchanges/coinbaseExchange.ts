import { BaseExchange, ExchangeConfig, MarketData, OrderBook, TradeOrder, Balance } from './baseExchange'

export class CoinbaseExchange extends BaseExchange {
  private isConnected = false
  private symbols: string[] = ['BTCUSD', 'ETHUSD', 'ADAUSD', 'SOLUSD']

  getName(): string {
    return 'Coinbase Pro'
  }

  async connect(): Promise<void> {
    await this.checkRateLimit('connect')
    
    // Mock connection validation
    if (!this.config.apiKey || !this.config.apiSecret) {
      throw new Error('API credentials are required for Coinbase connection')
    }

    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    this.isConnected = true
    console.log('Connected to Coinbase Pro')
  }

  async disconnect(): Promise<void> {
    this.isConnected = false
    console.log('Disconnected from Coinbase Pro')
  }

  private ensureConnected(): void {
    if (!this.isConnected) {
      throw new Error('Not connected to Coinbase Pro')
    }
  }

  async getMarketData(symbols: string[]): Promise<MarketData[]> {
    this.ensureConnected()
    await this.checkRateLimit('market_data')

    return symbols
      .filter(symbol => this.symbols.includes(symbol.replace('USDT', 'USD')))
      .map(symbol => {
        const basePrice = this.getBasePrice(symbol)
        const variation = (crypto.getRandomValues(new Uint32Array(1))[0] % 400) / 20000 - 0.01 // ±1% variation from Binance
        const price = basePrice * (1 + variation)
        
        return {
          symbol: symbol.replace('USDT', 'USD'),
          price,
          volume24h: basePrice * 25000 + (crypto.getRandomValues(new Uint32Array(1))[0] % 25000000), // Lower volume than Binance
          change24h: (crypto.getRandomValues(new Uint32Array(1))[0] % 2000) / 100 - 10,
          high24h: price * 1.05,
          low24h: price * 0.95,
          timestamp: Date.now()
        }
      })
  }

  async getOrderBook(symbol: string, limit = 50): Promise<OrderBook> {
    this.ensureConnected()
    await this.checkRateLimit('order_book')

    const marketData = await this.getMarketData([symbol])
    const price = marketData[0]?.price || 50000

    const bids = Array.from({ length: limit }, (_, i) => ({
      price: price * (1 - (i + 1) * 0.0001),
      quantity: Math.random() * 10,
      total: 0
    }))

    const asks = Array.from({ length: limit }, (_, i) => ({
      price: price * (1 + (i + 1) * 0.0001),
      quantity: Math.random() * 10,
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
      symbol: symbol.replace('USDT', 'USD'),
      bids,
      asks,
      timestamp: Date.now()
    }
  }

  async getBalances(): Promise<Balance[]> {
    this.ensureConnected()
    await this.checkRateLimit('balances')

    // Mock balances
    return [
      {
        asset: 'USD',
        free: Math.random() * 10000,
        locked: Math.random() * 1000,
        total: 0
      },
      {
        asset: 'BTC',
        free: Math.random() * 5,
        locked: Math.random() * 0.5,
        total: 0
      },
      {
        asset: 'ETH',
        free: Math.random() * 50,
        locked: Math.random() * 5,
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

    // Coinbase-specific order processing
    const orderId = `cb_${Date.now()}_${crypto.getRandomValues(new Uint32Array(1))[0].toString(36)}`
    
    // Simulate order execution delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const executed = crypto.getRandomValues(new Uint32Array(1))[0] % 10 < 9 // 90% execution rate
    
    return {
      id: orderId,
      symbol: order.symbol.replace('USDT', 'USD'),
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

    // Mock cancellation - 95% success rate
    return crypto.getRandomValues(new Uint32Array(1))[0] % 20 < 19
  }

  async getOrderStatus(orderId: string): Promise<TradeOrder> {
    this.ensureConnected()
    await this.checkRateLimit('order_status')

    // Mock order status
    return {
      id: orderId,
      symbol: 'BTCUSD',
      side: 'buy',
      type: 'limit',
      amount: 1,
      price: 50000,
      status: 'filled',
      filled: 1,
      remaining: 0,
      timestamp: Date.now() - 60000
    }
  }

  async getTradeHistory(symbol?: string, limit = 100): Promise<TradeOrder[]> {
    this.ensureConnected()
    await this.checkRateLimit('trade_history')

    // Mock trade history
    return Array.from({ length: Math.min(limit, 20) }, (_, i) => ({
      id: `cb_${Date.now() - i * 60000}_trade`,
      symbol: symbol?.replace('USDT', 'USD') || 'BTCUSD',
      side: Math.random() > 0.5 ? 'buy' : 'sell',
      type: 'limit',
      amount: Math.random() * 5,
      price: this.getBasePrice(symbol || 'BTCUSD') * (1 + (Math.random() - 0.5) * 0.1),
      status: 'filled',
      filled: Math.random() * 5,
      remaining: 0,
      timestamp: Date.now() - i * 60000
    }))
  }

  private getBasePrice(symbol: string): number {
    const priceMap: Record<string, number> = {
      'BTCUSD': 45000,
      'BTCUSDT': 45000,
      'ETHUSD': 2500,
      'ETHUSDT': 2500,
      'ADAUSD': 0.35,
      'ADAUSDT': 0.35,
      'SOLUSD': 95,
      'SOLUSDT': 95
    }
    return priceMap[symbol] || 1
  }
}