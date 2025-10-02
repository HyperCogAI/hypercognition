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
    // CoinGecko API expects comma-separated coin IDs
    // For demo purposes, we'll use popular coins as reference
    const coinIds = 'bitcoin,ethereum,solana,polygon,chainlink,uniswap,aave,compound';
    
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`,
      {
        headers: {
          'x-cg-demo-api-key': apiKey
        }
      }
    );

    if (!response.ok) {
      console.error(`[PriceSync] CoinGecko API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    console.log('[PriceSync] Real price data fetched from CoinGecko');
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
      const { error: sentimentError } = await supabase
        .from('market_sentiment')
        .insert({
          fear_greed_index: fearGreedData.value,
          sentiment_label: fearGreedData.classification.toLowerCase(),
          overall_sentiment: (fearGreedData.value - 50) / 50, // Normalize to -1 to 1
          metadata: {
            source: 'alternative.me',
            real_data: true,
            coingecko_available: !!coinGeckoData
          },
          timestamp: new Date().toISOString()
        });

      if (sentimentError) {
        console.error('[PriceSync] Error inserting sentiment:', sentimentError);
      } else {
        console.log('[PriceSync] Updated market sentiment with real Fear & Greed data');
      }
    }

    console.log('[PriceSync] Sync completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        metrics: {
          agents_updated: updates.length,
          real_data_sources: {
            coingecko: !!coinGeckoData,
            fear_greed: !!fearGreedData
          }
        }
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
