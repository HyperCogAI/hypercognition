import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SignalRequest {
  agentId: string
  userId: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const openaiKey = Deno.env.get('OPENAI_API_KEY')

    if (!openaiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get request body
    const { agentId, userId }: SignalRequest = await req.json()

    if (!agentId || !userId) {
      return new Response(
        JSON.stringify({ error: 'Agent ID and User ID are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Generating signal for agent ${agentId} by user ${userId}`)

    // Check rate limit
    const { data: rateLimitData, error: rateLimitError } = await supabase
      .rpc('check_signal_rate_limit', { user_id_param: userId })

    if (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError)
      throw rateLimitError
    }

    if (!rateLimitData.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          details: rateLimitData
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch agent data
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .single()

    if (agentError || !agent) {
      return new Response(
        JSON.stringify({ error: 'Agent not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch recent market data
    const { data: marketData } = await supabase
      .from('market_data_feeds')
      .select('*')
      .eq('agent_id', agentId)
      .order('timestamp', { ascending: false })
      .limit(100)

    // Generate AI-powered signal using OpenAI
    const prompt = `As an expert trading analyst, analyze the following data and generate a trading signal:

Agent: ${agent.name} (${agent.symbol})
Current Price: $${agent.price}
24h Change: ${agent.change_24h}%
24h Volume: $${agent.volume_24h}
Market Cap: $${agent.market_cap}
Category: ${agent.category}

Recent Market Data Points: ${marketData?.length || 0} data points available

Based on this information, provide:
1. Signal type (buy, sell, or hold)
2. Confidence level (0-100)
3. Entry price recommendation
4. Target price (if buy/sell)
5. Stop loss (if buy/sell)
6. Detailed reasoning (50-200 words)
7. Timeframe (e.g., 1h, 4h, 1d)

Respond in JSON format:
{
  "signalType": "buy|sell|hold",
  "confidence": 75,
  "entryPrice": 0.5,
  "targetPrice": 0.65,
  "stopLoss": 0.45,
  "reasoning": "detailed analysis...",
  "timeframe": "4h"
}`

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert cryptocurrency trading analyst. Provide accurate, data-driven trading signals with clear reasoning.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      }),
    })

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text()
      console.error('OpenAI API error:', error)
      throw new Error('Failed to generate signal from AI')
    }

    const aiResult = await openaiResponse.json()
    const signalData = JSON.parse(aiResult.choices[0].message.content)

    // Validate the generated signal
    const { data: validationResult, error: validationError } = await supabase
      .rpc('validate_trading_signal', {
        signal_type_param: signalData.signalType,
        confidence_param: signalData.confidence,
        entry_price_param: signalData.entryPrice,
        target_price_param: signalData.targetPrice || null,
        stop_loss_param: signalData.stopLoss || null,
        reasoning_param: signalData.reasoning
      })

    if (validationError) {
      console.error('Validation error:', validationError)
      throw validationError
    }

    if (!validationResult.valid) {
      return new Response(
        JSON.stringify({
          error: 'Signal validation failed',
          details: validationResult.errors
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create the trading signal
    const { data: newSignal, error: insertError } = await supabase
      .from('trading_signals')
      .insert({
        agent_id: agentId,
        user_id: userId,
        signal_type: signalData.signalType,
        confidence: signalData.confidence,
        entry_price: signalData.entryPrice,
        target_price: signalData.targetPrice || null,
        stop_loss: signalData.stopLoss || null,
        reasoning: validationResult.sanitized_reasoning,
        timeframe: signalData.timeframe || '1h',
        status: 'active',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      })
      .select()
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      throw insertError
    }

    console.log(`Successfully created signal ${newSignal.id}`)

    return new Response(
      JSON.stringify({
        success: true,
        signal: newSignal,
        remaining_signals: rateLimitData.remaining - 1
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error generating signal:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})