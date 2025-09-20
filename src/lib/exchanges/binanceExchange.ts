import { BaseExchange, ExchangeConfig, MarketData, OrderBook, TradeOrder, Balance } from './baseExchange'

// Binance API types
interface BinanceTicker {
  symbol: string
  price: string
  volume: string
  priceChangePercent: string
  highPrice: string
  lowPrice: string
}

interface BinanceOrderBook {
  bids: [string, string][]
  asks: [string, string][]
}

interface BinanceOrder {
  orderId: number
  symbol: string
  side: string
  type: string
  origQty: string
  executedQty: string
  status: string
  price: string
  timeInForce: string
}

export class BinanceExchange extends BaseExchange {
  private baseUrl: string
  private wsUrl: string
  private websocket: WebSocket | null = null

  constructor(config: ExchangeConfig) {
    super(config)
    this.baseUrl = config.testnet 
      ? 'https://testnet.binance.vision/api/v3'
      : 'https://api.binance.com/api/v3'
    this.wsUrl = config.testnet
      ? 'wss://testnet.binance.vision/ws'
      : 'wss://stream.binance.com:9443/ws'
  }

  getName(): string {
    return 'Binance'
  }

  async connect(): Promise<void> {
    try {
      // Test connection with ping
      const response = await fetch(`${this.baseUrl}/ping`)
      if (!response.ok) {
        throw new Error(`Failed to connect to Binance: ${response.statusText}`)
      }
      console.log('Connected to Binance API')
    } catch (error) {
      console.error('Failed to connect to Binance:', error)
      throw error
    }
  }

  async disconnect(): Promise<void> {
    if (this.websocket) {
      this.websocket.close()
      this.websocket = null
    }
  }

  async getMarketData(symbols: string[]): Promise<MarketData[]> {
    await this.checkRateLimit('ticker')
    
    try {
      const response = await fetch(`${this.baseUrl}/ticker/24hr`)
      if (!response.ok) {
        throw new Error(`Failed to fetch market data: ${response.statusText}`)
      }

      const tickers: BinanceTicker[] = await response.json()
      const symbolSet = new Set(symbols.map(s => this.formatSymbol(s)))

      return tickers
        .filter(ticker => symbolSet.has(ticker.symbol))
        .map(ticker => ({
          symbol: ticker.symbol,
          price: parseFloat(ticker.price),
          volume24h: parseFloat(ticker.volume),
          change24h: parseFloat(ticker.priceChangePercent),
          high24h: parseFloat(ticker.highPrice),
          low24h: parseFloat(ticker.lowPrice),
          timestamp: Date.now()
        }))
    } catch (error) {
      console.error('Failed to fetch market data:', error)
      throw error
    }
  }

  async getOrderBook(symbol: string, limit: number = 100): Promise<OrderBook> {
    await this.checkRateLimit('orderbook')
    
    try {
      const formattedSymbol = this.formatSymbol(symbol)
      const response = await fetch(`${this.baseUrl}/depth?symbol=${formattedSymbol}&limit=${limit}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch order book: ${response.statusText}`)
      }

      const data: BinanceOrderBook = await response.json()
      
      return {
        symbol: formattedSymbol,
        bids: data.bids.map(([price, quantity]) => ({
          price: parseFloat(price),
          quantity: parseFloat(quantity),
          total: parseFloat(price) * parseFloat(quantity)
        })),
        asks: data.asks.map(([price, quantity]) => ({
          price: parseFloat(price),
          quantity: parseFloat(quantity),
          total: parseFloat(price) * parseFloat(quantity)
        })),
        timestamp: Date.now()
      }
    } catch (error) {
      console.error('Failed to fetch order book:', error)
      throw error
    }
  }

  async getBalances(): Promise<Balance[]> {
    // This would require API key authentication in production
    // For demo purposes, return mock data
    return [
      { asset: 'BTC', free: 0.5, locked: 0.1, total: 0.6 },
      { asset: 'ETH', free: 2.5, locked: 0.5, total: 3.0 },
      { asset: 'USDT', free: 1000, locked: 200, total: 1200 }
    ]
  }

  async placeOrder(order: Omit<TradeOrder, 'id' | 'status' | 'filled' | 'remaining' | 'timestamp'>): Promise<TradeOrder> {
    this.validateOrder(order)
    await this.checkRateLimit('order')

    // For demo purposes, simulate order placement
    // In production, this would make authenticated API calls
    return {
      id: `order_${Date.now()}`,
      ...order,
      status: 'pending',
      filled: 0,
      remaining: order.amount,
      timestamp: Date.now()
    }
  }

  async cancelOrder(orderId: string): Promise<boolean> {
    await this.checkRateLimit('order')
    // Simulate order cancellation
    return true
  }

  async getOrderStatus(orderId: string): Promise<TradeOrder> {
    await this.checkRateLimit('order')
    
    // Simulate order status check
    return {
      id: orderId,
      symbol: 'BTCUSDT',
      side: 'buy',
      type: 'limit',
      amount: 0.1,
      price: 50000,
      status: 'filled',
      filled: 0.1,
      remaining: 0,
      timestamp: Date.now() - 30000
    }
  }

  async getTradeHistory(symbol?: string, limit: number = 50): Promise<TradeOrder[]> {
    await this.checkRateLimit('trades')
    
    // Simulate trade history
    return Array.from({ length: Math.min(limit, 10) }, (_, i) => ({
      id: `trade_${Date.now() - i * 60000}`,
      symbol: symbol || 'BTCUSDT',
      side: i % 2 === 0 ? 'buy' : 'sell',
      type: 'market',
      amount: 0.01 * (i + 1),
      status: 'filled',
      filled: 0.01 * (i + 1),
      remaining: 0,
      timestamp: Date.now() - i * 60000
    }))
  }

  // WebSocket connection for real-time data
  connectWebSocket(symbols: string[], onMessage: (data: any) => void): void {
    const streams = symbols.map(symbol => `${symbol.toLowerCase()}@ticker`).join('/')
    const wsUrl = `${this.wsUrl}/${streams}`

    this.websocket = new WebSocket(wsUrl)
    
    this.websocket.onopen = () => {
      console.log('Connected to Binance WebSocket')
    }

    this.websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        onMessage(data)
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }

    this.websocket.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    this.websocket.onclose = () => {
      console.log('WebSocket connection closed')
    }
  }
}