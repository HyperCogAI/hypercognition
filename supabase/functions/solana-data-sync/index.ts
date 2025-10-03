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

    // Fetch price data from CoinGecko for tokens with coingecko_id
    const { data: tokensWithCoingecko } = await supabaseClient
      .from('solana_tokens')
      .select('id, mint_address, symbol')
      .eq('is_active', true)
      .not('symbol', 'is', null)
    
    const coingeckoIds = tokensWithCoingecko
      ?.map(t => t.symbol?.toLowerCase())
      .filter(Boolean)
      .join(',')

    let priceData: any = {}
    
    if (coingeckoIds) {
      try {
        const coingeckoUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoIds}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`
        const response = await fetch(coingeckoUrl)
        
        if (response.ok) {
          priceData = await response.json()
          console.log(`[SolanaSync] CoinGecko data fetched for ${Object.keys(priceData).length} tokens`)
        } else {
          console.error(`[SolanaSync] CoinGecko API error: ${response.status}`)
        }
      } catch (error) {
        console.error('[SolanaSync] Error fetching from CoinGecko:', error)
      }
    }

    // Fetch additional data from DEXScreener for all tokens
    for (const token of tokens) {
      try {
        const dexUrl = `https://api.dexscreener.com/latest/dex/search?q=${token.symbol}`
        const response = await fetch(dexUrl)
        
        if (response.ok) {
          const data = await response.json()
          const pair = data.pairs?.find((p: any) => 
            p.chainId === 'solana' && 
            (p.baseToken?.address === token.mint_address || p.baseToken?.symbol === token.symbol)
          )
          
          if (pair) {
            // Update token with DEXScreener data
            await supabaseClient
              .from('solana_tokens')
              .update({
                price: parseFloat(pair.priceUsd || '0'),
                change_24h: pair.priceChange?.h24 || 0,
                volume_24h: pair.volume?.h24 || 0,
                market_cap: pair.marketCap || 0,
                updated_at: new Date().toISOString()
              })
              .eq('mint_address', token.mint_address)

            // Insert price history
            await supabaseClient
              .from('solana_price_history')
              .insert({
                mint_address: token.mint_address,
                price: parseFloat(pair.priceUsd || '0'),
                volume_24h: pair.volume?.h24 || 0,
                market_cap: pair.marketCap || 0
              })
          }
        }
        
        // Rate limit - wait 300ms between requests
        await new Promise(resolve => setTimeout(resolve, 300))
      } catch (error) {
        console.error(`[SolanaSync] Error fetching DEXScreener data for ${token.symbol}:`, error)
      }
    }

    // Update tokens with CoinGecko data (if available)
    if (Object.keys(priceData).length > 0) {
      for (const token of tokensWithCoingecko || []) {
        const symbolKey = token.symbol?.toLowerCase()
        if (symbolKey && priceData[symbolKey]) {
          const data = priceData[symbolKey]
        
        await supabaseClient
          .from('solana_tokens')
          .update({
            price: data.usd || 0,
            change_24h: data.usd_24h_change || 0,
            market_cap: data.usd_market_cap || 0,
            volume_24h: data.usd_24h_vol || 0,
            updated_at: new Date().toISOString()
          })
          .eq('mint_address', token.mint_address)

        // Insert price history
        await supabaseClient
          .from('solana_price_history')
          .insert({
            mint_address: token.mint_address,
            price: data.usd || 0,
            volume_24h: data.usd_24h_vol || 0,
            market_cap: data.usd_market_cap || 0
          })
        }
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
