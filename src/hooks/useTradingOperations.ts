import { useNotifications } from './useNotifications'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'

export const useTradingOperations = () => {
  const { showSuccess, showError } = useNotifications()
  const { isConnected, user } = useAuth()

  const executeBuy = async (agentId: string, amount: number, price: number) => {
    if (!isConnected || !user) {
      showError('Please connect your wallet first')
      return false
    }

    try {
      const totalValue = amount * price
      const gasEstimate = totalValue * 0.003 // 0.3% gas fee estimate
      
      // Insert transaction record
      const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          agent_id: agentId,
          type: 'buy',
          amount: amount,
          price_per_token: price,
          total_value: totalValue,
          gas_fee: gasEstimate,
          status: 'pending'
        })
        .select()
        .single()

      if (txError) throw txError

      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate random success/failure (95% success rate)
      const success = Math.random() > 0.05
      
      if (success) {
        // Update transaction status
        await supabase
          .from('transactions')
          .update({ 
            status: 'completed',
            transaction_hash: `0x${Math.random().toString(16).substring(2, 66)}`
          })
          .eq('id', transaction.id)

        // Update or create holding
        const { data: existingHolding } = await supabase
          .from('user_holdings')
          .select()
          .eq('user_id', user.id)
          .eq('agent_id', agentId)
          .maybeSingle()

        if (existingHolding) {
          // Update existing holding
          const newTotalAmount = existingHolding.total_amount + amount
          const newTotalInvested = existingHolding.total_invested + totalValue
          const newAvgCost = newTotalInvested / newTotalAmount

          await supabase
            .from('user_holdings')
            .update({
              total_amount: newTotalAmount,
              total_invested: newTotalInvested,
              average_cost: newAvgCost,
              last_updated: new Date().toISOString()
            })
            .eq('id', existingHolding.id)
        } else {
          // Create new holding
          await supabase
            .from('user_holdings')
            .insert({
              user_id: user.id,
              agent_id: agentId,
              total_amount: amount,
              average_cost: price,
              total_invested: totalValue
            })
        }

        showSuccess(`Successfully bought ${amount} tokens!`)
        return true
      } else {
        // Update transaction status to failed
        await supabase
          .from('transactions')
          .update({ status: 'failed' })
          .eq('id', transaction.id)
        
        throw new Error('Transaction failed')
      }
    } catch (error) {
      console.error('Buy transaction error:', error)
      showError('Transaction failed. Please try again.')
      return false
    }
  }

  const executeSell = async (agentId: string, amount: number, price: number) => {
    if (!isConnected || !user) {
      showError('Please connect your wallet first')
      return false
    }

    try {
      // Check if user has enough tokens
      const { data: holding } = await supabase
        .from('user_holdings')
        .select()
        .eq('user_id', user.id)
        .eq('agent_id', agentId)
        .maybeSingle()

      if (!holding || holding.total_amount < amount) {
        showError('Insufficient token balance')
        return false
      }

      const totalValue = amount * price
      const gasEstimate = totalValue * 0.003 // 0.3% gas fee estimate
      
      // Insert transaction record
      const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          agent_id: agentId,
          type: 'sell',
          amount: amount,
          price_per_token: price,
          total_value: totalValue,
          gas_fee: gasEstimate,
          status: 'pending'
        })
        .select()
        .single()

      if (txError) throw txError

      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate random success/failure (95% success rate)
      const success = Math.random() > 0.05
      
      if (success) {
        // Update transaction status
        await supabase
          .from('transactions')
          .update({ 
            status: 'completed',
            transaction_hash: `0x${Math.random().toString(16).substring(2, 66)}`
          })
          .eq('id', transaction.id)

        // Update holding
        const newTotalAmount = holding.total_amount - amount
        const soldPortion = amount / holding.total_amount
        const realizedPnL = (price - holding.average_cost) * amount
        
        if (newTotalAmount > 0) {
          // Update existing holding
          await supabase
            .from('user_holdings')
            .update({
              total_amount: newTotalAmount,
              total_invested: holding.total_invested * (1 - soldPortion),
              realized_pnl: holding.realized_pnl + realizedPnL,
              last_updated: new Date().toISOString()
            })
            .eq('id', holding.id)
        } else {
          // Delete holding if completely sold
          await supabase
            .from('user_holdings')
            .delete()
            .eq('id', holding.id)
        }

        showSuccess(`Successfully sold ${amount} tokens!`)
        return true
      } else {
        // Update transaction status to failed
        await supabase
          .from('transactions')
          .update({ status: 'failed' })
          .eq('id', transaction.id)
        
        throw new Error('Transaction failed')
      }
    } catch (error) {
      console.error('Sell transaction error:', error)
      showError('Transaction failed. Please try again.')
      return false
    }
  }

  return {
    executeBuy,
    executeSell,
    isConnected
  }
}