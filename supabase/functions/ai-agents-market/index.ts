import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper to normalize network names from various sources
function normalizeNetworkName(input?: string): string {
  if (!input) return 'Other';
  
  const normalized = input.toLowerCase().trim();
  
  // Ethereum variants
  if (normalized === 'ethereum' || normalized === 'eth') return 'Ethereum';
  
  // Solana
  if (normalized === 'solana' || normalized === 'sol') return 'Solana';
  
  // Base
  if (normalized === 'base') return 'Base';
  
  // BNB Chain variants
  if (normalized === 'bsc' || normalized === 'bnb' || normalized === 'binance-smart-chain' || normalized === 'binance smart chain') return 'BNB Chain';
  
  // NEAR Protocol
  if (normalized === 'near' || normalized === 'near-protocol') return 'NEAR';
  
  // Polygon
  if (normalized === 'polygon' || normalized === 'matic' || normalized === 'polygon-pos') return 'Polygon';
  
  // Avalanche
  if (normalized === 'avalanche' || normalized === 'avax' || normalized === 'avalanche-c-chain') return 'Avalanche';
  
  // Arbitrum
  if (normalized === 'arbitrum' || normalized === 'arbitrum-one') return 'Arbitrum';
  
  // Optimism
  if (normalized === 'optimism' || normalized === 'op') return 'Optimism';
  
  // Tron
  if (normalized === 'tron' || normalized === 'trx') return 'Tron';
  
  // Fantom
  if (normalized === 'fantom' || normalized === 'ftm') return 'Fantom';
  
  // Cardano
  if (normalized === 'cardano' || normalized === 'ada') return 'Cardano';
  
  // Cosmos
  if (normalized === 'cosmos' || normalized === 'atom') return 'Cosmos';
  
  // TON
  if (normalized === 'ton' || normalized === 'toncoin' || normalized === 'the-open-network') return 'TON';
  
  return 'Other';
}

// Helper to detect the native blockchain of a token from CoinGecko data
function detectNativeChain(coin: any): string {
  // Priority 1: Check asset_platform_id (most reliable for native chain)
  if (coin.asset_platform_id) {
    return normalizeNetworkName(coin.asset_platform_id);
  }
  
  // Priority 2: Check platforms object keys
  if (coin.platforms && typeof coin.platforms === 'object') {
    const platformKeys = Object.keys(coin.platforms);
    if (platformKeys.length > 0) {
      // Use the first platform as primary chain
      return normalizeNetworkName(platformKeys[0]);
    }
  }
  
  // Priority 3: Check if it's a known L1 blockchain by coin ID
  if (coin.id) {
    const knownL1s: Record<string, string> = {
      'solana': 'Solana',
      'near': 'NEAR',
      'ethereum': 'Ethereum',
      'avalanche-2': 'Avalanche',
      'cardano': 'Cardano',
      'toncoin': 'TON',
      'cosmos': 'Cosmos',
      'fantom': 'Fantom',
      'tron': 'Tron',
      'bnb': 'BNB Chain',
      'polygon-ecosystem-token': 'Polygon',
      'matic-network': 'Polygon'
    };
    
    if (knownL1s[coin.id]) {
      return knownL1s[coin.id];
    }
  }
  
  return 'Other';
}

// Helper to fetch DefiLlama data for a token
async function getDefiLlamaData(tokenSymbol: string, coinGeckoId?: string) {
  try {
    // First try to get protocol data by name/symbol
    const protocolsResponse = await fetch('https://api.llama.fi/protocols');
    if (!protocolsResponse.ok) return null;

    const protocols = await protocolsResponse.json();
    
    // Find matching protocol (case-insensitive)
    const matchedProtocol = protocols.find((p: any) => 
      p.name.toLowerCase().includes(tokenSymbol.toLowerCase()) ||
      p.symbol?.toLowerCase() === tokenSymbol.toLowerCase() ||
      p.gecko_id === coinGeckoId
    );

    if (!matchedProtocol) return null;

    // Get detailed protocol data
    const detailResponse = await fetch(`https://api.llama.fi/protocol/${matchedProtocol.slug}`);
    if (!detailResponse.ok) return null;

    const detail = await detailResponse.json();

    return {
      tvl: detail.tvl || matchedProtocol.tvl || 0,
      chainTvls: detail.chainTvls || {},
      mcaptvl: detail.mcaptvl || 0,
      category: detail.category || matchedProtocol.category || '',
      chains: detail.chains || matchedProtocol.chains || [],
      protocolSlug: matchedProtocol.slug,
      twitter: detail.twitter || '',
      url: detail.url || ''
    };
  } catch (error) {
    console.error('[DefiLlama] Error:', error);
    return null;
  }
}

