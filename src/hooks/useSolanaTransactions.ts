import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { useWallet } from '@solana/wallet-adapter-react'
import { connection } from '@/config/solana'
import { useState } from 'react'
import { toast } from 'sonner'

export const useSolanaTransactions = () => {
  const { publicKey, sendTransaction } = useWallet()
  const [isLoading, setIsLoading] = useState(false)

  const getBalance = async (): Promise<number> => {
    if (!publicKey) return 0
    
    try {
      const balance = await connection.getBalance(publicKey)
      return balance / LAMPORTS_PER_SOL
    } catch (error) {
      console.error('Error fetching balance:', error)
      return 0
    }
  }

  const sendSOL = async (toAddress: string, amount: number): Promise<string | null> => {
    if (!publicKey) {
      toast.error('Wallet not connected')
      return null
    }

    setIsLoading(true)
    try {
      const toPublicKey = new PublicKey(toAddress)
      const lamports = amount * LAMPORTS_PER_SOL

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: toPublicKey,
          lamports,
        })
      )

      const signature = await sendTransaction(transaction, connection)
      await connection.confirmTransaction(signature, 'confirmed')
      
      toast.success(`Successfully sent ${amount} SOL`)
      return signature
    } catch (error) {
      console.error('Transaction failed:', error)
      toast.error('Transaction failed')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const getTokenAccounts = async () => {
    if (!publicKey) return []
    
    try {
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
      )
      
      return tokenAccounts.value.map(account => ({
        mint: account.account.data.parsed.info.mint,
        amount: account.account.data.parsed.info.tokenAmount.uiAmount || 0,
        decimals: account.account.data.parsed.info.tokenAmount.decimals,
      }))
    } catch (error) {
      console.error('Error fetching token accounts:', error)
      return []
    }
  }

  return {
    getBalance,
    sendSOL,
    getTokenAccounts,
    isLoading,
  }
}