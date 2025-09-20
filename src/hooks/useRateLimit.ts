import { useState, useCallback, useRef } from "react"
import { toast } from "sonner"

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
  warningThreshold?: number
}

interface RateLimitState {
  requests: number
  resetTime: number
  isLimited: boolean
}

export const useRateLimit = (config: RateLimitConfig) => {
  const [state, setState] = useState<RateLimitState>({
    requests: 0,
    resetTime: Date.now() + config.windowMs,
    isLimited: false
  })
  
  const timeoutRef = useRef<NodeJS.Timeout>()

  const checkLimit = useCallback(() => {
    const now = Date.now()
    
    // Reset window if expired
    if (now >= state.resetTime) {
      setState({
        requests: 0,
        resetTime: now + config.windowMs,
        isLimited: false
      })
      return true
    }
    
    // Check if limit reached
    if (state.requests >= config.maxRequests) {
      const remainingTime = Math.ceil((state.resetTime - now) / 1000)
      toast.error(`Rate limit exceeded. Try again in ${remainingTime} seconds.`)
      return false
    }
    
    // Increment request count
    setState(prev => ({
      ...prev,
      requests: prev.requests + 1,
      isLimited: prev.requests + 1 >= config.maxRequests
    }))
    
    // Warning when approaching limit
    const warningThreshold = config.warningThreshold || Math.ceil(config.maxRequests * 0.8)
    if (state.requests + 1 >= warningThreshold && state.requests + 1 < config.maxRequests) {
      const remaining = config.maxRequests - (state.requests + 1)
      toast.warning(`Rate limit warning: ${remaining} requests remaining`)
    }
    
    // Auto-reset when window expires
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => {
      setState(prev => ({
        requests: 0,
        resetTime: Date.now() + config.windowMs,
        isLimited: false
      }))
    }, state.resetTime - now)
    
    return true
  }, [state, config])

  const getRemainingRequests = useCallback(() => {
    return Math.max(0, config.maxRequests - state.requests)
  }, [state.requests, config.maxRequests])

  const getResetTimeRemaining = useCallback(() => {
    return Math.max(0, state.resetTime - Date.now())
  }, [state.resetTime])

  return {
    checkLimit,
    getRemainingRequests,
    getResetTimeRemaining,
    isLimited: state.isLimited,
    requests: state.requests,
    maxRequests: config.maxRequests
  }
}

// Pre-configured rate limiters for different actions
export const useSearchRateLimit = () => useRateLimit({
  maxRequests: 60,
  windowMs: 60 * 1000, // 1 minute
  warningThreshold: 50
})

export const useTradingRateLimit = () => useRateLimit({
  maxRequests: 5,
  windowMs: 60 * 1000, // 1 minute
  warningThreshold: 3
})

export const useSocialRateLimit = () => useRateLimit({
  maxRequests: 20,
  windowMs: 60 * 1000, // 1 minute
  warningThreshold: 15
})