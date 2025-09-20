import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { LoadingButton } from '@/components/ui/loading-button'
import { useAdvancedTrading, OrderType, OrderSide } from '@/hooks/useAdvancedTrading'
import { formatCurrency } from '@/lib/utils'
import { Trash2, Clock, TrendingUp, TrendingDown } from 'lucide-react'

interface AdvancedTradingPanelProps {
  agentId: string
  agentName: string
  currentPrice: number
  userBalance?: number
}

export function AdvancedTradingPanel({ 
  agentId, 
  agentName, 
  currentPrice, 
  userBalance = 0 
}: AdvancedTradingPanelProps) {
  const { orders, isLoading, placeOrder, cancelOrder } = useAdvancedTrading()
  const [orderType, setOrderType] = useState<OrderType>('limit')
  const [orderSide, setOrderSide] = useState<OrderSide>('buy')
  const [amount, setAmount] = useState('')
  const [price, setPrice] = useState('')
  const [triggerPrice, setTriggerPrice] = useState('')
  const [fillOrKill, setFillOrKill] = useState(false)
  const [isPlacing, setIsPlacing] = useState(false)

  const agentOrders = orders.filter(order => order.agent_id === agentId)
  const pendingOrders = agentOrders.filter(order => order.status === 'pending')

  const handlePlaceOrder = async () => {
    if (!amount || (!price && orderType !== 'market')) return

    setIsPlacing(true)
    
    const orderData = {
      agent_id: agentId,
      type: orderType,
      side: orderSide,
      amount: parseFloat(amount),
      price: price ? parseFloat(price) : undefined,
      trigger_price: triggerPrice ? parseFloat(triggerPrice) : undefined,
      fill_or_kill: fillOrKill
    }

    const success = await placeOrder(orderData)
    
    if (success) {
      setAmount('')
      setPrice('')
      setTriggerPrice('')
    }
    
    setIsPlacing(false)
  }

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-600'
      case 'filled': return 'bg-green-500/20 text-green-600'
      case 'cancelled': return 'bg-red-500/20 text-red-600'
      case 'expired': return 'bg-gray-500/20 text-gray-600'
      default: return 'bg-gray-500/20 text-gray-600'
    }
  }

  const getOrderTypeIcon = (type: string, side: string) => {
    if (side === 'buy') {
      return <TrendingUp className="h-3 w-3 text-green-500" />
    } else {
      return <TrendingDown className="h-3 w-3 text-red-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Order Form */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced Trading</CardTitle>
          <CardDescription>Place limit orders, stop losses, and take profits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={orderSide} onValueChange={(value) => setOrderSide(value as OrderSide)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="buy" className="text-green-600">Buy</TabsTrigger>
              <TabsTrigger value="sell" className="text-red-600">Sell</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Order Type</Label>
              <Select value={orderType} onValueChange={(value) => setOrderType(value as OrderType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="market">Market</SelectItem>
                  <SelectItem value="limit">Limit</SelectItem>
                  <SelectItem value="stop_loss">Stop Loss</SelectItem>
                  <SelectItem value="take_profit">Take Profit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          {orderType !== 'market' && (
            <div>
              <Label>
                {orderType === 'limit' ? 'Limit Price' : 'Price'}
              </Label>
              <Input
                type="number"
                placeholder={currentPrice.toString()}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          )}

          {(orderType === 'stop_loss' || orderType === 'take_profit') && (
            <div>
              <Label>Trigger Price</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={triggerPrice}
                onChange={(e) => setTriggerPrice(e.target.value)}
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              id="fill-or-kill"
              checked={fillOrKill}
              onCheckedChange={setFillOrKill}
            />
            <Label htmlFor="fill-or-kill">Fill or Kill</Label>
          </div>

          <div className="text-sm text-muted-foreground">
            Current Price: {formatCurrency(currentPrice)}
            {userBalance > 0 && (
              <span className="ml-4">Balance: {userBalance.toFixed(2)} {agentName}</span>
            )}
          </div>

          <LoadingButton
            onClick={handlePlaceOrder}
            loading={isPlacing}
            className="w-full"
            disabled={!amount || (!price && orderType !== 'market')}
          >
            Place {orderSide.toUpperCase()} Order
          </LoadingButton>
        </CardContent>
      </Card>

      {/* Active Orders */}
      {pendingOrders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Active Orders ({pendingOrders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getOrderTypeIcon(order.type, order.side)}
                    <div>
                      <div className="font-medium">
                        {order.side.toUpperCase()} {order.amount} {agentName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {order.type.replace('_', ' ').toUpperCase()}
                        {order.price && ` @ ${formatCurrency(order.price)}`}
                        {order.trigger_price && ` (Trigger: ${formatCurrency(order.trigger_price)})`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getOrderStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => cancelOrder(order.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}