import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const supabase = createClient(
  'https://xdinlkmqmjlrmunsjswf.supabase.co',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are a crypto alpha detection AI monitoring Twitter KOLs for early gem signals.

DETECTION CRITERIA:

✅ STRONG GEM SIGNALS (70-100% confidence):
- New token launches with Ethereum (0x...) or Solana contract addresses
- Insider mentions of low-cap tokens (<$50M) not on major CEXs
- Unusual bullish sentiment from typically neutral/bearish KOLs
- Specific NFT drops with mint details (time, price, supply)
- Airdrop announcements with clear eligibility steps
- Protocol launches with TVL/usage data
- Phrases: "aping in", "early", "gem", "100x", "hidden alpha", "undervalued"

⚠️ MEDIUM SIGNALS (40-69% confidence):
- Token mentions without contracts but with strong conviction
- General bullish sentiment with some specifics
- Retweets with added alpha/context
- Chart analysis with entry points

❌ IGNORE (0-39% confidence):
- Generic market commentary ("BTC looking good")
- Retweets without added value
- Scam patterns ("guaranteed 10x", "send 1 ETH get 2 back")
- Vague predictions without actionable info
- Already widely known tokens (BTC, ETH, major alts)

EXTRACT STRUCTURED DATA:
- Token tickers (validate: 2-10 chars, uppercase)
- Contract addresses (validate: 0x[40 chars] for ETH, base58 for Solana)
- Links: Website, Telegram, Discord, DEX, CMC
- Time-sensitive details: Mint time, snapshot date, deadline
- Numerical targets: Price, supply, TVL

RETURN JSON:
{
  "is_gem_signal": true/false,
  "confidence_score": 0-100 (integer),
  "gem_type": "token" | "nft" | "protocol" | "airdrop" | "alpha" | null,
  "extracted_tokens": [
    {
      "ticker": "XYZ",
      "name": "XYZ Protocol" (if mentioned),
      "contract": "0x..." or null,
      "chain": "ethereum" | "solana" | "base" | null
    }
  ],
  "extracted_links": {
    "website": "https://...",
    "telegram": "https://t.me/...",
    "dex": "https://dexscreener.com/...",
    ...
  },
  "key_details": [
    "Token launching on Uniswap tomorrow",
    "Team is doxxed",
    "Low tax (1%)",
    ...
  ],
  "reasoning": "Brief 1-2 sentence explanation of why this is/isn't a gem signal and confidence level"
}`;

async function analyzeWithAI(tweetText: string): Promise<any> {
  try {
    // Call Lovable AI for analysis
    const response = await fetch('https://api.lovable.app/v1/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_AI_API_KEY')}`,
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `ANALYZE THIS TWEET:\n${tweetText}` },
        ],
        model: 'gemini-2.0-flash',
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      console.error('AI API error:', await response.text());
      return null;
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error('AI analysis error:', error);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tweets, kol_username, kol_account_id, watchlist_id, user_id } = await req.json();

    console.log(`Analyzing ${tweets.length} tweets from @${kol_username}`);

    const signals = [];

    for (const tweet of tweets) {
      // Check if tweet already processed
      const { data: existing } = await supabase
        .from('twitter_kol_signals')
        .select('id')
        .eq('tweet_id', tweet.id)
        .single();

      if (existing) {
        console.log(`Tweet ${tweet.id} already processed, skipping`);
        continue;
      }

      // Analyze tweet with AI
      const analysis = await analyzeWithAI(tweet.text);

      if (!analysis || !analysis.is_gem_signal) {
        console.log(`Tweet ${tweet.id} is not a gem signal`);
        continue;
      }

      // Create signal
      const { data: signal, error: signalError } = await supabase
        .from('twitter_kol_signals')
        .insert({
          kol_account_id,
          watchlist_id,
          user_id,
          tweet_id: tweet.id,
          tweet_text: tweet.text,
          tweet_url: `https://twitter.com/${kol_username}/status/${tweet.id}`,
          posted_at: tweet.created_at,
          confidence_score: analysis.confidence_score,
          gem_type: analysis.gem_type,
          extracted_data: {
            tokens: analysis.extracted_tokens || [],
            links: analysis.extracted_links || {},
            details: analysis.key_details || [],
          },
          ai_analysis: analysis.reasoning,
          status: 'new',
        })
        .select()
        .single();

      if (signalError) {
        console.error('Error creating signal:', signalError);
      } else {
        console.log(`Created signal ${signal.id} with ${analysis.confidence_score}% confidence`);
        signals.push(signal);

        // Auto-trigger ticker analysis if tokens were extracted
        if (analysis.extracted_tokens && analysis.extracted_tokens.length > 0) {
          const primaryTicker = analysis.extracted_tokens[0].ticker;
          console.log(`Auto-triggering ticker analysis for $${primaryTicker}`);
          
          try {
            const analysisResponse = await supabase.functions.invoke('analyze-signal-ticker', {
              body: {
                signal_id: signal.id,
                ticker: primaryTicker,
                force_refresh: false,
              },
            });
            
            if (analysisResponse.error) {
              console.error('Ticker analysis failed:', analysisResponse.error);
              
              // CRITICAL FIX: Log error to database
              await supabase.from('watchlist_sync_errors').insert({
                watchlist_id: watchlist_id,
                user_id: user_id,
                error_type: 'ticker_analysis_error',
                error_message: analysisResponse.error.message || 'Ticker analysis failed',
                function_name: 'analyze-signal-ticker',
                metadata: {
                  signal_id: signal.id,
                  ticker: primaryTicker,
                  timestamp: new Date().toISOString(),
                },
              });
            } else {
              console.log('Ticker analysis completed successfully');
            }
          } catch (error: any) {
            console.error('Failed to invoke ticker analysis:', error);
            
            // Log error
            await supabase.from('watchlist_sync_errors').insert({
              watchlist_id: watchlist_id,
              user_id: user_id,
              error_type: 'ticker_analysis_invoke_error',
              error_message: error.message || 'Failed to invoke ticker analysis',
              function_name: 'analyze-signal-tracker',
              metadata: {
                signal_id: signal.id,
                ticker: primaryTicker,
                timestamp: new Date().toISOString(),
              },
            });
          }
        }

        // Trigger alert dispatcher for high-confidence signals
        if (analysis.confidence_score >= 70) {
          await supabase.functions.invoke('twitter-alert-dispatcher', {
            body: { signal },
          });
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, signals_created: signals.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Analyzer error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
