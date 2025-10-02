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

    // Get recent market data, prefer active but fallback to top by volume
    const { data: agentsActive, error: agentsError } = await supabase
      .from('agents')
      .select('price, change_24h, market_cap, volume_24h')
      .eq('status', 'active')
      .order('volume_24h', { ascending: false })
      .limit(100);

    if (agentsError) {
      console.error('[SentimentSync] Error fetching agents:', agentsError);
      throw agentsError;
    }

    let agents = agentsActive || [];

    // Fallback: include non-active agents if none are active
    if (!agents || agents.length === 0) {
      const { data: fallbackAgents, error: fallbackError } = await supabase
        .from('agents')
        .select('price, change_24h, market_cap, volume_24h')
        .order('volume_24h', { ascending: false })
        .limit(100);

      if (fallbackError) {
        console.error('[SentimentSync] Fallback error fetching agents:', fallbackError);
        throw fallbackError;
      }

      agents = fallbackAgents || [];
    }

    if (!agents || agents.length === 0) {
      console.log('[SentimentSync] No agents found (active or fallback)');
      return new Response(
        JSON.stringify({ success: false, message: 'No agents found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate weighted sentiment metrics based on magnitude and market cap
    const totalAgents = agents.length;
    const totalMarketCap = agents.reduce((sum, a) => sum + (a.market_cap || 0), 0);
    
    // Weight by market cap for more accurate sentiment
    const weightedPositive = agents.reduce((sum, a) => {
      const change = a.change_24h || 0;
      const weight = (a.market_cap || 0) / totalMarketCap;
      return sum + (change > 0 ? change * weight : 0);
    }, 0);
    
    const weightedNegative = agents.reduce((sum, a) => {
      const change = a.change_24h || 0;
      const weight = (a.market_cap || 0) / totalMarketCap;
      return sum + (change < 0 ? Math.abs(change) * weight : 0);
    }, 0);

    // Count agents by sentiment
    const bullishCount = agents.filter(a => (a.change_24h || 0) > 2).length; // >2% gain
    const bearishCount = agents.filter(a => (a.change_24h || 0) < -2).length; // >2% loss
    const neutralCount = totalAgents - bullishCount - bearishCount;

    const bullishPercentage = (bullishCount / totalAgents) * 100;
    const bearishPercentage = (bearishCount / totalAgents) * 100;
    const neutralPercentage = (neutralCount / totalAgents) * 100;

    // Calculate overall sentiment score using weighted changes
    // Range: -1 (extreme bearish) to 1 (extreme bullish)
    const overallSentiment = Math.max(-1, Math.min(1, 
      (weightedPositive - weightedNegative) / Math.max(weightedPositive + weightedNegative, 0.01)
    ));

    // Calculate fear & greed index (0-100)
    const fearGreedIndex = Math.round(((overallSentiment + 1) / 2) * 100);

    // Calculate market cap change
    const marketCapChange = agents.reduce((sum, a) => {
      const change = ((a.market_cap || 0) * (a.change_24h || 0)) / 100;
      return sum + change;
    }, 0);

    // Average change across all agents
    const avgChange = agents.reduce((sum, a) => sum + (a.change_24h || 0), 0) / totalAgents;

    // Determine volume sentiment based on actual performance
    let volumeSentiment = 'moderate';
    if (avgChange > 5) volumeSentiment = 'very high';
    else if (avgChange > 2) volumeSentiment = 'high';
    else if (avgChange < -5) volumeSentiment = 'very low';
    else if (avgChange < -2) volumeSentiment = 'low';

    // Determine social sentiment based on overall sentiment
    let socialSentiment = 'neutral';
    if (overallSentiment > 0.4) socialSentiment = 'extremely bullish';
    else if (overallSentiment > 0.2) socialSentiment = 'bullish';
    else if (overallSentiment < -0.4) socialSentiment = 'extremely bearish';
    else if (overallSentiment < -0.2) socialSentiment = 'bearish';

    console.log('[SentimentSync] Metrics:', {
      overallSentiment,
      avgChange,
      bullishPercentage,
      fearGreedIndex,
      socialSentiment
    });

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
        bullish_count: bullishCount,
        bearish_count: bearishCount,
        neutral_count: neutralCount,
        total_market_cap: totalMarketCap,
        avg_change: avgChange,
        weighted_positive: weightedPositive,
        weighted_negative: weightedNegative
      }
    }));

    const { error: sentimentError } = await supabase
      .from('market_sentiment')
      .insert(sentimentRecords);

    if (sentimentError) {
      console.error('[SentimentSync] Error inserting sentiment:', sentimentError);
      throw sentimentError;
    }

    // Generate unique market news based on current sentiment
    // Check for existing recent news to avoid duplicates
    const { data: recentNews } = await supabase
      .from('market_news')
      .select('title')
      .gte('created_at', new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()); // Last 6 hours

    const recentTitles = new Set(recentNews?.map(n => n.title) || []);
    const newsArticles = [];
    
    // Generate news based on sentiment strength
    if (overallSentiment > 0.4 && avgChange > 3) {
      const title = `Crypto Market Surges with ${avgChange.toFixed(1)}% Average Gain`;
      if (!recentTitles.has(title)) {
        newsArticles.push({
          title,
          summary: `Strong bullish momentum across ${bullishCount} tokens (${bullishPercentage.toFixed(1)}%). Fear & Greed Index hits ${fearGreedIndex}. Market cap increased by $${(marketCapChange / 1e9).toFixed(2)}B.`,
          content: `The cryptocurrency market is experiencing exceptional bullish momentum with an average gain of ${avgChange.toFixed(1)}% across ${totalAgents} tracked tokens. ${bullishCount} tokens are showing significant gains (>2%), representing ${bullishPercentage.toFixed(1)}% of the market. The Fear & Greed Index has surged to ${fearGreedIndex}, indicating ${fearGreedIndex > 80 ? 'extreme greed' : 'strong optimism'} among investors. Total market cap increased by $${(marketCapChange / 1e9).toFixed(2)}B.`,
          source: 'HyperCognition Analytics',
          category: 'market-analysis',
          sentiment_score: overallSentiment,
          impact_level: 'high',
          related_chains: ['solana', 'ethereum', 'base', 'polygon'],
          published_at: new Date().toISOString()
        });
      }
    } else if (overallSentiment > 0.15 && avgChange > 1) {
      const title = `Market Shows Positive Momentum with ${bullishPercentage.toFixed(0)}% Gains`;
      if (!recentTitles.has(title)) {
        newsArticles.push({
          title,
          summary: `Moderate bullish sentiment as ${bullishCount} tokens advance. Fear & Greed Index at ${fearGreedIndex}.`,
          content: `The cryptocurrency market maintains positive momentum with ${bullishPercentage.toFixed(1)}% of tokens showing gains. Average change across the market is ${avgChange.toFixed(1)}%. The Fear & Greed Index stands at ${fearGreedIndex}, reflecting growing investor confidence.`,
          source: 'HyperCognition Analytics',
          category: 'market-analysis',
          sentiment_score: overallSentiment,
          impact_level: 'medium',
          related_chains: ['solana', 'ethereum', 'base', 'polygon'],
          published_at: new Date().toISOString()
        });
      }
    } else if (overallSentiment < -0.4 && avgChange < -3) {
      const title = `Market Correction Underway: ${Math.abs(avgChange).toFixed(1)}% Average Decline`;
      if (!recentTitles.has(title)) {
        newsArticles.push({
          title,
          summary: `Significant bearish pressure with ${bearishCount} tokens declining. Fear & Greed Index drops to ${fearGreedIndex}.`,
          content: `The cryptocurrency market is experiencing a significant correction with an average decline of ${Math.abs(avgChange).toFixed(1)}% across tracked tokens. ${bearishCount} tokens are down more than 2%, representing ${bearishPercentage.toFixed(1)}% of the market. The Fear & Greed Index has dropped to ${fearGreedIndex}, indicating ${fearGreedIndex < 20 ? 'extreme fear' : 'heightened concern'} among investors.`,
          source: 'HyperCognition Analytics',
          category: 'market-analysis',
          sentiment_score: overallSentiment,
          impact_level: 'high',
          related_chains: ['solana', 'ethereum', 'base', 'polygon'],
          published_at: new Date().toISOString()
        });
      }
    } else if (Math.abs(avgChange) < 1) {
      const title = `Crypto Markets Consolidate Around Current Levels`;
      if (!recentTitles.has(title)) {
        newsArticles.push({
          title,
          summary: `Mixed sentiment with ${neutralPercentage.toFixed(1)}% of tokens showing minimal movement. Fear & Greed Index at ${fearGreedIndex}.`,
          content: `The cryptocurrency market is in a consolidation phase with balanced sentiment across tokens. ${bullishPercentage.toFixed(1)}% are gaining while ${bearishPercentage.toFixed(1)}% are declining, with the majority showing minimal change. The Fear & Greed Index stands at ${fearGreedIndex}, suggesting investors are waiting for clear directional signals.`,
          source: 'HyperCognition Analytics',
          category: 'market-analysis',
          sentiment_score: overallSentiment,
          impact_level: 'low',
          related_chains: ['solana', 'ethereum', 'base', 'polygon'],
          published_at: new Date().toISOString()
        });
      }
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
          bearish: bearishPercentage,
          avg_change: avgChange,
          social_sentiment: socialSentiment
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