import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { 
  Plug, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Activity,
  Settings,
  RefreshCw
} from 'lucide-react'

interface Exchange {
  id: string
  name: string
  logo: string
  status: 'connected' | 'disconnected' | 'error' | 'connecting'
  lastSync: Date | null
  tradingPairs: number
  volume24h: number
  fees: {
    maker: number
    taker: number
  }
  features: string[]
  isTestnet: boolean
}

interface ExchangeCredentials {
  apiKey: string
  secretKey: string
  passphrase?: string
  testnet: boolean
}

export const MultiExchangeConnector = () => {
  const [exchanges, setExchanges] = useState<Exchange[]>([
    {
      id: 'binance',
      name: 'Binance',
      logo: '🔶',
      status: 'connected',
      lastSync: new Date(),
      tradingPairs: 2143,
      volume24h: 24500000000,
      fees: { maker: 0.1, taker: 0.1 },
      features: ['Spot', 'Futures', 'Options', 'Margin'],
      isTestnet: false
    },
    {
      id: 'coinbase',
      name: 'Coinbase Pro',
      logo: '🔵',
      status: 'disconnected',
      lastSync: null,
      tradingPairs: 234,
      volume24h: 3200000000,
      fees: { maker: 0.05, taker: 0.05 },
      features: ['Spot', 'Advanced'],
      isTestnet: false
    },
    {
      id: 'kraken',
      name: 'Kraken',
      logo: '🐙',
      status: 'error',
      lastSync: new Date(Date.now() - 3600000),
      tradingPairs: 567,
      volume24h: 1800000000,
      fees: { maker: 0.16, taker: 0.26 },
      features: ['Spot', 'Futures', 'Margin'],
      isTestnet: false
    },
    {
      id: 'bybit',
      name: 'Bybit',
      logo: '🟡',
      status: 'disconnected',
      lastSync: null,
      tradingPairs: 445,
      volume24h: 8900000000,
      fees: { maker: 0.1, taker: 0.1 },
      features: ['Spot', 'Derivatives', 'Copy Trading'],
      isTestnet: false
    },
    {
      id: 'kucoin',
      name: 'KuCoin',
      logo: '🟢',
      status: 'disconnected',
      lastSync: null,
      tradingPairs: 1234,
      volume24h: 2100000000,
      fees: { maker: 0.1, taker: 0.1 },
      features: ['Spot', 'Futures', 'Pool'],
      isTestnet: false
    },
    {
      id: 'gate',
      name: 'Gate.io',
      logo: '🔺',
      status: 'disconnected',
      lastSync: null,
      tradingPairs: 1891,
      volume24h: 1200000000,
      fees: { maker: 0.2, taker: 0.2 },
      features: ['Spot', 'Perpetual', 'Options'],
      isTestnet: false
    }
  ])

  const [selectedExchange, setSelectedExchange] = useState<string | null>(null)
  const [credentials, setCredentials] = useState<ExchangeCredentials>({
    apiKey: '',
    secretKey: '',
    passphrase: '',
    testnet: false
  })
  const [isConnecting, setIsConnecting] = useState(false)
  const { toast } = useToast()

  const connectExchange = async (exchangeId: string) => {
    setIsConnecting(true)
    
    try {
      // Update status to connecting
      setExchanges(prev => prev.map(ex => 
        ex.id === exchangeId 
          ? { ...ex, status: 'connecting' as const }
          : ex
      ))

      // Simulate API connection
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate random success/failure
      const success = Math.random() > 0.2 // 80% success rate
      
      if (success) {
        setExchanges(prev => prev.map(ex => 
          ex.id === exchangeId 
            ? { 
                ...ex, 
                status: 'connected' as const,
                lastSync: new Date(),
                isTestnet: credentials.testnet
              }
            : ex
        ))

        toast({
          title: "Exchange Connected",
          description: `Successfully connected to ${exchanges.find(ex => ex.id === exchangeId)?.name}`,
        })
      } else {
        setExchanges(prev => prev.map(ex => 
          ex.id === exchangeId 
            ? { ...ex, status: 'error' as const }
            : ex
        ))

        toast({
          title: "Connection Failed",
          description: "Invalid credentials or API error",
          variant: "destructive"
        })
      }
    } catch (error) {
      setExchanges(prev => prev.map(ex => 
        ex.id === exchangeId 
          ? { ...ex, status: 'error' as const }
          : ex
      ))

      toast({
        title: "Connection Error",
        description: "Failed to connect to exchange",
        variant: "destructive"
      })
    } finally {
      setIsConnecting(false)
      setSelectedExchange(null)
      setCredentials({
        apiKey: '',
        secretKey: '',
        passphrase: '',
        testnet: false
      })
    }
  }

  const disconnectExchange = (exchangeId: string) => {
    setExchanges(prev => prev.map(ex => 
      ex.id === exchangeId 
        ? { ...ex, status: 'disconnected' as const, lastSync: null }
        : ex
    ))

    toast({
      title: "Exchange Disconnected",
      description: `Disconnected from ${exchanges.find(ex => ex.id === exchangeId)?.name}`,
    })
  }

  const syncExchange = async (exchangeId: string) => {
    setExchanges(prev => prev.map(ex => 
      ex.id === exchangeId 
        ? { ...ex, lastSync: new Date() }
        : ex
    ))

    toast({
      title: "Exchange Synced",
      description: "Latest data synchronized",
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'connecting': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />
      default: return <XCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected': return <Badge className="bg-green-500">Connected</Badge>
      case 'connecting': return <Badge className="bg-blue-500">Connecting</Badge>
      case 'error': return <Badge variant="destructive">Error</Badge>
      default: return <Badge variant="secondary">Disconnected</Badge>
    }
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(1)}B`
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(1)}M`
    return `$${(volume / 1e3).toFixed(1)}K`
  }

  const connectedExchanges = exchanges.filter(ex => ex.status === 'connected')
  const totalVolume = exchanges.reduce((sum, ex) => sum + ex.volume24h, 0)
  const totalPairs = exchanges.reduce((sum, ex) => sum + ex.tradingPairs, 0)

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Plug className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">{connectedExchanges.length}</div>
            <p className="text-sm text-muted-foreground">Connected</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">{formatVolume(totalVolume)}</div>
            <p className="text-sm text-muted-foreground">24h Volume</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold">{totalPairs.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">Trading Pairs</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Activity className="h-8 w-8 mx-auto mb-2 text-orange-500" />
            <div className="text-2xl font-bold">{exchanges.length}</div>
            <p className="text-sm text-muted-foreground">Available</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Exchange Connections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="exchanges">
            <TabsList>
              <TabsTrigger value="exchanges">Exchanges</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="exchanges" className="space-y-4">
              <div className="grid gap-4">
                {exchanges.map((exchange) => (
                  <Card key={exchange.id} className="relative">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{exchange.logo}</span>
                          <div>
                            <h3 className="font-medium flex items-center gap-2">
                              {exchange.name}
                              {getStatusIcon(exchange.status)}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {exchange.tradingPairs.toLocaleString()} pairs • {formatVolume(exchange.volume24h)} 24h volume
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(exchange.status)}
                          {exchange.isTestnet && (
                            <Badge variant="outline">Testnet</Badge>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Maker Fee:</span>
                          <span className="ml-1 font-medium">{exchange.fees.maker}%</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Taker Fee:</span>
                          <span className="ml-1 font-medium">{exchange.fees.taker}%</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Last Sync:</span>
                          <span className="ml-1 font-medium">
                            {exchange.lastSync ? exchange.lastSync.toLocaleTimeString() : 'Never'}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Features:</span>
                          <span className="ml-1 font-medium">{exchange.features.length}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {exchange.features.map((feature) => (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        {exchange.status === 'connected' ? (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => syncExchange(exchange.id)}
                            >
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Sync
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => disconnectExchange(exchange.id)}
                            >
                              Disconnect
                            </Button>
                          </>
                        ) : (
                          <Button 
                            size="sm"
                            onClick={() => setSelectedExchange(exchange.id)}
                            disabled={exchange.status === 'connecting'}
                          >
                            {exchange.status === 'connecting' ? 'Connecting...' : 'Connect'}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Global Exchange Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Default Order Size</Label>
                      <Input placeholder="1000" />
                    </div>
                    <div className="space-y-2">
                      <Label>Max Slippage (%)</Label>
                      <Input placeholder="0.5" />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Auto-sync enabled</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Smart order routing</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Risk management alerts</Label>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Connection Modal */}
      {selectedExchange && (
        <Card className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>
                Connect to {exchanges.find(ex => ex.id === selectedExchange)?.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>API Key</Label>
                <Input 
                  type="password"
                  placeholder="Enter your API key"
                  value={credentials.apiKey}
                  onChange={(e) => setCredentials(prev => ({ ...prev, apiKey: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Secret Key</Label>
                <Input 
                  type="password"
                  placeholder="Enter your secret key"
                  value={credentials.secretKey}
                  onChange={(e) => setCredentials(prev => ({ ...prev, secretKey: e.target.value }))}
                />
              </div>
              
              {selectedExchange === 'coinbase' && (
                <div className="space-y-2">
                  <Label>Passphrase</Label>
                  <Input 
                    type="password"
                    placeholder="Enter your passphrase"
                    value={credentials.passphrase}
                    onChange={(e) => setCredentials(prev => ({ ...prev, passphrase: e.target.value }))}
                  />
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <Label>Use Testnet</Label>
                <Switch 
                  checked={credentials.testnet}
                  onCheckedChange={(checked) => setCredentials(prev => ({ ...prev, testnet: checked }))}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setSelectedExchange(null)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => connectExchange(selectedExchange)}
                  disabled={isConnecting || !credentials.apiKey || !credentials.secretKey}
                >
                  {isConnecting ? 'Connecting...' : 'Connect'}
                </Button>
              </div>
            </CardContent>
          </div>
        </Card>
      )}
    </div>
  )
}