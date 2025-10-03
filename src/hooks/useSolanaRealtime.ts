import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

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
  const { user } = useAuth();
  const [tokens, setTokens] = useState<SolanaToken[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchTokens = async () => {
    // Redirect to Solana auth if not authenticated
    if (!user) {
      window.location.href = '/solana-auth';
      return;
    }

    try {
      setIsLoading(true)
      
      // Fetch from Supabase
      const { data, error } = await supabase
        .from('solana_tokens')
        .select('*')
        .eq('is_active', true)
        .order('market_cap', { ascending: false })
        .limit(20)
      
      if (error) throw error
      
      if (!data || data.length === 0) {
        console.warn('[SolanaRealtime] No data from database - using mock data')
        setTokens(generateMockTokens())
        setIsLoading(false)
        return
      }

      // Map database data to our format
      const mappedTokens = data.map((token: any) => ({
        id: token.coingecko_id || token.mint_address,
        mint_address: token.mint_address,
        name: token.name,
        symbol: token.symbol,
        description: `${token.name} on Solana`,
        image_url: token.logo_uri || '/placeholder.svg',
        decimals: token.decimals,
        price: Number(token.price_usd),
        market_cap: Number(token.market_cap),
        volume_24h: Number(token.volume_24h),
        change_24h: Number(token.price_change_24h),
        is_active: token.is_active
      }))
      
      setTokens(mappedTokens)
      console.log('Fetched', mappedTokens.length, 'Solana tokens from database')
      
    } catch (error) {
      console.error('Error fetching Solana tokens:', error)
      // Fallback to mock data on error
      setTokens(generateMockTokens())
    } finally {
      setIsLoading(false)
    }
  }

  // Generate mock data when API fails
  const generateMockTokens = (): SolanaToken[] => {
    const mockTokens = [
      {
        id: 'solana',
        mint_address: 'So11111111111111111111111111111111111111112',
        name: 'Solana',
        symbol: 'SOL',
        description: 'Solana native token',
        image_url: '/placeholder.svg',
        decimals: 9,
        price: 165.42,
        market_cap: 77500000000,
        volume_24h: 2800000000,
        change_24h: 2.34,
        is_active: true
      },
      {
        id: 'bonk',
        mint_address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
        name: 'Bonk',
        symbol: 'BONK',
        description: 'Community meme coin',
        image_url: '/placeholder.svg',
        decimals: 5,
        price: 0.00002845,
        market_cap: 1800000000,
        volume_24h: 180000000,
        change_24h: -4.21,
        is_active: true
      },
      {
        id: 'jupiter',
        mint_address: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
        name: 'Jupiter',
        symbol: 'JUP',
        description: 'DEX aggregator token',
        image_url: '/placeholder.svg',
        decimals: 6,
        price: 0.987,
        market_cap: 1320000000,
        volume_24h: 85000000,
        change_24h: 1.87,
        is_active: true
      }
    ]
    
    return mockTokens
  }

  useEffect(() => {
    // Don't start fetching if user is not authenticated
    if (!user) return;
    
    // Initial fetch
    fetchTokens()

    // Set up periodic refresh every 30 seconds for real-time data
    const interval = setInterval(fetchTokens, 30000)

    return () => {
      clearInterval(interval)
    }
  }, [user])

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