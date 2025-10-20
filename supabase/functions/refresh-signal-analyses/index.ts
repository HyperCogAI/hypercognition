import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting signal analysis refresh job...');

    // Find signals with stale analysis (> 6 hours old) from the last 48 hours
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

    const { data: staleAnalyses, error: fetchError } = await supabase
      .from('signal_ticker_analysis')
      .select('signal_id, ticker')
      .lt('analysis_timestamp', sixHoursAgo)
      .gte('created_at', fortyEightHoursAgo);

    if (fetchError) {
      console.error('Error fetching stale analyses:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${staleAnalyses?.length || 0} stale analyses to refresh`);

    let refreshed = 0;
    let failed = 0;

    for (const analysis of staleAnalyses || []) {
      try {
        console.log(`Refreshing analysis for signal ${analysis.signal_id}, ticker $${analysis.ticker}`);
        
        const { error: invokeError } = await supabase.functions.invoke('analyze-signal-ticker', {
          body: {
            signal_id: analysis.signal_id,
            ticker: analysis.ticker,
            force_refresh: true,
          },
        });

        if (invokeError) {
          console.error(`Failed to refresh ${analysis.ticker}:`, invokeError);
          failed++;
        } else {
          refreshed++;
        }

        // Rate limiting: wait 2 seconds between refreshes to avoid overwhelming the Twitter API
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error(`Error refreshing analysis for ${analysis.ticker}:`, error);
        failed++;
      }
    }

    console.log(`Refresh job completed. Refreshed: ${refreshed}, Failed: ${failed}`);

    return new Response(
      JSON.stringify({
        success: true,
        total_found: staleAnalyses?.length || 0,
        refreshed,
        failed,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Refresh job error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
