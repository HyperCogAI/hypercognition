import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    
    // Fetch Kaito attention scores for these KOLs
    const { data: kaitoScores } = await supabase
      .from('kaito_attention_scores')
      .select('twitter_username, yaps_all, yaps_24h, yaps_7d')
      .in('twitter_username', kolUsernames);

    // Build KOL mentions array (simulated - in production would search Twitter API)
    const kolMentions: KOLMention[] = [];
    let topTierCount = 0;
    let midTierCount = 0;
    let emergingCount = 0;
    let totalInfluence = 0;

    // For demo purposes, randomly select 30-50% of KOLs as "mentioning" the ticker
    const mentionRate = 0.3 + Math.random() * 0.2; // 30-50%
    
    if (kaitoScores) {
      for (const score of kaitoScores) {
        if (Math.random() < mentionRate) {
          const yaps = score.yaps_all || 0;
          const tier = getInfluenceTier(yaps);
          const tweetCount = Math.floor(Math.random() * 5) + 1; // 1-5 tweets
          
          kolMentions.push({
            username: score.twitter_username,
            yaps_all: yaps,
            yaps_24h: score.yaps_24h,
            yaps_7d: score.yaps_7d,
            tier,
            tweet_count: tweetCount,
          });

          totalInfluence += yaps;

          // Count by tier
          if (yaps >= 5000) topTierCount++;
          else if (yaps >= 1000) midTierCount++;
          else emergingCount++;
        }
      }
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
          mention_rate: mentionRate,
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
