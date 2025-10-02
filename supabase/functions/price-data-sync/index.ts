import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fetch real crypto prices from CoinGecko
async function fetchCoinGeckoPrices(symbols: string[]) {
  const apiKey = Deno.env.get('COINGECKO_API_KEY');
  
  if (!apiKey) {
    console.warn('[PriceSync] COINGECKO_API_KEY not configured, using synthetic data');
    return null;
  }

  try {
    // CoinGecko Pro API endpoint (use demo API for free tier)
    const coinIds = 'bitcoin,ethereum,solana,polygon-ecosystem-token,chainlink,uniswap,aave,compound-governance-token';
    
    // Use demo API (free tier) - adjust endpoint based on your plan
    const baseUrl = 'https://api.coingecko.com/api/v3';
    const endpoint = `${baseUrl}/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`;
    
    const response = await fetch(endpoint, {
      headers: {
        'x-cg-demo-api-key': apiKey,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[PriceSync] CoinGecko API error ${response.status}:`, errorText);
      return null;
    }

    const data = await response.json();
    console.log('[PriceSync] Real price data fetched from CoinGecko:', Object.keys(data).length, 'coins');
    return data;
  } catch (error) {
    console.error('[PriceSync] Error fetching CoinGecko data:', error);
    return null;
  }
}

// Fetch Fear & Greed Index (free API, no key needed)
async function fetchFearGreedIndex() {
  try {
    const response = await fetch('https://api.alternative.me/fng/?limit=1');
    
    if (!response.ok) {
      console.error(`[PriceSync] Fear & Greed API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    if (data.data && data.data[0]) {
      return {
        value: parseInt(data.data[0].value),
        classification: data.data[0].value_classification
      };
    }
    return null;
  } catch (error) {
    console.error('[PriceSync] Error fetching Fear & Greed:', error);
    return null;
  }
}

// Fetch TVL per chain from DefiLlama (public API)
async function fetchDefiLlamaTVL(chain: 'ethereum' | 'base' | 'bsc'): Promise<number | null> {
  try {
    const res = await fetch(`https://api.llama.fi/tvl/${chain}`);
    if (!res.ok) return null;
    const tvl = await res.json();
    return typeof tvl === 'number' ? tvl : (tvl?.tvl ?? null);
  } catch (e) {
    console.error('[PriceSync] DefiLlama TVL fetch error for', chain, e);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('[PriceSync] Starting price data sync');

    // Fetch real market data
    const [coinGeckoData, fearGreedData] = await Promise.all([
      fetchCoinGeckoPrices([]),
      fetchFearGreedIndex()
    ]);

    // Get all active agents
    const { data: agents, error: agentsError } = await supabase
      .from('agents')
      .select('id, symbol, name, price, volume_24h, market_cap')
      .eq('status', 'active');

    if (agentsError) {
      console.error('[PriceSync] Error fetching agents:', agentsError);
      throw agentsError;
    }

    // Map real crypto data to reference coins for realistic price movements
    const coinMapping: Record<string, string> = {
      'bitcoin': coinGeckoData?.bitcoin,
      'ethereum': coinGeckoData?.ethereum,
      'solana': coinGeckoData?.solana,
      'polygon': coinGeckoData?.polygon,
      'chainlink': coinGeckoData?.chainlink,
      'uniswap': coinGeckoData?.uniswap,
      'aave': coinGeckoData?.aave,
      'compound': coinGeckoData?.compound
    };

    const referenceCoins = Object.keys(coinMapping).filter(k => coinMapping[k]);
    
    // Update agent prices with realistic movements
    const updates = [];
    for (const agent of agents || []) {
      let priceChange = (Math.random() - 0.5) * 0.1; // Default ±5%
      let volumeMultiplier = 1 + (Math.random() - 0.5) * 0.3; // ±15%

      // If we have real data, use it to influence our synthetic prices
      if (coinGeckoData && referenceCoins.length > 0) {
        const randomCoin = referenceCoins[Math.floor(Math.random() * referenceCoins.length)];
        const coinData = coinMapping[randomCoin];
        
        if (coinData && coinData.usd_24h_change) {
          // Use real coin's movement as a trend indicator
          const realChange = coinData.usd_24h_change / 100;
          priceChange = realChange * (0.5 + Math.random() * 0.5); // 50-100% correlation
        }
      }

      const newPrice = agent.price * (1 + priceChange);
      const newVolume = agent.volume_24h * volumeMultiplier;
      const newMarketCap = newPrice * 1000000; // Assuming 1M supply

      updates.push(
        supabase
          .from('agents')
          .update({
            price: newPrice,
            change_24h: priceChange * 100,
            volume_24h: newVolume,
            market_cap: newMarketCap,
            updated_at: new Date().toISOString()
          })
          .eq('id', agent.id)
      );
    }

    // Execute all updates
    if (updates.length > 0) {
      await Promise.all(updates);
      console.log(`[PriceSync] Updated ${updates.length} agent prices`);
    }

    // Update market sentiment with real Fear & Greed data
    if (fearGreedData) {
      // Insert for multiple timeframes to match market_sentiment_sync pattern
      const timeframes = ['1h', '4h', '24h', '7d'];
      const sentimentInserts = timeframes.map(timeframe => 
        supabase.from('market_sentiment').insert({
          fear_greed_index: fearGreedData.value,
          overall_sentiment: (fearGreedData.value - 50) / 50, // Normalize to -1 to 1
          timeframe: timeframe,
          bullish_percentage: fearGreedData.value > 50 ? Math.round((fearGreedData.value - 50) * 2) : 0,
          bearish_percentage: fearGreedData.value < 50 ? Math.round((50 - fearGreedData.value) * 2) : 0,
          neutral_percentage: Math.abs(fearGreedData.value - 50) < 10 ? 50 : 20,
          social_sentiment: fearGreedData.classification.toLowerCase(),
          metadata: {
            source: 'alternative.me',
            real_data: true,
            coingecko_available: !!coinGeckoData,
            classification: fearGreedData.classification
          },
          timestamp: new Date().toISOString()
        })
      );

      const results = await Promise.allSettled(sentimentInserts);
      const errors = results.filter(r => r.status === 'rejected');
      
      if (errors.length > 0) {
        console.error('[PriceSync] Error inserting sentiment:', errors);
      } else {
        console.log('[PriceSync] Updated market sentiment with real Fear & Greed data for all timeframes');
      }
    }

    console.log('[PriceSync] Sync completed successfully');

    // Build chain metrics by aggregating updated agents for client consumption
    const chainGroups: Record<string, { totalVolume: number; totalMarketCap: number; count: number }> = {};
    for (const a of agents || []) {
      const chain = ((a as any).chain || 'Base').toLowerCase();
      if (!chainGroups[chain]) chainGroups[chain] = { totalVolume: 0, totalMarketCap: 0, count: 0 };
      chainGroups[chain].totalVolume += (a as any).volume_24h || 0;
      chainGroups[chain].totalMarketCap += (a as any).market_cap || 0;
      chainGroups[chain].count += 1;
    }

    // Fetch real TVL from DefiLlama; fall back to synthetic aggregation
    const [ethTVL, baseTVL, bscTVL] = await Promise.all([
      fetchDefiLlamaTVL('ethereum'),
      fetchDefiLlamaTVL('base'),
      fetchDefiLlamaTVL('bsc'),
    ]);
    const realTVL: Record<string, number | null> = { ethereum: ethTVL, base: baseTVL, bnb: bscTVL };

    const chainConfig: Record<string, { blockTime: number; tps: number; gas: number }> = {
      ethereum: { blockTime: 12, tps: 15, gas: 20 },
      base: { blockTime: 2, tps: 100, gas: 0.02 },
      bnb: { blockTime: 3, tps: 160, gas: 3 },
      polygon: { blockTime: 2, tps: 65, gas: 0.02 },
    };

    const nowIso = new Date().toISOString();
    const buildMetrics = (key: 'ethereum' | 'base' | 'bnb' | 'polygon') => {
      const g = chainGroups[key] || { totalVolume: 0, totalMarketCap: 0, count: 0 };
      const cfg = chainConfig[key];
      return {
        tvl: (realTVL as any)[key] ?? g.totalMarketCap * 1.5,
        volume_24h: g.totalVolume,
        transactions_24h: Math.max(1, g.count) * 800,
        active_addresses_24h: Math.max(1, g.count) * 200,
        avg_gas_price: cfg.gas,
        block_time: cfg.blockTime,
        tps: cfg.tps,
        timestamp: nowIso,
      };
    };

    const chainMetrics = {
      ethereum: buildMetrics('ethereum'),
      base: buildMetrics('base'),
      bnb: buildMetrics('bnb'),
      polygon: buildMetrics('polygon'),
    };

    return new Response(
      JSON.stringify({
        success: true,
        metrics: {
          agents_updated: updates.length,
          real_data_sources: {
            coingecko: !!coinGeckoData,
            fear_greed: !!fearGreedData
          }
        },
        chainMetrics,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[PriceSync] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
