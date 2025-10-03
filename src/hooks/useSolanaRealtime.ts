import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/integrations/supabase/client'

export interface SolanaToken {
  id: string
  mint_address: string
  name: string
  symbol: string
  description?: string
  image_url?: string
  decimals: number
  price: number
  market_cap: number
  volume_24h: number
  change_24h: number
  is_active: boolean
}

export const useSolanaRealtime = () => {
  const [tokens, setTokens] = useState<SolanaToken[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const isFetchingRef = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchTokens = useCallback(async () => {
    // Prevent concurrent fetches
    if (isFetchingRef.current) {
      console.log('[SolanaRealtime] Fetch already in progress, skipping')
      return
    }

    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()
    isFetchingRef.current = true
    
    try {
      setIsLoading(true)
      
      // Fetch from Supabase with optimized query
      const { data, error } = await supabase
        .from('solana_tokens')
        .select('id, mint_address, name, symbol, description, image_url, decimals, price, market_cap, volume_24h, change_24h, is_active')
        .eq('is_active', true)
        .order('market_cap', { ascending: false })
        .limit(100)
      
      if (error) throw error
      
      if (!data || data.length === 0) {
        console.warn('[SolanaRealtime] No data from database')
        setTokens([])
        return
      }

      // Map database data with minimal processing
      const mappedTokens = data.map((token: any) => ({
        id: token.id,
        mint_address: token.mint_address,
        name: token.name,
        symbol: token.symbol,
        description: token.description || `${token.name} on Solana`,
        image_url: token.image_url || '/placeholder.svg',
        decimals: token.decimals,
        price: Number(token.price) || 0,
        market_cap: Number(token.market_cap) || 0,
        volume_24h: Number(token.volume_24h) || 0,
        change_24h: Number(token.change_24h) || 0,
        is_active: token.is_active
      }))
      
      setTokens(mappedTokens)
      console.log(`[SolanaRealtime] ✓ Loaded ${mappedTokens.length} tokens`)
      
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('[SolanaRealtime] Error:', error)
        setTokens([])
      }
    } finally {
      setIsLoading(false)
      isFetchingRef.current = false
    }
  }, [])


  // Generate mock data removed - using real data only

  useEffect(() => {
    // Initial fetch
    fetchTokens()

    // Set up periodic refresh every 60 seconds (data syncs every 5 min anyway)
    const interval = setInterval(fetchTokens, 60000)

    return () => {
      clearInterval(interval)
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchTokens])

  const getTokenByMint = (mintAddress: string) => {
    return tokens.find(token => token.mint_address === mintAddress)
  }

  const getTokensBySymbols = (symbols: string[]) => {
    return tokens.filter(token => symbols.includes(token.symbol))
  }

  return {
    tokens,
    isLoading,
    fetchTokens,
    getTokenByMint,
    getTokensBySymbols,
  }
}