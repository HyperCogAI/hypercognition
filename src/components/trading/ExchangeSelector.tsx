import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { exchangeManager, ExchangeType } from '@/lib/exchanges/exchangeManager'
import { useExchangeStatus } from '@/lib/exchanges/exchangeManager'
import { Wifi, WifiOff, Settings, Plus, Trash2 } from 'lucide-react'

export const ExchangeSelector = () => {
  const { toast } = useToast()
  const { connectedExchanges, activeExchange, setActiveExchange } = useExchangeStatus()
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newExchangeConfig, setNewExchangeConfig] = useState({
    type: 'binance' as ExchangeType,
    apiKey: '',
    apiSecret: '',
    testnet: true
  })

  const handleAddExchange = async () => {
    try {
      await exchangeManager.addExchange(newExchangeConfig.type, {
        apiKey: newExchangeConfig.apiKey,
        apiSecret: newExchangeConfig.apiSecret,
        testnet: newExchangeConfig.testnet
      })

      toast({
        title: "Exchange Connected",
        description: `${newExchangeConfig.type} has been connected successfully.`
      })

      setShowAddDialog(false)
      setNewExchangeConfig({
        type: 'binance',
        apiKey: '',
        apiSecret: '',
        testnet: true
      })
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect exchange",
        variant: "destructive"
      })
    }
  }

  const handleRemoveExchange = async (type: ExchangeType) => {
    try {
      await exchangeManager.removeExchange(type)
      toast({
        title: "Exchange Disconnected",
        description: `${type} has been disconnected.`
      })
    } catch (error) {
      toast({
        title: "Disconnection Failed",
        description: error instanceof Error ? error.message : "Failed to disconnect exchange",
        variant: "destructive"
      })
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Exchange Connections</CardTitle>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Exchange
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Connect Exchange</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="exchange-type">Exchange</Label>
                <Select
                  value={newExchangeConfig.type}
                  onValueChange={(value) => setNewExchangeConfig(prev => ({ ...prev, type: value as ExchangeType }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="binance">Binance</SelectItem>
                    <SelectItem value="coinbase" disabled>Coinbase (Coming Soon)</SelectItem>
                    <SelectItem value="kraken" disabled>Kraken (Coming Soon)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="testnet"
                  checked={newExchangeConfig.testnet}
                  onCheckedChange={(checked) => setNewExchangeConfig(prev => ({ ...prev, testnet: checked }))}
                />
                <Label htmlFor="testnet">Use Testnet</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="Enter your API key"
                  value={newExchangeConfig.apiKey}
                  onChange={(e) => setNewExchangeConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="api-secret">API Secret</Label>
                <Input
                  id="api-secret"
                  type="password"
                  placeholder="Enter your API secret"
                  value={newExchangeConfig.apiSecret}
                  onChange={(e) => setNewExchangeConfig(prev => ({ ...prev, apiSecret: e.target.value }))}
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg text-sm">
                <p className="text-blue-700 dark:text-blue-300">
                  <strong>Demo Mode:</strong> For demonstration purposes, you can connect without real API keys. 
                  The platform will use simulated data for testing.
                </p>
              </div>

              <Button onClick={handleAddExchange} className="w-full">
                Connect Exchange
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent className="space-y-4">
        {connectedExchanges.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <WifiOff className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No exchanges connected</p>
            <p className="text-sm">Add an exchange to start trading</p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label>Active Exchange</Label>
              <Select
                value={activeExchange || ''}
                onValueChange={(value) => setActiveExchange(value as ExchangeType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select active exchange" />
                </SelectTrigger>
                <SelectContent>
                  {connectedExchanges.map((exchange) => (
                    <SelectItem key={exchange} value={exchange}>
                      <div className="flex items-center gap-2">
                        <Wifi className="h-4 w-4 text-green-500" />
                        {exchange.charAt(0).toUpperCase() + exchange.slice(1)}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Connected Exchanges</Label>
              <div className="space-y-2">
                {connectedExchanges.map((exchange) => (
                  <div key={exchange} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Wifi className="h-4 w-4 text-green-500" />
                      <span className="font-medium capitalize">{exchange}</span>
                      {activeExchange === exchange && (
                        <Badge variant="secondary">Active</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {/* Open exchange settings */}}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveExchange(exchange)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}