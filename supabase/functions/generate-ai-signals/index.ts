import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SignalRequest {
  agentId: string
  timeframe: string
  modelId?: string
  strategyId?: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (!user) {
      throw new Error('Unauthorized')
    }

    const { agentId, timeframe, modelId, strategyId }: SignalRequest = await req.json()

    // Fetch agent data
    const { data: agent } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .single()

    if (!agent) {
      throw new Error('Agent not found')
    }

    // Fetch recent market data
    const { data: marketData } = await supabase
      .from('market_data_feeds')
      .select('*')
      .eq('agent_id', agentId)
      .order('timestamp', { ascending: false })
      .limit(100)

    // Calculate technical indicators
    const indicators = calculateTechnicalIndicators(marketData || [])

    // Generate signal using AI logic
    const signal = generateSignal(agent, indicators, timeframe)

    // Store signal
    const { data: newSignal, error: signalError } = await supabase
      .from('trading_signals')
      .insert({
        user_id: user.id,
        agent_id: agentId,
        signal_type: signal.type,
        confidence: signal.confidence,
        entry_price: signal.entryPrice,
        target_price: signal.targetPrice,
        stop_loss: signal.stopLoss,
        reasoning: signal.reasoning,
        timeframe: timeframe,
        ai_model_id: modelId,
        confidence_score: signal.confidence,
        technical_indicators: indicators,
        risk_level: signal.riskLevel,
        execution_status: 'pending',
        status: 'active'
      })
      .select()
      .single()

    if (signalError) {
      throw signalError
    }

    return new Response(
      JSON.stringify({
        success: true,
        signal: newSignal
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Signal generation error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function calculateTechnicalIndicators(data: any[]): any {
  if (data.length === 0) {
    return {
      rsi: 50,
      macd: 0,
      bollingerBands: { upper: 0, middle: 0, lower: 0 },
      volume: 0,
      sma20: 0,
      ema50: 0
    }
  }

  const prices = data.map(d => d.price).reverse()
  const volumes = data.map(d => d.volume || 0).reverse()

  // RSI calculation (simplified)
  const rsi = calculateRSI(prices, 14)

  // MACD calculation (simplified)
  const macd = calculateMACD(prices)

  // Bollinger Bands
  const sma20 = calculateSMA(prices, 20)
  const stdDev = calculateStdDev(prices.slice(-20))
  const bollingerBands = {
    upper: sma20 + (2 * stdDev),
    middle: sma20,
    lower: sma20 - (2 * stdDev)
  }

  return {
    rsi,
    macd,
    bollingerBands,
    volume: volumes[volumes.length - 1] || 0,
    sma20,
    ema50: calculateEMA(prices, 50)
  }
}

function calculateRSI(prices: number[], period: number): number {
  if (prices.length < period) return 50

  let gains = 0
  let losses = 0

  for (let i = prices.length - period; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1]
    if (change > 0) gains += change
    else losses += Math.abs(change)
  }

  const avgGain = gains / period
  const avgLoss = losses / period

  if (avgLoss === 0) return 100
  const rs = avgGain / avgLoss
  return 100 - (100 / (1 + rs))
}

function calculateMACD(prices: number[]): number {
  const ema12 = calculateEMA(prices, 12)
  const ema26 = calculateEMA(prices, 26)
  return ema12 - ema26
}

function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1]
  const sum = prices.slice(-period).reduce((a, b) => a + b, 0)
  return sum / period
}

function calculateEMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1]
  
  const multiplier = 2 / (period + 1)
  let ema = calculateSMA(prices.slice(0, period), period)

  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema
  }

  return ema
}

function calculateStdDev(prices: number[]): number {
  const mean = prices.reduce((a, b) => a + b, 0) / prices.length
  const squareDiffs = prices.map(p => Math.pow(p - mean, 2))
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / prices.length
  return Math.sqrt(avgSquareDiff)
}

function generateSignal(agent: any, indicators: any, timeframe: string): any {
  const { rsi, macd, bollingerBands } = indicators
  const currentPrice = agent.price

  let signalType: 'buy' | 'sell' | 'hold' = 'hold'
  let confidence = 50
  let reasoning = 'Neutral market conditions'
  let riskLevel: 'low' | 'medium' | 'high' | 'extreme' = 'medium'

  // Buy signals
  if (rsi < 30 && macd > 0 && currentPrice < bollingerBands.lower) {
    signalType = 'buy'
    confidence = 85 + Math.random() * 10
    reasoning = 'Strong buy signal: RSI oversold, MACD bullish, price below lower Bollinger Band'
    riskLevel = 'low'
  } else if (rsi < 40 && macd > 0) {
    signalType = 'buy'
    confidence = 70 + Math.random() * 10
    reasoning = 'Moderate buy signal: RSI approaching oversold, positive MACD momentum'
    riskLevel = 'medium'
  }
  
  // Sell signals
  else if (rsi > 70 && macd < 0 && currentPrice > bollingerBands.upper) {
    signalType = 'sell'
    confidence = 85 + Math.random() * 10
    reasoning = 'Strong sell signal: RSI overbought, MACD bearish, price above upper Bollinger Band'
    riskLevel = 'low'
  } else if (rsi > 60 && macd < 0) {
    signalType = 'sell'
    confidence = 70 + Math.random() * 10
    reasoning = 'Moderate sell signal: RSI approaching overbought, negative MACD momentum'
    riskLevel = 'medium'
  }

  const entryPrice = currentPrice
  const stopLoss = signalType === 'buy' 
    ? currentPrice * 0.95 
    : currentPrice * 1.05
  const targetPrice = signalType === 'buy'
    ? currentPrice * 1.15
    : currentPrice * 0.85

  return {
    type: signalType,
    confidence: Math.round(confidence),
    entryPrice,
    targetPrice: signalType === 'hold' ? null : targetPrice,
    stopLoss: signalType === 'hold' ? null : stopLoss,
    reasoning,
    riskLevel
  }
}
