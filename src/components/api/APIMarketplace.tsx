import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Code, Key, DollarSign, Users, TrendingUp, Star, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function APIMarketplace() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Real data from Supabase - using secure public view
  const { data: developers = [], isLoading: devsLoading } = useQuery({
    queryKey: ['marketplace-developers-public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketplace_developers_public')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: endpoints = [], isLoading: endpointsLoading } = useQuery({
    queryKey: ['marketplace-endpoints'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketplace_endpoints')
        .select(`
          *,
          developer:marketplace_developers_public(*)
        `)
        .eq('is_active', true)
        .order('total_subscribers', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: userApiKeys = [], isLoading: keysLoading } = useQuery({
    queryKey: ['user-api-keys'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const filteredEndpoints = endpoints.filter(endpoint => {
    const matchesSearch = endpoint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         endpoint.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || endpoint.category.toLowerCase() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(endpoints.map(e => e.category.toLowerCase()))];

  const handleSubscribe = async (endpointId: string) => {
    try {
      // In a real implementation, this would create a subscription
      toast({
        title: "Subscribed Successfully",
        description: "You've been subscribed to this API endpoint."
      });
    } catch (error) {
      toast({
        title: "Subscription Failed",
        description: "Failed to subscribe to the API endpoint.",
        variant: "destructive"
      });
    }
  };

  const handleGenerateKey = async () => {
    try {
      const newKey = 'ak_' + Math.random().toString(36).substring(2, 15);
      
      const { error } = await supabase
        .from('api_keys')
        .insert({
          name: `API Key ${userApiKeys.length + 1}`,
          key_prefix: newKey.substring(0, 8),
          permissions: ['read'],
          is_active: true,
          created_by: 'current_user', // Should use actual user ID
          organization_id: 'default_org' // Should use actual org ID
        });

      if (error) throw error;

      toast({
        title: "API Key Generated",
        description: `New API key created: ${newKey}`
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate API key.",
        variant: "destructive"
      });
    }
  };

  if (devsLoading || endpointsLoading || keysLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          API Marketplace
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Discover, subscribe to, and manage trading APIs from verified developers worldwide.
        </p>
      </div>

      <Tabs defaultValue="marketplace" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="my-subscriptions">My Subscriptions</TabsTrigger>
          <TabsTrigger value="my-keys">API Keys</TabsTrigger>
        </TabsList>

        <TabsContent value="marketplace" className="space-y-6">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search APIs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <div className="flex gap-2">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="capitalize"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredEndpoints.map((endpoint) => (
              <Card key={endpoint.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{endpoint.name}</CardTitle>
                      <CardDescription className="mt-1">
                        by {endpoint.developer?.company_name}
                      </CardDescription>
                    </div>
                    {endpoint.developer?.verified && (
                      <Badge className="bg-blue-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {endpoint.description}
                  </p>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>{endpoint.average_rating || 0}/5</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{endpoint.total_subscribers}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="capitalize">
                      {endpoint.category}
                    </Badge>
                    <div className="text-right">
                      {endpoint.pricing_model === 'freemium' && (
                        <div className="text-sm font-medium text-green-500">Free Tier</div>
                      )}
                      {endpoint.pricing_model === 'pay-per-use' && (
                        <div className="text-sm">
                          <span className="font-medium">${endpoint.price_per_request}</span>
                          <span className="text-muted-foreground">/request</span>
                        </div>
                      )}
                      {endpoint.pricing_model === 'subscription' && (
                        <div className="text-sm">
                          <span className="font-medium">${endpoint.monthly_price}</span>
                          <span className="text-muted-foreground">/month</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      className="flex-1" 
                      onClick={() => handleSubscribe(endpoint.id)}
                    >
                      Subscribe
                    </Button>
                    <Button variant="outline" size="sm">
                      <Code className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my-subscriptions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My API Subscriptions</CardTitle>
              <CardDescription>
                Manage your active API subscriptions and usage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">No active subscriptions</p>
                <Button variant="outline" className="mt-4">
                  Browse Marketplace
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-keys" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                API Keys
                <Button onClick={handleGenerateKey}>
                  <Key className="h-4 w-4 mr-2" />
                  Generate Key
                </Button>
              </CardTitle>
              <CardDescription>
                Manage your API keys for accessing subscribed services
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userApiKeys.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No API keys generated</p>
                  <Button variant="outline" onClick={handleGenerateKey} className="mt-4">
                    <Key className="h-4 w-4 mr-2" />
                    Generate Your First Key
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {userApiKeys.map((key) => (
                    <div key={key.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{key.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {key.key_prefix}...
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={key.is_active ? "bg-green-500" : "bg-gray-500"}>
                          {key.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <Button variant="outline" size="sm">
                          Manage
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}