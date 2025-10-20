import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { createHmac } from 'node:crypto';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TwitterCredentials {
  user_id: string;
  api_key: string;
  api_secret: string;
  access_token: string;
  access_token_secret: string;
}

interface KOLMention {
  username: string;
  yaps_all: number;
  yaps_24h?: number;
  yaps_7d?: number;
  tier: string;
  tweet_count: number;
}

interface AnalysisResult {
  success: boolean;
  analysis?: {
    ticker: string;
    kols_mentioning: KOLMention[];
    total_kols: number;
    total_influence: number;
    average_influence: number;
    confidence_multiplier: number;
    original_score: number;
    enhanced_score: number;
    top_tier_kols: number;
    mid_tier_kols: number;
    emerging_kols: number;
  };
  error?: string;
}

function getInfluenceTier(yaps: number): string {
  if (yaps >= 10000) return 'legendary';
  if (yaps >= 5000) return 'elite';
  if (yaps >= 1000) return 'prominent';
  if (yaps >= 100) return 'rising';
  return 'emerging';
}

function calculateConfidenceMultiplier(
  topTierCount: number,
  midTierCount: number,
  emergingCount: number
): number {
  let multiplier = 1.0;
  multiplier += topTierCount * 0.3;  // +0.3 for each top-tier KOL (Yaps >= 5000)
  multiplier += midTierCount * 0.15; // +0.15 for each mid-tier KOL (1000-5000 Yaps)
  multiplier += emergingCount * 0.05; // +0.05 for each emerging KOL (<1000 Yaps)
  
  return Math.min(multiplier, 3.0); // Cap at 3.0x
}

function generateOAuthSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string
): string {
  const signatureBaseString = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(
    Object.entries(params)
      .sort()
      .map(([k, v]) => `${k}=${v}`)
      .join('&')
  )}`;
  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;
  const hmacSha1 = createHmac('sha1', signingKey);
  return hmacSha1.update(signatureBaseString).digest('base64');
}

function generateOAuthHeader(method: string, url: string, creds: TwitterCredentials): string {
  const oauthParams = {
    oauth_consumer_key: creds.api_key,
    oauth_nonce: Math.random().toString(36).substring(2),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: creds.access_token,
    oauth_version: '1.0',
  };

  const signature = generateOAuthSignature(
    method,
    url,
    oauthParams,
    creds.api_secret,
    creds.access_token_secret
  );

  const signedOAuthParams = { ...oauthParams, oauth_signature: signature };
  const entries = Object.entries(signedOAuthParams).sort((a, b) => a[0].localeCompare(b[0]));

  return 'OAuth ' + entries.map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`).join(', ');
}

