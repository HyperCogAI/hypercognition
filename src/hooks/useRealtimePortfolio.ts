import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'

export const useRealtimePortfolio = () => {
  const { user } = useAuth()
  const [holdings, setHoldings] = useState([])
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    if (!user) return

    // Subscribe to holdings changes
    const holdingsChannel = supabase
      .channel('user-holdings')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_holdings',
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
          console.log('Holdings update:', payload)
          
          // Refresh holdings data with agent info
          const { data } = await supabase
            .from('user_holdings')
            .select(`*, agent:agents(*)`)
            .eq('user_id', user.id)
          
          if (data) {
            setHoldings(data)
          }
        }
      )
      .subscribe()

    // Subscribe to transaction changes
    const transactionsChannel = supabase
      .channel('user-transactions')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
          console.log('New transaction:', payload)
          
          // Add new transaction to the list
          const { data } = await supabase
            .from('transactions')
            .select(`*, agent:agents(*)`)
            .eq('id', payload.new.id)
            .single()
          
          if (data) {
            setTransactions(prev => [data, ...prev])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(holdingsChannel)
      supabase.removeChannel(transactionsChannel)
    }
  }, [user])

  return {
    holdings,
    transactions,
    setHoldings,
    setTransactions
  }
}