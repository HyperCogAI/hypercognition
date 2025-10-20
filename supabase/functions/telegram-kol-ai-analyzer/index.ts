import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are an expert cryptocurrency analyst detecting high-quality "gem" signals from Telegram messages.

STRICT CRITERIA FOR GEM SIGNALS:
1. Must explicitly mention a specific token/project (not vague predictions)
2. Should have actionable information (price targets, entry points, contract addresses)
3. Clear positive sentiment or recommendation
4. Credible analysis or reasoning (not pure hype)

GEM TYPES:
- token: New or existing cryptocurrency token opportunities
- nft: NFT project launches or opportunities  
- protocol: DeFi protocols, dApps, or infrastructure
- airdrop: Upcoming airdrops or claim opportunities
- alpha: Early insider information or private alpha

CONFIDENCE SCORING (0-100):
- 90-100: Extremely specific with contract addresses, charts, detailed analysis
- 70-89: Strong signal with clear token mention and reasoning
- 50-69: Moderate signal, some details but lacking specifics
- Below 50: Weak signal, too vague or generic

EXTRACT:
- Token tickers (e.g., $SOL, $ETH, $PEPE)
- Contract addresses (Ethereum 0x..., Solana base58)
- Links (website, Telegram, Discord, DEX, CMC)
- Key details (market cap, holders, liquidity, catalysts)

REJECT:
- Pure market commentary without specific tokens
- Educational content
- General crypto news
- Scam/rug pull warnings
- Vague predictions without actionable info`;

async function analyzeWithAI(messageText: string): Promise<any> {
  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `ANALYZE THIS TELEGRAM MESSAGE:\n${messageText}` },
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'report_gem_signal',
            description: 'Report gem signal analysis results',
            parameters: {
              type: 'object',
              properties: {
                is_gem_signal: { type: 'boolean' },
                confidence_score: { type: 'integer', minimum: 0, maximum: 100 },
                gem_type: { 
                  type: 'string', 
                  enum: ['token', 'nft', 'protocol', 'airdrop', 'alpha'] 
                },
                extracted_tokens: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      ticker: { type: 'string' },
                      name: { type: 'string' },
                      contract: { type: 'string' },
                      chain: { 
                        type: 'string', 
                        enum: ['ethereum', 'solana', 'base'] 
                      }
                    },
                    required: ['ticker']
                  }
                },
                extracted_links: { 
                  type: 'object',
                  properties: {
                    website: { type: 'string' },
                    telegram: { type: 'string' },
                    discord: { type: 'string' },
                    dex: { type: 'string' },
                    cmc: { type: 'string' }
                  }
                },
                key_details: { 
                  type: 'array', 
                  items: { type: 'string' } 
                },
                reasoning: { type: 'string' }
              },
              required: ['is_gem_signal', 'confidence_score', 'reasoning'],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'report_gem_signal' } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      return null;
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const result = JSON.parse(toolCall.function.arguments);
      console.log('AI analysis result:', result);
      return result;
    }
    
    console.error('No tool call in response:', JSON.stringify(data));
    return null;
  } catch (error) {
    console.error('AI analysis error:', error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, channel_id, watchlist_id, user_id, channel_title } = await req.json();
    
    console.log(`Analyzing message from ${channel_title}`);
    
    const analysis = await analyzeWithAI(message.text);
    
    if (!analysis || !analysis.is_gem_signal) {
      console.log('Not a gem signal, skipping');
      return new Response(
        JSON.stringify({ success: true, signalCreated: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    const { data: signal, error } = await supabase
      .from('telegram_kol_signals')
      .insert({
        channel_id,
        watchlist_id,
        user_id,
        message_id: message.message_id,
        message_text: message.text,
        message_url: message.message_url,
        posted_at: new Date(message.date * 1000).toISOString(),
        has_photo: message.has_photo,
        has_video: message.has_video,
        has_document: message.has_document,
        media_urls: JSON.stringify([]),
        forward_from_chat_id: message.forward_from?.chat?.id?.toString(),
        forward_from_chat_title: message.forward_from?.chat?.title,
        forward_date: message.forward_from?.date ? new Date(message.forward_from.date * 1000).toISOString() : null,
        confidence_score: analysis.confidence_score,
        gem_type: analysis.gem_type,
        extracted_data: {
          tokens: analysis.extracted_tokens || [],
          links: analysis.extracted_links || {},
          key_details: analysis.key_details || []
        },
        ai_reasoning: analysis.reasoning,
        status: 'new'
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error inserting signal:', error);
      throw error;
    }
    
    console.log(`Created signal with ${analysis.confidence_score}% confidence`);
    
    return new Response(
      JSON.stringify({ success: true, signalCreated: true, signalId: signal.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Analyzer error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
