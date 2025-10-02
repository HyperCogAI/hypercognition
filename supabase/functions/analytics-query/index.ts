import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { query, params, useCache = true, cacheTtl = 300 } = await req.json()

    console.log(`[AnalyticsQuery] Processing query: ${query}`)

    // Generate cache key
    const cacheKey = `analytics_${query}_${JSON.stringify(params)}`

    // Try to get from cache
    if (useCache) {
      const { data: cached } = await supabaseClient
        .rpc('get_or_compute_analytics', { key: cacheKey, cache_ttl: cacheTtl })

      if (cached) {
        console.log(`[AnalyticsQuery] Cache hit for ${cacheKey}`)
        return new Response(JSON.stringify({
          success: true,
          data: cached,
          from_cache: true
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    // Execute query based on type
    let result: any

    switch (query) {
      case 'top_performers':
        result = await getTopPerformers(supabaseClient, params)
        break
      case 'trending_agents':
        result = await getTrendingAgents(supabaseClient, params)
        break
      case 'market_overview':
        result = await getMarketOverview(supabaseClient, params)
        break
      case 'sentiment_trends':
        result = await getSentimentTrends(supabaseClient, params)
        break
      case 'volume_leaders':
        result = await getVolumeLeaders(supabaseClient, params)
        break
      case 'anomaly_alerts':
        result = await getAnomalyAlerts(supabaseClient, params)
        break
      default:
        throw new Error(`Unknown query type: ${query}`)
    }

    // Cache the result
    if (useCache && result) {
      await supabaseClient
        .rpc('update_analytics_cache', {
          key: cacheKey,
          cache_type_param: query,
          data_param: result,
          ttl_seconds: cacheTtl
        })
    }

    console.log(`[AnalyticsQuery] Query complete: ${query}`)

    return new Response(JSON.stringify({
      success: true,
      data: result,
      from_cache: false
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('[AnalyticsQuery] Error:', error)
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function getTopPerformers(client: any, params: any) {
  const { period = '24h', limit = 10 } = params

  const { data, error } = await client
    .from('trading_analytics')
    .select('agent_id, total_pnl, win_rate, total_volume')
    .eq('period', period)
    .order('total_pnl', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

async function getTrendingAgents(client: any, params: any) {
  const { period = '24h', limit = 10 } = params

  const { data, error } = await client
    .from('social_sentiment_data')
    .select('agent_id, velocity_score, viral_score, mentions_count')
    .eq('period', period)
    .order('velocity_score', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

async function getMarketOverview(client: any, params: any) {
  const { period = '24h' } = params

  const { data: volumeData } = await client
    .from('trading_analytics')
    .select('total_volume')
    .eq('period', period)

  const { data: sentimentData } = await client
    .from('social_sentiment_data')
    .select('sentiment_score')
    .eq('period', period)

  const totalVolume = volumeData?.reduce((sum, d) => sum + (d.total_volume || 0), 0) || 0
  const avgSentiment = sentimentData?.reduce((sum, d) => sum + (d.sentiment_score || 0), 0) / (sentimentData?.length || 1)

  return {
    total_volume: totalVolume,
    avg_sentiment: avgSentiment,
    active_agents: volumeData?.length || 0,
    period
  }
}

async function getSentimentTrends(client: any, params: any) {
  const { agentId, period = '24h' } = params

  const { data, error } = await client
    .from('social_sentiment_data')
    .select('timestamp, sentiment_score, platform')
    .eq('agent_id', agentId)
    .eq('period', period)
    .order('timestamp', { ascending: true })

  if (error) throw error
  return data
}

async function getVolumeLeaders(client: any, params: any) {
  const { period = '24h', limit = 10 } = params

  const { data, error } = await client
    .from('trading_analytics')
    .select('agent_id, total_volume, total_trades, unique_traders')
    .eq('period', period)
    .order('total_volume', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

async function getAnomalyAlerts(client: any, params: any) {
  const { limit = 20 } = params

  const { data, error } = await client
    .from('anomaly_alerts')
    .select('*')
    .in('status', ['new', 'acknowledged'])
    .order('detected_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}
