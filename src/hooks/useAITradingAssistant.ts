import { useState, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface TradingRecommendation {
  action: 'buy' | 'sell' | 'hold'
  agent_id: string
  agent_symbol: string
  confidence: number
  reasoning: string
  suggested_price?: number
  risk_level: 'low' | 'medium' | 'high'
}

interface MarketAnalysis {
  trend: 'bullish' | 'bearish' | 'neutral'
  sentiment: number
  volatility: number
  key_factors: string[]
  support_levels?: number[]
  resistance_levels?: number[]
}

interface AIResponse {
  message: string
  recommendations?: TradingRecommendation[]
  market_analysis?: MarketAnalysis
  portfolio_insights?: {
    total_value: number
    risk_score: number
    diversification_score: number
    suggestions: string[]
  }
  charts?: {
    price_prediction?: Array<{ timestamp: string; predicted_price: number }>
    sentiment_analysis?: Array<{ timestamp: string; sentiment: number }>
  }
}

export function useAITradingAssistant() {
  const [loading, setLoading] = useState(false)
  const [chatHistory, setChatHistory] = useState<Array<{
    type: 'user' | 'assistant'
    content: string
    timestamp: Date
    data?: any
  }>>([])
  const { toast } = useToast()

  const sendMessage = useCallback(async (message: string, context?: any) => {
    setLoading(true)
    
    try {
      // Add user message to history
      const userMessage = {
        type: 'user' as const,
        content: message,
        timestamp: new Date()
      }
      setChatHistory(prev => [...prev, userMessage])

      const { data, error } = await supabase.functions.invoke('ai-trading-assistant', {
        body: {
          message,
          context,
          history: chatHistory.slice(-10) // Send last 10 messages for context
        }
      })

      if (error) throw error

      const response: AIResponse = data
      
      // Add assistant response to history
      const assistantMessage = {
        type: 'assistant' as const,
        content: response.message,
        timestamp: new Date(),
        data: response
      }
      setChatHistory(prev => [...prev, assistantMessage])

      return response
    } catch (error) {
      console.error('AI Trading Assistant error:', error)
      toast({
        title: "AI Assistant Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      })
      throw error
    } finally {
      setLoading(false)
    }
  }, [chatHistory, toast])

  const clearHistory = useCallback(() => {
    setChatHistory([])
  }, [])

  const getMarketAnalysis = useCallback(async (agentIds: string[]) => {
    return sendMessage(`Analyze the current market conditions for these agents: ${agentIds.join(', ')}. Provide detailed insights on trends, sentiment, volatility, and trading opportunities with specific price targets.`)
  }, [sendMessage])

  const getPortfolioAdvice = useCallback(async (portfolio: any) => {
    return sendMessage(`Analyze my current portfolio and provide optimization suggestions with specific actions I should take.`, { portfolio })
  }, [sendMessage])

  const getTradingSignals = useCallback(async (agentId: string, timeframe: string = '1h') => {
    return sendMessage(`Generate trading signals for agent ${agentId} on ${timeframe} timeframe. Include entry/exit points and risk management.`)
  }, [sendMessage])

  const getRiskAssessment = useCallback(async (trades: any[]) => {
    return sendMessage(`Assess the risk of these potential trades and provide risk management recommendations.`, { trades })
  }, [sendMessage])

  const getMarketNews = useCallback(async () => {
    return sendMessage(`Provide a summary of current market news and how it might affect AI agent prices.`)
  }, [sendMessage])

  return {
    loading,
    chatHistory,
    sendMessage,
    clearHistory,
    getMarketAnalysis,
    getPortfolioAdvice,
    getTradingSignals,
    getRiskAssessment,
    getMarketNews
  }
}