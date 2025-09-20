// Base exchange interface for standardized trading operations
export interface ExchangeConfig {
  apiKey: string
  apiSecret: string
  testnet?: boolean
  rateLimit?: number
}

export interface MarketData {
  symbol: string
  price: number
  volume24h: number
  change24h: number
  high24h: number
  low24h: number
  marketCap?: number
  timestamp: number
}

export interface OrderBookEntry {
  price: number
  quantity: number
  total: number
}

export interface OrderBook {
  symbol: string
  bids: OrderBookEntry[]
  asks: OrderBookEntry[]
  timestamp: number
}

export interface TradeOrder {
  id: string
  symbol: string
  side: 'buy' | 'sell'
  type: 'market' | 'limit' | 'stop_loss' | 'take_profit'
  amount: number
  price?: number
  status: 'pending' | 'filled' | 'cancelled' | 'failed'
  filled: number
  remaining: number
  timestamp: number
}

export interface Balance {
  asset: string
  free: number
  locked: number
  total: number
}

export abstract class BaseExchange {
  protected config: ExchangeConfig
  protected rateLimiter: Map<string, number> = new Map()

  constructor(config: ExchangeConfig) {
    this.config = config
  }

  // Rate limiting
  protected async checkRateLimit(endpoint: string): Promise<void> {
    const now = Date.now()
    const lastCall = this.rateLimiter.get(endpoint) || 0
    const minInterval = 100 // 100ms between calls

    if (now - lastCall < minInterval) {
      await new Promise(resolve => setTimeout(resolve, minInterval - (now - lastCall)))
    }
    this.rateLimiter.set(endpoint, Date.now())
  }

  // Abstract methods that each exchange must implement
  abstract getName(): string
  abstract connect(): Promise<void>
  abstract disconnect(): Promise<void>
  abstract getMarketData(symbols: string[]): Promise<MarketData[]>
  abstract getOrderBook(symbol: string, limit?: number): Promise<OrderBook>
  abstract getBalances(): Promise<Balance[]>
  abstract placeOrder(order: Omit<TradeOrder, 'id' | 'status' | 'filled' | 'remaining' | 'timestamp'>): Promise<TradeOrder>
  abstract cancelOrder(orderId: string): Promise<boolean>
  abstract getOrderStatus(orderId: string): Promise<TradeOrder>
  abstract getTradeHistory(symbol?: string, limit?: number): Promise<TradeOrder[]>

  // Common utility methods
  protected formatSymbol(symbol: string): string {
    return symbol.toUpperCase().replace('/', '')
  }

  protected validateOrder(order: any): void {
    if (!order.symbol || !order.side || !order.amount) {
      throw new Error('Invalid order: missing required fields')
    }
    if (order.amount <= 0) {
      throw new Error('Invalid order: amount must be positive')
    }
    if (order.type === 'limit' && (!order.price || order.price <= 0)) {
      throw new Error('Invalid order: limit orders require positive price')
    }
  }
}