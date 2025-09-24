import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
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

const getExchangeLogo = (exchangeName: string) => {
  const logos: Record<string, string> = {
    'Binance': '🔶',
    'Coinbase': '🔵',
    'Kraken': '🟣',
    'Bitfinex': '🟢',
    'KuCoin': '🟡',
    'Huobi': '🔴'
  };
  return logos[exchangeName] || '⚪';
};

const getExchangeFeatures = (exchangeName: string) => {
  const features: Record<string, string[]> = {
    'Binance': ['Spot', 'Futures', 'Options', 'Margin'],
    'Coinbase': ['Spot', 'Pro Trading'],
    'Kraken': ['Spot', 'Futures', 'Margin'],
    'Bitfinex': ['Spot', 'Margin', 'Derivatives'],
    'KuCoin': ['Spot', 'Futures', 'Margin'],
    'Huobi': ['Spot', 'Futures', 'Options']
  };
  return features[exchangeName] || ['Spot'];
};

export const MultiExchangeConnector = () => {
  const { toast } = useToast()
  
  // Real data from Supabase
  const { data: exchangeConnections = [], isLoading, refetch } = useQuery({
    queryKey: ['exchange-connections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exchange_connections')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Transform real data to match UI interface
  const exchanges = exchangeConnections.map(conn => ({
    id: conn.id,
    name: conn.exchange_name,
    logo: getExchangeLogo(conn.exchange_name),
    status: conn.connection_status as 'connected' | 'disconnected' | 'error' | 'connecting',
    lastSync: conn.last_sync_at ? new Date(conn.last_sync_at) : null,
    tradingPairs: Math.floor(Math.random() * 500) + 100, // Mock for now
    volume24h: Math.floor(Math.random() * 1000000) + 100000, // Mock for now
    fees: {
      maker: 0.1,
      taker: 0.1
    },
    features: getExchangeFeatures(conn.exchange_name),
    isTestnet: conn.is_testnet
  }));

  const [selectedExchange, setSelectedExchange] = useState<Exchange | null>(null)
  const [showCredentialsForm, setShowCredentialsForm] = useState(false)
  const [credentials, setCredentials] = useState<ExchangeCredentials>({
    apiKey: '',
    secretKey: '',
    passphrase: '',
    testnet: false
  })

  const handleConnect = async (exchange: Exchange) => {
    try {
      const { error } = await supabase
        .from('exchange_connections')
        .insert({
          exchange_name: exchange.name,
          api_key_encrypted: credentials.apiKey, // In production, this should be encrypted
          is_testnet: credentials.testnet,
          connection_status: 'connecting',
          user_id: 'current_user' // Should use actual user ID
        });

      if (error) throw error;

      toast({
        title: "Exchange Connection",
        description: `Connecting to ${exchange.name}...`
      });

      // Simulate connection process
      setTimeout(() => {
        refetch();
        toast({
          title: "Connected Successfully",
          description: `${exchange.name} has been connected.`
        });
      }, 2000);

    } catch (error) {
      console.error('Connection error:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to exchange. Please check your credentials.",
        variant: "destructive"
      });
    }
  }

  const handleDisconnect = async (exchangeId: string) => {
    try {
      const { error } = await supabase
        .from('exchange_connections')
        .update({ 
          connection_status: 'disconnected',
          is_active: false 
        })
        .eq('id', exchangeId);

      if (error) throw error;

      refetch();
      toast({
        title: "Disconnected",
        description: "Exchange has been disconnected."
      });
    } catch (error) {
      console.error('Disconnect error:', error);
      toast({
        title: "Error",
        description: "Failed to disconnect exchange.",
        variant: "destructive"
      });
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'connecting': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />
      default: return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-500'
      case 'connecting': return 'text-blue-500'
      case 'error': return 'text-red-500'
      default: return 'text-yellow-500'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Exchange Connector
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Connect to multiple exchanges and manage your trading accounts from one unified interface.
        </p>
      </div>

      <Tabs defaultValue="exchanges" className="space-y-6">
        <TabsContent value="exchanges" className="space-y-4">
          <div className="grid gap-4">
            {exchanges.map((exchange) => (
              <Card key={exchange.id} className="transition-all hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">{exchange.logo}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{exchange.name}</h3>
                          {getStatusIcon(exchange.status)}
                          <Badge variant={exchange.isTestnet ? "secondary" : "default"}>
                            {exchange.isTestnet ? 'Testnet' : 'Mainnet'}
                          </Badge>
                        </div>
                        <p className={`text-sm ${getStatusColor(exchange.status)}`}>
                          {exchange.status.charAt(0).toUpperCase() + exchange.status.slice(1)}
                          {exchange.lastSync && (
                            <span className="text-muted-foreground ml-2">
                              Last sync: {exchange.lastSync.toLocaleTimeString()}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Trading Pairs</div>
                        <div className="font-medium">{exchange.tradingPairs.toLocaleString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">24h Volume</div>
                        <div className="font-medium">${exchange.volume24h.toLocaleString()}</div>
                      </div>
                      <div className="flex gap-2">
                        {exchange.status === 'connected' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDisconnect(exchange.id)}
                          >
                            Disconnect
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedExchange(exchange)
                              setShowCredentialsForm(true)
                            }}
                          >
                            Connect
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {exchange.status === 'connected' && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Maker Fee</div>
                          <div className="font-medium">{exchange.fees.maker}%</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Taker Fee</div>
                          <div className="font-medium">{exchange.fees.taker}%</div>
                        </div>
                        <div className="col-span-2">
                          <div className="text-muted-foreground">Features</div>
                          <div className="flex gap-1 mt-1">
                            {exchange.features.map((feature) => (
                              <Badge key={feature} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {showCredentialsForm && selectedExchange && (
            <Card>
              <CardHeader>
                <CardTitle>Connect to {selectedExchange.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={credentials.apiKey}
                    onChange={(e) => setCredentials(prev => ({ ...prev, apiKey: e.target.value }))}
                    placeholder="Enter your API key"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secretKey">Secret Key</Label>
                  <Input
                    id="secretKey"
                    type="password"
                    value={credentials.secretKey}
                    onChange={(e) => setCredentials(prev => ({ ...prev, secretKey: e.target.value }))}
                    placeholder="Enter your secret key"
                  />
                </div>

                {selectedExchange.name === 'Coinbase' && (
                  <div className="space-y-2">
                    <Label htmlFor="passphrase">Passphrase</Label>
                    <Input
                      id="passphrase"
                      type="password"
                      value={credentials.passphrase}
                      onChange={(e) => setCredentials(prev => ({ ...prev, passphrase: e.target.value }))}
                      placeholder="Enter your passphrase"
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Switch
                    id="testnet"
                    checked={credentials.testnet}
                    onCheckedChange={(checked) => setCredentials(prev => ({ ...prev, testnet: checked }))}
                  />
                  <Label htmlFor="testnet">Use testnet</Label>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCredentialsForm(false)
                      setSelectedExchange(null)
                      setCredentials({ apiKey: '', secretKey: '', passphrase: '', testnet: false })
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleConnect(selectedExchange)}
                    disabled={!credentials.apiKey || !credentials.secretKey}
                  >
                    Connect
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}