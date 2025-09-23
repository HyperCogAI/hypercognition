import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Code, Key, DollarSign, Users, TrendingUp, Settings, AlertCircle, CheckCircle, Copy, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface APIKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  rateLimit: number;
  status: 'active' | 'suspended' | 'expired';
  usage: number;
  revenue: number;
  createdAt: string;
  lastUsed: string;
}

interface Developer {
  id: string;
  name: string;
  email: string;
  company?: string;
  tier: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'pending' | 'suspended';
  totalRevenue: number;
  apiKeys: number;
  lastActive: string;
}

interface APIEndpoint {
  name: string;
  description: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  category: string;
  pricing: number;
  usage: number;
  isPublic: boolean;
}

const APIMarketplace: React.FC = () => {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [endpoints, setEndpoints] = useState<APIEndpoint[]>([]);
  const [selectedTier, setSelectedTier] = useState<string>('free');
  const { toast } = useToast();

  useEffect(() => {
    // Initialize mock data
    const mockDevelopers: Developer[] = [
      {
        id: '1',
        name: 'John Smith',
        email: 'john@tradingbots.com',
        company: 'TradingBots Inc',
        tier: 'enterprise',
        status: 'active',
        totalRevenue: 15000,
        apiKeys: 5,
        lastActive: '2024-01-15'
      },
      {
        id: '2',
        name: 'Sarah Chen',
        email: 'sarah@fintechstudio.com',
        company: 'FinTech Studio',
        tier: 'pro',
        status: 'active',
        totalRevenue: 3500,
        apiKeys: 3,
        lastActive: '2024-01-14'
      }
    ];

    const mockAPIKeys: APIKey[] = [
      {
        id: '1',
        name: 'Production API',
        key: 'hc_prod_1a2b3c4d5e6f7g8h9i0j',
        permissions: ['trading', 'portfolio', 'analytics'],
        rateLimit: 10000,
        status: 'active',
        usage: 7500,
        revenue: 850,
        createdAt: '2024-01-01',
        lastUsed: '2024-01-15'
      },
      {
        id: '2',
        name: 'Development API',
        key: 'hc_dev_k1l2m3n4o5p6q7r8s9t0',
        permissions: ['portfolio', 'analytics'],
        rateLimit: 1000,
        status: 'active',
        usage: 234,
        revenue: 45,
        createdAt: '2024-01-10',
        lastUsed: '2024-01-14'
      }
    ];

    const mockEndpoints: APIEndpoint[] = [
      {
        name: 'Get Market Data',
        description: 'Real-time market data for AI agents',
        method: 'GET',
        path: '/v1/market/data',
        category: 'Market Data',
        pricing: 0.01,
        usage: 125000,
        isPublic: true
      },
      {
        name: 'Execute Trade',
        description: 'Execute trading orders programmatically',
        method: 'POST',
        path: '/v1/trading/order',
        category: 'Trading',
        pricing: 0.05,
        usage: 45000,
        isPublic: false
      },
      {
        name: 'Portfolio Analytics',
        description: 'Advanced portfolio performance metrics',
        method: 'GET',
        path: '/v1/portfolio/analytics',
        category: 'Analytics',
        pricing: 0.02,
        usage: 78000,
        isPublic: true
      }
    ];

    setDevelopers(mockDevelopers);
    setApiKeys(mockAPIKeys);
    setEndpoints(mockEndpoints);
  }, []);

  const generateAPIKey = () => {
    const newKey: APIKey = {
      id: Date.now().toString(),
      name: 'New API Key',
      key: `hc_${Math.random().toString(36).substring(2, 15)}`,
      permissions: ['portfolio'],
      rateLimit: selectedTier === 'free' ? 1000 : selectedTier === 'pro' ? 10000 : 100000,
      status: 'active',
      usage: 0,
      revenue: 0,
      createdAt: new Date().toISOString().split('T')[0],
      lastUsed: 'Never'
    };

    setApiKeys(prev => [...prev, newKey]);
    toast({
      title: "API Key Generated",
      description: "New API key has been created successfully.",
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "API key copied to clipboard.",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>;
      case 'expired':
        return <Badge variant="secondary">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'enterprise':
        return <Badge className="bg-purple-500">Enterprise</Badge>;
      case 'pro':
        return <Badge className="bg-blue-500">Pro</Badge>;
      case 'free':
        return <Badge variant="secondary">Free</Badge>;
      default:
        return <Badge variant="outline">{tier}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">API Marketplace</h1>
          <p className="text-muted-foreground">Developer portal and API management</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Key className="w-4 h-4 mr-2" />
                Generate API Key
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate New API Key</DialogTitle>
                <DialogDescription>Create a new API key for your application</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>API Key Name</Label>
                  <Input placeholder="Production API, Development API, etc." />
                </div>
                <div className="space-y-2">
                  <Label>Tier</Label>
                  <Select value={selectedTier} onValueChange={setSelectedTier}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free (1,000 calls/month)</SelectItem>
                      <SelectItem value="pro">Pro (10,000 calls/month)</SelectItem>
                      <SelectItem value="enterprise">Enterprise (100,000 calls/month)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={generateAPIKey} className="w-full">
                  Generate API Key
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Developers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{developers.length}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +15% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Calls</CardTitle>
            <Code className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">248K</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$18,500</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +23% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.9%</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="keys">API Keys</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="developers">Developers</TabsTrigger>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Popular Endpoints</CardTitle>
                <CardDescription>Most used API endpoints this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {endpoints.slice(0, 5).map((endpoint, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{endpoint.name}</p>
                        <p className="text-sm text-muted-foreground">{endpoint.method} {endpoint.path}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{endpoint.usage.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">calls</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Sharing</CardTitle>
                <CardDescription>Developer revenue distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Platform Fee (30%)</span>
                    <span className="font-medium">$5,550</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Developer Share (70%)</span>
                    <span className="font-medium">$12,950</span>
                  </div>
                  <Progress value={70} className="h-2" />
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Revenue sharing applies to premium API endpoints only.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="keys" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Key Management</CardTitle>
              <CardDescription>Manage and monitor your API keys</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiKeys.map((key) => (
                  <div key={key.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{key.name}</h3>
                        <p className="text-sm text-muted-foreground">Created: {key.createdAt}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(key.status)}
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(key.key)}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Usage</Label>
                        <p className="font-medium">{key.usage.toLocaleString()} / {key.rateLimit.toLocaleString()}</p>
                        <Progress value={(key.usage / key.rateLimit) * 100} className="h-1 mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Revenue</Label>
                        <p className="font-medium">${key.revenue}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Last Used</Label>
                        <p className="font-medium">{key.lastUsed}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Permissions</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {key.permissions.map((permission, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {permission}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <code className="bg-muted px-2 py-1 rounded text-sm">{key.key}</code>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <RefreshCw className="w-4 h-4 mr-1" />
                          Regenerate
                        </Button>
                        <Button variant="outline" size="sm">
                          Configure
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Endpoints</CardTitle>
              <CardDescription>Available endpoints and pricing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {endpoints.map((endpoint, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <Badge variant={endpoint.method === 'GET' ? 'default' : 'secondary'}>
                          {endpoint.method}
                        </Badge>
                        <h3 className="font-semibold">{endpoint.name}</h3>
                        {endpoint.isPublic && <Badge variant="outline">Public</Badge>}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${endpoint.pricing}</p>
                        <p className="text-sm text-muted-foreground">per call</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{endpoint.description}</p>
                    <div className="flex items-center justify-between">
                      <code className="bg-muted px-2 py-1 rounded text-sm">{endpoint.path}</code>
                      <div className="text-sm text-muted-foreground">
                        {endpoint.usage.toLocaleString()} calls this month
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="developers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Developer Community</CardTitle>
              <CardDescription>Active developers and their metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {developers.map((developer) => (
                  <div key={developer.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{developer.name}</h3>
                        <p className="text-sm text-muted-foreground">{developer.email}</p>
                        {developer.company && (
                          <p className="text-sm text-muted-foreground">{developer.company}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-1">
                          {getTierBadge(developer.tier)}
                          {getStatusBadge(developer.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">Last active: {developer.lastActive}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Total Revenue</Label>
                        <p className="font-medium">${developer.totalRevenue.toLocaleString()}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">API Keys</Label>
                        <p className="font-medium">{developer.apiKeys}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Status</Label>
                        <p className="font-medium">{developer.status}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Documentation</CardTitle>
              <CardDescription>Interactive API documentation and examples</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Getting Started</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Welcome to the HyperCognition API. Our REST API allows you to integrate AI trading capabilities into your applications.
                  </p>
                  <div className="bg-muted p-4 rounded">
                    <code className="text-sm">
                      curl -H "Authorization: Bearer YOUR_API_KEY" \<br />
                      &nbsp;&nbsp;&nbsp;&nbsp; https://api.hypercognition.com/v1/market/data
                    </code>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Authentication</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    All API requests require authentication using your API key in the Authorization header.
                  </p>
                  <div className="bg-muted p-4 rounded">
                    <code className="text-sm">Authorization: Bearer hc_your_api_key_here</code>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Rate Limits</h3>
                  <p className="text-sm text-muted-foreground">
                    Rate limits vary by tier:
                  </p>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                    <li>• Free: 1,000 calls/month</li>
                    <li>• Pro: 10,000 calls/month</li>
                    <li>• Enterprise: 100,000 calls/month</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default APIMarketplace;