import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { 
  Activity, 
  Wifi, 
  WifiOff, 
  Users, 
  TrendingUp, 
  Bell,
  Zap,
  BarChart3,
  Wallet
} from 'lucide-react'

interface RealtimeStats {
  connectedUsers: number
  messagesPerSecond: number
  latency: number
  activeStreams: number
}

interface LiveUpdate {
  id: string
  type: 'price' | 'order' | 'trade' | 'portfolio' | 'notification'
  data: any
  timestamp: Date
  source: string
}

export const EnhancedRealtimeSystem = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [stats, setStats] = useState<RealtimeStats>({
    connectedUsers: 0,
    messagesPerSecond: 0,
    latency: 0,
    activeStreams: 0
  })
  const [liveUpdates, setLiveUpdates] = useState<LiveUpdate[]>([])
  const [subscriptions, setSubscriptions] = useState({
    prices: true,
    orders: true,
    portfolio: true,
    social: false,
    news: true
  })
  
  const { toast } = useToast()
  const channelsRef = useRef<any[]>([])
  const latencyTestRef = useRef<number>(0)

  // WebSocket connection with enhanced features
  const initializeRealtime = useCallback(async () => {
    try {
      // Test connection latency
      const startTime = Date.now()
      
      // Price updates channel
      if (subscriptions.prices) {
        const priceChannel = supabase
          .channel('enhanced-price-updates')
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'market_data_feeds' },
            (payload) => {
              const latency = Date.now() - startTime
              setStats(prev => ({ ...prev, latency }))
              
              addLiveUpdate({
                id: `price-${Date.now()}`,
                type: 'price',
                data: payload,
                timestamp: new Date(),
                source: 'market_data'
              })
            }
          )
          .on('presence', { event: 'sync' }, () => {
            const presenceState = priceChannel.presenceState()
            const userCount = Object.keys(presenceState).length
            setStats(prev => ({ ...prev, connectedUsers: userCount }))
          })
          .subscribe()

        channelsRef.current.push(priceChannel)
      }

      // Portfolio updates channel
      if (subscriptions.portfolio) {
        const portfolioChannel = supabase
          .channel('enhanced-portfolio-updates')
          .on('postgres_changes',
            { event: '*', schema: 'public', table: 'portfolios' },
            (payload) => {
              addLiveUpdate({
                id: `portfolio-${Date.now()}`,
                type: 'portfolio',
                data: payload,
                timestamp: new Date(),
                source: 'portfolio'
              })
            }
          )
          .subscribe()

        channelsRef.current.push(portfolioChannel)
      }

      // Order updates channel
      if (subscriptions.orders) {
        const orderChannel = supabase
          .channel('enhanced-order-updates')
          .on('postgres_changes',
            { event: '*', schema: 'public', table: 'orders' },
            (payload) => {
              addLiveUpdate({
                id: `order-${Date.now()}`,
                type: 'order',
                data: payload,
                timestamp: new Date(),
                source: 'trading'
              })
            }
          )
          .subscribe()

        channelsRef.current.push(orderChannel)
      }

      // Social updates channel
      if (subscriptions.social) {
        const socialChannel = supabase
          .channel('enhanced-social-updates')
          .on('postgres_changes',
            { event: '*', schema: 'public', table: 'agent_comments' },
            (payload) => {
              addLiveUpdate({
                id: `social-${Date.now()}`,
                type: 'trade',
                data: payload,
                timestamp: new Date(),
                source: 'social'
              })
            }
          )
          .subscribe()

        channelsRef.current.push(socialChannel)
      }

      // Notifications channel
      const notificationChannel = supabase
        .channel('enhanced-notifications')
        .on('postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications' },
          (payload) => {
            addLiveUpdate({
              id: `notification-${Date.now()}`,
              type: 'notification',
              data: payload,
              timestamp: new Date(),
              source: 'system'
            })

            // Show toast for high priority notifications
            if (payload.new?.priority === 'high') {
              toast({
                title: payload.new.title,
                description: payload.new.message,
                variant: "default"
              })
            }
          }
        )
        .subscribe()

      channelsRef.current.push(notificationChannel)

      setIsConnected(true)
      setStats(prev => ({ ...prev, activeStreams: channelsRef.current.length }))

      toast({
        title: "Real-time Connected",
        description: `Connected to ${channelsRef.current.length} live data streams`,
      })

    } catch (error) {
      console.error('Failed to initialize realtime:', error)
      toast({
        title: "Connection Failed",
        description: "Could not establish real-time connection",
        variant: "destructive"
      })
    }
  }, [subscriptions, toast])

  const addLiveUpdate = (update: LiveUpdate) => {
    setLiveUpdates(prev => {
      const newUpdates = [update, ...prev].slice(0, 100) // Keep last 100 updates
      
      // Calculate messages per second
      const recentUpdates = newUpdates.filter(u => 
        Date.now() - u.timestamp.getTime() < 1000
      )
      setStats(prevStats => ({ 
        ...prevStats, 
        messagesPerSecond: recentUpdates.length 
      }))
      
      return newUpdates
    })
  }

  const disconnectRealtime = () => {
    channelsRef.current.forEach(channel => {
      supabase.removeChannel(channel)
    })
    channelsRef.current = []
    setIsConnected(false)
    setStats({
      connectedUsers: 0,
      messagesPerSecond: 0,
      latency: 0,
      activeStreams: 0
    })

    toast({
      title: "Disconnected",
      description: "Real-time connection closed",
    })
  }

  const toggleSubscription = (type: keyof typeof subscriptions) => {
    setSubscriptions(prev => ({
      ...prev,
      [type]: !prev[type]
    }))
  }

  useEffect(() => {
    return () => {
      disconnectRealtime()
    }
  }, [])

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case 'price': return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'order': return <BarChart3 className="h-4 w-4 text-blue-500" />
      case 'portfolio': return <Wallet className="h-4 w-4 text-purple-500" />
      case 'notification': return <Bell className="h-4 w-4 text-orange-500" />
      default: return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="h-5 w-5 text-green-500" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-500" />
            )}
            Enhanced Real-time System
            <Badge variant={isConnected ? "default" : "destructive"}>
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-2xl font-bold">{stats.connectedUsers}</span>
              </div>
              <p className="text-sm text-muted-foreground">Connected Users</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Zap className="h-4 w-4 text-green-500" />
                <span className="text-2xl font-bold">{stats.messagesPerSecond}</span>
              </div>
              <p className="text-sm text-muted-foreground">Messages/sec</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Activity className="h-4 w-4 text-orange-500" />
                <span className="text-2xl font-bold">{stats.latency}ms</span>
              </div>
              <p className="text-sm text-muted-foreground">Latency</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <BarChart3 className="h-4 w-4 text-purple-500" />
                <span className="text-2xl font-bold">{stats.activeStreams}</span>
              </div>
              <p className="text-sm text-muted-foreground">Active Streams</p>
            </div>
          </div>

          <div className="flex gap-2">
            {!isConnected ? (
              <Button onClick={initializeRealtime} className="flex-1">
                Connect to Real-time
              </Button>
            ) : (
              <Button onClick={disconnectRealtime} variant="outline" className="flex-1">
                Disconnect
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Subscription Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Real-time Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(subscriptions).map(([key, enabled]) => (
              <div key={key} className="flex items-center justify-between">
                <label className="text-sm font-medium capitalize">
                  {key.replace('_', ' ')}
                </label>
                <Switch
                  checked={enabled}
                  onCheckedChange={() => toggleSubscription(key as keyof typeof subscriptions)}
                  disabled={isConnected}
                />
              </div>
            ))}
          </div>
          {isConnected && (
            <p className="text-xs text-muted-foreground mt-2">
              Disconnect to change subscription settings
            </p>
          )}
        </CardContent>
      </Card>

      {/* Live Updates Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Live Updates Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {liveUpdates.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No live updates yet. Connect to start receiving real-time data.
              </p>
            ) : (
              liveUpdates.map((update) => (
                <div
                  key={update.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  {getUpdateIcon(update.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {update.type}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {update.source}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {JSON.stringify(update.data).slice(0, 100)}...
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {update.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}