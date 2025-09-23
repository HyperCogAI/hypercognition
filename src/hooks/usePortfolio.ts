import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { usePortfolioData, usePortfolioTransactions, usePortfolioStats } from '@/hooks/usePortfolioData'

export const usePortfolio = () => {
  const { user, isConnected } = useAuth()
  
  // Use split hooks for better modularity
  const { holdings, isLoading: holdingsLoading, fetchHoldings } = usePortfolioData(user?.id)
  const { transactions, isLoading: transactionsLoading, fetchTransactions } = usePortfolioTransactions(user?.id)
  const portfolioStats = usePortfolioStats(holdings)

  const isLoading = holdingsLoading || transactionsLoading

  const refetchAll = async () => {
    if (isConnected && user) {
      await Promise.all([
        fetchHoldings(),
        fetchTransactions()
      ])
    }
  }

  return {
    holdings,
    transactions,
    portfolioStats,
    isLoading,
    refetch: refetchAll
  }
}