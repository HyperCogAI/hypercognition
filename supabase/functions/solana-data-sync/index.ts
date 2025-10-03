import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('[SolanaSync] Starting Solana data sync')

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch tokens from database
    const { data: tokens, error: tokensError } = await supabaseClient
      .from('solana_tokens')
      .select('id, mint_address, symbol, name')
      .eq('is_active', true)

    if (tokensError) {
      throw tokensError
    }

    console.log(`[SolanaSync] Fetching data for ${tokens.length} tokens`)

    let successCount = 0
    let errorCount = 0

    // Fetch data from DEXScreener for each token using mint address
    for (const token of tokens) {
      try {
        // Use token address endpoint for more accurate data
        const dexUrl = `https://api.dexscreener.com/latest/dex/tokens/${token.mint_address}`
        console.log(`[SolanaSync] Fetching ${token.symbol} from DEXScreener...`)
        
        const response = await fetch(dexUrl)
        
        if (!response.ok) {
          console.error(`[SolanaSync] DEXScreener API error for ${token.symbol}: ${response.status}`)
          errorCount++
          continue
        }

        const data = await response.json()
        
        // Find the best Solana pair (highest liquidity)
        const solanaPairs = data.pairs?.filter((p: any) => p.chainId === 'solana') || []
        
        if (solanaPairs.length === 0) {
          console.log(`[SolanaSync] No Solana pairs found for ${token.symbol}`)
          errorCount++
          continue
        }

        // Sort by liquidity and take the top pair
        const bestPair = solanaPairs.sort((a: any, b: any) => 
          (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0)
        )[0]

        const price = parseFloat(bestPair.priceUsd || '0')
        const change24h = parseFloat(bestPair.priceChange?.h24 || '0')
        const volume24h = parseFloat(bestPair.volume?.h24 || '0')
        const marketCap = parseFloat(bestPair.fdv || '0') // Use FDV as market cap
        const liquidity = parseFloat(bestPair.liquidity?.usd || '0')

        console.log(`[SolanaSync] ${token.symbol}: $${price}, 24h: ${change24h}%, Vol: $${volume24h}`)

        // Update token with DEXScreener data
        const { error: updateError } = await supabaseClient
          .from('solana_tokens')
          .update({
            price,
            change_24h: change24h,
            volume_24h: volume24h,
            market_cap: marketCap,
            updated_at: new Date().toISOString()
          })
          .eq('mint_address', token.mint_address)

        if (updateError) {
          console.error(`[SolanaSync] Error updating ${token.symbol}:`, updateError)
          errorCount++
          continue
        }

        // Insert price history
        await supabaseClient
          .from('solana_price_history')
          .insert({
            mint_address: token.mint_address,
            price,
            volume_24h: volume24h,
            market_cap: marketCap
          })

        successCount++
        
        // Rate limit - wait 400ms between requests to respect API limits
        await new Promise(resolve => setTimeout(resolve, 400))
      } catch (error) {
        console.error(`[SolanaSync] Error fetching data for ${token.symbol}:`, error)
        errorCount++
      }
    }

    // Clean up old price history (keep last 7 days)
    await supabaseClient
      .from('solana_price_history')
      .delete()
      .lt('timestamp', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    console.log('[SolanaSync] Sync completed successfully')

    return new Response(
      JSON.stringify({ 
        success: true, 
        tokensUpdated: tokens.length,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('[SolanaSync] Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
