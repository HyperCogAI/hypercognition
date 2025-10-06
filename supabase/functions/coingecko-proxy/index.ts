const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Server-side cache to reduce API calls and bypass rate limits
const cache = new Map<string, { timestamp: number; data: any }>();

// Cache TTL configurations (in milliseconds)
const CACHE_CONFIG = {
  markets: 30_000,      // 30s for market data (frequently changing)
  chart: 60_000,        // 60s for charts (less volatile)
  search: 120_000,      // 2m for search/trending (relatively static)
  default: 30_000       // 30s default
};

function getCacheTTL(endpoint: string): number {
  if (endpoint.includes('/market_chart')) return CACHE_CONFIG.chart;
  if (endpoint.includes('/search')) return CACHE_CONFIG.search;
  if (endpoint.includes('/coins/markets')) return CACHE_CONFIG.markets;
  return CACHE_CONFIG.default;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const endpoint = url.searchParams.get('endpoint');
    
    if (!endpoint) {
      throw new Error('Missing endpoint parameter');
    }

    // Build the CoinGecko API URL
    const coinGeckoUrl = `https://api.coingecko.com/api/v3${endpoint}`;
    
    console.log(`[CoinGecko Proxy] Request: ${endpoint}`);

    // Check cache first
    const cacheKey = endpoint;
    const cacheTTL = getCacheTTL(endpoint);
    const now = Date.now();
    const cached = cache.get(cacheKey);
    
    if (cached && (now - cached.timestamp) < cacheTTL) {
      console.log(`[CoinGecko Proxy] Cache HIT: ${endpoint}`);
      return new Response(JSON.stringify(cached.data), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-Cache': 'HIT',
          'Cache-Control': `public, max-age=${Math.floor(cacheTTL / 1000)}`
        },
      });
    }

    console.log(`[CoinGecko Proxy] Cache MISS: ${endpoint}`);

    // Make request to CoinGecko API with retry on 429
    const doFetch = () => fetch(coinGeckoUrl, {
      headers: {
        'Accept': 'application/json',
      },
    });

    let response = await doFetch();

    // Retry once on rate limit with exponential backoff
    if (response.status === 429) {
      console.warn('[CoinGecko Proxy] Rate limited (429), retrying in 2s...');
      await new Promise((r) => setTimeout(r, 2000));
      response = await doFetch();
    }

    if (!response.ok) {
      const text = await response.text();
      console.error(`[CoinGecko Proxy] API error: ${response.status}`, text);
      
      // Return stale cached data if available on error
      if (cached) {
        console.log('[CoinGecko Proxy] Returning stale cache due to API error');
        return new Response(JSON.stringify(cached.data), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'X-Cache': 'STALE',
            'X-Error': 'API_ERROR'
          },
        });
      }
      
      return new Response(
        JSON.stringify({ 
          error: `CoinGecko API error: ${response.status}`, 
          details: text,
          success: false 
        }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const data = await response.json();
    
    // Cache the successful response
    cache.set(cacheKey, { timestamp: now, data });
    
    console.log(`[CoinGecko Proxy] Success: ${endpoint} (cached for ${cacheTTL}ms)`);

    return new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'X-Cache': 'MISS',
        'Cache-Control': `public, max-age=${Math.floor(cacheTTL / 1000)}`
      },
    });

  } catch (error) {
    console.error('[CoinGecko Proxy] Error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
