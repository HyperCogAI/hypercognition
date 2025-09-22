import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

interface SolanaToken {
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

  const fetchTokens = async () => {
    const { data, error } = await supabase
      .from('solana_tokens')
      .select('*')
      .eq('is_active', true)
      .order('market_cap', { ascending: false })

    if (error) {
      console.error('Error fetching Solana tokens:', error)
      return
    }

    setTokens(data || [])
    setIsLoading(false)
  }

  useEffect(() => {
    // Initial fetch
    fetchTokens()

    // Set up real-time subscription
    const channel = supabase
      .channel('solana-tokens-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'solana_tokens'
        },
        (payload) => {
          console.log('Solana token update:', payload)
          fetchTokens() // Refetch data on any change
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

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