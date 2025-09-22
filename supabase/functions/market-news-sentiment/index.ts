import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NewsRequest {
  query?: string
  category?: 'general' | 'defi' | 'ai' | 'crypto' | 'trading'
  timeframe?: 'hour' | 'day' | 'week' | 'month'
  agent_symbols?: string[]
}

interface SentimentAnalysisRequest {
  text: string
  context?: 'trading' | 'market' | 'general'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY')
    
    if (!perplexityApiKey) {
      console.error('Perplexity API key not found')
      return new Response(
        JSON.stringify({ error: 'Perplexity API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const { action, ...requestData } = await req.json()
    console.log('Market news request:', { action, requestData })

    let response
    let query = ''
    let searchDomains = ['perplexity.ai']
    let recencyFilter = 'day'

    switch (action) {
      case 'get_market_news':
        const newsReq = requestData as NewsRequest
        
        // Build search query based on category and agent symbols
        if (newsReq.category === 'ai') {
          query = 'AI agent trading artificial intelligence tokens latest news developments'
        } else if (newsReq.category === 'defi') {
          query = 'DeFi decentralized finance latest news trading protocols'
        } else if (newsReq.category === 'crypto') {
          query = 'cryptocurrency market news bitcoin ethereum trading'
        } else if (newsReq.agent_symbols && newsReq.agent_symbols.length > 0) {
          query = `${newsReq.agent_symbols.join(' ')} AI agent token trading news market analysis`
        } else {
          query = newsReq.query || 'cryptocurrency AI agent trading market news analysis'
        }

        recencyFilter = newsReq.timeframe || 'day'
        searchDomains = ['coindesk.com', 'cointelegraph.com', 'decrypt.co', 'theblock.co', 'bloomberg.com']
        break

      case 'analyze_sentiment':
        const sentimentReq = requestData as SentimentAnalysisRequest
        query = `Analyze the sentiment of this text in the context of ${sentimentReq.context || 'trading'}: "${sentimentReq.text}". Provide sentiment score (positive/negative/neutral) and key emotional indicators.`
        break

      case 'get_trending_topics':
        query = 'trending topics in cryptocurrency AI agents DeFi trading markets today'
        searchDomains = ['twitter.com', 'reddit.com', 'coindesk.com', 'cointelegraph.com']
        break

      case 'market_sentiment_analysis':
        query = 'current market sentiment analysis cryptocurrency AI agents DeFi fear greed index'
        searchDomains = ['alternative.me', 'coinmarketcap.com', 'coinglass.com']
        break

      default:
        throw new Error('Invalid action specified')
    }

    console.log('Perplexity query:', query)

    // Call Perplexity API
    response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          {
            role: 'system',
            content: `You are a professional market analyst specializing in cryptocurrency, AI agents, and DeFi. 
            
            For news requests: Provide structured, factual market analysis with key insights, price impacts, and actionable information.
            For sentiment analysis: Provide clear sentiment classification with confidence scores and reasoning.
            
            Always format responses as JSON with appropriate fields for easy parsing.
            Be precise, objective, and focus on trading-relevant information.`
          },
          {
            role: 'user',
            content: query
          }
        ],
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 2000,
        return_images: false,
        return_related_questions: true,
        search_domain_filter: searchDomains,
        search_recency_filter: recencyFilter,
        frequency_penalty: 1,
        presence_penalty: 0
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Perplexity API error:', response.status, errorText)
      throw new Error(`Perplexity API error: ${response.status}`)
    }

    const data = await response.json()
    console.log('Perplexity response received')

    const result = {
      action,
      content: data.choices[0].message.content,
      related_questions: data.related_questions || [],
      query_used: query,
      timestamp: new Date().toISOString(),
      sources_searched: searchDomains,
      recency: recencyFilter
    }

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error in market news function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch market news',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})