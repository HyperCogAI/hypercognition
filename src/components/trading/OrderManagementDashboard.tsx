import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAdvancedOrders, type AdvancedOrder } from '@/hooks/useAdvancedOrders'
import { Edit, X, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle } from 'lucide-react'
import { format } from 'date-fns'

const statusIcons = {
  pending: <Clock className="h-4 w-4 text-yellow-500" />,
  filled: <CheckCircle className="h-4 w-4 text-green-500" />,
  cancelled: <XCircle className="h-4 w-4 text-red-500" />,
  rejected: <XCircle className="h-4 w-4 text-red-500" />,
  partially_filled: <TrendingUp className="h-4 w-4 text-blue-500" />
}

const orderTypeColors = {
  market: 'bg-blue-100 text-blue-800',
  limit: 'bg-green-100 text-green-800',
  stop_market: 'bg-yellow-100 text-yellow-800',
  stop_limit: 'bg-orange-100 text-orange-800',
  trailing_stop: 'bg-purple-100 text-purple-800'
}

interface OrderEditDialogProps {
  order: AdvancedOrder
  onSave: (orderId: string, updates: Partial<AdvancedOrder>) => Promise<void>
}

function OrderEditDialog({ order, onSave }: OrderEditDialogProps) {
  const [price, setPrice] = useState(order.price?.toString() || '')
  const [amount, setAmount] = useState(order.amount.toString())
  const [stopLoss, setStopLoss] = useState(order.stop_loss_price?.toString() || '')
  const [takeProfit, setTakeProfit] = useState(order.take_profit_price?.toString() || '')

  const handleSave = async () => {
    const updates: Partial<AdvancedOrder> = {
      amount: parseFloat(amount),
      ...(price && { price: parseFloat(price) }),
      ...(stopLoss && { stop_loss_price: parseFloat(stopLoss) }),
      ...(takeProfit && { take_profit_price: parseFloat(takeProfit) })
    }
    
    await onSave(order.id, updates)
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit Order</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Amount</Label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        
        {order.type !== 'market' && (
          <div className="space-y-2">
            <Label>Price</Label>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
        )}
        
        <div className="space-y-2">
          <Label>Stop Loss</Label>
          <Input
            type="number"
            value={stopLoss}
            onChange={(e) => setStopLoss(e.target.value)}
            placeholder="Optional"
          />
        </div>
        
        <div className="space-y-2">
          <Label>Take Profit</Label>
          <Input
            type="number"
            value={takeProfit}
            onChange={(e) => setTakeProfit(e.target.value)}
            placeholder="Optional"
          />
        </div>
        
        <Button onClick={handleSave} className="w-full">
          Save Changes
        </Button>
      </div>
    </DialogContent>
  )
}

export function OrderManagementDashboard() {
  const { orders, executions, loading, cancelOrder, modifyOrder } = useAdvancedOrders()
  const [filter, setFilter] = useState<'all' | 'pending' | 'filled' | 'cancelled'>('all')

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true
    return order.status === filter
  })

  const getOrderTypeLabel = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  if (loading) {
    return <div className="p-4">Loading orders...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Order Management</h2>
        <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="filled">Filled</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders">Open Orders</TabsTrigger>
          <TabsTrigger value="history">Order History</TabsTrigger>
          <TabsTrigger value="executions">Executions</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Active Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Side</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Filled</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {statusIcons[order.status as keyof typeof statusIcons]}
                          <span className="capitalize">{order.status}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={orderTypeColors[order.type as keyof typeof orderTypeColors]}>
                          {getOrderTypeLabel(order.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className={`flex items-center gap-1 ${
                          order.side === 'buy' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {order.side === 'buy' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                          {order.side.toUpperCase()}
                        </div>
                      </TableCell>
                      <TableCell>{order.amount}</TableCell>
                      <TableCell>
                        {order.price ? `$${order.price}` : 'Market'}
                      </TableCell>
                      <TableCell>
                        {order.filled_amount} / {order.amount}
                        {order.filled_amount > 0 && (
                          <div className="text-xs text-muted-foreground">
                            {((order.filled_amount / order.amount) * 100).toFixed(1)}%
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(order.created_at), 'MMM dd, HH:mm')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {order.status === 'pending' && (
                            <>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <OrderEditDialog order={order} onSave={modifyOrder} />
                              </Dialog>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => cancelOrder(order.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Side</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Filled</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.filter(order => order.status === 'filled' || order.status === 'cancelled').map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {statusIcons[order.status as keyof typeof statusIcons]}
                          <span className="capitalize">{order.status}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={orderTypeColors[order.type as keyof typeof orderTypeColors]}>
                          {getOrderTypeLabel(order.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className={`flex items-center gap-1 ${
                          order.side === 'buy' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {order.side === 'buy' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                          {order.side.toUpperCase()}
                        </div>
                      </TableCell>
                      <TableCell>{order.amount}</TableCell>
                      <TableCell>
                        {order.price ? `$${order.price}` : 'Market'}
                      </TableCell>
                      <TableCell>{order.filled_amount}</TableCell>
                      <TableCell>
                        {format(new Date(order.updated_at), 'MMM dd, HH:mm')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="executions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Executions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Fee</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {executions.map((execution) => (
                    <TableRow key={execution.id}>
                      <TableCell>
                        <Badge variant={execution.execution_type === 'full' ? 'default' : 'secondary'}>
                          {execution.execution_type}
                        </Badge>
                      </TableCell>
                      <TableCell>{execution.executed_amount}</TableCell>
                      <TableCell>
                        {execution.executed_price ? `$${execution.executed_price}` : '-'}
                      </TableCell>
                      <TableCell>${execution.fee_amount}</TableCell>
                      <TableCell>
                        {format(new Date(execution.execution_time), 'MMM dd, HH:mm:ss')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}