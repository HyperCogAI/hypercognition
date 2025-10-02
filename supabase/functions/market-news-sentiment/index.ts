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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Market news function called')
    
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY')
    
    if (!perplexityApiKey) {
      console.error('Perplexity API key not found in environment')
      return new Response(
        JSON.stringify({ 
          error: 'Perplexity API key not configured',
          message: 'Please configure the PERPLEXITY_API_KEY in Supabase Edge Function secrets'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const requestBody = await req.json()
    const { action, ...requestData } = requestBody
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

    // Call Perplexity API with better error handling
    console.log('Calling Perplexity API...')
    response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: `You are a professional market analyst specializing in cryptocurrency, AI agents, and DeFi. 
            
            For news requests: Provide structured, factual market analysis with key insights, price impacts, and actionable information.
            For sentiment analysis: Provide clear sentiment classification with confidence scores and reasoning.
            
            Always format responses as JSON when possible with appropriate fields for easy parsing.
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

    console.log('Perplexity API response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Perplexity API error:', response.status, errorText)
      
      // Return fallback data if API fails
      const fallbackResult = {
        action,
        content: `Market analysis temporarily unavailable. Based on general market trends, the ${action === 'get_market_news' ? 'cryptocurrency and AI agent markets continue to evolve with increasing institutional interest and technological developments.' : 'market sentiment remains mixed with both opportunities and challenges ahead.'}`,
        related_questions: [
          "What are the latest developments in AI agent trading?",
          "How is the DeFi market performing today?",
          "What factors are driving cryptocurrency prices?"
        ],
        query_used: query,
        timestamp: new Date().toISOString(),
        sources_searched: searchDomains,
        recency: recencyFilter,
        fallback: true
      }
      
      return new Response(
        JSON.stringify(fallbackResult),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const data = await response.json()
    console.log('Perplexity response received successfully')

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
    
    // Return fallback data instead of error
    const fallbackResult = {
      action: 'fallback',
      content: 'Market analysis service is temporarily unavailable. Here are some general market insights: The cryptocurrency and AI agent trading markets continue to show growth potential with increasing adoption and technological advances. Please check back later for real-time analysis.',
      related_questions: [
        "What are the current trends in AI agent trading?",
        "How is the cryptocurrency market performing?",
        "What should I know about DeFi developments?"
      ],
      query_used: 'fallback',
      timestamp: new Date().toISOString(),
      sources_searched: ['fallback'],
      recency: 'day',
      fallback: true,
      error_message: error instanceof Error ? error.message : 'Unknown error'
    }
    
    return new Response(
      JSON.stringify(fallbackResult),
      {
        status: 200, // Return 200 to show fallback content rather than error
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})