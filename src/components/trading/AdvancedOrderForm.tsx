import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useAdvancedOrders } from '@/hooks/useAdvancedOrders'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  Clock, 
  Settings,
  Zap
} from 'lucide-react'

interface AdvancedOrderFormProps {
  agentId?: string
  agentSymbol?: string
  currentPrice?: number
  onOrderCreate?: () => void
}

export function AdvancedOrderForm({ 
  agentId = "1", 
  agentSymbol = "BTC/USDT", 
  currentPrice = 65000, 
  onOrderCreate 
}: AdvancedOrderFormProps) {
  const { user } = useAuth()
  const { createOrder, executeMarketOrder, isCreating } = useAdvancedOrders()
  
  const [orderType, setOrderType] = useState<string>('market')
  const [side, setSide] = useState<'buy' | 'sell'>('buy')
  const [amount, setAmount] = useState('')
  const [price, setPrice] = useState('')
  const [triggerPrice, setTriggerPrice] = useState('')
  const [stopLossPrice, setStopLossPrice] = useState('')
  const [takeProfitPrice, setTakeProfitPrice] = useState('')
  const [trailingStopPercent, setTrailingStopPercent] = useState('')
  const [timeInForce, setTimeInForce] = useState<string>('GTC')
  const [fillOrKill, setFillOrKill] = useState(false)
  const [reduceOnly, setReduceOnly] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id || !amount) return

    const orderData = {
      user_id: user.id,
      agent_id: agentId,
      type: orderType as any,
      side,
      amount: parseFloat(amount),
      price: price ? parseFloat(price) : undefined,
      trigger_price: triggerPrice ? parseFloat(triggerPrice) : undefined,
      stop_loss_price: stopLossPrice ? parseFloat(stopLossPrice) : undefined,
      take_profit_price: takeProfitPrice ? parseFloat(takeProfitPrice) : undefined,
      trailing_stop_percent: trailingStopPercent ? parseFloat(trailingStopPercent) : undefined,
      time_in_force: timeInForce as any,
      fill_or_kill: fillOrKill,
      reduce_only: reduceOnly,
      order_source: 'manual'
    }

    try {
      if (orderType === 'market') {
        await executeMarketOrder(orderData)
      } else {
        await createOrder(orderData)
      }
      
      // Reset form
      setAmount('')
      setPrice('')
      setTriggerPrice('')
      setStopLossPrice('')
      setTakeProfitPrice('')
      setTrailingStopPercent('')
      setFillOrKill(false)
      setReduceOnly(false)
      
      onOrderCreate?.()
    } catch (error) {
      console.error('Order submission failed:', error)
    }
  }

  const calculateOrderValue = () => {
    const qty = parseFloat(amount) || 0
    const orderPrice = orderType === 'market' ? currentPrice : (parseFloat(price) || currentPrice)
    return qty * orderPrice
  }

  const getEstimatedFee = () => {
    return calculateOrderValue() * 0.001 // 0.1% fee
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Advanced Order - {agentSymbol}
          <Badge variant="outline">${currentPrice.toFixed(4)}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order Type and Side */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Order Type</Label>
              <Select value={orderType} onValueChange={setOrderType}>
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
            
            <div>
              <Label>Side</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={side === 'buy' ? 'default' : 'outline'}
                  onClick={() => setSide('buy')}
                  className="w-full"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Buy
                </Button>
                <Button
                  type="button"
                  variant={side === 'sell' ? 'destructive' : 'outline'}
                  onClick={() => setSide('sell')}
                  className="w-full"
                >
                  <TrendingDown className="h-4 w-4 mr-2" />
                  Sell
                </Button>
              </div>
            </div>
          </div>

          {/* Amount */}
          <div>
            <Label>Amount ({agentSymbol})</Label>
            <Input
              type="number"
              step="0.0001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0000"
              required
            />
          </div>

          {/* Price Fields */}
          {(orderType === 'limit' || orderType === 'stop_limit') && (
            <div>
              <Label>Limit Price ($)</Label>
              <Input
                type="number"
                step="0.0001"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder={currentPrice.toFixed(4)}
              />
            </div>
          )}

          {(orderType === 'stop_market' || orderType === 'stop_limit') && (
            <div>
              <Label>Trigger Price ($)</Label>
              <Input
                type="number"
                step="0.0001"
                value={triggerPrice}
                onChange={(e) => setTriggerPrice(e.target.value)}
                placeholder={currentPrice.toFixed(4)}
              />
            </div>
          )}

          {orderType === 'trailing_stop' && (
            <div>
              <Label>Trailing Stop (%)</Label>
              <Input
                type="number"
                step="0.1"
                value={trailingStopPercent}
                onChange={(e) => setTrailingStopPercent(e.target.value)}
                placeholder="5.0"
              />
            </div>
          )}

          <Separator />

          {/* Risk Management */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Risk Management
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Stop Loss ($)</Label>
                <Input
                  type="number"
                  step="0.0001"
                  value={stopLossPrice}
                  onChange={(e) => setStopLossPrice(e.target.value)}
                  placeholder="Optional"
                />
              </div>
              
              <div>
                <Label>Take Profit ($)</Label>
                <Input
                  type="number"
                  step="0.0001"
                  value={takeProfitPrice}
                  onChange={(e) => setTakeProfitPrice(e.target.value)}
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Advanced Options */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Advanced Options
            </h4>
            
            <div>
              <Label>Time in Force</Label>
              <Select value={timeInForce} onValueChange={setTimeInForce}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GTC">Good Till Cancelled</SelectItem>
                  <SelectItem value="IOC">Immediate or Cancel</SelectItem>
                  <SelectItem value="FOK">Fill or Kill</SelectItem>
                  <SelectItem value="DAY">Day Order</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="fill-or-kill"
                  checked={fillOrKill}
                  onCheckedChange={setFillOrKill}
                />
                <Label htmlFor="fill-or-kill">Fill or Kill</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="reduce-only"
                  checked={reduceOnly}
                  onCheckedChange={setReduceOnly}
                />
                <Label htmlFor="reduce-only">Reduce Only</Label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Order Summary */}
          <div className="space-y-2 p-4 bg-muted rounded-lg">
            <h4 className="font-medium">Order Summary</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span>Order Value:</span>
              <span className="font-medium">${calculateOrderValue().toFixed(2)}</span>
              <span>Estimated Fee:</span>
              <span className="font-medium">${getEstimatedFee().toFixed(2)}</span>
              <span>Total Cost:</span>
              <span className="font-medium">
                ${(calculateOrderValue() + getEstimatedFee()).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isCreating || !amount}
            className="w-full"
            size="lg"
          >
            {isCreating ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                {orderType === 'market' ? 'Execute Market Order' : 'Place Order'}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}