import { useEffect, useState, useCallback } from 'react'
import { realtimePriceService, PriceUpdate } from '@/services/RealtimePriceService'

interface UseRealtimePricesOptions {
  cryptoIds?: string[]
  autoStart?: boolean
}

export function useRealtimePrices(options: UseRealtimePricesOptions = {}) {
  const { cryptoIds = [], autoStart = true } = options
  const [prices, setPrices] = useState<Map<string, PriceUpdate>>(new Map())
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (autoStart && cryptoIds.length > 0) {
      // Start the service
      realtimePriceService.start()
      setIsConnected(true)

      // Subscribe to price updates
      const unsubscribe = realtimePriceService.subscribe(
        cryptoIds,
        (update) => {
          setPrices(prev => {
            const newMap = new Map(prev)
            newMap.set(update.id, update)
            return newMap
          })
        }
      )

      return () => {
        unsubscribe()
        // Don't stop the service as other components might be using it
      }
    }
  }, [cryptoIds.join(','), autoStart])

  const getPrice = useCallback((cryptoId: string) => {
    return prices.get(cryptoId) || realtimePriceService.getPrice(cryptoId)
  }, [prices])

  const refresh = useCallback(async () => {
    await realtimePriceService.refresh()
  }, [])

  return {
    prices,
    getPrice,
    refresh,
    isConnected
  }
}
