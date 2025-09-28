import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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

    console.log('Fetching from Birdeye:', birdeyeUrl.toString());

    // Make request to Birdeye API
    const response = await fetch(birdeyeUrl.toString(), {
      headers: {
        'X-API-KEY': BIRDEYE_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Birdeye API error:', response.status, response.statusText);
      throw new Error(`Birdeye API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Birdeye response:', data);

    return new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
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