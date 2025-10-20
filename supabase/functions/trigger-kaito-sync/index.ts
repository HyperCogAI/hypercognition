import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { kol_account_ids } = await req.json();

    if (!kol_account_ids || !Array.isArray(kol_account_ids) || kol_account_ids.length === 0) {
      return new Response(
        JSON.stringify({ error: 'kol_account_ids array is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Triggering Kaito sync for ${kol_account_ids.length} KOL accounts`);

    // Fetch KOL accounts to get usernames
    const { data: kolAccounts, error: kolError } = await supabase
      .from('twitter_kol_accounts')
      .select('id, twitter_username')
      .in('id', kol_account_ids);

    if (kolError) {
      console.error('Error fetching KOL accounts:', kolError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch KOL accounts' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    if (!kolAccounts || kolAccounts.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No KOL accounts found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    const usernames = kolAccounts.map(acc => acc.twitter_username);
    
    // Invoke the kaito-sync function
    const { data: syncResult, error: syncError } = await supabase.functions.invoke('kaito-sync', {
      body: { usernames }
    });

    if (syncError) {
      console.error('Error invoking kaito-sync:', syncError);
      return new Response(
        JSON.stringify({ error: 'Failed to sync Kaito scores', details: syncError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log(`Kaito sync completed for ${usernames.length} accounts`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        synced_accounts: usernames.length,
        details: syncResult 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in trigger-kaito-sync:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
