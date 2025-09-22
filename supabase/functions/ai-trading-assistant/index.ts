import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, userId, context } = await req.json();
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openaiApiKey) {
      throw new Error('OpenAI API key not found');
    }

    if (!query) {
      throw new Error('Query is required');
    }

    // Get user's portfolio data if userId is provided
    let portfolioContext = '';
    if (userId) {
      try {
        const { data: portfolio } = await supabase
          .from('portfolios')
          .select('*')
          .eq('user_id', userId);
        
        if (portfolio && portfolio.length > 0) {
          portfolioContext = `\nUser's Portfolio: ${JSON.stringify(portfolio)}`;
        }
      } catch (error) {
        console.warn('Could not fetch portfolio data:', error);
      }
    }

    // Get recent market data context
    let marketContext = '';
    try {
      const { data: agents } = await supabase
        .from('agents')
        .select('name, symbol, price, price_change_24h, market_cap')
        .order('market_cap', { ascending: false })
        .limit(10);
      
      if (agents && agents.length > 0) {
        marketContext = `\nTop AI Agents by Market Cap: ${JSON.stringify(agents)}`;
      }
    } catch (error) {
      console.warn('Could not fetch market data:', error);
    }

    const systemPrompt = `You are an expert AI Trading Assistant for HyperCognition, a platform specializing in AI agent trading. Your expertise includes:

1. Market Analysis: Analyze trends, price movements, and market sentiment for AI agents
2. Trading Strategies: Provide personalized trading recommendations based on user portfolios
3. Risk Management: Assess risk levels and suggest position sizing
4. Portfolio Optimization: Help users balance their AI agent holdings
5. Market Education: Explain trading concepts and market dynamics

Guidelines:
- Always prioritize user safety and responsible trading
- Mention when recommendations are speculative
- Encourage users to do their own research (DYOR)
- Never guarantee profits or specific price targets
- Focus on AI agent ecosystem and trading opportunities
- Be conversational but professional
- Use data-driven insights when available

${portfolioContext}
${marketContext}

Additional Context: ${context || 'No additional context provided'}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
        max_tokens: 1000,
        temperature: 0.7,
        stream: false
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to get AI response');
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Log the interaction for analytics
    try {
      await supabase
        .from('ai_assistant_logs')
        .insert({
          user_id: userId,
          query,
          response: aiResponse,
          context: context || null,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.warn('Could not log interaction:', error);
    }

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('AI Trading Assistant error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});