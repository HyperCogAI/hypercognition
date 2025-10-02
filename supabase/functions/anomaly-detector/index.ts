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

    const { agentId, currentData, historicalData } = await req.json()

    console.log(`[AnomalyDetector] Detecting anomalies for agent ${agentId}`)

    const anomalies: any[] = []

    // Price spike detection
    const priceAnomaly = detectPriceAnomaly(currentData, historicalData)
    if (priceAnomaly) anomalies.push(priceAnomaly)

    // Volume spike detection
    const volumeAnomaly = detectVolumeAnomaly(currentData, historicalData)
    if (volumeAnomaly) anomalies.push(volumeAnomaly)

    // Sentiment shift detection
    const sentimentAnomaly = detectSentimentAnomaly(currentData, historicalData)
    if (sentimentAnomaly) anomalies.push(sentimentAnomaly)

    // Liquidity drain detection
    const liquidityAnomaly = detectLiquidityAnomaly(currentData, historicalData)
    if (liquidityAnomaly) anomalies.push(liquidityAnomaly)

    // Insert anomalies into database
    for (const anomaly of anomalies) {
      const { error } = await supabaseClient
        .from('anomaly_alerts')
        .insert({
          agent_id: agentId,
          anomaly_type: anomaly.type,
          severity: anomaly.severity,
          description: anomaly.description,
          baseline_value: anomaly.baseline,
          current_value: anomaly.current,
          deviation_percent: anomaly.deviation,
          detection_algorithm: 'statistical_threshold',
          confidence_score: anomaly.confidence,
          status: 'new',
          detected_at: new Date().toISOString()
        })

      if (error) {
        console.error('[AnomalyDetector] Error inserting anomaly:', error)
      }
    }

    console.log(`[AnomalyDetector] Detected ${anomalies.length} anomalies for agent ${agentId}`)

    return new Response(JSON.stringify({
      success: true,
      anomalies_detected: anomalies.length,
      anomalies
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('[AnomalyDetector] Error:', error)
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

function detectPriceAnomaly(current: any, historical: any[]): any | null {
  if (!historical || historical.length < 10) return null

  const avgPrice = historical.reduce((sum, h) => sum + h.price, 0) / historical.length
  const stdDev = calculateStdDev(historical.map(h => h.price))

  const deviation = ((current.price - avgPrice) / avgPrice) * 100
  const zScore = (current.price - avgPrice) / stdDev

  // Detect spike if price is more than 3 standard deviations from mean
  if (Math.abs(zScore) > 3) {
    return {
      type: 'price_spike',
      severity: Math.abs(deviation) > 50 ? 'critical' : Math.abs(deviation) > 30 ? 'high' : 'medium',
      description: `Price ${deviation > 0 ? 'surged' : 'dropped'} by ${Math.abs(deviation).toFixed(2)}% from baseline`,
      baseline: avgPrice,
      current: current.price,
      deviation: Math.abs(deviation),
      confidence: Math.min(95, 50 + Math.abs(zScore) * 10)
    }
  }

  return null
}

function detectVolumeAnomaly(current: any, historical: any[]): any | null {
  if (!historical || historical.length < 10) return null

  const avgVolume = historical.reduce((sum, h) => sum + (h.volume || 0), 0) / historical.length
  const currentVolume = current.volume || 0

  if (avgVolume === 0) return null

  const deviation = ((currentVolume - avgVolume) / avgVolume) * 100

  // Detect spike if volume is more than 200% of average
  if (deviation > 200) {
    return {
      type: 'volume_spike',
      severity: deviation > 500 ? 'high' : 'medium',
      description: `Trading volume increased by ${deviation.toFixed(2)}% from baseline`,
      baseline: avgVolume,
      current: currentVolume,
      deviation,
      confidence: Math.min(90, 50 + deviation / 10)
    }
  }

  return null
}

function detectSentimentAnomaly(current: any, historical: any[]): any | null {
  if (!current.sentiment || !historical || historical.length < 5) return null

  const avgSentiment = historical
    .filter(h => h.sentiment !== undefined)
    .reduce((sum, h) => sum + h.sentiment, 0) / historical.filter(h => h.sentiment !== undefined).length

  const sentimentChange = current.sentiment - avgSentiment

  // Detect shift if sentiment changed by more than 30 points
  if (Math.abs(sentimentChange) > 30) {
    return {
      type: 'sentiment_shift',
      severity: Math.abs(sentimentChange) > 50 ? 'high' : 'medium',
      description: `Sentiment ${sentimentChange > 0 ? 'improved' : 'deteriorated'} significantly`,
      baseline: avgSentiment,
      current: current.sentiment,
      deviation: Math.abs(sentimentChange),
      confidence: Math.min(85, 50 + Math.abs(sentimentChange) / 2)
    }
  }

  return null
}

function detectLiquidityAnomaly(current: any, historical: any[]): any | null {
  if (!current.liquidity || !historical || historical.length < 10) return null

  const avgLiquidity = historical
    .filter(h => h.liquidity !== undefined)
    .reduce((sum, h) => sum + h.liquidity, 0) / historical.filter(h => h.liquidity !== undefined).length

  if (avgLiquidity === 0) return null

  const deviation = ((current.liquidity - avgLiquidity) / avgLiquidity) * 100

  // Detect drain if liquidity dropped by more than 30%
  if (deviation < -30) {
    return {
      type: 'liquidity_drain',
      severity: deviation < -60 ? 'critical' : 'high',
      description: `Liquidity decreased by ${Math.abs(deviation).toFixed(2)}%`,
      baseline: avgLiquidity,
      current: current.liquidity,
      deviation: Math.abs(deviation),
      confidence: Math.min(90, 50 + Math.abs(deviation) / 2)
    }
  }

  return null
}

function calculateStdDev(values: number[]): number {
  const avg = values.reduce((sum, val) => sum + val, 0) / values.length
  const squaredDiffs = values.map(val => Math.pow(val - avg, 2))
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length
  return Math.sqrt(variance)
}
