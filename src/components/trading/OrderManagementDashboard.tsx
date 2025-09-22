import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAdvancedOrders } from '@/hooks/useAdvancedOrders'
import { 
  ListOrdered, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle, 
  Target,
  AlertTriangle,
  Shield,
  MoreVertical,
  Filter,
  Search,
  Trash2
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDistanceToNow } from 'date-fns'

export function OrderManagementDashboard() {
  const { 
    orders, 
    isLoading, 
    cancelOrder, 
    getOrderStats, 
    getOrdersByStatus, 
    getOrdersByType,
    isCancelling
  } = useAdvancedOrders()
  
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const stats = getOrderStats()

  const getFilteredOrders = () => {
    let filtered = orders

    if (filterStatus !== 'all') {
      filtered = getOrdersByStatus(filterStatus)
    }

    if (filterType !== 'all') {
      filtered = getOrdersByType(filterType)
    }

    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.agent_id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return filtered
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500'
      case 'partial': return 'bg-blue-500'
      case 'filled': return 'bg-green-500'
      case 'cancelled': return 'bg-gray-500'
      case 'expired': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'market': return <TrendingUp className="h-4 w-4" />
      case 'limit': return <Target className="h-4 w-4" />
      case 'stop_market': return <AlertTriangle className="h-4 w-4" />
      case 'stop_limit': return <Shield className="h-4 w-4" />
      case 'trailing_stop': return <TrendingDown className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(value)
  }

  const handleCancelOrder = (orderId: string) => {
    cancelOrder(orderId)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Order Management</h2>
          <p className="text-muted-foreground">
            Manage your active orders and view trading history
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Orders</p>
                <p className="text-2xl font-bold">{stats.activeOrders}</p>
              </div>
              <Clock className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Filled Orders</p>
                <p className="text-2xl font-bold">{stats.filledOrders}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Volume</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalVolume)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</p>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by agent name or symbol..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Label>Status:</Label>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border rounded px-2 py-1"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="partial">Partial</option>
                <option value="filled">Filled</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Label>Type:</Label>
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                className="border rounded px-2 py-1"
              >
                <option value="all">All</option>
                <option value="market">Market</option>
                <option value="limit">Limit</option>
                <option value="stop_market">Stop Market</option>
                <option value="stop_limit">Stop Limit</option>
                <option value="trailing_stop">Trailing Stop</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListOrdered className="h-5 w-5" />
            Orders ({getFilteredOrders().length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {getFilteredOrders().length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No orders found matching your criteria
                </div>
              ) : (
                getFilteredOrders().map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(order.status)}`} />
                        {getTypeIcon(order.type)}
                        <Badge variant={order.side === 'buy' ? 'default' : 'destructive'}>
                          {order.side.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div>
                        <p className="font-medium">Agent {order.agent_id.slice(0, 8)}...</p>
                        <p className="text-sm text-muted-foreground">
                          {order.type.replace('_', ' ')}
                        </p>
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="font-medium">
                        {order.amount.toFixed(4)} @ {formatCurrency(order.price || 0)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Filled: {order.filled_amount.toFixed(4)} ({((order.filled_amount / order.amount) * 100).toFixed(1)}%)
                      </p>
                    </div>

                    <div className="text-center">
                      <Badge variant="outline" className="mb-1">
                        {order.status.toUpperCase()}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency((order.price || 0) * order.amount)}
                      </p>
                      {order.stop_loss_price && (
                        <p className="text-xs text-red-600">
                          SL: {formatCurrency(order.stop_loss_price)}
                        </p>
                      )}
                      {order.take_profit_price && (
                        <p className="text-xs text-green-600">
                          TP: {formatCurrency(order.take_profit_price)}
                        </p>
                      )}
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {['pending', 'partial'].includes(order.status) && (
                          <DropdownMenuItem
                            onClick={() => handleCancelOrder(order.id)}
                            disabled={isCancelling}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Cancel
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem>
                          View Details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}