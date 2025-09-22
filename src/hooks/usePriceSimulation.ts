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

    // Fallback to simulation for tokens without real data
    const interval = setInterval(() => {
      setPriceData(prev => {
        // Generate small random price movements (-2% to +2%)
        const changePercent = (Math.random() - 0.5) * 4
        const newPrice = prev.current * (1 + changePercent / 100)
        const change = newPrice - initialPrice
        const totalChangePercent = (change / initialPrice) * 100

        return {
          current: newPrice,
          change,
          changePercent: totalChangePercent
        }
      })
    }, 3000) // Update every 3 seconds

    return () => clearInterval(interval)
  }, [tokenId, initialPrice, getCryptoById, getSolanaByMint])

  return priceData
}