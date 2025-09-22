import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get all agents
    const { data: agents, error: agentsError } = await supabase
      .from('agents')
      .select('id, symbol, price')
      .limit(10)

    if (agentsError) {
      console.error('Error fetching agents:', agentsError)
      return new Response(JSON.stringify({ error: 'Failed to fetch agents' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log(`Generating market data for ${agents.length} agents`)

    for (const agent of agents) {
      const basePrice = parseFloat(agent.price) || 1.0
      
      // Generate realistic price movements
      const priceChange = (Math.random() - 0.5) * 0.1 // +/- 5% max change
      const newPrice = basePrice * (1 + priceChange)
      const change24h = priceChange * 100
      
      // Generate volume and other metrics
      const volume24h = Math.random() * 1000000 + 50000
      const high24h = newPrice * (1 + Math.random() * 0.05)
      const low24h = newPrice * (1 - Math.random() * 0.05)
      const tradesCount = Math.floor(Math.random() * 500) + 100
      
      // Generate bid/ask spread
      const spreadPercentage = 0.001 + Math.random() * 0.002 // 0.1-0.3% spread
      const bestBid = newPrice * (1 - spreadPercentage / 2)
      const bestAsk = newPrice * (1 + spreadPercentage / 2)
      const vwap = newPrice * (0.98 + Math.random() * 0.04)

      // Insert market data feed
      const { error: feedError } = await supabase
        .from('market_data_feeds')
        .insert({
          agent_id: agent.id,
          price: newPrice,
          volume_24h: volume24h,
          high_24h: high24h,
          low_24h: low24h,
          open_24h: basePrice,
          change_24h: newPrice - basePrice,
          change_percent_24h: change24h,
          bid_price: bestBid,
          ask_price: bestAsk,
          spread: bestAsk - bestBid,
          source: 'simulator'
        })

      if (feedError) {
        console.error(`Error inserting market data for ${agent.symbol}:`, feedError)
      }

      // Generate order book data
      const orderBookEntries = []
      
      // Generate bids (buy orders)
      for (let i = 0; i < 10; i++) {
        const price = bestBid * (1 - (i * 0.001))
        const size = Math.random() * 1000 + 100
        orderBookEntries.push({
          agent_id: agent.id,
          side: 'buy',
          price: price,
          size: size,
          total: size,
          level_index: i + 1
        })
      }
      
      // Generate asks (sell orders)
      for (let i = 0; i < 10; i++) {
        const price = bestAsk * (1 + (i * 0.001))
        const size = Math.random() * 1000 + 100
        orderBookEntries.push({
          agent_id: agent.id,
          side: 'sell',
          price: price,
          size: size,
          total: size,
          level_index: i + 1
        })
      }

      // Clear old order book data and insert new
      await supabase
        .from('order_book')
        .delete()
        .eq('agent_id', agent.id)

      const { error: orderBookError } = await supabase
        .from('order_book')
        .insert(orderBookEntries)

      if (orderBookError) {
        console.error(`Error inserting order book for ${agent.symbol}:`, orderBookError)
      }

      // Generate recent trades
      const trades = []
      for (let i = 0; i < 5; i++) {
        const tradePrice = newPrice * (0.995 + Math.random() * 0.01)
        const tradeSize = Math.random() * 500 + 50
        const side = Math.random() > 0.5 ? 'buy' : 'sell'
        const timestamp = new Date(Date.now() - (i * 60000)) // Last 5 minutes
        
        trades.push({
          agent_id: agent.id,
          trade_id: `${agent.id}_${Date.now()}_${i}`,
          price: tradePrice,
          size: tradeSize,
          side: side,
          timestamp: timestamp.toISOString(),
          is_maker: Math.random() > 0.5
        })
      }

      const { error: tradesError } = await supabase
        .from('market_trades')
        .insert(trades)

      if (tradesError) {
        console.error(`Error inserting trades for ${agent.symbol}:`, tradesError)
      }

      // Update agent price
      await supabase
        .from('agents')
        .update({ 
          price: newPrice,
          change_24h: change24h,
          volume_24h: volume24h
        })
        .eq('id', agent.id)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Generated market data for ${agents.length} agents`,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in market data simulation:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})