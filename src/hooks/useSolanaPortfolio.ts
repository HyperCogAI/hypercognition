import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useSolanaWallet } from './useSolanaWallet'
import { useSolanaTransactions } from './useSolanaTransactions'
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

interface SolanaPortfolio {
  id: string
  token_id: string
  mint_address: string
  amount: number
  purchase_price?: number
  purchase_date?: string
  token?: SolanaToken
}

export const useSolanaPortfolio = () => {
  const { isConnected } = useSolanaWallet()
  const { getBalance, getTokenAccounts } = useSolanaTransactions()
  const { user } = useAuth()
  const [portfolio, setPortfolio] = useState<SolanaPortfolio[]>([])
  const [solBalance, setSolBalance] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  // Redirect to Solana auth if not authenticated
  if (!user) {
    window.location.href = '/solana-auth';
    return {
      portfolio: [],
      solBalance: 0,
      isLoading: false,
      refreshPortfolio: () => {},
      totalValue: 0,
      totalChange24h: 0
    };
  }

  const fetchSolanaTokens = async (): Promise<SolanaToken[]> => {
    const { data, error } = await supabase
      .from('solana_tokens')
      .select('*')
      .eq('is_active', true)
      .order('market_cap', { ascending: false })

    if (error) {
      console.error('Error fetching Solana tokens:', error)
      return []
    }

    return (data || []).map((token: any) => ({
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
  }

  const fetchPortfolio = async () => {
    if (!isConnected) return

    setIsLoading(true)
    try {
      // Get SOL balance
      const balance = await getBalance()
      setSolBalance(balance)

      // Get token accounts from wallet
      const tokenAccounts = await getTokenAccounts()
      
      // Get token data from database
      const tokens = await fetchSolanaTokens()
      
      // Match wallet holdings with database tokens
      const portfolioData: SolanaPortfolio[] = tokenAccounts
        .map(account => {
          const token = tokens.find(t => t.mint_address === account.mint)
          if (!token || account.amount === 0) return null
          
          return {
            id: `${account.mint}_${Date.now()}`,
            token_id: token.id,
            mint_address: account.mint,
            amount: account.amount,
            token
          }
        })
        .filter(Boolean) as SolanaPortfolio[]

      setPortfolio(portfolioData)
    } catch (error) {
      console.error('Error fetching Solana portfolio:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addTokenToPortfolio = async (mintAddress: string, amount: number, purchasePrice?: number) => {
    if (!user) {
      throw new Error('User not authenticated')
    }

    try {
      const { data: tokenData } = await supabase
        .from('solana_tokens')
        .select('*')
        .eq('mint_address', mintAddress)
        .single()

      if (!tokenData) {
        throw new Error('Token not found')
      }

      const { data, error } = await supabase
        .from('solana_portfolio' as any)
        .insert({
          user_id: user.id,
          mint_address: mintAddress,
          amount,
          purchase_price: purchasePrice,
          purchase_date: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      // Refresh portfolio
      await fetchPortfolio()
      return data
    } catch (error) {
      console.error('Error adding token to portfolio:', error)
      throw error
    }
  }

  const getTotalValue = () => {
    const tokenValue = portfolio.reduce((total, item) => {
      return total + (item.amount * (item.token?.price || 0))
    }, 0)
    
    // Assuming SOL price (you'd get this from an API in real implementation)
    const solPrice = 100 // placeholder
    const solValue = solBalance * solPrice
    
    return tokenValue + solValue
  }

  useEffect(() => {
    if (isConnected) {
      fetchPortfolio()
    } else {
      setPortfolio([])
      setSolBalance(0)
    }
  }, [isConnected])

  return {
    portfolio,
    solBalance,
    isLoading,
    fetchPortfolio,
    addTokenToPortfolio,
    getTotalValue,
    fetchSolanaTokens,
  }
}