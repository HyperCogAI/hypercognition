import { useState, useMemo } from 'react'
import { mockMarkets, mockUserPositions, mockRecentTrades } from '@/data/mockPredictionMarkets'
import { MarketCategory, PredictionMarket } from '@/types/predictionMarket'

export const usePredictionMarkets = (category?: MarketCategory) => {
  const [markets] = useState(mockMarkets)
  const [userPositions] = useState(mockUserPositions)
  const [recentTrades] = useState(mockRecentTrades)

  const filteredMarkets = useMemo(() => {
    if (!category || category === 'ai-agents') {
      return markets
    }
    return markets.filter(m => m.category === category)
  }, [markets, category])

  const totalStats = useMemo(() => {
    return {
      totalMarkets: markets.length,
      totalVolume: markets.reduce((sum, m) => sum + m.totalVolume, 0),
      activeTraders: new Set(recentTrades.map(t => t.userAddress)).size,
    }
  }, [markets, recentTrades])

  return {
    markets: filteredMarkets,
    userPositions,
    recentTrades,
    totalStats,
  }
}

export const useMarketDetails = (marketId: string) => {
  const market = mockMarkets.find(m => m.id === marketId)
  const trades = mockRecentTrades.filter(t => t.marketId === marketId)
  const userPosition = mockUserPositions.find(p => p.marketId === marketId)

  return {
    market,
    trades,
    userPosition,
  }
}
