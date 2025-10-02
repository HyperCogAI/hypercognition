import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('[SentimentSync] Starting market sentiment sync');

    // Get recent market data
    const { data: agents, error: agentsError } = await supabase
      .from('agents')
      .select('price, change_24h, market_cap')
      .order('volume_24h', { ascending: false })
      .limit(100);

    if (agentsError) {
      console.error('[SentimentSync] Error fetching agents:', agentsError);
      throw agentsError;
    }

    // Calculate sentiment metrics
    const totalAgents = agents?.length || 0;
    const positiveChanges = agents?.filter(a => (a.change_24h || 0) > 0).length || 0;
    const negativeChanges = agents?.filter(a => (a.change_24h || 0) < 0).length || 0;
    const neutralChanges = totalAgents - positiveChanges - negativeChanges;

    const bullishPercentage = totalAgents > 0 ? (positiveChanges / totalAgents) * 100 : 50;
    const bearishPercentage = totalAgents > 0 ? (negativeChanges / totalAgents) * 100 : 50;
    const neutralPercentage = totalAgents > 0 ? (neutralChanges / totalAgents) * 100 : 0;

    // Calculate overall sentiment score (-1 to 1)
    const overallSentiment = (bullishPercentage - bearishPercentage) / 100;

    // Calculate fear & greed index (0-100)
    const fearGreedIndex = Math.round(((overallSentiment + 1) / 2) * 100);

    // Calculate market cap change
    const totalMarketCap = agents?.reduce((sum, a) => sum + (a.market_cap || 0), 0) || 0;
    const marketCapChange = agents?.reduce((sum, a) => {
      const change = ((a.market_cap || 0) * (a.change_24h || 0)) / 100;
      return sum + change;
    }, 0) || 0;

    // Determine volume sentiment
    let volumeSentiment = 'moderate';
    if (bullishPercentage > 60) volumeSentiment = 'high';
    if (bullishPercentage < 40) volumeSentiment = 'low';

    // Determine social sentiment
    let socialSentiment = 'neutral';
    if (overallSentiment > 0.3) socialSentiment = 'bullish';
    if (overallSentiment < -0.3) socialSentiment = 'bearish';

    // Insert sentiment data for different timeframes
    const timeframes = ['1h', '4h', '24h', '7d'];
    const sentimentRecords = timeframes.map(timeframe => ({
      timeframe,
      overall_sentiment: overallSentiment,
      fear_greed_index: fearGreedIndex,
      bullish_percentage: bullishPercentage,
      bearish_percentage: bearishPercentage,
      neutral_percentage: neutralPercentage,
      volume_sentiment: volumeSentiment,
      social_sentiment: socialSentiment,
      market_cap_change: marketCapChange,
      timestamp: new Date().toISOString(),
      metadata: {
        total_agents: totalAgents,
        positive_changes: positiveChanges,
        negative_changes: negativeChanges,
        total_market_cap: totalMarketCap
      }
    }));

    const { error: sentimentError } = await supabase
      .from('market_sentiment')
      .insert(sentimentRecords);

    if (sentimentError) {
      console.error('[SentimentSync] Error inserting sentiment:', sentimentError);
      throw sentimentError;
    }

    // Generate and insert market news based on sentiment
    const newsArticles = [];
    
    if (overallSentiment > 0.5) {
      newsArticles.push({
        title: 'Crypto Market Shows Strong Bullish Momentum',
        summary: `Market sentiment remains highly positive with ${bullishPercentage.toFixed(1)}% of tokens showing gains. Fear & Greed Index at ${fearGreedIndex}.`,
        content: `The cryptocurrency market is experiencing strong bullish momentum with ${positiveChanges} out of ${totalAgents} tracked tokens showing positive performance. The Fear & Greed Index has reached ${fearGreedIndex}, indicating ${fearGreedIndex > 70 ? 'extreme greed' : 'optimism'} among investors.`,
        source: 'AI Market Analysis',
        category: 'market-analysis',
        sentiment_score: overallSentiment,
        impact_level: 'high',
        related_chains: ['solana', 'ethereum', 'base', 'polygon'],
        published_at: new Date().toISOString()
      });
    } else if (overallSentiment < -0.5) {
      newsArticles.push({
        title: 'Market Faces Bearish Pressure',
        summary: `Negative sentiment dominates with ${bearishPercentage.toFixed(1)}% of tokens declining. Fear & Greed Index at ${fearGreedIndex}.`,
        content: `The cryptocurrency market is facing significant bearish pressure with ${negativeChanges} out of ${totalAgents} tracked tokens showing negative performance. The Fear & Greed Index has dropped to ${fearGreedIndex}, indicating ${fearGreedIndex < 30 ? 'extreme fear' : 'concern'} among investors.`,
        source: 'AI Market Analysis',
        category: 'market-analysis',
        sentiment_score: overallSentiment,
        impact_level: 'high',
        related_chains: ['solana', 'ethereum', 'base', 'polygon'],
        published_at: new Date().toISOString()
      });
    } else {
      newsArticles.push({
        title: 'Crypto Market Consolidates',
        summary: `Mixed sentiment across markets with ${neutralPercentage.toFixed(1)}% showing minimal change. Fear & Greed Index at ${fearGreedIndex}.`,
        content: `The cryptocurrency market is in a consolidation phase with balanced sentiment. ${bullishPercentage.toFixed(1)}% of tokens are gaining while ${bearishPercentage.toFixed(1)}% are declining. The Fear & Greed Index stands at ${fearGreedIndex}, suggesting a neutral market stance.`,
        source: 'AI Market Analysis',
        category: 'market-analysis',
        sentiment_score: overallSentiment,
        impact_level: 'medium',
        related_chains: ['solana', 'ethereum', 'base', 'polygon'],
        published_at: new Date().toISOString()
      });
    }

    if (newsArticles.length > 0) {
      const { error: newsError } = await supabase
        .from('market_news')
        .insert(newsArticles);

      if (newsError) {
        console.error('[SentimentSync] Error inserting news:', newsError);
      }
    }

    console.log('[SentimentSync] Sync completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        sentiment: {
          overall: overallSentiment,
          fear_greed_index: fearGreedIndex,
          bullish: bullishPercentage,
          bearish: bearishPercentage
        },
        news_articles: newsArticles.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[SentimentSync] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});