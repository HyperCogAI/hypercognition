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

    // Fetch tokens from database with their IDs and existing logos
    const { data: tokens, error: tokensError } = await supabaseClient
      .from('solana_tokens')
      .select('id, mint_address, symbol, name, image_url')
      .eq('is_active', true)

    if (tokensError) {
      throw tokensError
    }

    console.log(`[SolanaSync] Fetching data for ${tokens.length} tokens in parallel`)

    // Fetch Jupiter token list with logos
    const mintAddresses = tokens.map(t => t.mint_address)
    let jupiterTokens: Record<string, any> = {}
    try {
      console.log('[SolanaSync] Fetching Jupiter token metadata...')
      const jupiterTokensResponse = await fetch('https://tokens.jup.ag/tokens?tags=verified')
      if (jupiterTokensResponse.ok) {
        const tokensList = await jupiterTokensResponse.json()
        // Create lookup map by mint address
        tokensList.forEach((token: any) => {
          jupiterTokens[token.address] = token
        })
        console.log(`[SolanaSync] Loaded ${Object.keys(jupiterTokens).length} Jupiter tokens with metadata`)
      }
    } catch (error) {
      console.warn('[SolanaSync] Jupiter tokens fetch failed:', error)
    }

    // Fetch Jupiter prices as fallback
    let jupiterPrices: Record<string, any> = {}
    try {
      console.log('[SolanaSync] Fetching Jupiter prices...')
      const jupiterUrl = `https://api.jup.ag/price/v2?ids=${mintAddresses.join(',')}`
      const jupiterResponse = await fetch(jupiterUrl)
      if (jupiterResponse.ok) {
        const jupiterData = await jupiterResponse.json()
        jupiterPrices = jupiterData.data || {}
        console.log(`[SolanaSync] Fetched Jupiter prices for ${Object.keys(jupiterPrices).length} tokens`)
      }
    } catch (error) {
      console.warn('[SolanaSync] Jupiter price API failed:', error)
    }

    // Batch tokens into groups of 5 for parallel processing
    const batchSize = 5
    const tokenBatches = []
    for (let i = 0; i < tokens.length; i += batchSize) {
      tokenBatches.push(tokens.slice(i, i + batchSize))
    }

    let successCount = 0
    let errorCount = 0
    const updates: any[] = []
    const priceHistory: any[] = []

    // Process batches in parallel
    for (const batch of tokenBatches) {
      const batchResults = await Promise.allSettled(
        batch.map(async (token) => {
          try {
            const dexUrl = `https://api.dexscreener.com/latest/dex/tokens/${token.mint_address}`
            const response = await fetch(dexUrl, {
              headers: { 'Accept': 'application/json' }
            })
            
            if (!response.ok) {
              throw new Error(`API error: ${response.status}`)
            }

            const data = await response.json()
            const solanaPairs = data.pairs?.filter((p: any) => p.chainId === 'solana') || []
            
            // If no DEX pairs found, try Jupiter as fallback
            if (solanaPairs.length === 0) {
              const jupiterPrice = jupiterPrices[token.mint_address]
              if (jupiterPrice) {
                const price = parseFloat(jupiterPrice.price || '0')
                if (isFinite(price) && price > 0) {
                  // Get logo from Jupiter token list or existing
                  const jupiterToken = jupiterTokens[token.mint_address]
                  const logoUrl = jupiterToken?.logoURI || token.image_url || null

                  return {
                    token,
                    price,
                    change24h: 0, // Jupiter API v2 doesn't provide 24h change
                    volume24h: 0,
                    marketCap: 0,
                    logoUrl,
                  }
                }
              }
              
              // Still update logo even if no price data
              const jupiterToken = jupiterTokens[token.mint_address]
              if (jupiterToken?.logoURI && !token.image_url) {
                return {
                  token,
                  price: 0,
                  change24h: 0,
                  volume24h: 0,
                  marketCap: 0,
                  logoUrl: jupiterToken.logoURI,
                }
              }
              
              throw new Error('No trading data found on DEXScreener or Jupiter')
            }

            // Prefer pairs where our token is the base; otherwise handle inverse (quote) pairs by inverting price
            const lowerMint = token.mint_address.toLowerCase()
            const directPairs = solanaPairs.filter((p: any) => (p.baseToken?.address || '').toLowerCase() === lowerMint)
            const inversePairs = solanaPairs.filter((p: any) => (p.quoteToken?.address || '').toLowerCase() === lowerMint)
            const pickByLiquidity = (arr: any[]) => arr.sort((a: any, b: any) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0]

            const selectedPair = directPairs.length ? pickByLiquidity(directPairs) : (inversePairs.length ? pickByLiquidity(inversePairs) : null)
            if (!selectedPair) {
              throw new Error('No matching pairs for token address')
            }
            const isBase = directPairs.length > 0

            const basePriceUsd = parseFloat(selectedPair.priceUsd || '0')
            if (!isFinite(basePriceUsd) || basePriceUsd <= 0) {
              throw new Error('Invalid base pair price')
            }
            const price = isBase ? basePriceUsd : (1 / basePriceUsd)

            // Approximate inverse percentage change for quote-side tokens
            const baseChange = parseFloat(selectedPair.priceChange?.h24 || '0')
            const change24h = isBase ? baseChange : (baseChange === 0 ? 0 : -baseChange)

            const volume24h = parseFloat(selectedPair.volume?.h24 || '0')
            const marketCap = isBase ? parseFloat(selectedPair.fdv || '0') : 0

            if (!isFinite(price) || price <= 0) {
              throw new Error('Computed invalid price')
            }

            // Extract logo URL from multiple sources with priority:
            // 1. DexScreener pair info
            // 2. DexScreener token info
            // 3. Jupiter token list
            // 4. Existing database logo
            const dexLogo = isBase 
              ? (selectedPair.info?.imageUrl || selectedPair.baseToken?.imageUrl)
              : (selectedPair.info?.imageUrl || selectedPair.quoteToken?.imageUrl)
            
            const jupiterToken = jupiterTokens[token.mint_address]
            const logoUrl = dexLogo || jupiterToken?.logoURI || token.image_url || null

            return {
              token,
              price,
              change24h,
              volume24h,
              marketCap,
              logoUrl,
            }
          } catch (error) {
            console.error(`[SolanaSync] Error for ${token.symbol}:`, error)
            throw error
          }
        })
      )

      // Process results
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const { token, price, change24h, volume24h, marketCap, logoUrl } = result.value
          successCount++
          
          updates.push({
            mint_address: token.mint_address,
            price,
            change_24h: change24h,
            volume_24h: volume24h,
            market_cap: marketCap,
            image_url: logoUrl,
            updated_at: new Date().toISOString()
          })

          priceHistory.push({
            token_id: token.id,
            mint_address: token.mint_address,
            price,
            volume: volume24h,
            market_cap: marketCap
          })
          
          console.log(`[SolanaSync] ✓ ${token.symbol}: $${price}, ${change24h.toFixed(2)}%`)
        } else {
          errorCount++
        }
      })

      // Small delay between batches to respect rate limits
      if (tokenBatches.indexOf(batch) < tokenBatches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200))
      }
    }

    // Batch update all tokens
    if (updates.length > 0) {
      console.log(`[SolanaSync] Updating ${updates.length} tokens in database...`)
      
      // Update each token (Supabase doesn't support bulk upsert easily)
      await Promise.all(
        updates.map(update => 
          supabaseClient
            .from('solana_tokens')
            .update({
              price: update.price,
              change_24h: update.change_24h,
              volume_24h: update.volume_24h,
              market_cap: update.market_cap,
              image_url: update.image_url,
              updated_at: update.updated_at
            })
            .eq('mint_address', update.mint_address)
        )
      )

      // Batch insert price history
      if (priceHistory.length > 0) {
        await supabaseClient
          .from('solana_price_history')
          .insert(priceHistory)
      }
    }

    // Clean up old price history (keep last 7 days) - async, don't wait
    supabaseClient
      .from('solana_price_history')
      .delete()
      .lt('timestamp', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .then(() => console.log('[SolanaSync] Old price history cleaned'))

    console.log(`[SolanaSync] ✅ Sync completed: ${successCount} successful, ${errorCount} failed`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        tokensUpdated: successCount,
        tokensFailed: errorCount,
        totalTokens: tokens.length,
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
