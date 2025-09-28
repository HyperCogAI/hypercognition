import { useState, useEffect } from 'react'
import { birdeyeApi, SOLANA_TOKEN_ADDRESSES } from '@/lib/apis/birdeyeApi'

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
    try {
      setIsLoading(true)
      
      // Get well-known Solana tokens
      const tokenAddresses = Object.values(SOLANA_TOKEN_ADDRESSES)
      const pricesData = await birdeyeApi.getMultipleTokenPrices(tokenAddresses)
      
      if (!pricesData) {
        console.error('Failed to fetch token prices from Birdeye - using mock data')
        // Fallback to mock data when API fails
        setTokens(generateMockTokens())
        setIsLoading(false)
        return
      }

      // Fetch detailed info for each token
      const tokenPromises = tokenAddresses.map(async (address) => {
        try {
          const [overview, price] = await Promise.all([
            birdeyeApi.getTokenOverview(address),
            Promise.resolve(pricesData[address])
          ])
          
          if (!overview || !price) return null
          
          return {
            id: address,
            mint_address: address,
            name: overview.name,
            symbol: overview.symbol,
            description: `${overview.name} token`,
            image_url: overview.logoURI,
            decimals: overview.decimals,
            price: price.value,
            market_cap: overview.mc || 0,
            volume_24h: overview.v24hUSD || 0,
            change_24h: price.priceChange24h || 0,
            is_active: true
          } as SolanaToken
        } catch (error) {
          console.error(`Error fetching data for token ${address}:`, error)
          return null
        }
      })

      const tokenResults = await Promise.all(tokenPromises)
      const validTokens = tokenResults.filter((token): token is SolanaToken => token !== null)
      
      // Sort by market cap descending
      validTokens.sort((a, b) => (b.market_cap || 0) - (a.market_cap || 0))
      
      setTokens(validTokens)
      console.log('Fetched', validTokens.length, 'Solana tokens from Birdeye')
      
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
        id: SOLANA_TOKEN_ADDRESSES.SOL,
        mint_address: SOLANA_TOKEN_ADDRESSES.SOL,
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
        id: SOLANA_TOKEN_ADDRESSES.BONK,
        mint_address: SOLANA_TOKEN_ADDRESSES.BONK,
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
        id: SOLANA_TOKEN_ADDRESSES.JUP,
        mint_address: SOLANA_TOKEN_ADDRESSES.JUP,
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
    // Initial fetch
    fetchTokens()

    // Set up periodic refresh every 30 seconds for real-time data
    const interval = setInterval(fetchTokens, 30000)

    return () => {
      clearInterval(interval)
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