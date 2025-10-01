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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    console.log('Updating market data for all agents...');

    // Fetch all agents
    const { data: agents, error: agentsError } = await supabaseClient
      .from('agents')
      .select('id, symbol, price, volume_24h')
      .limit(100);

    if (agentsError) {
      console.error('Error fetching agents:', agentsError);
      return new Response(JSON.stringify({ error: 'Failed to fetch agents' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const updates: any[] = [];
    let updated_count = 0;

    // Simulate price updates (in production, you'd fetch from real APIs)
    for (const agent of agents || []) {
      try {
        // Simulate realistic price movement (-5% to +5%)
        const price_change_percent = (Math.random() - 0.5) * 0.10; // -5% to +5%
        const current_price = parseFloat(agent.price || '0');
        const new_price = current_price * (1 + price_change_percent);
        
        // Simulate volume change
        const volume_change = (Math.random() - 0.5) * 0.20; // -10% to +10%
        const current_volume = parseFloat(agent.volume_24h || '0');
        const new_volume = Math.max(0, current_volume * (1 + volume_change));

        updates.push({
          id: agent.id,
          price: new_price.toFixed(6),
          volume_24h: new_volume.toFixed(2),
          change_24h: (price_change_percent * 100).toFixed(2)
        });

        updated_count++;
      } catch (error) {
        console.error(`Error updating agent ${agent.id}:`, error);
      }
    }

    // Batch update all agents
    for (const update of updates) {
      await supabaseClient
        .from('agents')
        .update({
          price: update.price,
          volume_24h: update.volume_24h,
          change_24h: update.change_24h,
          updated_at: new Date().toISOString()
        })
        .eq('id', update.id);
    }

    console.log(`Market data updated for ${updated_count} agents`);

    return new Response(JSON.stringify({ 
      success: true,
      updated_count,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Update market data error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
