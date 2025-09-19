import { useState, useEffect } from 'react'

interface PriceData {
  current: number
  change: number
  changePercent: number
}

export const usePriceSimulation = (initialPrice: number = 7.41) => {
  const [priceData, setPriceData] = useState<PriceData>({
    current: initialPrice,
    change: 0,
    changePercent: 0
  })

  useEffect(() => {
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
  }, [initialPrice])

  return priceData
}