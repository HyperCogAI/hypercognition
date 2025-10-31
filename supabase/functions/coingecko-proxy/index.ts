const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Server-side cache to reduce API calls and bypass rate limits
const cache = new Map<string, { timestamp: number; data: any }>();

// Cache TTL configurations (in milliseconds)
const CACHE_CONFIG = {
  markets: 120_000,     // 2min for market data (reduce API calls)
  chart: 180_000,       // 3min for charts
  search: 300_000,      // 5min for search/trending
  default: 120_000      // 2min default
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

    // Strip /api/v3 prefix if it exists (since we add it below)
    const cleanEndpoint = endpoint.startsWith('/api/v3') 
      ? endpoint.substring(7) // Remove '/api/v3'
      : endpoint;

    // Build the CoinGecko API URL
    const coinGeckoUrl = `https://api.coingecko.com/api/v3${cleanEndpoint}`;
    
    console.log(`[CoinGecko Proxy] Request: ${cleanEndpoint} -> ${coinGeckoUrl}`);

    // Check cache first
    const cacheKey = cleanEndpoint;
    const cacheTTL = getCacheTTL(cleanEndpoint);
    const now = Date.now();
    const cached = cache.get(cacheKey);
    
    if (cached && (now - cached.timestamp) < cacheTTL) {
      console.log(`[CoinGecko Proxy] Cache HIT: ${cleanEndpoint}`);
      return new Response(JSON.stringify(cached.data), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-Cache': 'HIT',
          'Cache-Control': `public, max-age=${Math.floor(cacheTTL / 1000)}`
        },
      });
    }

    console.log(`[CoinGecko Proxy] Cache MISS: ${cleanEndpoint}`);

    // Make request to CoinGecko API with retry on 429
    const apiKey = Deno.env.get('COINGECKO_API_KEY');
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };
    
    if (apiKey) {
      headers['x-cg-demo-api-key'] = apiKey;
    }
    
    const doFetch = () => fetch(coinGeckoUrl, { headers });

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
      
      // Always return cached data if available on error (even if stale)
      if (cached) {
        console.log('[CoinGecko Proxy] Returning stale cache due to API error');
        return new Response(JSON.stringify(cached.data), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'X-Cache': 'STALE',
            'X-Error': `API_ERROR_${response.status}`,
            'Cache-Control': `public, max-age=${Math.floor(cacheTTL / 1000)}`
          },
        });
      }
      
      // If rate limited and no cache, return a helpful error
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: 'Rate limit exceeded', 
            message: 'Using reduced refresh rate. Data may be slightly delayed.',
            success: false,
            cached: false
          }),
          { 
            status: 503, // Service temporarily unavailable
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
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
    
    console.log(`[CoinGecko Proxy] Success: ${cleanEndpoint} (cached for ${cacheTTL}ms)`);

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
