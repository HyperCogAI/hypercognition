import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { agentId, platform, texts, period = '24h' } = await req.json()

    console.log(`[SentimentAnalyzer] Analyzing sentiment for agent ${agentId}`)

    // Analyze sentiment for provided texts
    const sentiments = texts.map((text: string) => analyzeSentiment(text))

    const positiveMentions = sentiments.filter(s => s.sentiment === 'positive').length
    const negativeMentions = sentiments.filter(s => s.sentiment === 'negative').length
    const neutralMentions = sentiments.filter(s => s.sentiment === 'neutral').length

    const sentimentScore = calculateSentimentScore(positiveMentions, negativeMentions, neutralMentions)

    // Calculate engagement metrics
    const engagementMetrics = {
      mentions_count: texts.length,
      likes_count: Math.floor(Math.random() * 500 + 100), // Would come from API
      shares_count: Math.floor(Math.random() * 100 + 20),
      comments_count: Math.floor(Math.random() * 200 + 50),
      views_count: Math.floor(Math.random() * 5000 + 1000)
    }

    // Calculate velocity (rate of change)
    const { data: previousData } = await supabaseClient
      .from('social_sentiment_data')
      .select('mentions_count, timestamp')
      .eq('agent_id', agentId)
      .eq('platform', platform)
      .eq('period', period)
      .order('timestamp', { ascending: false })
      .limit(1)

    let velocityScore = 0
    if (previousData && previousData.length > 0) {
      const timeDiff = (new Date().getTime() - new Date(previousData[0].timestamp).getTime()) / 3600000 // hours
      const mentionsDiff = engagementMetrics.mentions_count - previousData[0].mentions_count
      velocityScore = mentionsDiff / Math.max(1, timeDiff)
    }

    // Calculate viral score
    const viralScore = calculateViralScore(engagementMetrics, velocityScore)

    // Insert sentiment data
    const { data: insertedData, error } = await supabaseClient
      .from('social_sentiment_data')
      .insert({
        agent_id: agentId,
        platform,
        mentions_count: engagementMetrics.mentions_count,
        likes_count: engagementMetrics.likes_count,
        shares_count: engagementMetrics.shares_count,
        comments_count: engagementMetrics.comments_count,
        views_count: engagementMetrics.views_count,
        sentiment_score: sentimentScore,
        positive_mentions: positiveMentions,
        negative_mentions: negativeMentions,
        neutral_mentions: neutralMentions,
        velocity_score: velocityScore,
        viral_score: viralScore,
        period,
        timestamp: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('[SentimentAnalyzer] Error inserting data:', error)
      throw error
    }

    console.log(`[SentimentAnalyzer] Sentiment analysis complete for agent ${agentId}`)

    return new Response(JSON.stringify({
      success: true,
      sentiment_data: insertedData,
      breakdown: {
        positive: positiveMentions,
        negative: negativeMentions,
        neutral: neutralMentions,
        score: sentimentScore
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('[SentimentAnalyzer] Error:', error)
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

function analyzeSentiment(text: string): { sentiment: string; score: number } {
  const lowerText = text.toLowerCase()

  // Positive keywords
  const positiveWords = ['bullish', 'moon', 'gem', 'buy', 'pump', 'up', 'gain', 'profit', 'win', 'great', 'excellent', 'amazing', 'good', 'love']
  const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length

  // Negative keywords
  const negativeWords = ['bearish', 'dump', 'sell', 'down', 'loss', 'scam', 'rug', 'bad', 'terrible', 'avoid', 'warning', 'crash', 'drop']
  const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length

  if (positiveCount > negativeCount) {
    return { sentiment: 'positive', score: (positiveCount / (positiveCount + negativeCount + 1)) * 100 }
  } else if (negativeCount > positiveCount) {
    return { sentiment: 'negative', score: -(negativeCount / (positiveCount + negativeCount + 1)) * 100 }
  }

  return { sentiment: 'neutral', score: 0 }
}

function calculateSentimentScore(positive: number, negative: number, neutral: number): number {
  const total = positive + negative + neutral
  if (total === 0) return 0

  return ((positive - negative) / total) * 100
}

function calculateViralScore(metrics: any, velocity: number): number {
  // Engagement rate
  const engagementRate = (metrics.likes_count + metrics.shares_count + metrics.comments_count) / Math.max(1, metrics.views_count)

  // Viral coefficient
  const viralCoefficient = metrics.shares_count / Math.max(1, metrics.mentions_count)

  // Combined viral score
  return Math.min(100, (engagementRate * 50 + viralCoefficient * 30 + Math.min(20, velocity * 2)))
}
