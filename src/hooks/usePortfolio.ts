import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'

export const usePortfolio = () => {
  const { user, isConnected } = useAuth()
  const [holdings, setHoldings] = useState([])
  const [transactions, setTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const portfolioStats = {
    totalValue: holdings.reduce((sum, h) => sum + (h.total_amount * (h.agent?.price || 0)), 0),
    holdingsCount: holdings.length,
    totalPnL: holdings.reduce((sum, h) => sum + h.unrealized_pnl, 0),
    totalInvested: holdings.reduce((sum, h) => sum + h.total_invested, 0),
    change24h: 0,
    bestPerformer: holdings.length > 0 ? holdings[0] : null
  }

  useEffect(() => {
    if (isConnected && user) {
      fetchPortfolioData()
    }
  }, [isConnected, user])

  const fetchPortfolioData = async () => {
    try {
      setIsLoading(true)
      
      const [holdingsRes, transactionsRes] = await Promise.all([
        supabase
          .from('user_holdings')
          .select(`*, agent:agents(*)`)
          .eq('user_id', user.id),
        supabase
          .from('transactions')
          .select(`*, agent:agents(*)`)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20)
      ])

      setHoldings(holdingsRes.data || [])
      setTransactions(transactionsRes.data || [])
    } catch (error) {
      console.error('Error fetching portfolio:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    holdings,
    transactions,
    portfolioStats,
    isLoading,
    refetch: fetchPortfolioData
  }
}