async function searchTickerOnTwitter(
  ticker: string,
  kolUsernames: string[],
  creds: TwitterCredentials,
  supabase: any
): Promise<KOLMention[]> {
  const mentions: KOLMention[] = [];
  
  console.log(`Searching Twitter for $${ticker} mentions by ${kolUsernames.length} KOLs`);
  
  for (const username of kolUsernames) {
    try {
      const searchQuery = `$${ticker} from:${username}`;
      const baseUrl = 'https://api.x.com/2/tweets/search/recent';
      const url = `${baseUrl}?query=${encodeURIComponent(searchQuery)}&max_results=10`;
      
      const oauthHeader = generateOAuthHeader('GET', baseUrl, creds);
      
      const response = await fetch(url, {
        headers: { Authorization: oauthHeader }
      });
      
      // CRITICAL FIX: Parse and update rate limit from response headers
      const rateLimitRemaining = response.headers.get('x-rate-limit-remaining');
      const rateLimitReset = response.headers.get('x-rate-limit-reset');
      
      if (rateLimitRemaining && rateLimitReset) {
        await supabase
          .from('twitter_credentials')
          .update({
            rate_limit_remaining: parseInt(rateLimitRemaining),
            rate_limit_reset_at: new Date(parseInt(rateLimitReset) * 1000).toISOString(),
          })
          .eq('user_id', creds.user_id);
      }
      
      if (response.ok) {
        const data = await response.json();
        const tweetCount = data.meta?.result_count || 0;
        
        if (tweetCount > 0) {
          // Fetch Kaito score for this KOL
          const { data: kaitoScore } = await supabase
            .from('kaito_attention_scores')
            .select('yaps_all, yaps_24h, yaps_7d')
            .eq('twitter_username', username)
            .single();
          
          const yaps = kaitoScore?.yaps_all || 0;
          
          mentions.push({
            username,
            yaps_all: yaps,
            yaps_24h: kaitoScore?.yaps_24h,
            yaps_7d: kaitoScore?.yaps_7d,
            tier: getInfluenceTier(yaps),
            tweet_count: tweetCount,
          });
          
          console.log(`Found ${tweetCount} tweets from @${username} (${yaps} Yaps)`);
        }
      } else {
        console.error(`Twitter API error for @${username}:`, await response.text());
      }
      
      // Rate limiting: wait 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`Error searching tweets for @${username}:`, error);
    }
  }
  
  return mentions;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { signal_id, ticker, force_refresh = false } = await req.json();

    if (!signal_id || !ticker) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing signal_id or ticker' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Analyzing ticker: ${ticker} for signal: ${signal_id}`);

    // Check if analysis already exists and is recent (less than 6 hours old)
    if (!force_refresh) {
      const { data: existingAnalysis } = await supabase
        .from('signal_ticker_analysis')
        .select('*')
        .eq('signal_id', signal_id)
        .eq('ticker', ticker)
        .single();

      if (existingAnalysis) {
        const analysisAge = Date.now() - new Date(existingAnalysis.analysis_timestamp).getTime();
        const sixHoursInMs = 6 * 60 * 60 * 1000;
        
        if (analysisAge < sixHoursInMs) {
          console.log('Using cached analysis (less than 6 hours old)');
          return new Response(
            JSON.stringify({
              success: true,
              cached: true,
              analysis: {
                ticker: existingAnalysis.ticker,
                kols_mentioning: existingAnalysis.kols_mentioning,
                total_kols: existingAnalysis.total_kols_count,
                total_influence: existingAnalysis.total_influence_score,
                average_influence: existingAnalysis.average_influence_score,
                confidence_multiplier: existingAnalysis.confidence_multiplier,
                enhanced_score: existingAnalysis.final_confidence_score,
                top_tier_kols: existingAnalysis.top_tier_kols,
                mid_tier_kols: existingAnalysis.mid_tier_kols,
                emerging_kols: existingAnalysis.emerging_kols,
              }
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    // Get the signal to fetch original confidence score
    const { data: signal, error: signalError } = await supabase
      .from('twitter_kol_signals')
      .select('confidence_score, user_id')
      .eq('id', signal_id)
      .single();

    if (signalError || !signal) {
      return new Response(
        JSON.stringify({ success: false, error: 'Signal not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get all KOL accounts from user's watchlists
    const { data: watchlistKOLs } = await supabase
      .from('twitter_kol_accounts')
      .select('twitter_username, watchlist_id')
      .eq('is_active', true);

    if (!watchlistKOLs || watchlistKOLs.length === 0) {
      console.log('No KOL accounts found in watchlists');
      return new Response(
        JSON.stringify({
          success: true,
          analysis: {
            ticker,
            kols_mentioning: [],
            total_kols: 0,
            total_influence: 0,
            average_influence: 0,
            confidence_multiplier: 1.0,
            original_score: signal.confidence_score,
            enhanced_score: signal.confidence_score,
            top_tier_kols: 0,
            mid_tier_kols: 0,
            emerging_kols: 0,
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract unique KOL usernames
    const kolUsernames = [...new Set(watchlistKOLs.map(k => k.twitter_username))];
    
    // Get user's Twitter credentials for API access
    const { data: credentials } = await supabase
      .from('twitter_credentials')
      .select('*')
      .eq('user_id', signal.user_id)
      .eq('is_valid', true)
      .single();

    if (!credentials) {
      console.log('No valid Twitter credentials found for user');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Twitter API credentials required. Please configure in Settings > Twitter KOLs.',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Search Twitter for real mentions of the ticker by KOLs
    const kolMentions = await searchTickerOnTwitter(
      ticker,
      kolUsernames,
      {
        user_id: signal.user_id,
        api_key: credentials.api_key,
        api_secret: credentials.api_secret,
        access_token: credentials.access_token,
        access_token_secret: credentials.access_token_secret,
      },
      supabase
    );

    // Calculate metrics from real data
    let topTierCount = 0;
    let midTierCount = 0;
    let emergingCount = 0;
    let totalInfluence = 0;

    for (const mention of kolMentions) {
      totalInfluence += mention.yaps_all;
      
      if (mention.yaps_all >= 5000) topTierCount++;
      else if (mention.yaps_all >= 1000) midTierCount++;
      else emergingCount++;
    }

    // Sort by influence (highest first)
    kolMentions.sort((a, b) => b.yaps_all - a.yaps_all);

    const totalKOLs = kolMentions.length;
    const averageInfluence = totalKOLs > 0 ? totalInfluence / totalKOLs : 0;
    const confidenceMultiplier = calculateConfidenceMultiplier(
      topTierCount,
      midTierCount,
      emergingCount
    );
    const enhancedScore = Math.min(signal.confidence_score * confidenceMultiplier, 100);

    // Store the analysis
    const { data: analysis, error: insertError } = await supabase
      .from('signal_ticker_analysis')
      .insert({
        signal_id,
        ticker,
        kols_mentioning: kolMentions,
        total_kols_count: totalKOLs,
        total_influence_score: totalInfluence,
        average_influence_score: averageInfluence,
        confidence_multiplier: confidenceMultiplier,
        final_confidence_score: enhancedScore,
        top_tier_kols: topTierCount,
        mid_tier_kols: midTierCount,
        emerging_kols: emergingCount,
        metadata: {
          analyzed_at: new Date().toISOString(),
          total_watchlist_kols: kolUsernames.length,
          search_method: 'twitter_api',
        }
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting analysis:', insertError);
      throw insertError;
    }

    // Update the signal with enhanced confidence
    await supabase
      .from('twitter_kol_signals')
      .update({
        enhanced_confidence_score: enhancedScore,
        ticker_analysis_id: analysis.id,
      })
      .eq('id', signal_id);

    const result: AnalysisResult = {
      success: true,
      analysis: {
        ticker,
        kols_mentioning: kolMentions,
        total_kols: totalKOLs,
        total_influence: totalInfluence,
        average_influence: averageInfluence,
        confidence_multiplier: confidenceMultiplier,
        original_score: signal.confidence_score,
        enhanced_score: enhancedScore,
        top_tier_kols: topTierCount,
        mid_tier_kols: midTierCount,
        emerging_kols: emergingCount,
      }
    };

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-signal-ticker:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
