import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSolanaWallet } from "@/hooks/useSolanaWallet"
import { Clock, CheckCircle, XCircle, AlertCircle, TrendingUp, TrendingDown } from "lucide-react"

interface SolanaOrder {
  id: string
  type: 'buy' | 'sell' | 'swap'
  token: string
  amount: number
  price?: number
  status: 'pending' | 'filled' | 'cancelled' | 'failed'
  timestamp: Date
  fromToken?: string
  toToken?: string
}

export const SolanaOrderManager = () => {
  const { isConnected } = useSolanaWallet()
  const [orders] = useState<SolanaOrder[]>([
    {
      id: '1',
      type: 'buy',
      token: 'SOL',
      amount: 10,
      price: 100.50,
      status: 'filled',
      timestamp: new Date(Date.now() - 3600000)
    },
    {
      id: '2',
      type: 'sell',
      token: 'USDC',
      amount: 500,
      price: 1.00,
      status: 'pending',
      timestamp: new Date(Date.now() - 1800000)
    },
    {
      id: '3',
      type: 'swap',
      token: 'RAY',
      amount: 25,
      status: 'cancelled',
      timestamp: new Date(Date.now() - 7200000),
      fromToken: 'SOL',
      toToken: 'RAY'
    }
  ])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'filled':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'filled':
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'cancelled':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'failed':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20'
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleString()
  }

  const pendingOrders = orders.filter(order => order.status === 'pending')
  const completedOrders = orders.filter(order => order.status !== 'pending')

  if (!isConnected) {
    return (
      <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20">
        <CardHeader>
          <CardTitle>Solana Order Manager</CardTitle>
          <CardDescription>Connect your wallet to view orders</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20">
      <CardHeader>
        <CardTitle>Solana Order Manager</CardTitle>
        <CardDescription>
          Manage your Solana trading orders and transaction history
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending ({pendingOrders.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              History ({completedOrders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4 mt-4">
            {pendingOrders.length > 0 ? (
              pendingOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 bg-background/50 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {order.type === 'buy' ? (
                        <TrendingUp className="h-5 w-5 text-green-500" />
                      ) : order.type === 'sell' ? (
                        <TrendingDown className="h-5 w-5 text-red-500" />
                      ) : (
                        <div className="h-5 w-5 rounded-full bg-purple-500" />
                      )}
                      <div>
                        <p className="font-medium capitalize">
                          {order.type} {order.token}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.type === 'swap' 
                            ? `${order.fromToken} → ${order.toToken}`
                            : `${order.amount} @ $${order.price?.toFixed(2)}`
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1 capitalize">{order.status}</span>
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Cancel order logic here
                        console.log('Cancel order:', order.id)
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No pending orders</p>
                <p className="text-sm">Your active orders will appear here</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4 mt-4">
            {completedOrders.length > 0 ? (
              completedOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 bg-background/50 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {order.type === 'buy' ? (
                        <TrendingUp className="h-5 w-5 text-green-500" />
                      ) : order.type === 'sell' ? (
                        <TrendingDown className="h-5 w-5 text-red-500" />
                      ) : (
                        <div className="h-5 w-5 rounded-full bg-purple-500" />
                      )}
                      <div>
                        <p className="font-medium capitalize">
                          {order.type} {order.token}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.type === 'swap' 
                            ? `${order.fromToken} → ${order.toToken}`
                            : `${order.amount} @ $${order.price?.toFixed(2)}`
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">{order.status}</span>
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTime(order.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No order history</p>
                <p className="text-sm">Your completed orders will appear here</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}