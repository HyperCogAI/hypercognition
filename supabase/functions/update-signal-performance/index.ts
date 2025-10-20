import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CoinGeckoPrice {
  [key: string]: {
    usd: number;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log(`[update-signal-performance] Starting hourly performance update`);

    // Fetch all pending signals
    const { data: pendingSignals, error: fetchError } = await supabase
      .from('signal_performance_tracking')
      .select('*')
      .eq('outcome', 'pending')
      .order('created_at', { ascending: true })
      .limit(100); // Process 100 at a time

    if (fetchError) {
      throw fetchError;
    }

    console.log(`[update-signal-performance] Found ${pendingSignals?.length || 0} pending signals to update`);

    let updatedCount = 0;
    let errorCount = 0;

    for (const tracking of pendingSignals || []) {
      try {
        // Fetch current price
        let currentPrice = 0;
        
        const coinGeckoUrl = tracking.contract_address
          ? `https://api.coingecko.com/api/v3/simple/token_price/${tracking.chain}?contract_addresses=${tracking.contract_address}&vs_currencies=usd`
          : `https://api.coingecko.com/api/v3/simple/price?ids=${tracking.ticker.toLowerCase()}&vs_currencies=usd`;

        const priceResponse = await fetch(coinGeckoUrl);
        
        if (priceResponse.ok) {
          const priceData: CoinGeckoPrice = await priceResponse.json();
          const firstKey = Object.keys(priceData)[0];
          currentPrice = priceData[firstKey]?.usd || tracking.price_at_signal;
        } else {
          console.log(`[update-signal-performance] Failed to fetch price for ${tracking.ticker}, skipping`);
          continue;
        }

        // Calculate time elapsed
        const createdAt = new Date(tracking.created_at);
        const now = new Date();
        const hoursElapsed = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

        // Calculate returns
        const calculateReturn = (price: number, basePrice: number) => 
          ((price - basePrice) / basePrice) * 100;

        const currentReturn = calculateReturn(currentPrice, tracking.price_at_signal);

        // Update peak if new high
        const newPeakPrice = Math.max(tracking.peak_price || tracking.price_at_signal, currentPrice);
        const newPeakReturn = calculateReturn(newPeakPrice, tracking.price_at_signal);

        // Build update object
        const updates: any = {
          last_updated_at: now.toISOString(),
          peak_price: newPeakPrice,
          peak_return: newPeakReturn,
        };

        if (newPeakPrice > (tracking.peak_price || 0)) {
          updates.peak_reached_at = now.toISOString();
        }

        // Update time-based prices
        if (hoursElapsed >= 1 && !tracking.price_1h) {
          updates.price_1h = currentPrice;
          updates.return_1h = currentReturn;
        }
        if (hoursElapsed >= 4 && !tracking.price_4h) {
          updates.price_4h = currentPrice;
          updates.return_4h = currentReturn;
        }
        if (hoursElapsed >= 24 && !tracking.price_24h) {
          updates.price_24h = currentPrice;
          updates.return_24h = currentReturn;
        }
        if (hoursElapsed >= 168 && !tracking.price_7d) {
          updates.price_7d = currentPrice;
          updates.return_7d = currentReturn;
        }

        // Classify outcome after 24 hours
        if (hoursElapsed >= 24 && tracking.outcome === 'pending') {
          const return24h = updates.return_24h || currentReturn;
          
          if (return24h > 10) {
            updates.outcome = 'bullish';
          } else if (return24h < -5) {
            updates.outcome = 'bearish';
          } else {
            updates.outcome = 'neutral';
          }

          // Calculate performance score (0-100)
          // Based on peak return and sustained gains
          const peakScore = Math.min(100, Math.max(0, (newPeakReturn + 20) * 2));
          const sustainedScore = Math.min(100, Math.max(0, (return24h + 20) * 2));
          updates.performance_score = Math.round((peakScore * 0.6 + sustainedScore * 0.4));

          console.log(`[update-signal-performance] Classified ${tracking.ticker} as ${updates.outcome} (return: ${return24h.toFixed(2)}%, score: ${updates.performance_score})`);
        }

        // Update tracking record
        const { error: updateError } = await supabase
          .from('signal_performance_tracking')
          .update(updates)
          .eq('id', tracking.id);

        if (updateError) {
          console.error(`[update-signal-performance] Error updating ${tracking.ticker}:`, updateError);
          errorCount++;
        } else {
          updatedCount++;
        }

        // Rate limiting - wait 1 second between API calls
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`[update-signal-performance] Error processing ${tracking.ticker}:`, error);
        errorCount++;
      }
    }

    console.log(`[update-signal-performance] Completed: ${updatedCount} updated, ${errorCount} errors`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        totalProcessed: pendingSignals?.length || 0,
        updated: updatedCount,
        errors: errorCount 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[update-signal-performance] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
