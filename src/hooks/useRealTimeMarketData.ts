import { useState, useEffect, useCallback, useRef } from 'react'
import { exchangeManager } from '@/lib/exchanges/exchangeManager'
import { MarketData, OrderBook } from '@/lib/exchanges/baseExchange'

interface MarketDataState {
  data: MarketData[]
  loading: boolean
  error: string | null
  lastUpdate: number
}

interface OrderBookState {
  data: OrderBook | null
  loading: boolean
  error: string | null
  lastUpdate: number
}

// Real-time market data hook
export const useRealTimeMarketData = (symbols: string[], refreshInterval: number = 5000) => {
  const [state, setState] = useState<MarketDataState>({
    data: [],
    loading: true,
    error: null,
    lastUpdate: 0
  })

  const intervalRef = useRef<NodeJS.Timeout>()
  const mountedRef = useRef(true)

  const fetchMarketData = useCallback(async () => {
    if (!symbols.length) return

    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      const marketData = await exchangeManager.getMarketData(symbols)
      
      if (mountedRef.current) {
        setState({
          data: marketData,
          loading: false,
          error: null,
          lastUpdate: Date.now()
        })
      }
    } catch (error) {
      console.error('Failed to fetch market data:', error)
      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch market data'
        }))
      }
    }
  }, [symbols])

  useEffect(() => {
    mountedRef.current = true
    
    // Initial fetch
    fetchMarketData()

    // Set up polling
    intervalRef.current = setInterval(fetchMarketData, refreshInterval)

    return () => {
      mountedRef.current = false
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [fetchMarketData, refreshInterval])

  const refetch = useCallback(() => {
    fetchMarketData()
  }, [fetchMarketData])

  return {
    ...state,
    refetch
  }
}

// Real-time order book hook
export const useRealTimeOrderBook = (symbol: string, limit: number = 20, refreshInterval: number = 1000) => {
  const [state, setState] = useState<OrderBookState>({
    data: null,
    loading: true,
    error: null,
    lastUpdate: 0
  })

  const intervalRef = useRef<NodeJS.Timeout>()
  const mountedRef = useRef(true)

  const fetchOrderBook = useCallback(async () => {
    if (!symbol) return

    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      const orderBook = await exchangeManager.getOrderBook(symbol, limit)
      
      if (mountedRef.current) {
        setState({
          data: orderBook,
          loading: false,
          error: null,
          lastUpdate: Date.now()
        })
      }
    } catch (error) {
      console.error('Failed to fetch order book:', error)
      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch order book'
        }))
      }
    }
  }, [symbol, limit])

  useEffect(() => {
    mountedRef.current = true
    
    // Initial fetch
    fetchOrderBook()

    // Set up polling
    intervalRef.current = setInterval(fetchOrderBook, refreshInterval)

    return () => {
      mountedRef.current = false
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [fetchOrderBook, refreshInterval])

  const refetch = useCallback(() => {
    fetchOrderBook()
  }, [fetchOrderBook])

  return {
    ...state,
    refetch
  }
}

// WebSocket-based real-time data hook
export const useWebSocketMarketData = (symbols: string[]) => {
  const [marketData, setMarketData] = useState<Record<string, MarketData>>({})
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (!symbols.length) return

    try {
      // For demo purposes, simulate WebSocket data
      const simulateData = () => {
        const updates: Record<string, MarketData> = {}
        
        symbols.forEach(symbol => {
          const basePrice = 50000 // Base price for simulation
          const volatility = 0.02 // 2% volatility
          const change = (Math.random() - 0.5) * 2 * volatility
          
          updates[symbol] = {
            symbol,
            price: basePrice * (1 + change),
            volume24h: Math.random() * 1000000,
            change24h: change * 100,
            high24h: basePrice * (1 + volatility),
            low24h: basePrice * (1 - volatility),
            timestamp: Date.now()
          }
        })
        
        setMarketData(prev => ({ ...prev, ...updates }))
      }

      // Simulate initial connection
      setConnected(true)
      setError(null)
      
      // Simulate periodic updates
      const interval = setInterval(simulateData, 1000)
      
      // Initial data
      simulateData()

      return () => {
        clearInterval(interval)
        setConnected(false)
      }
    } catch (error) {
      console.error('WebSocket error:', error)
      setError(error instanceof Error ? error.message : 'WebSocket connection failed')
      setConnected(false)
    }
  }, [symbols])

  return {
    marketData,
    connected,
    error
  }
}

// Price change tracking hook
export const usePriceAlerts = () => {
  const [alerts, setAlerts] = useState<Array<{
    id: string
    symbol: string
    condition: 'above' | 'below'
    price: number
    triggered: boolean
    createdAt: number
  }>>([])

  const addAlert = useCallback((symbol: string, condition: 'above' | 'below', price: number) => {
    const alert = {
      id: `alert_${Date.now()}`,
      symbol,
      condition,
      price,
      triggered: false,
      createdAt: Date.now()
    }
    
    setAlerts(prev => [...prev, alert])
    return alert.id
  }, [])

  const removeAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id))
  }, [])

  const checkAlerts = useCallback((marketData: MarketData[]) => {
    setAlerts(prev => prev.map(alert => {
      if (alert.triggered) return alert

      const symbolData = marketData.find(data => data.symbol === alert.symbol)
      if (!symbolData) return alert

      const shouldTrigger = 
        (alert.condition === 'above' && symbolData.price >= alert.price) ||
        (alert.condition === 'below' && symbolData.price <= alert.price)

      if (shouldTrigger) {
        // You could add notification logic here
        console.log(`Price alert triggered: ${alert.symbol} ${alert.condition} ${alert.price}`)
        return { ...alert, triggered: true }
      }

      return alert
    }))
  }, [])

  return {
    alerts,
    addAlert,
    removeAlert,
    checkAlerts
  }
}