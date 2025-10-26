export type MarketStatus = 'open' | 'resolving' | 'resolved' | 'cancelled'
export type MarketCategory = 'ai-agents' | 'crypto' | 'competitions' | 'events'
export type OutcomeType = 'binary' | 'multi'

export interface Outcome {
  id: string
  label: string
  shares: number
  price: number
}

export interface PredictionMarket {
  id: string
  question: string
  description: string
  category: MarketCategory
  status: MarketStatus
  outcomeType: OutcomeType
  outcomes: Outcome[]
  totalLiquidity: number
  totalVolume: number
  resolutionDate: Date
  createdAt: Date
  creatorAddress: string
  oracleSource?: string
  imageUrl?: string
}

export interface UserPosition {
  id: string
  marketId: string
  outcomeId: string
  shares: number
  averagePrice: number
  currentValue: number
  pnl: number
  pnlPercentage: number
}

export interface MarketTrade {
  id: string
  marketId: string
  outcomeId: string
  type: 'buy' | 'sell'
  shares: number
  price: number
  totalCost: number
  userAddress: string
  timestamp: Date
}

export interface MarketComment {
  id: string
  marketId: string
  userAddress: string
  userName?: string
  content: string
  timestamp: Date
  likes: number
}
