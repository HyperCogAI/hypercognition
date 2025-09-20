import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

export const useRealtimePrice = (agentId?: string) => {
  const [priceData, setPriceData] = useState<any>(null)

  useEffect(() => {
    if (!agentId) return

    // Subscribe to price updates for specific agent
    const channel = supabase
      .channel('price-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'price_history',
          filter: `agent_id=eq.${agentId}`
        },
        (payload) => {
          console.log('Real-time price update:', payload)
          setPriceData(payload.new)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [agentId])

  return priceData
}

export const useRealtimeAllPrices = () => {
  const [allPrices, setAllPrices] = useState<Record<string, any>>({})

  useEffect(() => {
    const channel = supabase
      .channel('all-price-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'price_history'
        },
        (payload) => {
          console.log('All prices update:', payload)
          setAllPrices(prev => ({
            ...prev,
            [payload.new.agent_id]: payload.new
          }))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return allPrices
}