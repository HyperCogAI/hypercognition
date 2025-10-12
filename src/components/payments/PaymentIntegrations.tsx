import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, DollarSign, Settings, Check, X, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentProvider {
  id: string;
  name: string;
  icon: React.ReactNode;
  status: 'connected' | 'disconnected' | 'error';
  fees: string;
  supported: string[];
  description: string;
}

interface PaymentSettings {
  autoCollect: boolean;
  webhooksEnabled: boolean;
  testMode: boolean;
  defaultCurrency: string;
  minimumAmount: number;
}

const PaymentIntegrations: React.FC = () => {
  const [providers, setProviders] = useState<PaymentProvider[]>([]);
  const [settings, setSettings] = useState<PaymentSettings>({
    autoCollect: true,
    webhooksEnabled: true,
    testMode: false,
    defaultCurrency: 'USD',
    minimumAmount: 10
  });
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize payment providers
    const mockProviders: PaymentProvider[] = [
      {
        id: 'stripe',
        name: 'Stripe',
        icon: <CreditCard className="w-6 h-6" />,
        status: 'connected',
        fees: '2.9% + 30¢',
        supported: ['Credit Cards', 'Apple Pay', 'Google Pay', 'ACH'],
        description: 'Global payment processing with advanced fraud protection'
      },
      {
        id: 'paypal',
        name: 'PayPal',
        icon: <DollarSign className="w-6 h-6" />,
        status: 'disconnected',
        fees: '3.49% + fixed fee',
        supported: ['PayPal', 'Credit Cards', 'Bank Transfers'],
        description: 'Trusted digital payment platform for global transactions'
      }
    ];
    setProviders(mockProviders);
  }, []);

  const connectProvider = async (providerId: string) => {
    setIsConnecting(providerId);
    
    // Simulate connection process
    setTimeout(() => {
      setProviders(prev => prev.map(provider => 
        provider.id === providerId 
          ? { ...provider, status: 'connected' as const }
          : provider
      ));
      setIsConnecting(null);
      toast({
        title: "Provider Connected",
        description: `Successfully connected to ${providers.find(p => p.id === providerId)?.name}`,
      });
    }, 2000);
  };

  const disconnectProvider = async (providerId: string) => {
    setProviders(prev => prev.map(provider => 
      provider.id === providerId 
        ? { ...provider, status: 'disconnected' as const }
        : provider
    ));
    toast({
      title: "Provider Disconnected",
      description: `Disconnected from ${providers.find(p => p.id === providerId)?.name}`,
      variant: "destructive"
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'error':
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge variant="default" className="bg-green-500">Connected</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Disconnected</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white leading-tight">
            Payment{" "}
            <span className="text-white">
              Integrations
            </span>
          </h1>
          <p className="text-muted-foreground">Manage payment processors and billing settings</p>
        </div>
        <Button variant="outline">
          <Settings className="w-4 h-4 mr-2" />
          Global Settings
        </Button>
      </div>

      <Tabs defaultValue="providers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="providers">Payment Providers</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map((provider) => (
              <Card key={provider.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {provider.icon}
                      <CardTitle className="text-lg">{provider.name}</CardTitle>
                    </div>
                    {getStatusIcon(provider.status)}
                  </div>
                  <CardDescription>{provider.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status</span>
                    {getStatusBadge(provider.status)}
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium">Processing Fees</span>
                    <p className="text-sm text-muted-foreground">{provider.fees}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium">Supported Methods</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {provider.supported.slice(0, 2).map((method) => (
                        <Badge key={method} variant="outline" className="text-xs">
                          {method}
                        </Badge>
                      ))}
                      {provider.supported.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{provider.supported.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    {provider.status === 'connected' ? (
                      <div className="space-y-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => disconnectProvider(provider.id)}
                        >
                          Disconnect
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="w-full">
                              Configure
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Configure {provider.name}</DialogTitle>
                              <DialogDescription>
                                Manage settings for {provider.name} integration
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label>Webhook URL</Label>
                                <Input value={`https://api.hypercognition.com/webhooks/${provider.id}`} readOnly />
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch />
                                <Label>Enable automatic refunds</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch defaultChecked />
                                <Label>Send payment confirmations</Label>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    ) : (
                      <Button 
                        onClick={() => connectProvider(provider.id)}
                        disabled={isConnecting === provider.id}
                        className="w-full"
                      >
                        {isConnecting === provider.id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          'Connect'
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest payment transactions across all providers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <DollarSign className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium">Payment #{1000 + i}</p>
                        <p className="text-sm text-muted-foreground">User subscription</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${(10 + (crypto.getRandomValues(new Uint32Array(1))[0] % 9000) / 100).toFixed(2)}</p>
                      <Badge variant="default" className="bg-green-500">Success</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
              <CardDescription>Configure global payment preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Auto-collect payments</Label>
                    <p className="text-sm text-muted-foreground">Automatically charge customers on due dates</p>
                  </div>
                  <Switch 
                    checked={settings.autoCollect}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoCollect: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Enable webhooks</Label>
                    <p className="text-sm text-muted-foreground">Receive real-time payment notifications</p>
                  </div>
                  <Switch 
                    checked={settings.webhooksEnabled}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, webhooksEnabled: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Test mode</Label>
                    <p className="text-sm text-muted-foreground">Use test API keys for development</p>
                  </div>
                  <Switch 
                    checked={settings.testMode}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, testMode: checked }))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Default Currency</Label>
                  <Input value={settings.defaultCurrency} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Minimum Payment Amount</Label>
                  <Input 
                    type="number" 
                    value={settings.minimumAmount}
                    onChange={(e) => setSettings(prev => ({ ...prev, minimumAmount: Number(e.target.value) }))}
                  />
                </div>
              </div>
              
              {settings.testMode && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Test mode is enabled. No real payments will be processed.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaymentIntegrations;