import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // Get the authorization header and user
    const authHeader = req.headers.get('Authorization')
    let userId = null
    
    if (authHeader) {
      const { data: { user } } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''))
      userId = user?.id
    }

    const { message, context, history } = await req.json()

    console.log('AI Trading Assistant Request:', { message, context, historyLength: history?.length })

    // Get real market data for context
    const { data: agents } = await supabaseClient
      .from('agents')
      .select('*')
      .order('market_cap', { ascending: false })
      .limit(10)

    const { data: marketData } = await supabaseClient
      .from('market_data_feeds')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(50)

    const { data: marketTickers } = await supabaseClient
      .from('market_tickers')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(20)

    // Prepare context for AI
    const aiContext = {
      user_query: message,
      market_data: marketData?.slice(0, 10) || [],
      top_agents: agents || [],
      market_tickers: marketTickers || [],
      user_context: context,
      conversation_history: history?.slice(-5) || []
    }

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert AI trading assistant for an AI agent trading platform. You provide intelligent trading advice, market analysis, and portfolio optimization recommendations.

CONTEXT:
- Platform trades AI agents (tokens) with real-time market data
- You have access to current market data, prices, and trading patterns
- Users can buy/sell AI agent tokens and manage portfolios
- Focus on actionable insights with specific price targets and risk assessments

RESPONSE FORMAT:
Always respond with a JSON object containing:
{
  "message": "Main response message (markdown supported)",
  "recommendations": [
    {
      "action": "buy|sell|hold",
      "agent_id": "agent_id",
      "agent_symbol": "SYMBOL", 
      "confidence": 0-100,
      "reasoning": "Explanation",
      "suggested_price": 0.1234,
      "risk_level": "low|medium|high"
    }
  ],
  "market_analysis": {
    "trend": "bullish|bearish|neutral",
    "sentiment": 0-100,
    "volatility": 0-100,
    "key_factors": ["factor1", "factor2"],
    "support_levels": [0.1, 0.2],
    "resistance_levels": [0.3, 0.4]
  },
  "portfolio_insights": {
    "total_value": 1000.0,
    "risk_score": 1-10,
    "diversification_score": 1-10,
    "suggestions": ["suggestion1", "suggestion2"]
  }
}

CURRENT MARKET DATA:
${JSON.stringify(aiContext, null, 2)}

Provide specific, actionable advice based on real market conditions. Be concise but thorough.`
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    })

    if (!openaiResponse.ok) {
      console.error('OpenAI API error:', await openaiResponse.text())
      throw new Error('Failed to get AI response')
    }

    const openaiData = await openaiResponse.json()
    const aiResponseText = openaiData.choices[0].message.content

    console.log('OpenAI raw response:', aiResponseText)

    // Parse AI response
    let aiResponse
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiResponseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        aiResponse = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      // Fallback response
      aiResponse = {
        message: aiResponseText || "I'm analyzing the market data to provide you with insights. Could you please be more specific about what you'd like to know?",
        recommendations: [],
        market_analysis: {
          trend: 'neutral',
          sentiment: 50,
          volatility: 30,
          key_factors: ['Market data analysis in progress'],
        }
      }
    }

    // Enhance recommendations with real agent data
    if (aiResponse.recommendations) {
      aiResponse.recommendations = aiResponse.recommendations.map((rec: any) => {
        const agent = agents?.find(a => a.symbol === rec.agent_symbol || a.id === rec.agent_id)
        if (agent) {
          return {
            ...rec,
            agent_id: agent.id,
            agent_symbol: agent.symbol,
            suggested_price: rec.suggested_price || agent.price
          }
        }
        return rec
      })
    }

    // Log the interaction
    if (userId) {
      const { error: logError } = await supabaseClient
        .from('ai_assistant_logs')
        .insert({
          user_id: userId,
          query: message,
          response: aiResponse.message,
          context: JSON.stringify(context)
        });
      
      if (logError) {
        console.error('Failed to log interaction:', logError);
      }
    }

    console.log('Final AI response:', aiResponse)

    return new Response(
      JSON.stringify(aiResponse),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('AI Trading Assistant error:', error)
    
    // Return a helpful fallback response
    const fallbackResponse = {
      message: "I'm experiencing some technical difficulties at the moment. However, I can still help you with general trading advice. What specific aspect of trading or market analysis would you like to discuss?",
      recommendations: [],
      market_analysis: {
        trend: 'neutral',
        sentiment: 50,
        volatility: 25,
        key_factors: ['Service temporarily unavailable', 'Please try again in a moment']
      }
    }

    return new Response(
      JSON.stringify(fallbackResponse),
      { 
        status: 200, // Return 200 to show fallback content
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    )
  }
})