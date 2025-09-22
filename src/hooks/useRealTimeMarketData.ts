import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import type { Database } from '@/integrations/supabase/types'

type MarketDataFeed = Database['public']['Tables']['market_data_feeds']['Row']
type OrderBookEntry = Database['public']['Tables']['order_book']['Row']
type MarketTicker = Database['public']['Tables']['market_tickers']['Row']
type MarketTrade = Database['public']['Tables']['market_trades']['Row']

export interface OrderBookData {
  bids: OrderBookEntry[]
  asks: OrderBookEntry[]
  spread: number
  midPrice: number
}

export interface MarketDataState {
  tickers: Map<string, MarketTicker>
  orderBooks: Map<string, OrderBookData>
  recentTrades: Map<string, MarketTrade[]>
  isConnected: boolean
  lastUpdate: Date | null
}

export function useRealTimeMarketData(agentIds?: string[]) {
  const [marketData, setMarketData] = useState<MarketDataState>({
    tickers: new Map(),
    orderBooks: new Map(),
    recentTrades: new Map(),
    isConnected: false,
    lastUpdate: null
  })
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Fetch initial market data
  const fetchInitialData = useCallback(async () => {
    try {
      const agentFilter = agentIds ? agentIds : undefined

      // Fetch market tickers
      let tickersQuery = supabase.from('market_tickers').select('*')
      if (agentFilter) {
        tickersQuery = tickersQuery.in('agent_id', agentFilter)
      }
      const { data: tickersData, error: tickersError } = await tickersQuery

      if (tickersError) throw tickersError

      // Fetch order book data
      let orderBookQuery = supabase
        .from('order_book')
        .select('*')
        .order('price', { ascending: false })
        .limit(20)
      
      if (agentFilter) {
        orderBookQuery = orderBookQuery.in('agent_id', agentFilter)
      }
      const { data: orderBookData, error: orderBookError } = await orderBookQuery

      if (orderBookError) throw orderBookError

      // Fetch recent trades
      let tradesQuery = supabase
        .from('market_trades')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50)
      
      if (agentFilter) {
        tradesQuery = tradesQuery.in('agent_id', agentFilter)
      }
      const { data: tradesData, error: tradesError } = await tradesQuery

      if (tradesError) throw tradesError

      // Process data
      const tickersMap = new Map<string, MarketTicker>()
      tickersData?.forEach(ticker => {
        tickersMap.set(ticker.agent_id, ticker)
      })

      const orderBooksMap = new Map<string, OrderBookData>()
      const tradesMap = new Map<string, MarketTrade[]>()

      // Group order book data by agent
      const orderBooksByAgent = new Map<string, OrderBookEntry[]>()
      orderBookData?.forEach(entry => {
        if (!orderBooksByAgent.has(entry.agent_id)) {
          orderBooksByAgent.set(entry.agent_id, [])
        }
        orderBooksByAgent.get(entry.agent_id)!.push(entry)
      })

      // Process order books
      orderBooksByAgent.forEach((entries, agentId) => {
        const bids = entries.filter(e => e.side === 'buy').sort((a, b) => Number(b.price) - Number(a.price))
        const asks = entries.filter(e => e.side === 'sell').sort((a, b) => Number(a.price) - Number(b.price))
        
        const bestBid = bids[0]?.price || 0
        const bestAsk = asks[0]?.price || 0
        const midPrice = (Number(bestBid) + Number(bestAsk)) / 2
        const spread = Number(bestAsk) - Number(bestBid)

        orderBooksMap.set(agentId, {
          bids,
          asks,
          spread,
          midPrice
        })
      })

      // Group trades by agent
      const tradesByAgent = new Map<string, MarketTrade[]>()
      tradesData?.forEach(trade => {
        if (!tradesByAgent.has(trade.agent_id)) {
          tradesByAgent.set(trade.agent_id, [])
        }
        tradesByAgent.get(trade.agent_id)!.push(trade)
      })

      setMarketData({
        tickers: tickersMap,
        orderBooks: orderBooksMap,
        recentTrades: tradesByAgent,
        isConnected: true,
        lastUpdate: new Date()
      })

    } catch (error) {
      console.error('Error fetching initial market data:', error)
      toast({
        title: "Error",
        description: "Failed to load market data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [agentIds, toast])

  // Real-time subscription setup
  useEffect(() => {
    fetchInitialData()

    // Subscribe to market tickers updates
    const tickersChannel = supabase
      .channel('market-tickers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'market_tickers'
        },
        (payload) => {
          console.log('Market ticker update:', payload)
          
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const ticker = payload.new as MarketTicker
            setMarketData(prev => ({
              ...prev,
              tickers: new Map(prev.tickers.set(ticker.agent_id, ticker)),
              lastUpdate: new Date()
            }))
          }
        }
      )
      .subscribe()

    // Subscribe to order book updates
    const orderBookChannel = supabase
      .channel('order-book-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_book'
        },
        () => {
          // Refetch order book data for real-time updates
          fetchInitialData()
        }
      )
      .subscribe()

    // Subscribe to market trades
    const tradesChannel = supabase
      .channel('market-trades-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'market_trades'
        },
        (payload) => {
          console.log('New trade:', payload)
          
          const trade = payload.new as MarketTrade
          setMarketData(prev => {
            const agentTrades = prev.recentTrades.get(trade.agent_id) || []
            const updatedTrades = [trade, ...agentTrades].slice(0, 50) // Keep last 50 trades
            
            return {
              ...prev,
              recentTrades: new Map(prev.recentTrades.set(trade.agent_id, updatedTrades)),
              lastUpdate: new Date()
            }
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(tickersChannel)
      supabase.removeChannel(orderBookChannel)
      supabase.removeChannel(tradesChannel)
    }
  }, [fetchInitialData])

  // Get data for specific agent
  const getAgentData = useCallback((agentId: string) => {
    return {
      ticker: marketData.tickers.get(agentId),
      orderBook: marketData.orderBooks.get(agentId),
      recentTrades: marketData.recentTrades.get(agentId) || []
    }
  }, [marketData])

  return {
    marketData,
    loading,
    getAgentData,
    refresh: fetchInitialData
  }
}