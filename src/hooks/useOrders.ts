import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { orderService, Order, Trade } from '@/services/OrderService'
import { toast } from '@/hooks/use-toast'

export function useOrders() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Fetch orders
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: () => {
      if (!user?.id) return []
      return orderService.getOrders(user.id)
    },
    enabled: !!user?.id,
    refetchInterval: 5000, // Refresh every 5 seconds
  })

  // Fetch trades
  const { data: trades = [], isLoading: tradesLoading } = useQuery({
    queryKey: ['trades', user?.id],
    queryFn: () => {
      if (!user?.id) return []
      return orderService.getTrades(user.id)
    },
    enabled: !!user?.id,
  })

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: (params: {
      agentId: string
      orderType: 'market' | 'limit' | 'stop_market' | 'stop_limit'
      side: 'buy' | 'sell'
      amount: number
      price?: number
      stopPrice?: number
      stopLossPrice?: number
      takeProfitPrice?: number
      timeInForce?: 'GTC' | 'IOC' | 'FOK'
      exchange?: string
      notes?: string
    }) => orderService.createOrder(params),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['orders'] })
        queryClient.invalidateQueries({ queryKey: ['trades'] })
        queryClient.invalidateQueries({ queryKey: ['portfolio-holdings'] })
        queryClient.invalidateQueries({ queryKey: ['user-balance'] })
        toast({
          title: 'Success',
          description: 'Order created successfully',
        })
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to create order',
          variant: 'destructive'
        })
      }
    }
  })

  // Cancel order mutation
  const cancelOrderMutation = useMutation({
    mutationFn: (orderId: string) => orderService.cancelOrder(orderId),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['orders'] })
        toast({
          title: 'Success',
          description: 'Order cancelled',
        })
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to cancel order',
          variant: 'destructive'
        })
      }
    }
  })

  return {
    orders,
    trades,
    isLoading: ordersLoading || tradesLoading,
    createOrder: createOrderMutation.mutate,
    cancelOrder: cancelOrderMutation.mutate,
    isCreatingOrder: createOrderMutation.isPending,
    isCancellingOrder: cancelOrderMutation.isPending
  }
}