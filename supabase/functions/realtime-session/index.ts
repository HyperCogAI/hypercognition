import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SessionConfig {
  modalities: string[]
  instructions: string
  voice: string
  input_audio_format: string
  output_audio_format: string
  turn_detection?: {
    type: string
    threshold?: number
    prefix_padding_ms?: number
    silence_duration_ms?: number
  }
  tools?: Array<{
    type: string
    name: string
    description: string
    parameters: object
  }>
  tool_choice?: string
  temperature?: number
  max_response_output_tokens?: number | string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    
    if (!openaiApiKey) {
      console.error('OpenAI API key not found')
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Creating realtime session...')

    // Enhanced session configuration for trading assistant
    const sessionConfig: SessionConfig = {
      modalities: ["text", "audio"],
      instructions: `You are an expert AI Trading Assistant for HyperCognition, an AI agent trading platform. 

Your role is to:
- Provide intelligent trading advice and market analysis
- Help users understand AI agent investments and market trends
- Offer portfolio optimization suggestions
- Explain trading strategies and risk management
- Answer questions about the platform and its features
- Maintain a professional yet friendly tone

Key capabilities:
- Real-time market data analysis
- AI agent performance evaluation  
- Risk assessment and portfolio diversification advice
- Trading signal interpretation
- Educational content about DeFi and AI agent trading

Guidelines:
- Be concise but thorough in your responses
- Use clear, accessible language for complex trading concepts
- Always consider risk management in recommendations
- Provide specific, actionable insights when possible
- Ask clarifying questions when needed for better advice
- Stay focused on trading and platform-related topics

Respond in a natural, conversational tone suitable for voice interaction.`,
      voice: "alloy",
      input_audio_format: "pcm16",
      output_audio_format: "pcm16",
      turn_detection: {
        type: "server_vad",
        threshold: 0.5,
        prefix_padding_ms: 300,
        silence_duration_ms: 500
      },
      tools: [
        {
          type: "function",
          name: "get_market_data",
          description: "Get current market data for AI agents including price, volume, and trends",
          parameters: {
            type: "object",
            properties: {
              agent_symbols: {
                type: "array",
                items: { type: "string" },
                description: "Array of agent symbols to get data for"
              },
              timeframe: {
                type: "string",
                enum: ["1h", "4h", "1d", "1w"],
                description: "Timeframe for market data",
                default: "1d"
              }
            }
          }
        },
        {
          type: "function", 
          name: "analyze_portfolio",
          description: "Analyze a user's portfolio for optimization opportunities and risk assessment",
          parameters: {
            type: "object",
            properties: {
              holdings: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    agent_id: { type: "string" },
                    amount: { type: "number" },
                    value: { type: "number" }
                  }
                },
                description: "Current portfolio holdings"
              }
            },
            required: ["holdings"]
          }
        },
        {
          type: "function",
          name: "get_trading_signals",
          description: "Generate trading signals and recommendations for specific AI agents",
          parameters: {
            type: "object", 
            properties: {
              agent_id: {
                type: "string",
                description: "ID of the AI agent to analyze"
              },
              risk_tolerance: {
                type: "string",
                enum: ["low", "medium", "high"],
                description: "User's risk tolerance level",
                default: "medium"
              }
            },
            required: ["agent_id"]
          }
        }
      ],
      tool_choice: "auto",
      temperature: 0.7,
      max_response_output_tokens: "inf"
    }

    console.log('Session config:', sessionConfig)

    // Create ephemeral session with OpenAI
    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sessionConfig)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI API error:', response.status, errorText)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create session', 
          details: errorText,
          status: response.status 
        }),
        { 
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const sessionData = await response.json()
    console.log('Session created successfully:', sessionData.id)

    return new Response(
      JSON.stringify(sessionData),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error creating realtime session:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})