// Helper to fetch DEXScreener data for a token
async function getDEXScreenerData(tokenAddress?: string, searchQuery?: string) {
  try {
    let url = '';
    
    if (tokenAddress) {
      // Search by token address
      url = `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`;
    } else if (searchQuery) {
      // Search by query
      url = `https://api.dexscreener.com/latest/dex/search/?q=${encodeURIComponent(searchQuery)}`;
    } else {
      return null;
    }

    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    
    // Get the best pair (highest liquidity)
    const pairs = data.pairs || [];
    if (pairs.length === 0) return null;

    const bestPair = pairs.reduce((best: any, current: any) => {
      const bestLiq = best?.liquidity?.usd || 0;
      const currentLiq = current?.liquidity?.usd || 0;
      return currentLiq > bestLiq ? current : best;
    }, pairs[0]);

    // Construct readable pair name from base and quote tokens
    const baseSymbol = bestPair.baseToken?.symbol || '';
    const quoteSymbol = bestPair.quoteToken?.symbol || '';
    const pairName = (baseSymbol && quoteSymbol) ? `${baseSymbol}/${quoteSymbol}` : '';

    return {
      dexLiquidity: bestPair.liquidity?.usd || 0,
      dexVolume24h: bestPair.volume?.h24 || 0,
      dexPriceUsd: parseFloat(bestPair.priceUsd || '0'),
      dexPriceChange24h: bestPair.priceChange?.h24 || 0,
      dexPair: pairName,
      dexName: bestPair.dexId,
      dexChain: bestPair.chainId,
      fdv: bestPair.fdv || 0,
      pairCreatedAt: bestPair.pairCreatedAt,
      pairAddress: bestPair.pairAddress
    };
  } catch (error) {
    console.error('[DEXScreener] Error:', error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, limit = 100, id, days = 30, enrich = false } = await req.json();

    console.log('[AI-Market] Request:', { action, limit, id, days, enrich });

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

      // PERFORMANCE NOTE:
      // Full enrichment (DEXScreener + DefiLlama per coin) frequently exceeds Edge CPU time
      // for larger lists. By default we return a "lite" list (CoinGecko only). If the caller
      // explicitly requests enrich=true, we only enrich the first 8 items to stay within limits.

      let agents: any[] = data.map((coin: any) => ({
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
        chain: detectNativeChain(coin),
        liquidity_chain: '',
        category: 'AI & Big Data'
      }));

      if (enrich) {
        const enrichCount = Math.min(8, agents.length);
        const enriched = await Promise.all(
          agents.slice(0, enrichCount).map(async (a) => {
            try {
              const [dexData, llamaData] = await Promise.all([
                getDEXScreenerData(undefined, a.symbol),
                getDefiLlamaData(a.symbol, a.id)
              ]);
              return {
                ...a,
                // Keep native chain, add liquidity chain separately
                liquidity_chain: normalizeNetworkName(dexData?.dexChain),
                // DEXScreener enrichment
                dex_liquidity: dexData?.dexLiquidity || 0,
                dex_volume_24h: dexData?.dexVolume24h || 0,
                dex_price_usd: dexData?.dexPriceUsd || 0,
                dex_chain: dexData?.dexChain || '',
                dex_name: dexData?.dexName || '',
                dex_pair: dexData?.dexPair || '',
                fdv: dexData?.fdv || 0,
                // DefiLlama enrichment
                tvl: llamaData?.tvl || 0,
                chain_tvls: llamaData?.chainTvls || {},
                mcap_tvl_ratio: llamaData?.mcaptvl || 0,
                defi_category: llamaData?.category || '',
                chains: llamaData?.chains || [],
                protocol_slug: llamaData?.protocolSlug || '',
                twitter: llamaData?.twitter || '',
                website: llamaData?.url || ''
              };
            } catch (_) {
              return a;
            }
          })
        );
        agents = [...enriched, ...agents.slice(enrichCount)];
      }

      console.log('[AI-Market] Fetched:', agents.length, 'AI tokens (lite=', !enrich, ')');

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
        chain: 'Other',
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
      
      // Fetch DEXScreener and DefiLlama data in parallel
      const [dexData, llamaData] = await Promise.all([
        getDEXScreenerData(undefined, coin.symbol),
        getDefiLlamaData(coin.symbol, coin.id)
      ]);
      
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
        chain: detectNativeChain(coin),
        liquidity_chain: normalizeNetworkName(dexData?.dexChain),
        category: 'AI & Big Data',
        description: coin.description?.en || '',
        // DEXScreener enrichment
        dex_liquidity: dexData?.dexLiquidity || 0,
        dex_volume_24h: dexData?.dexVolume24h || 0,
        dex_price_usd: dexData?.dexPriceUsd || 0,
        dex_chain: dexData?.dexChain || '',
        dex_name: dexData?.dexName || '',
        fdv: dexData?.fdv || coin.market_data?.fully_diluted_valuation?.usd || 0,
        // DefiLlama enrichment
        tvl: llamaData?.tvl || 0,
        chain_tvls: llamaData?.chainTvls || {},
        mcap_tvl_ratio: llamaData?.mcaptvl || 0,
        defi_category: llamaData?.category || '',
        chains: llamaData?.chains || [],
        protocol_slug: llamaData?.protocolSlug || '',
        twitter: llamaData?.twitter || '',
        website: llamaData?.url || ''
      };

      console.log('[AI-Market] Agent:', agent.name, 'with DEX + DeFi data');

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
        chain: 'Other',
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
