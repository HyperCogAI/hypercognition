import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, poolId } = await req.json()

    if (action === 'match_orders') {
      const { data: pools } = poolId 
        ? await supabaseClient.from('solana_pools').select('id').eq('id', poolId).eq('is_active', true)
        : await supabaseClient.from('solana_pools').select('id').eq('is_active', true)

      if (!pools || pools.length === 0) {
        return new Response(
          JSON.stringify({ error: 'No active pools found' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
        )
      }

      const results = []
      for (const pool of pools) {
        const { data, error } = await supabaseClient.rpc('match_solana_limit_orders', {
          p_pool_id: pool.id
        })

        if (error) {
          console.error(`Error matching orders for pool ${pool.id}:`, error)
          continue
        }

        results.push({
          pool_id: pool.id,
          matches: data
        })
      }

      const { data: expiredCount } = await supabaseClient.rpc('expire_solana_limit_orders')

      return new Response(
        JSON.stringify({ 
          success: true, 
          results,
          expired_orders: expiredCount 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'expire_orders') {
      const { data: expiredCount, error } = await supabaseClient.rpc('expire_solana_limit_orders')

      if (error) {
        throw error
      }

      return new Response(
        JSON.stringify({ success: true, expired_count: expiredCount }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
