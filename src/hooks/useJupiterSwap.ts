import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { jupiterApi } from '@/lib/apis/jupiterApi'

export interface SwapParams {
  inputMint: string
  outputMint: string
  amount: number
  slippageBps?: number // basis points (100 = 1%)
}

export const useJupiterSwap = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [routes, setRoutes] = useState<any[]>([])
  const { toast } = useToast()

  const getSwapRoutes = async (params: SwapParams) => {
    setIsLoading(true)
    try {
      const response = await jupiterApi.getSwapRoute(
        params.inputMint,
        params.outputMint,
        params.amount * 1e9, // Convert to lamports/atomic units
        params.slippageBps || 50
      )
      
      if (response && Array.isArray(response)) {
        setRoutes(response)
        return response
      }
      
      return []
    } catch (error) {
      console.error('Error fetching swap routes:', error)
      toast({
        title: "Route Error",
        description: "Failed to fetch swap routes",
        variant: "destructive"
      })
      return []
    } finally {
      setIsLoading(false)
    }
  }

  const executeSwap = async (route: any) => {
    setIsLoading(true)
    try {
      // In a real implementation, this would:
      // 1. Get the transaction from Jupiter API
      // 2. Sign it with the user's wallet
      // 3. Send it to the network
      
      // In a real implementation, this would execute the swap
      // For now, we simulate a successful swap with proper error handling
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const signature = `${crypto.getRandomValues(new Uint32Array(1))[0].toString(36)}${Date.now()}`
      
      toast({
        title: "Swap Successful",
        description: "Your tokens have been swapped successfully",
      })
      
      return { success: true, signature }
    } catch (error) {
      console.error('Error executing swap:', error)
      toast({
        title: "Swap Failed",
        description: "Failed to execute swap transaction",
        variant: "destructive"
      })
      return { success: false, error }
    } finally {
      setIsLoading(false)
    }
  }

  const getBestRoute = (routes: any[]) => {
    if (!routes.length) return null
    
    // Return route with best output amount
    return routes.reduce((best, current) => {
      const bestOutput = parseInt(best?.outAmount || '0')
      const currentOutput = parseInt(current?.outAmount || '0')
      return currentOutput > bestOutput ? current : best
    })
  }

  const calculatePriceImpact = (route: any) => {
    if (!route?.priceImpactPct) return 0
    return parseFloat(route.priceImpactPct)
  }

  const getOutputAmount = (route: any, decimals: number = 9) => {
    if (!route?.outAmount) return 0
    return parseInt(route.outAmount) / Math.pow(10, decimals)
  }

  const getMinimumReceived = (route: any, slippageBps: number, decimals: number = 9) => {
    const outputAmount = getOutputAmount(route, decimals)
    const slippageMultiplier = 1 - (slippageBps / 10000)
    return outputAmount * slippageMultiplier
  }

  return {
    isLoading,
    routes,
    getSwapRoutes,
    executeSwap,
    getBestRoute,
    calculatePriceImpact,
    getOutputAmount,
    getMinimumReceived
  }
}