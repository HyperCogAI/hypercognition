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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: req.headers.get('Authorization')! } }
      }
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Initializing balance for user:', user.id);

    // Check if user already has a balance
    const { data: existingBalance } = await supabaseClient
      .from('user_balances')
      .select('id')
      .eq('user_id', user.id)
      .eq('currency', 'USD')
      .single();

    if (existingBalance) {
      return new Response(JSON.stringify({ 
        message: 'Balance already initialized',
        balance_id: existingBalance.id
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create initial balance (starting with $10,000 demo money)
    const { data: newBalance, error: balanceError } = await supabaseClient
      .from('user_balances')
      .insert({
        user_id: user.id,
        currency: 'USD',
        available_balance: 10000,
        locked_balance: 0
      })
      .select()
      .single();

    if (balanceError) {
      console.error('Balance creation error:', balanceError);
      return new Response(JSON.stringify({ error: 'Failed to initialize balance' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Balance initialized:', newBalance.id);

    return new Response(JSON.stringify({ 
      success: true,
      balance: newBalance
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Initialize balance error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
