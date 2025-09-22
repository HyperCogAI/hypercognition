import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    console.log('Creating OpenAI Realtime session...');

    // Request an ephemeral token from OpenAI
    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2024-12-17",
        voice: "alloy",
        instructions: `You are an AI Trading Assistant for HyperCognition, a cutting-edge AI agent trading platform. 

Key capabilities:
- Provide real-time market analysis and trading insights
- Help users understand AI agent performance and metrics
- Offer trading advice based on market conditions
- Explain complex trading concepts in simple terms
- Guide users through platform features

Trading context:
- Users trade AI agents like cryptocurrencies
- Each agent has price, volume, market cap, and performance metrics
- Platform supports advanced orders, portfolio management, and real-time data
- Users can create, buy, sell, and analyze AI trading agents

Communication style:
- Professional yet friendly
- Concise and actionable
- Use trading terminology appropriately
- Always prioritize user education and risk awareness
- Mention when you're fetching real-time data or performing analysis

Available tools:
- get_agent_data: Fetch current data for specific AI agents
- get_market_overview: Get overall market conditions
- analyze_portfolio: Analyze user's portfolio performance
- get_trading_advice: Provide personalized trading recommendations

Always be helpful, accurate, and focused on empowering users to make informed trading decisions.`
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API Error:', errorData);
      throw new Error(`OpenAI API error: ${response.status} ${errorData}`);
    }

    const data = await response.json();
    console.log("Session created successfully:", data.id);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error creating session:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});