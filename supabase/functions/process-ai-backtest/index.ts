import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BacktestRequest {
  strategyId: string
  period: string
  agentIds: string[]
  startDate?: string
  endDate?: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (!user) {
      throw new Error('Unauthorized')
    }

    const { strategyId, period, agentIds, startDate, endDate }: BacktestRequest = await req.json()

    // Fetch strategy
    const { data: strategy, error: strategyError } = await supabase
      .from('ai_trading_strategies')
      .select('*')
      .eq('id', strategyId)
      .single()

    if (strategyError || !strategy) {
      throw new Error('Strategy not found')
    }

    // Calculate date range
    const end = endDate ? new Date(endDate) : new Date()
    const start = startDate ? new Date(startDate) : new Date(end.getTime() - getPeriodMs(period))

    // Create backtest record
    const { data: backtest, error: backtestError } = await supabase
      .from('ai_backtest_results')
      .insert({
        strategy_id: strategyId,
        user_id: user.id,
        period,
        start_date: start.toISOString(),
        end_date: end.toISOString(),
        status: 'running'
      })
      .select()
      .single()

    if (backtestError) {
      throw backtestError
    }

    // Fetch historical data for agents
    const { data: historicalData } = await supabase
      .from('market_data_feeds')
      .select('*')
      .in('agent_id', agentIds)
      .gte('timestamp', start.toISOString())
      .lte('timestamp', end.toISOString())
      .order('timestamp', { ascending: true })

    // Run backtest simulation
    const results = runBacktestSimulation(strategy, historicalData || [])

    // Update backtest with results
    const { error: updateError } = await supabase
      .from('ai_backtest_results')
      .update({
        status: 'completed',
        total_return: results.totalReturn,
        sharpe_ratio: results.sharpeRatio,
        max_drawdown: results.maxDrawdown,
        win_rate: results.winRate,
        total_trades: results.totalTrades,
        profit_factor: results.profitFactor,
        detailed_results: results.trades,
        completed_at: new Date().toISOString()
      })
      .eq('id', backtest.id)

    if (updateError) {
      throw updateError
    }

    // Update strategy performance
    await supabase.rpc('calculate_strategy_performance', { strategy_id_param: strategyId })

    return new Response(
      JSON.stringify({
        success: true,
        backtest_id: backtest.id,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Backtest error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function getPeriodMs(period: string): number {
  const periods: Record<string, number> = {
    '1D': 24 * 60 * 60 * 1000,
    '1W': 7 * 24 * 60 * 60 * 1000,
    '1M': 30 * 24 * 60 * 60 * 1000,
    '3M': 90 * 24 * 60 * 60 * 1000,
    '6M': 180 * 24 * 60 * 60 * 1000,
    '1Y': 365 * 24 * 60 * 60 * 1000
  }
  return periods[period] || periods['1M']
}

function runBacktestSimulation(strategy: any, data: any[]): any {
  const trades: any[] = []
  let equity = 10000 // Starting capital
  let maxEquity = equity
  let maxDrawdown = 0
  let wins = 0

  const params = strategy.parameters || {}
  
  // Simple momentum strategy simulation
  for (let i = 20; i < data.length; i++) {
    const currentPrice = data[i].price
    const previousPrices = data.slice(i - 20, i).map((d: any) => d.price)
    const avgPrice = previousPrices.reduce((a: number, b: number) => a + b, 0) / previousPrices.length
    
    const momentum = (currentPrice - avgPrice) / avgPrice
    
    // Buy signal
    if (momentum > 0.02 && trades.length === 0) {
      trades.push({
        type: 'buy',
        price: currentPrice,
        timestamp: data[i].timestamp,
        equity_before: equity
      })
    }
    
    // Sell signal
    if (trades.length > 0 && trades[trades.length - 1].type === 'buy') {
      if (momentum < -0.01 || i === data.length - 1) {
        const lastTrade = trades[trades.length - 1]
        const pnl = ((currentPrice - lastTrade.price) / lastTrade.price) * equity
        equity += pnl
        
        trades.push({
          type: 'sell',
          price: currentPrice,
          timestamp: data[i].timestamp,
          pnl,
          equity_after: equity
        })
        
        if (pnl > 0) wins++
        
        maxEquity = Math.max(maxEquity, equity)
        const drawdown = ((maxEquity - equity) / maxEquity) * 100
        maxDrawdown = Math.max(maxDrawdown, drawdown)
      }
    }
  }

  const totalReturn = ((equity - 10000) / 10000) * 100
  const winRate = trades.length > 0 ? (wins / (trades.length / 2)) * 100 : 0
  const avgReturn = trades.length > 0 ? totalReturn / (trades.length / 2) : 0
  const sharpeRatio = avgReturn / (maxDrawdown || 1)

  return {
    totalReturn: Number(totalReturn.toFixed(2)),
    sharpeRatio: Number(sharpeRatio.toFixed(2)),
    maxDrawdown: Number(maxDrawdown.toFixed(2)),
    winRate: Number(winRate.toFixed(2)),
    totalTrades: Math.floor(trades.length / 2),
    profitFactor: wins > 0 ? Number((wins / (trades.length / 2 - wins || 1)).toFixed(2)) : 0,
    trades
  }
}
