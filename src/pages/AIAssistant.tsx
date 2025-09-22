import React from 'react'
import AITradingAssistant from '@/components/ai/AITradingAssistant'
import { SEOHead } from '@/components/seo/SEOHead'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

export function AIAssistantPage() {
  const { user } = useAuth()

  // Fetch user portfolio for context
  const { data: portfolio } = useQuery({
    queryKey: ['user-portfolio', user?.id],
    queryFn: async () => {
      if (!user?.id) return null

      const { data: holdings, error: holdingsError } = await supabase
        .from('user_holdings')
        .select(`
          *,
          agents (
            id,
            name,
            symbol,
            price,
            change_24h
          )
        `)
        .eq('user_id', user.id)

      if (holdingsError) throw holdingsError

      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (transactionsError) throw transactionsError

      return {
        holdings,
        recent_transactions: transactions,
        total_value: holdings?.reduce((sum, h) => sum + (h.total_amount * h.agents?.price || 0), 0) || 0
      }
    },
    enabled: !!user?.id
  })

  // Fetch current market data for context
  const { data: marketData } = useQuery({
    queryKey: ['market-overview'],
    queryFn: async () => {
      const { data: tickers, error } = await supabase
        .from('market_tickers')
        .select('*')
        .order('volume_24h', { ascending: false })
        .limit(10)

      if (error) throw error
      return tickers
    }
  })

  return (
    <>
      <SEOHead
        title="AI Trading Assistant - Intelligent Trading Insights"
        description="Get AI-powered trading recommendations, market analysis, and portfolio optimization insights for AI agent tokens."
        keywords="AI trading assistant, trading bot, market analysis, portfolio optimization, trading signals"
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">AI Trading Assistant</h1>
          <p className="text-muted-foreground">
            Get intelligent trading insights, market analysis, and portfolio optimization 
            recommendations powered by real-time market data and advanced AI.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <AITradingAssistant 
            portfolio={portfolio}
            marketData={marketData}
          />
        </div>
      </div>
    </>
  )
}