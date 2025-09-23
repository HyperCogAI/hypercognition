import { useState, useCallback } from 'react'
import { withErrorHandling, createError, useErrorHandler } from '@/lib/errorHandling'
import { supabase } from '@/integrations/supabase/client'
import { cache, CACHE_KEYS, CACHE_TTL, CACHE_TAGS } from '@/lib/cache'

export type OrderType = 'market' | 'limit' | 'stop_loss' | 'take_profit'
export type OrderSide = 'buy' | 'sell'
export type OrderStatus = 'pending' | 'filled' | 'cancelled' | 'expired'

export interface OrderData {
  agent_id: string
  type: OrderType
  side: OrderSide
  amount: number
  price?: number
  trigger_price?: number
  expires_at?: string
  fill_or_kill?: boolean
  stop_loss_price?: number
  take_profit_price?: number
  trailing_stop_percent?: number
}

export const useTradingOperations = (userId?: string) => {
  const [isLoading, setIsLoading] = useState(false)
  const { captureError } = useErrorHandler()

  const placeOrder = useCallback(async (orderData: OrderData) => {
    if (!userId) {
      throw createError.auth('User must be authenticated to place orders', {
        component: 'useTradingOperations',
        action: 'placeOrder'
      })
    }

    return withErrorHandling(async () => {
      setIsLoading(true)

      // Validate order data
      if (orderData.amount <= 0) {
        throw createError.validation('Order amount must be greater than 0')
      }

      if (orderData.type === 'limit' && !orderData.price) {
        throw createError.validation('Limit orders require a price')
      }

      const { data, error } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          ...orderData,
          status: 'pending' as OrderStatus,
          filled_amount: 0
        })
        .select()
        .single()

      if (error) {
        throw createError.trading(`Failed to place ${orderData.type} order: ${error.message}`, {
          component: 'useTradingOperations',
          action: 'placeOrder',
          userId,
          additionalData: orderData
        })
      }

      // Invalidate cache for user orders
      cache.invalidateByTags([CACHE_TAGS.ORDERS])

      return data
    }, {
      component: 'useTradingOperations',
      action: 'placeOrder',
      userId
    })
  }, [userId, captureError])

  const cancelOrder = useCallback(async (orderId: string) => {
    if (!userId) {
      throw createError.auth('User must be authenticated to cancel orders')
    }

    return withErrorHandling(async () => {
      setIsLoading(true)

      const { data, error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' as OrderStatus })
        .eq('id', orderId)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        throw createError.trading(`Failed to cancel order: ${error.message}`, {
          component: 'useTradingOperations',
          action: 'cancelOrder',
          userId,
          additionalData: { orderId }
        })
      }

      // Invalidate cache
      cache.invalidateByTags([CACHE_TAGS.ORDERS])

      return data
    }, {
      component: 'useTradingOperations',
      action: 'cancelOrder',
      userId
    })
  }, [userId, captureError])

  const getOrderHistory = useCallback(async (status?: OrderStatus, limit: number = 50) => {
    if (!userId) return []

    return withErrorHandling(async () => {
      const cacheKey = CACHE_KEYS.USER_ORDERS(userId, status)
      const cached = cache.get(cacheKey)
      if (cached) return cached

      let query = supabase
        .from('orders')
        .select(`*, agent:agents(*)`)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (status) {
        query = query.eq('status', status)
      }

      const { data, error } = await query

      if (error) {
        throw createError.database('Failed to fetch order history', {
          component: 'useTradingOperations',
          action: 'getOrderHistory',
          userId,
          additionalData: { status, limit }
        })
      }

      cache.set(cacheKey, data || [], {
        ttl: CACHE_TTL.USER_DATA,
        tags: [CACHE_TAGS.ORDERS, CACHE_TAGS.USERS]
      })

      return data || []
    }, {
      component: 'useTradingOperations',
      action: 'getOrderHistory',
      userId
    }) || []
  }, [userId, captureError])

  return {
    placeOrder,
    cancelOrder,
    getOrderHistory,
    isLoading
  }
}

export const useOrderValidation = () => {
  const validateOrderData = useCallback((orderData: OrderData) => {
    const errors: string[] = []

    if (orderData.amount <= 0) {
      errors.push('Amount must be greater than 0')
    }

    if (orderData.type === 'limit' && !orderData.price) {
      errors.push('Limit orders require a price')
    }

    if (orderData.type === 'stop_loss' && !orderData.trigger_price) {
      errors.push('Stop loss orders require a trigger price')
    }

    if (orderData.type === 'take_profit' && !orderData.trigger_price) {
      errors.push('Take profit orders require a trigger price')
    }

    if (orderData.price && orderData.price <= 0) {
      errors.push('Price must be greater than 0')
    }

    if (orderData.trigger_price && orderData.trigger_price <= 0) {
      errors.push('Trigger price must be greater than 0')
    }

    if (orderData.stop_loss_price && orderData.stop_loss_price <= 0) {
      errors.push('Stop loss price must be greater than 0')
    }

    if (orderData.take_profit_price && orderData.take_profit_price <= 0) {
      errors.push('Take profit price must be greater than 0')
    }

    if (orderData.trailing_stop_percent && (orderData.trailing_stop_percent <= 0 || orderData.trailing_stop_percent > 100)) {
      errors.push('Trailing stop percentage must be between 0 and 100')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }, [])

  return { validateOrderData }
}