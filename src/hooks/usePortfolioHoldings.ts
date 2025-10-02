import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { portfolioService, PortfolioHolding, PortfolioTransaction } from '@/services/PortfolioService'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/hooks/use-toast'

export function usePortfolioHoldings() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Fetch holdings
  const { data: holdings = [], isLoading, error, refetch } = useQuery({
    queryKey: ['portfolio-holdings', user?.id],
    queryFn: () => {
      if (!user?.id) return []
      return portfolioService.getHoldings(user.id)
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  // Fetch transactions
  const { data: transactions = [] } = useQuery({
    queryKey: ['portfolio-transactions', user?.id],
    queryFn: () => {
      if (!user?.id) return []
      return portfolioService.getTransactions(user.id, 100)
    },
    enabled: !!user?.id,
  })

  // Fetch portfolio summary
  const { data: summary } = useQuery({
    queryKey: ['portfolio-summary', user?.id],
    queryFn: () => {
      if (!user?.id) return {
        totalValue: 0,
        totalInvested: 0,
        totalPnL: 0,
        totalPnLPercent: 0,
        realizedPnL: 0,
        unrealizedPnL: 0,
        holdingsCount: 0
      }
      return portfolioService.getPortfolioSummary(user.id)
    },
    enabled: !!user?.id,
    refetchInterval: 30000,
  })

  // Add holding mutation
  const addHoldingMutation = useMutation({
    mutationFn: (params: {
      assetId: string
      assetType: 'crypto' | 'agent'
      assetName: string
      assetSymbol: string
      quantity: number
      price: number
      fees?: number
      exchange?: string
      notes?: string
    }) => {
      if (!user?.id) throw new Error('User not authenticated')
      return portfolioService.addHolding({
        userId: user.id,
        ...params
      })
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['portfolio-holdings'] })
        queryClient.invalidateQueries({ queryKey: ['portfolio-summary'] })
        queryClient.invalidateQueries({ queryKey: ['portfolio-transactions'] })
        toast({
          title: 'Success',
          description: 'Asset added to portfolio',
        })
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to add to portfolio',
          variant: 'destructive'
        })
      }
    }
  })

  // Reduce holding mutation
  const reduceHoldingMutation = useMutation({
    mutationFn: (params: {
      assetId: string
      assetType: 'crypto' | 'agent'
      quantity: number
      price: number
      fees?: number
      exchange?: string
      notes?: string
    }) => {
      if (!user?.id) throw new Error('User not authenticated')
      return portfolioService.reduceHolding({
        userId: user.id,
        ...params
      })
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['portfolio-holdings'] })
        queryClient.invalidateQueries({ queryKey: ['portfolio-summary'] })
        queryClient.invalidateQueries({ queryKey: ['portfolio-transactions'] })
        toast({
          title: 'Success',
          description: 'Asset sold from portfolio',
        })
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to sell from portfolio',
          variant: 'destructive'
        })
      }
    }
  })

  // Update holdings values
  const updateValuesMatation = useMutation({
    mutationFn: (prices: Record<string, number>) => {
      if (!user?.id) throw new Error('User not authenticated')
      return portfolioService.updateHoldingsValue(user.id, prices)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-holdings'] })
      queryClient.invalidateQueries({ queryKey: ['portfolio-summary'] })
    }
  })

  return {
    holdings,
    transactions,
    summary,
    isLoading,
    error,
    addHolding: addHoldingMutation.mutate,
    reduceHolding: reduceHoldingMutation.mutate,
    updateValues: updateValuesMatation.mutate,
    refetch,
    isAddingHolding: addHoldingMutation.isPending,
    isReducingHolding: reduceHoldingMutation.isPending
  }
}
