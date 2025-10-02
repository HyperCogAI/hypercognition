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

      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;
      
      // Format context for AI
      let contextString = '';
      if (context) {
        if (context.selectedAgent) contextString += `Selected Agent: ${context.selectedAgent}. `;
        if (context.portfolio) {
          contextString += `Portfolio Value: $${context.portfolio.total_value?.toFixed(2) || 0}. `;
          contextString += `Holdings: ${context.portfolio.holdings?.map((h: any) => 
            `${h.agent_symbol}: ${h.amount} units`).join(', ') || 'None'}. `;
        }
      }

      const messages = [
        ...chatHistory.slice(-10).map(msg => ({
          role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.content
        })),
        { role: 'user' as const, content: message }
      ];

      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages,
          context: contextString,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          toast({
            title: 'Rate limit exceeded',
            description: 'Please wait before sending another message.',
            variant: 'destructive',
          });
          setChatHistory(prev => prev.slice(0, -1)); // Remove user message
          return;
        }
        throw new Error('Failed to get response');
      }

      if (!response.body) throw new Error('No response body');

      // Streaming response handling
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      let textBuffer = '';
      let streamDone = false;

      // Add initial empty assistant message
      setChatHistory(prev => [...prev, {
        type: 'assistant' as const,
        content: '',
        timestamp: new Date()
      }]);

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setChatHistory(prev => {
                const newMessages = [...prev];
                if (newMessages[newMessages.length - 1]?.type === 'assistant') {
                  newMessages[newMessages.length - 1] = {
                    type: 'assistant',
                    content: assistantContent,
                    timestamp: new Date()
                  };
                }
                return newMessages;
              });
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Log to database
      const { data: { user } } = await supabase.auth.getUser();
      if (user && assistantContent) {
        await supabase.from('ai_assistant_logs').insert({
          user_id: user.id,
          query: message,
          response: assistantContent,
          context: contextString || null,
        });
      }

      return { message: assistantContent } as AIResponse;
    } catch (error) {
      console.error('AI Trading Assistant error:', error)
      toast({
        title: "AI Assistant Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      })
      // Remove empty assistant message on error
      setChatHistory(prev => {
        const filtered = prev.filter((msg, idx) => 
          !(idx === prev.length - 1 && msg.type === 'assistant' && !msg.content)
        );
        return filtered;
      });
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