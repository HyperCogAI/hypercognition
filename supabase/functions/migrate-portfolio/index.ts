import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get auth user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log(`[MigratePortfolio] Starting migration for user ${user.id}`)

    // Get legacy crypto_portfolio data
    const { data: legacyData, error: fetchError } = await supabaseClient
      .from('crypto_portfolio')
      .select('*')
      .eq('user_id', user.id)

    if (fetchError) {
      console.error('[MigratePortfolio] Error fetching legacy data:', fetchError)
      return new Response(JSON.stringify({ error: 'Failed to fetch legacy data' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (!legacyData || legacyData.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No legacy data to migrate',
        migrated_count: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    let migratedCount = 0

    // Migrate each legacy entry
    for (const item of legacyData) {
      try {
        // Check if already migrated
        const { data: existing } = await supabaseClient
          .from('portfolio_holdings')
          .select('id')
          .eq('user_id', user.id)
          .eq('asset_id', item.crypto_id)
          .eq('asset_type', 'crypto')
          .maybeSingle()

        if (existing) {
          console.log(`[MigratePortfolio] Skipping ${item.crypto_symbol} - already migrated`)
          continue
        }

        // Create new holding
        const { error: insertError } = await supabaseClient
          .from('portfolio_holdings')
          .insert({
            user_id: user.id,
            asset_id: item.crypto_id,
            asset_type: 'crypto',
            asset_name: item.crypto_name,
            asset_symbol: item.crypto_symbol,
            quantity: item.amount,
            average_buy_price: item.purchase_price,
            total_invested: item.amount * item.purchase_price,
            current_value: item.amount * item.purchase_price,
            unrealized_pnl: 0,
            realized_pnl: 0
          })

        if (insertError) {
          console.error(`[MigratePortfolio] Error inserting ${item.crypto_symbol}:`, insertError)
          continue
        }

        migratedCount++
      } catch (error) {
        console.error(`[MigratePortfolio] Error processing ${item.crypto_symbol}:`, error)
      }
    }

    console.log(`[MigratePortfolio] Migrated ${migratedCount} of ${legacyData.length} items`)

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Successfully migrated ${migratedCount} portfolio items`,
      migrated_count: migratedCount,
      total_count: legacyData.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('[MigratePortfolio] Error:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})