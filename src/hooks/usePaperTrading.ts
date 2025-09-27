import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'

interface PaperTrade {
  id: string
  type: 'buy' | 'sell'
  symbol: string
  amount: number
  price: number
  timestamp: Date
  status: 'pending' | 'completed' | 'cancelled'
}

interface PaperBalance {
  [symbol: string]: number
}

export const usePaperTrading = () => {
  const [isEnabled, setIsEnabled] = useState(false)
  const [balance, setBalance] = useState<PaperBalance>({ USD: 10000 })
  const [trades, setTrades] = useState<PaperTrade[]>([])
  const [totalPnL, setTotalPnL] = useState(0)
  const { toast } = useToast()

  // Load paper trading state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('paperTradingState')
    if (savedState) {
      const { isEnabled: enabled, balance: savedBalance, trades: savedTrades } = JSON.parse(savedState)
      setIsEnabled(enabled)
      setBalance(savedBalance)
      setTrades(savedTrades.map((trade: any) => ({ ...trade, timestamp: new Date(trade.timestamp) })))
    }
  }, [])

  // Save paper trading state to localStorage
  useEffect(() => {
    const state = {
      isEnabled,
      balance,
      trades: trades.map(trade => ({ ...trade, timestamp: trade.timestamp.toISOString() }))
    }
    localStorage.setItem('paperTradingState', JSON.stringify(state))
  }, [isEnabled, balance, trades])

  const togglePaperTrading = (enabled: boolean) => {
    setIsEnabled(enabled)
    if (enabled) {
      toast({
        title: "Paper Trading Enabled",
        description: "All trades will be simulated with virtual funds.",
      })
    } else {
      toast({
        title: "Paper Trading Disabled",
        description: "Switching back to live trading mode.",
        variant: "destructive"
      })
    }
  }

  const executePaperTrade = async (type: 'buy' | 'sell', symbol: string, amount: number, price: number) => {
    const cost = amount * price
    const tradeId = `paper_${Date.now()}_${crypto.getRandomValues(new Uint32Array(1))[0].toString(36)}`

    if (type === 'buy') {
      if (balance.USD < cost) {
        toast({
          title: "Insufficient Funds",
          description: "Not enough USD balance for this paper trade.",
          variant: "destructive"
        })
        return false
      }
      
      setBalance(prev => ({
        ...prev,
        USD: prev.USD - cost,
        [symbol]: (prev[symbol] || 0) + amount
      }))
    } else {
      if ((balance[symbol] || 0) < amount) {
        toast({
          title: "Insufficient Assets",
          description: `Not enough ${symbol} balance for this paper trade.`,
          variant: "destructive"
        })
        return false
      }
      
      setBalance(prev => ({
        ...prev,
        USD: prev.USD + cost,
        [symbol]: (prev[symbol] || 0) - amount
      }))
    }

    const newTrade: PaperTrade = {
      id: tradeId,
      type,
      symbol,
      amount,
      price,
      timestamp: new Date(),
      status: 'completed'
    }

    setTrades(prev => [newTrade, ...prev])
    
    toast({
      title: "Paper Trade Executed",
      description: `${type.toUpperCase()} ${amount} ${symbol} at $${price.toFixed(2)}`,
    })

    return true
  }

  const resetPaperAccount = () => {
    setBalance({ USD: 10000 })
    setTrades([])
    setTotalPnL(0)
    toast({
      title: "Paper Account Reset",
      description: "Starting fresh with $10,000 virtual USD.",
    })
  }

  const getPortfolioValue = (currentPrices: { [symbol: string]: number }) => {
    let totalValue = balance.USD
    
    Object.entries(balance).forEach(([symbol, amount]) => {
      if (symbol !== 'USD' && currentPrices[symbol]) {
        totalValue += amount * currentPrices[symbol]
      }
    })
    
    return totalValue
  }

  return {
    isEnabled,
    balance,
    trades,
    totalPnL,
    togglePaperTrading,
    executePaperTrade,
    resetPaperAccount,
    getPortfolioValue
  }
}