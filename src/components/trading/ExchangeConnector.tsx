import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { exchangeManager } from '@/lib/exchanges/exchangeManager'
import { Wifi, WifiOff, Settings, Activity, AlertTriangle } from 'lucide-react'

interface ExchangeStatus {
  name: string
  connected: boolean
  lastPing: number
  latency: number
  apiLimits: {
    remaining: number
    resetTime: number
  }
}

export const ExchangeConnector: React.FC = () => {
  const [exchanges, setExchanges] = useState<ExchangeStatus[]>([])
  const [showConfig, setShowConfig] = useState(false)
  const [selectedExchange, setSelectedExchange] = useState<string>('')
  const [credentials, setCredentials] = useState({
    apiKey: '',
    apiSecret: '',
    passphrase: '',
    testnet: false
  })
  const { toast } = useToast()

  useEffect(() => {
    const fetchExchangeStatuses = async () => {
      const statuses = await exchangeManager.getExchangeStatuses()
      setExchanges(statuses)
    }

    fetchExchangeStatuses()
    const interval = setInterval(fetchExchangeStatuses, 30000) // Update every 30s

    return () => clearInterval(interval)
  }, [])

  const connectExchange = async (exchangeName: string) => {
    try {
      await exchangeManager.addExchange(exchangeName as any, {
        apiKey: credentials.apiKey,
        apiSecret: credentials.apiSecret,
        testnet: credentials.testnet
      })
      
      toast({
        title: "Exchange Connected",
        description: `Successfully connected to ${exchangeName}`,
      })
      
      setShowConfig(false)
      setCredentials({ apiKey: '', apiSecret: '', passphrase: '', testnet: false })
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: `Failed to connect to ${exchangeName}`,
        variant: "destructive"
      })
    }
  }

  const disconnectExchange = async (exchangeName: string) => {
    try {
      await exchangeManager.removeExchange(exchangeName as any)
      toast({
        title: "Exchange Disconnected",
        description: `Disconnected from ${exchangeName}`,
      })
    } catch (error) {
      toast({
        title: "Disconnection Failed",
        description: `Failed to disconnect from ${exchangeName}`,
        variant: "destructive"
      })
    }
  }

  const getStatusIcon = (connected: boolean, latency: number) => {
    if (!connected) return <WifiOff className="h-4 w-4 text-destructive" />
    if (latency > 1000) return <AlertTriangle className="h-4 w-4 text-warning" />
    return <Wifi className="h-4 w-4 text-success" />
  }

  const getStatusBadge = (connected: boolean, latency: number) => {
    if (!connected) return <Badge variant="destructive">Disconnected</Badge>
    if (latency > 1000) return <Badge variant="secondary">Slow</Badge>
    if (latency > 500) return <Badge variant="outline">Normal</Badge>
    return <Badge className="bg-success text-success-foreground">Fast</Badge>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Exchange Connections
          </CardTitle>
          <CardDescription>
            Manage connections to cryptocurrency exchanges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {['Binance', 'Coinbase', 'Kraken', 'Bybit', 'KuCoin'].map((exchange) => {
              const status = exchanges.find(e => e.name === exchange)
              return (
                <div key={exchange} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(status?.connected || false, status?.latency || 0)}
                    <div>
                      <h3 className="font-medium">{exchange}</h3>
                      <p className="text-sm text-muted-foreground">
                        {status?.connected ? `Latency: ${status.latency}ms` : 'Not connected'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(status?.connected || false, status?.latency || 0)}
                    <Button
                      variant={status?.connected ? "destructive" : "default"}
                      size="sm"
                      onClick={() => {
                        if (status?.connected) {
                          disconnectExchange(exchange)
                        } else {
                          setSelectedExchange(exchange)
                          setShowConfig(true)
                        }
                      }}
                    >
                      {status?.connected ? 'Disconnect' : 'Connect'}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showConfig} onOpenChange={setShowConfig}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect to {selectedExchange}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={credentials.apiKey}
                onChange={(e) => setCredentials(prev => ({ ...prev, apiKey: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="apiSecret">API Secret</Label>
              <Input
                id="apiSecret"
                type="password"
                value={credentials.apiSecret}
                onChange={(e) => setCredentials(prev => ({ ...prev, apiSecret: e.target.value }))}
              />
            </div>
            {selectedExchange === 'Coinbase' && (
              <div>
                <Label htmlFor="passphrase">Passphrase</Label>
                <Input
                  id="passphrase"
                  type="password"
                  value={credentials.passphrase}
                  onChange={(e) => setCredentials(prev => ({ ...prev, passphrase: e.target.value }))}
                />
              </div>
            )}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="testnet"
                checked={credentials.testnet}
                onChange={(e) => setCredentials(prev => ({ ...prev, testnet: e.target.checked }))}
              />
              <Label htmlFor="testnet">Use Testnet</Label>
            </div>
            <Button 
              onClick={() => connectExchange(selectedExchange)}
              className="w-full"
            >
              Connect Exchange
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}