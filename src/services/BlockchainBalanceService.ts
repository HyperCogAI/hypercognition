import { supabase } from '@/integrations/supabase/client'
import { PublicClient, formatUnits } from 'viem'

export interface BlockchainBalance {
  wallet_address: string
  chain: string
  balance: string
  balance_usd: number
  token_balances: TokenBalance[]
}

export interface TokenBalance {
  token_address: string
  token_symbol: string
  balance: string
  decimals: number
  balance_formatted: string
}

export interface BlockchainTransaction {
  id: string
  user_id: string
  tx_hash: string
  chain: string
  contract_address: string
  from_address: string
  to_address: string
  amount: number
  token_address: string
  status: string
  block_number: number
  confirmed_at: string
  created_at: string
  gas_used: number
}

export class BlockchainBalanceService {
  /**
   * Get wallet balance from blockchain via wagmi/viem
   * Note: This should be called from the frontend with a connected wallet
   */
  static async getWalletBalance(
    address: `0x${string}`, 
    publicClient: PublicClient
  ): Promise<bigint> {
    const balance = await publicClient.getBalance({ address })
    return balance
  }

  /**
   * Get ERC20 token balance from blockchain
   * Note: Use wagmi hooks (useReadContract) in components instead for better type safety
   */
  static formatTokenBalance(
    balance: bigint,
    decimals: number,
    symbol: string,
    tokenAddress: string
  ): TokenBalance {
    return {
      token_address: tokenAddress,
      token_symbol: symbol,
      balance: balance.toString(),
      decimals: decimals,
      balance_formatted: formatUnits(balance, decimals),
    }
  }

  /**
   * Get all blockchain transactions for a user from our database
   */
  static async getBlockchainTransactions(
    userId: string,
    limit: number = 50
  ): Promise<BlockchainTransaction[]> {
    const { data, error } = await supabase
      .from('blockchain_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return (data || []) as BlockchainTransaction[]
  }

  /**
   * Get blockchain transactions by status
   */
  static async getTransactionsByStatus(
    userId: string,
    status: 'pending' | 'confirmed' | 'failed'
  ): Promise<BlockchainTransaction[]> {
    const { data, error } = await supabase
      .from('blockchain_transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []) as BlockchainTransaction[]
  }

  /**
   * Get a specific transaction by hash
   */
  static async getTransactionByHash(
    txHash: string
  ): Promise<BlockchainTransaction | null> {
    const { data, error } = await supabase
      .from('blockchain_transactions')
      .select('*')
      .eq('tx_hash', txHash)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }
    return data as BlockchainTransaction
  }

  /**
   * Record a new blockchain transaction
   * This is typically called after a transaction is broadcast
   */
  static async recordTransaction(
    userId: string,
    txData: {
      tx_hash: string
      chain: string
      contract_address?: string
      from_address: string
      to_address: string
      amount: number
      token_address?: string
    }
  ): Promise<BlockchainTransaction> {
    const { data, error } = await supabase
      .from('blockchain_transactions')
      .insert({
        user_id: userId,
        tx_hash: txData.tx_hash,
        chain: txData.chain,
        contract_address: txData.contract_address || '',
        from_address: txData.from_address,
        to_address: txData.to_address,
        amount: txData.amount,
        token_address: txData.token_address || '',
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw error
    return data as BlockchainTransaction
  }

  /**
   * Update transaction status after confirmation
   */
  static async updateTransactionStatus(
    txHash: string,
    status: 'confirmed' | 'failed',
    blockNumber?: number
  ): Promise<void> {
    const { error } = await supabase
      .from('blockchain_transactions')
      .update({
        status,
        block_number: blockNumber,
      })
      .eq('tx_hash', txHash)

    if (error) throw error
  }

  /**
   * Calculate total portfolio value from on-chain holdings
   * This queries the blockchain_transactions table to determine net positions
   */
  static async calculatePortfolioValue(userId: string): Promise<{
    total_value_usd: number
    holdings: Array<{
      asset_id: string
      quantity: number
      current_price: number
      value_usd: number
    }>
  }> {
    // Get all confirmed transactions for the user
    const { data: transactions, error } = await supabase
      .from('blockchain_transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'confirmed')

    if (error) throw error

    // This would aggregate buy/sell transactions to calculate net holdings
    // For now, we'll delegate to portfolio_holdings table which is updated by process-order
    const { data: holdings } = await supabase
      .from('portfolio_holdings')
      .select('*')
      .eq('user_id', userId)

    const totalValue = holdings?.reduce((sum, h) => sum + parseFloat(h.current_value.toString()), 0) || 0

    return {
      total_value_usd: totalValue,
      holdings: holdings?.map(h => ({
        asset_id: h.asset_id,
        quantity: parseFloat(h.quantity.toString()),
        current_price: parseFloat(h.current_value.toString()) / parseFloat(h.quantity.toString()),
        value_usd: parseFloat(h.current_value.toString()),
      })) || []
    }
  }
}
