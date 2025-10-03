import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { 
      walletAddress,
      inputMint, 
      outputMint, 
      inputAmount, 
      slippageBps,
      route
    } = await req.json();

    console.log('[SolanaSwap] Processing swap request:', {
      walletAddress,
      inputMint: inputMint.substring(0, 8) + '...',
      outputMint: outputMint.substring(0, 8) + '...',
      inputAmount,
      slippageBps
    });

    // Get the actual swap transaction from Jupiter
    const swapResponse = await fetch('https://quote-api.jup.ag/v6/swap', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        quoteResponse: route,
        userPublicKey: walletAddress,
        wrapAndUnwrapSol: true,
        dynamicComputeUnitLimit: true,
        prioritizationFeeLamports: 'auto'
      })
    });

    if (!swapResponse.ok) {
      const errorText = await swapResponse.text();
      console.error('[SolanaSwap] Jupiter swap API error:', errorText);
      throw new Error(`Failed to get swap transaction: ${errorText}`);
    }

    const { swapTransaction } = await swapResponse.json();

    // Get token info for symbols
    const [inputToken, outputToken] = await Promise.all([
      fetch(`https://token.jup.ag/token/${inputMint}`).then(r => r.json()).catch(() => null),
      fetch(`https://token.jup.ag/token/${outputMint}`).then(r => r.json()).catch(() => null)
    ]);

    // Calculate output amount from route
    const outputAmount = parseInt(route.outAmount) / Math.pow(10, outputToken?.decimals || 6);

    // Record the swap in database
    const { data: swapRecord, error: insertError } = await supabaseClient
      .from('solana_swaps')
      .insert({
        user_id: user.id,
        wallet_address: walletAddress,
        input_mint: inputMint,
        output_mint: outputMint,
        input_amount: inputAmount,
        output_amount: outputAmount,
        input_symbol: inputToken?.symbol || inputMint.substring(0, 4),
        output_symbol: outputToken?.symbol || outputMint.substring(0, 4),
        slippage_bps: slippageBps,
        price_impact: parseFloat(route.priceImpactPct || '0'),
        route_data: route,
        status: 'pending'
      })
      .select()
      .single();

    if (insertError) {
      console.error('[SolanaSwap] Database insert error:', insertError);
      throw insertError;
    }

    console.log('[SolanaSwap] Swap recorded in database:', swapRecord.id);

    return new Response(
      JSON.stringify({ 
        success: true,
        swapTransaction,
        swapId: swapRecord.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[SolanaSwap] Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
