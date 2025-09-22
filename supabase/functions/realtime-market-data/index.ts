import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface MarketDataRequest {
  symbols?: string[];
  metrics?: string[];
  timeframe?: string;
}

interface TechnicalIndicator {
  name: string;
  value: number;
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
}

interface MarketSentiment {
  symbol: string;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  score: number;
  indicators: TechnicalIndicator[];
  volume_trend: string;
  price_momentum: string;
  social_sentiment?: number;
}

// Simulate real-time market data (in production, connect to real APIs)
const generateMarketData = async (symbols: string[]) => {
  const marketData: any[] = [];
  
  for (const symbol of symbols) {
    // Get current agent data
    const { data: agent } = await supabase
      .from('agents')
      .select('*')
      .eq('symbol', symbol)
      .single();
    
    if (!agent) continue;

    const currentPrice = parseFloat(agent.price) || 1.0;
    const basePrice = currentPrice;
    
    // Generate realistic price movement (±5%)
    const priceChange = (Math.random() - 0.5) * 0.1 * basePrice;
    const newPrice = Math.max(0.001, basePrice + priceChange);
    const changePercent = ((newPrice - basePrice) / basePrice) * 100;
    
    // Generate technical indicators
    const rsi = 30 + Math.random() * 40; // RSI between 30-70
    const macd = (Math.random() - 0.5) * 0.02;
    const bb_position = Math.random(); // Position in Bollinger Bands
    
    // Determine signals
    const rsiSignal = rsi > 70 ? 'SELL' : rsi < 30 ? 'BUY' : 'HOLD';
    const macdSignal = macd > 0 ? 'BUY' : 'SELL';
    const bbSignal = bb_position > 0.8 ? 'SELL' : bb_position < 0.2 ? 'BUY' : 'HOLD';
    
    const indicators: TechnicalIndicator[] = [
      {
        name: 'RSI',
        value: rsi,
        signal: rsiSignal,
        confidence: Math.abs(rsi - 50) / 20
      },
      {
        name: 'MACD',
        value: macd,
        signal: macdSignal,
        confidence: Math.abs(macd) * 50
      },
      {
        name: 'Bollinger Bands',
        value: bb_position,
        signal: bbSignal,
        confidence: Math.abs(bb_position - 0.5) * 2
      }
    ];
    
    // Calculate overall sentiment
    const buySignals = indicators.filter(i => i.signal === 'BUY').length;
    const sellSignals = indicators.filter(i => i.signal === 'SELL').length;
    
    let sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
    let sentimentScore = 0;
    
    if (buySignals > sellSignals) {
      sentiment = 'BULLISH';
      sentimentScore = (buySignals / indicators.length) * 100;
    } else if (sellSignals > buySignals) {
      sentiment = 'BEARISH';
      sentimentScore = (sellSignals / indicators.length) * 100;
    } else {
      sentimentScore = 50;
    }
    
    const volumeTrend = Math.random() > 0.5 ? 'INCREASING' : 'DECREASING';
    const priceMomentum = changePercent > 0 ? 'POSITIVE' : 'NEGATIVE';
    
    const marketSentiment: MarketSentiment = {
      symbol,
      sentiment,
      score: sentimentScore,
      indicators,
      volume_trend: volumeTrend,
      price_momentum: priceMomentum,
      social_sentiment: 40 + Math.random() * 20 // 40-60 range
    };
    
    marketData.push({
      symbol,
      name: agent.name,
      price: newPrice,
      change_24h: changePercent,
      volume_24h: agent.volume_24h * (0.8 + Math.random() * 0.4), // ±20% variation
      market_cap: newPrice * 1000000, // Simplified market cap calculation
      sentiment: marketSentiment,
      last_updated: new Date().toISOString(),
      technical_analysis: {
        rsi: rsi,
        macd: macd,
        bollinger_position: bb_position,
        sma_20: newPrice * (0.95 + Math.random() * 0.1),
        sma_50: newPrice * (0.90 + Math.random() * 0.2),
        volume_sma: agent.volume_24h || 100000
      }
    });
  }
  
  return marketData;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbols, metrics, timeframe }: MarketDataRequest = await req.json();
    
    // Default to top 10 agents if no symbols provided
    let targetSymbols = symbols;
    if (!targetSymbols || targetSymbols.length === 0) {
      const { data: topAgents } = await supabase
        .from('agents')
        .select('symbol')
        .order('market_cap', { ascending: false })
        .limit(10);
      
      targetSymbols = topAgents?.map(a => a.symbol) || [];
    }
    
    const marketData = await generateMarketData(targetSymbols);
    
    // Update price history for trending analysis
    for (const data of marketData) {
      try {
        // Update current agent price
        await supabase
          .from('agents')
          .update({
            price: data.price,
            change_24h: data.change_24h,
            volume_24h: data.volume_24h,
            market_cap: data.market_cap,
            updated_at: new Date().toISOString()
          })
          .eq('symbol', data.symbol);
          
        // Add to price history
        await supabase
          .from('price_history')
          .insert({
            agent_id: data.symbol, // Using symbol as ID for simplicity
            price: data.price,
            volume: data.volume_24h,
            market_cap: data.market_cap,
            timestamp: new Date().toISOString()
          });
      } catch (error) {
        console.warn(`Could not update data for ${data.symbol}:`, error);
      }
    }
    
    // Calculate market overview metrics
    const totalMarketCap = marketData.reduce((sum, d) => sum + d.market_cap, 0);
    const avgChange = marketData.reduce((sum, d) => sum + d.change_24h, 0) / marketData.length;
    const bullishCount = marketData.filter(d => d.sentiment.sentiment === 'BULLISH').length;
    const bearishCount = marketData.filter(d => d.sentiment.sentiment === 'BEARISH').length;
    
    const marketOverview = {
      total_market_cap: totalMarketCap,
      average_change_24h: avgChange,
      bullish_sentiment_ratio: bullishCount / marketData.length,
      bearish_sentiment_ratio: bearishCount / marketData.length,
      active_trading_pairs: marketData.length,
      market_trend: avgChange > 0 ? 'BULLISH' : 'BEARISH',
      volatility_index: Math.abs(avgChange) * 10, // Simplified volatility measure
      last_updated: new Date().toISOString()
    };
    
    return new Response(
      JSON.stringify({
        success: true,
        data: marketData,
        overview: marketOverview,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Real-time market data error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});