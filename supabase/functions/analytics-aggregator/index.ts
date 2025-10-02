import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Analytics Aggregator: Starting aggregation process');

    const { period = 'daily', agentId, metrics } = await req.json();

    // If specific agent analytics requested
    if (agentId && metrics) {
      return await getAgentAnalytics(supabase, agentId, metrics, period);
    }

    // Otherwise run full aggregation
    console.log('Analytics Aggregator: Starting full aggregation process');

    // Calculate time ranges based on period
    const now = new Date();
    let periodStart: Date;
    let periodEnd = now;

    switch (period) {
      case 'hourly':
        periodStart = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case 'daily':
        periodStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        periodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        periodStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    console.log(`Aggregating analytics for period: ${period} (${periodStart.toISOString()} to ${periodEnd.toISOString()})`);

    // Aggregate portfolio analytics
    await aggregatePortfolioAnalytics(supabase, period, periodStart, periodEnd);

    // Aggregate trading analytics
    await aggregateTradingAnalytics(supabase, period, periodStart, periodEnd);

    // Aggregate agent performance metrics
    await aggregateAgentPerformanceMetrics(supabase, period, periodStart, periodEnd);

    console.log('Analytics Aggregator: Aggregation complete');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Analytics aggregated successfully',
        period,
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Analytics Aggregator Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

async function aggregatePortfolioAnalytics(
  supabase: any,
  period: string,
  periodStart: Date,
  periodEnd: Date
) {
  console.log('Aggregating portfolio analytics...');

  // Get all unique users with crypto portfolio
  const { data: users } = await supabase
    .from('crypto_portfolio')
    .select('user_id')
    .gte('created_at', periodStart.toISOString())
    .lte('created_at', periodEnd.toISOString());

  if (!users || users.length === 0) return;

  const uniqueUserIds = [...new Set(users.map((u: any) => u.user_id))];

  for (const userId of uniqueUserIds) {
    // Calculate portfolio metrics for each user
    const { data: portfolio } = await supabase
      .from('crypto_portfolio')
      .select('*')
      .eq('user_id', userId);

    if (!portfolio || portfolio.length === 0) continue;

    const totalValue = portfolio.reduce((sum: number, item: any) => 
      sum + (item.amount * item.purchase_price), 0
    );

    // Insert or update portfolio analytics
    await supabase
      .from('portfolio_analytics')
      .upsert({
        user_id: userId,
        period,
        total_value: totalValue,
        total_pnl: 0, // Calculate based on current prices vs purchase prices
        total_pnl_percentage: 0,
        total_trades: 0,
        winning_trades: 0,
        losing_trades: 0,
        win_rate: 0,
        avg_profit: 0,
        avg_loss: 0,
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString(),
        calculated_at: new Date().toISOString()
      });
  }

  console.log(`Portfolio analytics aggregated for ${uniqueUserIds.length} users`);
}

async function aggregateTradingAnalytics(
  supabase: any,
  period: string,
  periodStart: Date,
  periodEnd: Date
) {
  console.log('Aggregating trading analytics...');

  // Get all orders in the period
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .gte('created_at', periodStart.toISOString())
    .lte('created_at', periodEnd.toISOString())
    .eq('status', 'filled');

  if (!orders || orders.length === 0) return;

  // Group by user
  const userOrders: Record<string, any[]> = {};
  orders.forEach((order: any) => {
    if (!userOrders[order.user_id]) {
      userOrders[order.user_id] = [];
    }
    userOrders[order.user_id].push(order);
  });

  for (const [userId, userOrderList] of Object.entries(userOrders)) {
    const totalVolume = userOrderList.reduce((sum, order) => 
      sum + (order.filled_amount || 0) * (order.average_price || 0), 0
    );

    const profitableTrades = userOrderList.filter(o => 
      (o.side === 'sell' && o.average_price > o.price) ||
      (o.side === 'buy' && o.price > o.average_price)
    ).length;

    await supabase
      .from('trading_analytics')
      .upsert({
        user_id: userId,
        period,
        total_volume: totalVolume,
        trade_count: userOrderList.length,
        profitable_trades: profitableTrades,
        unprofitable_trades: userOrderList.length - profitableTrades,
        total_profit: 0,
        total_loss: 0,
        consecutive_wins: 0,
        consecutive_losses: 0,
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString(),
        calculated_at: new Date().toISOString()
      });
  }

  console.log(`Trading analytics aggregated for ${Object.keys(userOrders).length} users`);
}

async function aggregateAgentPerformanceMetrics(
  supabase: any,
  period: string,
  periodStart: Date,
  periodEnd: Date
) {
  console.log('Aggregating agent performance metrics...');

  // Get all agents
  const { data: agents } = await supabase
    .from('agents')
    .select('id');

  if (!agents || agents.length === 0) return;

  for (const agent of agents) {
    // Get orders for this agent
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .eq('agent_id', agent.id)
      .gte('created_at', periodStart.toISOString())
      .lte('created_at', periodEnd.toISOString())
      .eq('status', 'filled');

    if (!orders || orders.length === 0) continue;

    const totalVolume = orders.reduce((sum, order) => 
      sum + (order.filled_amount || 0) * (order.average_price || 0), 0
    );

    const successfulTrades = orders.filter(o => 
      (o.side === 'sell' && o.average_price > o.price) ||
      (o.side === 'buy' && o.price > o.average_price)
    ).length;

    const winRate = orders.length > 0 ? (successfulTrades / orders.length) * 100 : 0;

    // Get unique users trading this agent
    const uniqueUsers = new Set(orders.map((o: any) => o.user_id));

    await supabase
      .from('agent_performance_metrics')
      .upsert({
        agent_id: agent.id,
        period,
        total_trades: orders.length,
        successful_trades: successfulTrades,
        total_volume: totalVolume,
        total_profit: 0,
        avg_roi: 0,
        win_rate: winRate,
        active_users: uniqueUsers.size,
        total_holders: uniqueUsers.size,
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString(),
        calculated_at: new Date().toISOString()
      });
  }

  console.log(`Agent performance metrics aggregated for ${agents.length} agents`);
}

async function getAgentAnalytics(supabase: any, agentId: string, metrics: string[], period: string) {
  console.log(`[AnalyticsAggregator] Getting metrics for agent ${agentId}`);

  const results: any = {};

  // Get social sentiment
  if (metrics.includes('sentiment') || metrics.includes('all')) {
    const { data: sentimentData } = await supabase
      .from('social_sentiment_data')
      .select('*')
      .eq('agent_id', agentId)
      .eq('period', period)
      .order('timestamp', { ascending: false })
      .limit(1);

    results.sentiment = sentimentData?.[0] || null;
  }

  // Get market correlations
  if (metrics.includes('correlations') || metrics.includes('all')) {
    const { data: correlationData } = await supabase
      .from('market_correlations')
      .select('*')
      .eq('agent_id', agentId)
      .eq('period', period)
      .order('timestamp', { ascending: false })
      .limit(1);

    results.correlations = correlationData?.[0] || null;
  }

  // Get trading analytics
  if (metrics.includes('trading') || metrics.includes('all')) {
    const { data: tradingData } = await supabase
      .from('trading_analytics')
      .select('*')
      .eq('agent_id', agentId)
      .eq('period', period)
      .order('timestamp', { ascending: false })
      .limit(1);

    results.trading = tradingData?.[0] || null;
  }

  // Get trend analysis
  if (metrics.includes('trends') || metrics.includes('all')) {
    const { data: trendData } = await supabase
      .from('trend_analysis')
      .select('*')
      .eq('agent_id', agentId)
      .order('analysis_timestamp', { ascending: false })
      .limit(1);

    results.trends = trendData?.[0] || null;
  }

  // Get anomalies
  if (metrics.includes('anomalies') || metrics.includes('all')) {
    const { data: anomalyData } = await supabase
      .from('anomaly_alerts')
      .select('*')
      .eq('agent_id', agentId)
      .in('status', ['new', 'acknowledged'])
      .order('detected_at', { ascending: false })
      .limit(10);

    results.anomalies = anomalyData || [];
  }

  // Calculate composite scores
  results.composite = {
    overall_health: calculateOverallHealth(results),
    investment_score: calculateInvestmentScore(results),
    risk_level: calculateRiskLevel(results),
    trending_score: calculateTrendingScore(results)
  };

  return new Response(JSON.stringify({
    success: true,
    agent_id: agentId,
    period,
    metrics: results,
    timestamp: new Date().toISOString()
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

function calculateOverallHealth(data: any): number {
  let score = 50;
  if (data.sentiment) {
    const sentimentScore = Math.max(-100, Math.min(100, data.sentiment.sentiment_score || 0));
    score += (sentimentScore / 100) * 25;
  }
  if (data.trading) {
    const winRate = data.trading.win_rate || 0;
    score += (winRate / 100) * 25;
  }
  return Math.max(0, Math.min(100, score));
}

function calculateInvestmentScore(data: any): number {
  let score = 50;
  if (data.correlations?.liquidity_score) {
    score += Math.min(20, data.correlations.liquidity_score / 5);
  }
  if (data.trading) {
    const winRate = data.trading.win_rate || 0;
    score += (winRate / 100) * 30;
  }
  return Math.max(0, Math.min(100, score));
}

function calculateRiskLevel(data: any): string {
  let riskScore = 0;
  if (data.correlations) {
    const vol24h = data.correlations.volatility_24h || 0;
    if (vol24h > 0.5) riskScore += 3;
    else if (vol24h > 0.3) riskScore += 2;
    else if (vol24h > 0.15) riskScore += 1;
  }
  if (data.correlations?.liquidity_score && data.correlations.liquidity_score < 30) riskScore += 2;
  if (data.anomalies?.length > 0) {
    const highSeverity = data.anomalies.filter((a: any) => 
      a.severity === 'high' || a.severity === 'critical'
    ).length;
    riskScore += highSeverity;
  }
  if (riskScore >= 5) return 'high';
  if (riskScore >= 3) return 'medium';
  return 'low';
}

function calculateTrendingScore(data: any): number {
  let score = 0;
  if (data.sentiment?.velocity_score) {
    score += Math.min(40, data.sentiment.velocity_score);
  }
  if (data.trading?.total_volume) {
    score += Math.min(30, (data.trading.total_volume / 1000000) * 10);
  }
  if (data.trends?.trend_strength) {
    score += (data.trends.trend_strength / 100) * 30;
  }
  return Math.max(0, Math.min(100, score));
}