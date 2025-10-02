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

    const { agentId, priceHistory } = await req.json()

    console.log(`[TrendDetector] Analyzing trends for agent ${agentId}`)

    if (!priceHistory || priceHistory.length < 50) {
      throw new Error('Insufficient price history for trend analysis')
    }

    // Calculate technical indicators
    const rsi = calculateRSI(priceHistory, 14)
    const macd = calculateMACD(priceHistory)
    const movingAvg50 = calculateSMA(priceHistory, 50)
    const movingAvg200 = priceHistory.length >= 200 ? calculateSMA(priceHistory, 200) : null

    // Determine trend direction
    const currentPrice = priceHistory[priceHistory.length - 1].price
    const trendDirection = determineTrendDirection(currentPrice, movingAvg50, movingAvg200, macd)

    // Calculate trend strength
    const trendStrength = calculateTrendStrength(rsi, macd, priceHistory)

    // Detect support and resistance levels
    const supportLevels = detectSupportLevels(priceHistory)
    const resistanceLevels = detectResistanceLevels(priceHistory)

    // Detect patterns
    const patterns = detectPatterns(priceHistory)

    // Volume analysis
    const volumeTrend = analyzeVolumeTrend(priceHistory)

    // Price prediction (simple linear regression)
    const prediction = predictPrice(priceHistory, 24) // 24h ahead

    // Calculate trend duration
    const trendDuration = calculateTrendDuration(priceHistory, trendDirection)

    // Insert trend analysis
    const { data: insertedData, error } = await supabaseClient
      .from('trend_analysis')
      .insert({
        agent_id: agentId,
        trend_direction: trendDirection,
        trend_strength: trendStrength,
        trend_duration_hours: trendDuration,
        support_levels: JSON.stringify(supportLevels),
        resistance_levels: JSON.stringify(resistanceLevels),
        detected_patterns: JSON.stringify(patterns),
        pattern_confidence: patterns.length > 0 ? 75 : 0,
        rsi,
        macd: macd.macd,
        moving_avg_50: movingAvg50,
        moving_avg_200: movingAvg200,
        volume_trend: volumeTrend,
        predicted_price_24h: prediction.price,
        predicted_direction: prediction.direction,
        confidence_score: prediction.confidence,
        analysis_timestamp: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('[TrendDetector] Error inserting data:', error)
      throw error
    }

    console.log(`[TrendDetector] Trend analysis complete for agent ${agentId}`)

    return new Response(JSON.stringify({
      success: true,
      trend_analysis: insertedData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('[TrendDetector] Error:', error)
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

function calculateRSI(prices: any[], period: number = 14): number {
  if (prices.length < period + 1) return 50

  let gains = 0
  let losses = 0

  for (let i = prices.length - period; i < prices.length; i++) {
    const change = prices[i].price - prices[i - 1].price
    if (change > 0) gains += change
    else losses += Math.abs(change)
  }

  const avgGain = gains / period
  const avgLoss = losses / period

  if (avgLoss === 0) return 100
  const rs = avgGain / avgLoss
  return 100 - (100 / (1 + rs))
}

function calculateMACD(prices: any[]): { macd: number; signal: number; histogram: number } {
  const ema12 = calculateEMA(prices, 12)
  const ema26 = calculateEMA(prices, 26)
  const macd = ema12 - ema26

  return { macd, signal: 0, histogram: 0 }
}

function calculateEMA(prices: any[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1].price

  const multiplier = 2 / (period + 1)
  let ema = prices[prices.length - period].price

  for (let i = prices.length - period + 1; i < prices.length; i++) {
    ema = (prices[i].price - ema) * multiplier + ema
  }

  return ema
}

function calculateSMA(prices: any[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1].price

  const sum = prices.slice(-period).reduce((acc, p) => acc + p.price, 0)
  return sum / period
}

function determineTrendDirection(current: number, ma50: number, ma200: number | null, macd: any): string {
  if (ma200 && current > ma200 && ma50 > ma200 && macd.macd > 0) return 'bullish'
  if (ma200 && current < ma200 && ma50 < ma200 && macd.macd < 0) return 'bearish'
  if (Math.abs(current - ma50) / ma50 < 0.02) return 'consolidating'
  return 'neutral'
}

function calculateTrendStrength(rsi: number, macd: any, prices: any[]): number {
  let strength = 50

  // RSI contribution
  if (rsi > 70) strength += 25
  else if (rsi < 30) strength += 25
  else strength += Math.abs(rsi - 50) / 2

  // MACD contribution
  strength += Math.min(25, Math.abs(macd.macd) * 10)

  return Math.min(100, strength)
}

function detectSupportLevels(prices: any[]): number[] {
  const levels: number[] = []
  const recent = prices.slice(-100)

  // Find local minima
  for (let i = 2; i < recent.length - 2; i++) {
    if (recent[i].price < recent[i - 1].price &&
        recent[i].price < recent[i - 2].price &&
        recent[i].price < recent[i + 1].price &&
        recent[i].price < recent[i + 2].price) {
      levels.push(recent[i].price)
    }
  }

  return levels.slice(-3) // Return top 3 support levels
}

function detectResistanceLevels(prices: any[]): number[] {
  const levels: number[] = []
  const recent = prices.slice(-100)

  // Find local maxima
  for (let i = 2; i < recent.length - 2; i++) {
    if (recent[i].price > recent[i - 1].price &&
        recent[i].price > recent[i - 2].price &&
        recent[i].price > recent[i + 1].price &&
        recent[i].price > recent[i + 2].price) {
      levels.push(recent[i].price)
    }
  }

  return levels.slice(-3) // Return top 3 resistance levels
}

function detectPatterns(prices: any[]): string[] {
  const patterns: string[] = []
  const recent = prices.slice(-50)

  // Simple pattern detection
  const trend = recent[recent.length - 1].price - recent[0].price

  if (trend > recent[0].price * 0.1) patterns.push('ascending_triangle')
  if (trend < -recent[0].price * 0.1) patterns.push('descending_triangle')

  return patterns
}

function analyzeVolumeTrend(prices: any[]): string {
  const recent = prices.slice(-20)
  const avgVolume = recent.reduce((sum, p) => sum + (p.volume || 0), 0) / recent.length
  const currentVolume = recent[recent.length - 1].volume || 0

  if (currentVolume > avgVolume * 1.5) return 'increasing'
  if (currentVolume < avgVolume * 0.5) return 'decreasing'
  return 'stable'
}

function predictPrice(prices: any[], hoursAhead: number): { price: number; direction: string; confidence: number } {
  const recent = prices.slice(-100)
  const currentPrice = recent[recent.length - 1].price

  // Simple linear regression
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0
  const n = recent.length

  for (let i = 0; i < n; i++) {
    sumX += i
    sumY += recent[i].price
    sumXY += i * recent[i].price
    sumX2 += i * i
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  const predictedPrice = slope * (n + hoursAhead) + intercept
  const direction = predictedPrice > currentPrice ? 'up' : 'down'
  const confidence = Math.min(85, 50 + Math.abs(slope) * 1000)

  return { price: predictedPrice, direction, confidence }
}

function calculateTrendDuration(prices: any[], direction: string): number {
  let duration = 0
  const isUptrend = direction === 'bullish'

  for (let i = prices.length - 1; i > 0; i--) {
    const change = prices[i].price - prices[i - 1].price
    if ((isUptrend && change > 0) || (!isUptrend && change < 0)) {
      duration++
    } else {
      break
    }
  }

  return duration
}
