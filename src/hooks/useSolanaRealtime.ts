import { useState, useEffect } from 'react'
import { coinGeckoSolanaApi } from '@/lib/apis/coingeckoSolanaApi'
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
      
      // Use CoinGecko Solana API instead of Birdeye
      const tokensData = await coinGeckoSolanaApi.getSolanaTokens()
      
      if (!tokensData || tokensData.length === 0) {
        console.warn('[SolanaRealtime] No data from CoinGecko - using mock data')
        setTokens(generateMockTokens())
        setIsLoading(false)
        return
      }

      // Map CoinGecko data to our format
      const mappedTokens = tokensData.slice(0, 20).map((token) => {
        try {
          if (!token || !token.id) return null
          
          return {
            id: token.id,
            mint_address: token.id, // Use ID as mint address proxy
            name: token.name,
            symbol: token.symbol,
            description: `${token.name} on Solana`,
            image_url: token.image || '/placeholder.svg',
            decimals: 9, // Default Solana decimals
            price: token.current_price,
            market_cap: token.market_cap || 0,
            volume_24h: token.total_volume || 0,
            change_24h: token.price_change_percentage_24h || 0,
            is_active: true
          } as SolanaToken
        } catch (error) {
          console.error(`Error mapping token ${token?.id}:`, error)
          return null
        }
      })

      const validTokens = mappedTokens.filter((token): token is SolanaToken => token !== null)
      
      // Sort by market cap descending
      validTokens.sort((a, b) => (b.market_cap || 0) - (a.market_cap || 0))
      
      setTokens(validTokens)
      console.log('Fetched', validTokens.length, 'Solana tokens from CoinGecko')
      
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