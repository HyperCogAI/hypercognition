import { useState, useEffect } from 'react'
import { useRealMarketData } from './useRealMarketData'

interface PriceData {
  current: number
  change: number
  changePercent: number
}

export const usePriceSimulation = (tokenId?: string, initialPrice: number = 7.41) => {
  const [priceData, setPriceData] = useState<PriceData>({
    current: initialPrice,
    change: 0,
    changePercent: 0
  })

  const { getCryptoById, getSolanaByMint } = useRealMarketData()

  useEffect(() => {
    // If we have a tokenId, try to get real data first
    if (tokenId) {
      const cryptoData = getCryptoById(tokenId)
      const solanaData = getSolanaByMint(tokenId)
      
      if (cryptoData) {
        setPriceData({
          current: cryptoData.current_price,
          change: cryptoData.price_change_24h,
          changePercent: cryptoData.price_change_percentage_24h
        })
        return
      }
      
      if (solanaData) {
        setPriceData({
          current: solanaData.price,
          change: solanaData.change_24h,
          changePercent: (solanaData.change_24h / solanaData.price) * 100
        })
        return
      }
    }

    // Return current price data if no real data available
    // Only simulate if explicitly requested (for demo purposes)
    if (tokenId && tokenId.includes('demo')) {
      const interval = setInterval(() => {
        setPriceData(prev => {
          // Generate small random price movements (-1% to +1%)
          const changePercent = (Math.random() - 0.5) * 2
          const newPrice = prev.current * (1 + changePercent / 100)
          const change = newPrice - initialPrice
          const totalChangePercent = (change / initialPrice) * 100

          return {
            current: newPrice,
            change,
            changePercent: totalChangePercent
          }
        })
      }, 5000) // Update every 5 seconds

      return () => clearInterval(interval)
    }

    return undefined
  }, [tokenId, initialPrice, getCryptoById, getSolanaByMint])

  return priceData
}