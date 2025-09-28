const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Simple in-memory cache to absorb burst traffic and reduce 429s
const cache = new Map<string, { timestamp: number; data: any }>();
const CACHE_TTL_MS = 15_000; // 15s per Birdeye guidance for public endpoints

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const BIRDEYE_API_KEY = Deno.env.get('BIRDEYE_API_KEY');
    
    if (!BIRDEYE_API_KEY) {
      throw new Error('BIRDEYE_API_KEY not configured');
    }

    const url = new URL(req.url);
    const endpoint = url.searchParams.get('endpoint');
    const params = Object.fromEntries(url.searchParams.entries());
    delete params.endpoint; // Remove endpoint from params
    
    if (!endpoint) {
      throw new Error('Missing endpoint parameter');
    }

    // Build the Birdeye API URL
    const birdeyeUrl = new URL(`https://public-api.birdeye.so${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
      if (key !== 'endpoint') {
        birdeyeUrl.searchParams.append(key, value);
      }
    });

    // Cache key based on endpoint + params
    const cacheKey = `${endpoint}?${birdeyeUrl.searchParams.toString()}`;
    const now = Date.now();
    const cached = cache.get(cacheKey);
    if (cached && (now - cached.timestamp) < CACHE_TTL_MS) {
      return new Response(JSON.stringify(cached.data), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-Cache': 'HIT'
        },
      });
    }

    console.log('Fetching from Birdeye:', birdeyeUrl.toString());

    const doFetch = () => fetch(birdeyeUrl.toString(), {
      headers: {
        'X-API-KEY': BIRDEYE_API_KEY,
        'Content-Type': 'application/json',
        'x-chain': 'solana',
      },
    });

    // Make request to Birdeye API with a single retry on 429/5xx
    let response = await doFetch();
    if (response.status === 429 || (response.status >= 500 && response.status < 600)) {
      await new Promise((r) => setTimeout(r, 250));
      response = await doFetch();
    }

    if (!response.ok) {
      const text = await response.text();
      console.error('Birdeye API error:', response.status, text);
      return new Response(
        JSON.stringify({ error: `Birdeye API error: ${response.status}`, details: text, success: false }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    cache.set(cacheKey, { timestamp: now, data });

    return new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'X-Cache': 'MISS'
      },
    });

  } catch (error) {
    console.error('Error in birdeye-proxy:', error);
    
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