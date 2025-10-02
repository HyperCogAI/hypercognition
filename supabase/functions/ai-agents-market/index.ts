import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, limit = 100, id, days = 30 } = await req.json();

    console.log('[AI-Market] Request:', { action, limit, id, days });

    // Fetch AI & Big Data category tokens from CoinGecko
    if (action === 'getTopAIAgents') {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=artificial-intelligence&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&price_change_percentage=24h,7d`,
        {
          headers: {
            'accept': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform CoinGecko data to our format
      const agents = data.map((coin: any) => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol.toUpperCase(),
        price: coin.current_price || 0,
        market_cap: coin.market_cap || 0,
        volume_24h: coin.total_volume || 0,
        change_24h: coin.price_change_24h || 0,
        change_percent_24h: coin.price_change_percentage_24h || 0,
        change_percent_7d: coin.price_change_percentage_7d_in_currency || 0,
        high_24h: coin.high_24h || 0,
        low_24h: coin.low_24h || 0,
        circulating_supply: coin.circulating_supply || 0,
        total_supply: coin.total_supply || 0,
        rank: coin.market_cap_rank || 0,
        avatar_url: coin.image || '',
        chain: 'Multi-Chain',
        category: 'AI & Big Data'
      }));

      console.log('[AI-Market] Fetched:', agents.length, 'AI tokens');

      return new Response(JSON.stringify(agents), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get trending AI tokens
    if (action === 'getTrendingAIAgents') {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=artificial-intelligence&order=price_change_percentage_24h_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h`,
        {
          headers: {
            'accept': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();
      
      const agents = data.map((coin: any) => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol.toUpperCase(),
        price: coin.current_price || 0,
        market_cap: coin.market_cap || 0,
        volume_24h: coin.total_volume || 0,
        change_24h: coin.price_change_24h || 0,
        change_percent_24h: coin.price_change_percentage_24h || 0,
        high_24h: coin.high_24h || 0,
        low_24h: coin.low_24h || 0,
        rank: coin.market_cap_rank || 0,
        avatar_url: coin.image || '',
        chain: 'Multi-Chain',
        category: 'AI & Big Data'
      }));

      console.log('[AI-Market] Trending:', agents.length, 'AI tokens');

      return new Response(JSON.stringify(agents), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get market stats
    if (action === 'getMarketStats') {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=artificial-intelligence&order=market_cap_desc&per_page=250&page=1&sparkline=false`,
        {
          headers: {
            'accept': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();
      
      const totalMarketCap = data.reduce((sum: number, coin: any) => sum + (coin.market_cap || 0), 0);
      const totalVolume24h = data.reduce((sum: number, coin: any) => sum + (coin.total_volume || 0), 0);
      const avgChange24h = data.reduce((sum: number, coin: any) => sum + (coin.price_change_percentage_24h || 0), 0) / data.length;

      const stats = {
        totalMarketCap,
        totalVolume24h,
        activeAgents: data.length,
        avgChange24h
      };

      console.log('[AI-Market] Stats:', stats);

      return new Response(JSON.stringify(stats), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get single agent by ID
    if (action === 'getAIAgentById' && id) {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false`,
        {
          headers: {
            'accept': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const coin = await response.json();
      
      const agent = {
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol.toUpperCase(),
        price: coin.market_data?.current_price?.usd || 0,
        market_cap: coin.market_data?.market_cap?.usd || 0,
        volume_24h: coin.market_data?.total_volume?.usd || 0,
        change_24h: coin.market_data?.price_change_24h || 0,
        change_percent_24h: coin.market_data?.price_change_percentage_24h || 0,
        high_24h: coin.market_data?.high_24h?.usd || 0,
        low_24h: coin.market_data?.low_24h?.usd || 0,
        circulating_supply: coin.market_data?.circulating_supply || 0,
        total_supply: coin.market_data?.total_supply || 0,
        rank: coin.market_cap_rank || 0,
        avatar_url: coin.image?.large || '',
        chain: 'Multi-Chain',
        category: 'AI & Big Data'
      };

      console.log('[AI-Market] Agent:', agent.name);

      return new Response(JSON.stringify(agent), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Search agents
    if (action === 'searchAIAgents') {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=artificial-intelligence&order=market_cap_desc&per_page=100&page=1&sparkline=false`,
        {
          headers: {
            'accept': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Client-side filtering will be done in the API client
      const agents = data.map((coin: any) => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol.toUpperCase(),
        price: coin.current_price || 0,
        market_cap: coin.market_cap || 0,
        volume_24h: coin.total_volume || 0,
        change_24h: coin.price_change_24h || 0,
        change_percent_24h: coin.price_change_percentage_24h || 0,
        avatar_url: coin.image || '',
        chain: 'Multi-Chain',
        category: 'AI & Big Data'
      }));

      return new Response(JSON.stringify(agents), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[AI-Market] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
