import { useState, useCallback } from 'react'
import { withErrorHandling, createError, ErrorContext, useErrorHandler } from '@/lib/errorHandling'
import { supabase } from '@/integrations/supabase/client'
import { cache, CACHE_KEYS, CACHE_TTL, CACHE_TAGS } from '@/lib/cache'

export interface PortfolioHolding {
  id: string
  user_id: string
  agent_id: string
  total_amount: number
  average_cost: number
  total_invested: number
  unrealized_pnl: number
  last_updated: string
  agent?: any
}

export interface Transaction {
  id: string
  user_id: string
  agent_id: string
  type: 'buy' | 'sell'
  amount: number
  price: number
  total: number
  created_at: string
  agent?: any
}

export const usePortfolioData = (userId?: string) => {
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { captureError } = useErrorHandler()

  const fetchHoldings = useCallback(async () => {
    if (!userId) return []

    return withErrorHandling(async () => {
      setIsLoading(true)
      
      const cacheKey = CACHE_KEYS.USER_HOLDINGS(userId)
      const cached = cache.get<PortfolioHolding[]>(cacheKey)
      if (cached) {
        setHoldings(cached)
        setIsLoading(false)
        return cached
      }

      const { data, error } = await supabase
        .from('user_holdings')
        .select(`*, agent:agents(*)`)
        .eq('user_id', userId)

      if (error) {
        throw createError.database('Failed to fetch portfolio holdings', {
          component: 'usePortfolioData',
          action: 'fetchHoldings',
          userId
        })
      }

      const transformedData = (data || []).map((h: any) => ({
        ...h,
        average_buy_price: h.average_cost || 0,
        last_transaction_at: h.last_updated
      }))

      cache.set(cacheKey, transformedData, {
        ttl: CACHE_TTL.USER_PORTFOLIO,
        tags: [CACHE_TAGS.PORTFOLIO, CACHE_TAGS.USERS]
      })

      setHoldings(transformedData)
      return transformedData
    }, {
      component: 'usePortfolioData',
      action: 'fetchHoldings',
      userId
    }) || []
  }, [userId, captureError])

  return {
    holdings,
    isLoading,
    fetchHoldings,
    refetch: fetchHoldings
  }
}

export const usePortfolioTransactions = (userId?: string) => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { captureError } = useErrorHandler()

  const fetchTransactions = useCallback(async (page: number = 1, limit: number = 20) => {
    if (!userId) return []

    return withErrorHandling(async () => {
      setIsLoading(true)
      
      const cacheKey = CACHE_KEYS.USER_TRANSACTIONS(userId, page)
      const cached = cache.get<Transaction[]>(cacheKey)
      if (cached) {
        setTransactions(cached)
        setIsLoading(false)
        return cached
      }

      const { data, error } = await supabase
        .from('transactions')
        .select(`*, agent:agents(*)`)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

      if (error) {
        throw createError.database('Failed to fetch transactions', {
          component: 'usePortfolioTransactions',
          action: 'fetchTransactions',
          userId,
          additionalData: { page, limit }
        })
      }

      const transformedData = (data || []).map((t: any) => ({
        ...t,
        transaction_type: t.type
      }))

      cache.set(cacheKey, transformedData, {
        ttl: CACHE_TTL.USER_DATA,
        tags: [CACHE_TAGS.PORTFOLIO, CACHE_TAGS.USERS]
      })

      setTransactions(transformedData)
      return transformedData
    }, {
      component: 'usePortfolioTransactions',
      action: 'fetchTransactions',
      userId
    }) || []
  }, [userId, captureError])

  return {
    transactions,
    isLoading,
    fetchTransactions,
    refetch: () => fetchTransactions(1)
  }
}

export const usePortfolioStats = (holdings: PortfolioHolding[]) => {
  const stats = {
    totalValue: holdings.reduce((sum, h) => sum + (h.total_amount * (h.agent?.price || 0)), 0),
    holdingsCount: holdings.length,
    totalPnL: holdings.reduce((sum, h) => sum + h.unrealized_pnl, 0),
    totalInvested: holdings.reduce((sum, h) => sum + h.total_invested, 0),
    change24h: 0, // This would need to be calculated from price history
    bestPerformer: holdings.length > 0 ? 
      holdings.reduce((best, current) => 
        current.unrealized_pnl > best.unrealized_pnl ? current : best
      ) : null,
    worstPerformer: holdings.length > 0 ? 
      holdings.reduce((worst, current) => 
        current.unrealized_pnl < worst.unrealized_pnl ? current : worst
      ) : null
  }

  return {
    ...stats,
    pnlPercentage: stats.totalInvested > 0 ? (stats.totalPnL / stats.totalInvested) * 100 : 0,
    diversification: holdings.length > 0 ? 
      holdings.map(h => h.total_invested / stats.totalInvested) : []
  }
}