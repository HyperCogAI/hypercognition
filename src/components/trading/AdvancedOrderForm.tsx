import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useAdvancedOrders } from '@/hooks/useAdvancedOrders'
import type { Database } from '@/integrations/supabase/types'

type OrderInsert = Database['public']['Tables']['orders']['Insert']

const orderSchema = z.object({
  agent_id: z.string().min(1, 'Agent is required'),
  type: z.enum(['market', 'limit', 'stop_market', 'stop_limit', 'trailing_stop']),
  side: z.enum(['buy', 'sell']),
  amount: z.number().positive('Amount must be positive'),
  price: z.number().optional(),
  trigger_price: z.number().optional(),
  stop_loss_price: z.number().optional(),
  take_profit_price: z.number().optional(),
  trailing_stop_percent: z.number().optional(),
  time_in_force: z.enum(['GTC', 'IOC', 'FOK', 'GTD']).default('GTC'),
  reduce_only: z.boolean().default(false)
})

type OrderFormData = z.infer<typeof orderSchema>

interface AdvancedOrderFormProps {
  agentId?: string
  agentSymbol?: string
  currentPrice?: number
  onOrderCreated?: () => void
}

export function AdvancedOrderForm({ 
  agentId, 
  agentSymbol, 
  currentPrice = 0,
  onOrderCreated 
}: AdvancedOrderFormProps) {
  const [orderType, setOrderType] = useState<'basic' | 'advanced'>('basic')
  const { createOrder } = useAdvancedOrders()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      agent_id: agentId || '',
      type: 'market',
      side: 'buy',
      time_in_force: 'GTC',
      reduce_only: false
    }
  })

  const watchedType = watch('type')
  const watchedSide = watch('side')
  const watchedAmount = watch('amount')
  const watchedPrice = watch('price')

  const onSubmit = async (data: OrderFormData) => {
    try {
      const orderData: OrderInsert = {
        user_id: '', // This will be set by RLS/auth
        agent_id: data.agent_id,
        type: data.type,
        side: data.side,
        amount: data.amount,
        price: data.price || null,
        trigger_price: data.trigger_price || null,
        stop_loss_price: data.stop_loss_price || null,
        take_profit_price: data.take_profit_price || null,
        trailing_stop_percent: data.trailing_stop_percent || null,
        time_in_force: data.time_in_force,
        reduce_only: data.reduce_only
      }

      await createOrder(orderData)
      onOrderCreated?.()
    } catch (error) {
      console.error('Failed to create order:', error)
    }
  }

  const calculateTotal = () => {
    if (!watchedAmount) return 0
    if (watchedType === 'market') return watchedAmount * currentPrice
    return watchedAmount * (watchedPrice || currentPrice)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Advanced Trading
          {agentSymbol && (
            <Badge variant="outline">{agentSymbol}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={orderType} onValueChange={(value) => setOrderType(value as 'basic' | 'advanced')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <TabsContent value="basic" className="space-y-4">
              {/* Order Type */}
              <div className="space-y-2">
                <Label>Order Type</Label>
                <Select
                  value={watchedType}
                  onValueChange={(value) => setValue('type', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="market">Market</SelectItem>
                    <SelectItem value="limit">Limit</SelectItem>
                    <SelectItem value="stop_market">Stop Market</SelectItem>
                    <SelectItem value="stop_limit">Stop Limit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Buy/Sell */}
              <div className="space-y-2">
                <Label>Side</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={watchedSide === 'buy' ? 'default' : 'outline'}
                    onClick={() => setValue('side', 'buy')}
                    className="text-green-600"
                  >
                    Buy
                  </Button>
                  <Button
                    type="button"
                    variant={watchedSide === 'sell' ? 'default' : 'outline'}
                    onClick={() => setValue('side', 'sell')}
                    className="text-red-600"
                  >
                    Sell
                  </Button>
                </div>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  step="any"
                  placeholder="0.00"
                  {...register('amount', { valueAsNumber: true })}
                />
                {errors.amount && (
                  <p className="text-sm text-destructive">{errors.amount.message}</p>
                )}
              </div>

              {/* Price (for limit orders) */}
              {(watchedType === 'limit' || watchedType === 'stop_limit') && (
                <div className="space-y-2">
                  <Label>Price</Label>
                  <Input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    {...register('price', { valueAsNumber: true })}
                  />
                </div>
              )}

              {/* Trigger Price (for stop orders) */}
              {(watchedType === 'stop_market' || watchedType === 'stop_limit') && (
                <div className="space-y-2">
                  <Label>Trigger Price</Label>
                  <Input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    {...register('trigger_price', { valueAsNumber: true })}
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              {/* All basic fields */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Order Type</Label>
                  <Select
                    value={watchedType}
                    onValueChange={(value) => setValue('type', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="market">Market</SelectItem>
                      <SelectItem value="limit">Limit</SelectItem>
                      <SelectItem value="stop_market">Stop Market</SelectItem>
                      <SelectItem value="stop_limit">Stop Limit</SelectItem>
                      <SelectItem value="trailing_stop">Trailing Stop</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={watchedSide === 'buy' ? 'default' : 'outline'}
                    onClick={() => setValue('side', 'buy')}
                    className="text-green-600"
                  >
                    Buy
                  </Button>
                  <Button
                    type="button"
                    variant={watchedSide === 'sell' ? 'default' : 'outline'}
                    onClick={() => setValue('side', 'sell')}
                    className="text-red-600"
                  >
                    Sell
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    {...register('amount', { valueAsNumber: true })}
                  />
                </div>

                {(watchedType === 'limit' || watchedType === 'stop_limit') && (
                  <div className="space-y-2">
                    <Label>Price</Label>
                    <Input
                      type="number"
                      step="any"
                      placeholder="0.00"
                      {...register('price', { valueAsNumber: true })}
                    />
                  </div>
                )}

                {watchedType === 'trailing_stop' && (
                  <div className="space-y-2">
                    <Label>Trailing Stop %</Label>
                    <Input
                      type="number"
                      step="any"
                      placeholder="5.0"
                      {...register('trailing_stop_percent', { valueAsNumber: true })}
                    />
                  </div>
                )}
              </div>

              <Separator />

              {/* Advanced Options */}
              <div className="space-y-4">
                <h4 className="font-medium">Risk Management</h4>
                
                <div className="space-y-2">
                  <Label>Stop Loss</Label>
                  <Input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    {...register('stop_loss_price', { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Take Profit</Label>
                  <Input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    {...register('take_profit_price', { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Time in Force</Label>
                  <Select
                    value={watch('time_in_force')}
                    onValueChange={(value) => setValue('time_in_force', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GTC">Good Till Cancelled</SelectItem>
                      <SelectItem value="IOC">Immediate or Cancel</SelectItem>
                      <SelectItem value="FOK">Fill or Kill</SelectItem>
                      <SelectItem value="GTD">Good Till Date</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="reduce-only"
                    checked={watch('reduce_only')}
                    onCheckedChange={(checked) => setValue('reduce_only', checked)}
                  />
                  <Label htmlFor="reduce-only">Reduce Only</Label>
                </div>
              </div>
            </TabsContent>

            {/* Order Summary */}
            <div className="bg-muted rounded-lg p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Current Price:</span>
                <span>${currentPrice.toFixed(4)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total Value:</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
              variant={watchedSide === 'buy' ? 'default' : 'destructive'}
            >
              {isSubmitting ? 'Creating Order...' : `${watchedSide === 'buy' ? 'Buy' : 'Sell'} ${agentSymbol || 'Token'}`}
            </Button>
          </form>
        </Tabs>
      </CardContent>
    </Card>
  )
}