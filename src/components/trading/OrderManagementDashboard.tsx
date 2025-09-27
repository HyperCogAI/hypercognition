import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-3"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse h-16 bg-muted rounded"></div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse h-96 bg-muted rounded"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <ListOrdered className="h-8 w-8 text-primary" />
            <h2 className="text-2xl font-bold">Trading Dashboard</h2>
          </div>
          <p className="text-muted-foreground">
            Manage your active orders and view comprehensive trading analytics
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Active Orders</p>
                <p className="text-3xl font-bold">{stats.activeOrders}</p>
              </div>
              <Clock className="h-10 w-10 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Filled Orders</p>
                <p className="text-3xl font-bold">{stats.filledOrders}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Volume</p>
                <p className="text-3xl font-bold">{formatCurrency(stats.totalVolume)}</p>
              </div>
              <TrendingUp className="h-10 w-10 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-3xl font-bold">{stats.successRate.toFixed(1)}%</p>
              </div>
              <Target className="h-10 w-10 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex items-center gap-3 flex-1 min-w-64">
              <Search className="h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by agent name or symbol..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10"
              />
            </div>
            
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-3">
                <Filter className="h-5 w-5 text-muted-foreground" />
                <Label className="text-sm font-medium">Status:</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32 h-10 bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg z-50">
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="filled">Filled</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-3">
                <Label className="text-sm font-medium">Type:</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-36 h-10 bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg z-50">
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="market">Market</SelectItem>
                    <SelectItem value="limit">Limit</SelectItem>
                    <SelectItem value="stop_market">Stop Market</SelectItem>
                    <SelectItem value="stop_limit">Stop Limit</SelectItem>
                    <SelectItem value="trailing_stop">Trailing Stop</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <ListOrdered className="h-6 w-6" />
            Active Orders ({getFilteredOrders().length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {getFilteredOrders().length === 0 ? (
                <div className="text-center py-16">
                  <ListOrdered className="h-16 w-16 text-muted-foreground/50 mx-auto mb-6" />
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-muted-foreground">No Orders Found</h3>
                    <p className="text-muted-foreground">
                      No orders match your current search criteria. Try adjusting your filters.
                    </p>
                  </div>
                </div>
              ) : (
                getFilteredOrders().map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-6 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(order.status)}`} />
                        <div className="p-2 rounded-lg bg-muted/30">
                          {getTypeIcon(order.type)}
                        </div>
                        <Badge variant={order.side === 'buy' ? 'default' : 'destructive'} className="font-medium">
                          {order.side.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="font-semibold">Agent {order.agent_id.slice(0, 8)}...</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {order.type.replace('_', ' ')} Order
                        </p>
                      </div>
                    </div>

                    <div className="text-center space-y-1">
                      <p className="font-semibold">
                        {order.amount.toFixed(4)} @ {formatCurrency(order.price || 0)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Filled: {order.filled_amount.toFixed(4)} ({((order.filled_amount / order.amount) * 100).toFixed(1)}%)
                      </p>
                    </div>

                    <div className="text-center space-y-2">
                      <Badge variant="outline" className="font-medium">
                        {order.status.toUpperCase()}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                      </p>
                    </div>

                    <div className="text-right space-y-1">
                      <p className="font-bold text-lg">
                        {formatCurrency((order.price || 0) * order.amount)}
                      </p>
                      <div className="space-y-1">
                        {order.stop_loss_price && (
                          <p className="text-xs text-red-500 font-medium">
                            SL: {formatCurrency(order.stop_loss_price)}
                          </p>
                        )}
                        {order.take_profit_price && (
                          <p className="text-xs text-green-500 font-medium">
                            TP: {formatCurrency(order.take_profit_price)}
                          </p>
                        )}
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-10 w-10">
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-background border shadow-lg z-50">
                        {['pending', 'partial'].includes(order.status) && (
                          <DropdownMenuItem
                            onClick={() => handleCancelOrder(order.id)}
                            disabled={isCancelling}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Cancel Order
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem>
                          <Target className="h-4 w-4 mr-2" />
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