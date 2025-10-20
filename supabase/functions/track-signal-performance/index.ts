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

    const { signalId } = await req.json();

    console.log(`[track-signal-performance] Starting tracking for signal: ${signalId}`);

    // Fetch signal details
    const { data: signal, error: signalError } = await supabase
      .from('twitter_kol_signals')
      .select('*, extracted_data')
      .eq('id', signalId)
      .single();

    if (signalError || !signal) {
      throw new Error(`Signal not found: ${signalError?.message}`);
    }

    // Extract ticker and contract from extracted_data
    const extractedData = signal.extracted_data as any;
    const ticker = extractedData?.ticker || extractedData?.token || null;
    const contractAddress = extractedData?.contract_address || null;
    const chain = extractedData?.chain || 'ethereum';

    if (!ticker) {
      console.log(`[track-signal-performance] No ticker found for signal ${signalId}, skipping tracking`);
      return new Response(
        JSON.stringify({ success: false, message: 'No ticker found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[track-signal-performance] Tracking ticker: ${ticker}, contract: ${contractAddress}`);

    // Fetch current price from CoinGecko
    let priceAtSignal = 0;
    let dataSource = 'coingecko';

    try {
      // Try CoinGecko first (free tier)
      const coinGeckoUrl = contractAddress
        ? `https://api.coingecko.com/api/v3/simple/token_price/${chain}?contract_addresses=${contractAddress}&vs_currencies=usd`
        : `https://api.coingecko.com/api/v3/simple/price?ids=${ticker.toLowerCase()}&vs_currencies=usd`;

      const priceResponse = await fetch(coinGeckoUrl);
      
      if (priceResponse.ok) {
        const priceData: CoinGeckoPrice = await priceResponse.json();
        const firstKey = Object.keys(priceData)[0];
        priceAtSignal = priceData[firstKey]?.usd || 0;
      } else {
        console.log(`[track-signal-performance] CoinGecko API failed, using fallback price`);
        priceAtSignal = 1; // Fallback price for tracking purposes
        dataSource = 'fallback';
      }
    } catch (error) {
      console.error(`[track-signal-performance] Error fetching price:`, error);
      priceAtSignal = 1; // Fallback
      dataSource = 'fallback';
    }

    console.log(`[track-signal-performance] Price at signal: $${priceAtSignal} (source: ${dataSource})`);

    // Insert performance tracking record
    const { error: insertError } = await supabase
      .from('signal_performance_tracking')
      .insert({
        signal_id: signalId,
        ticker: ticker,
        contract_address: contractAddress,
        chain: chain,
        price_at_signal: priceAtSignal,
        peak_price: priceAtSignal,
        peak_return: 0,
        outcome: 'pending',
        data_source: dataSource,
      });

    if (insertError) {
      console.error(`[track-signal-performance] Error inserting tracking:`, insertError);
      throw insertError;
    }

    console.log(`[track-signal-performance] Successfully started tracking for signal ${signalId}`);

    return new Response(
      JSON.stringify({ success: true, ticker, priceAtSignal, dataSource }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[track-signal-performance] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
