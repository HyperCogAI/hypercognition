import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Building2, Shield, Zap, Globe, Key, Code, BarChart3, Users, Clock, CheckCircle, AlertTriangle } from "lucide-react"
import { SEOHead } from "@/components/seo/SEOHead"

const InstitutionalAPIs = () => {
  const [selectedPlan, setSelectedPlan] = useState("enterprise")
  const [apiKeyName, setApiKeyName] = useState("")

  const plans = [
    {
      id: "institutional",
      name: "Institutional",
      price: "$15,000/month",
      description: "For hedge funds and institutional traders",
      features: [
        "Unlimited API calls",
        "Real-time market data",
        "Advanced order types",
        "Priority execution",
        "Dedicated support team",
        "Custom SLA (99.99% uptime)"
      ],
      limits: {
        calls: "Unlimited",
        data: "Real-time + Historical",
        support: "24/7 Phone + Dedicated AM"
      }
    },
    {
      id: "enterprise", 
      name: "Enterprise",
      price: "$50,000/month",
      description: "For large trading firms and prime brokers",
      popular: true,
      features: [
        "White-glove API integration",
        "Co-location support",
        "Direct market access",
        "Custom algorithm deployment",
        "Regulatory compliance tools",
        "Multi-exchange routing",
        "Risk management APIs",
        "Custom reporting"
      ],
      limits: {
        calls: "Unlimited",
        data: "Ultra-low latency feeds",
        support: "Dedicated engineering team"
      }
    },
    {
      id: "prime",
      name: "Prime",
      price: "Custom",
      description: "For banks and prime brokerage services",
      features: [
        "Everything in Enterprise",
        "Prime brokerage integration",
        "Multi-entity support",
        "Global regulatory compliance",
        "Custom infrastructure",
        "Dedicated cloud environment",
        "Advanced risk controls",
        "Institutional-grade security"
      ],
      limits: {
        calls: "Unlimited",
        data: "Premium market data",
        support: "White-glove service"
      }
    }
  ]

  const apiEndpoints = [
    {
      category: "Trading",
      endpoints: [
        { method: "POST", path: "/api/v1/orders", description: "Place trading orders", rateLimit: "1000/min" },
        { method: "GET", path: "/api/v1/orders", description: "Get order history", rateLimit: "2000/min" },
        { method: "DELETE", path: "/api/v1/orders/{id}", description: "Cancel order", rateLimit: "500/min" },
        { method: "POST", path: "/api/v1/orders/bulk", description: "Bulk order operations", rateLimit: "100/min" }
      ]
    },
    {
      category: "Market Data",
      endpoints: [
        { method: "GET", path: "/api/v1/market/ticker", description: "Real-time prices", rateLimit: "10000/min" },
        { method: "GET", path: "/api/v1/market/orderbook", description: "Order book data", rateLimit: "5000/min" },
        { method: "GET", path: "/api/v1/market/trades", description: "Recent trades", rateLimit: "3000/min" },
        { method: "GET", path: "/api/v1/market/candles", description: "OHLCV data", rateLimit: "2000/min" }
      ]
    },
    {
      category: "Portfolio", 
      endpoints: [
        { method: "GET", path: "/api/v1/portfolio/positions", description: "Current positions", rateLimit: "1000/min" },
        { method: "GET", path: "/api/v1/portfolio/performance", description: "Performance metrics", rateLimit: "500/min" },
        { method: "GET", path: "/api/v1/portfolio/risk", description: "Risk analytics", rateLimit: "300/min" }
      ]
    },
    {
      category: "AI Insights",
      endpoints: [
        { method: "GET", path: "/api/v1/ai/predictions", description: "ML predictions", rateLimit: "100/min" },
        { method: "GET", path: "/api/v1/ai/sentiment", description: "Market sentiment", rateLimit: "200/min" },
        { method: "POST", path: "/api/v1/ai/analyze", description: "Custom analysis", rateLimit: "50/min" }
      ]
    }
  ]

  const features = [
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-grade security with SOC 2 Type II compliance and end-to-end encryption"
    },
    {
      icon: Zap,
      title: "Ultra-Low Latency",
      description: "Sub-millisecond response times with co-location and direct market access"
    },
    {
      icon: Globe,
      title: "Global Coverage",
      description: "Access to 150+ exchanges worldwide with local regulatory compliance"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Real-time risk analytics, performance attribution, and compliance reporting"
    },
    {
      icon: Users,
      title: "Dedicated Support", 
      description: "24/7 support with dedicated technical account managers"
    },
    {
      icon: Code,
      title: "Custom Integration",
      description: "Bespoke API development and integration support for complex requirements"
    }
  ]

  const sla = [
    { metric: "API Uptime", guarantee: "99.99%", actual: "99.997%" },
    { metric: "Response Time", guarantee: "< 100ms", actual: "< 50ms" },
    { metric: "Support Response", guarantee: "< 15min", actual: "< 5min" },
    { metric: "Data Accuracy", guarantee: "99.9%", actual: "99.95%" }
  ]

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
      case 'POST': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
      case 'DELETE': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
      case 'PUT': return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  return (
    <>
      <SEOHead
        title="Institutional APIs - Enterprise Trading Solutions"
        description="Enterprise-grade APIs for institutional traders, hedge funds, and financial institutions. Ultra-low latency, advanced security, and dedicated support."
        keywords="institutional APIs, enterprise trading, hedge fund APIs, institutional trading, financial APIs, prime brokerage"
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-4">
            Institutional APIs
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Enterprise-grade trading APIs designed for institutional clients, hedge funds, and financial institutions
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-6 text-center">
                <feature.icon className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="pricing" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="endpoints">API Reference</TabsTrigger>
            <TabsTrigger value="authentication">Authentication</TabsTrigger>
            <TabsTrigger value="sla">SLA</TabsTrigger>
            <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
          </TabsList>

          <TabsContent value="pricing" className="space-y-6">
            <div className="grid gap-8 lg:grid-cols-3">
              {plans.map((plan) => (
                <Card 
                  key={plan.id}
                  className={`bg-card/50 backdrop-blur-sm border-border/50 relative ${
                    plan.popular ? 'ring-2 ring-primary scale-105' : ''
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center">
                    <Building2 className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <div className="text-3xl font-bold">{plan.price}</div>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="pt-4 border-t border-border/50">
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex justify-between">
                          <span>API Calls:</span>
                          <span className="font-medium">{plan.limits.calls}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Market Data:</span>
                          <span className="font-medium">{plan.limits.data}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Support:</span>
                          <span className="font-medium">{plan.limits.support}</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full" 
                      variant={plan.popular ? "default" : "outline"}
                      size="lg"
                    >
                      Contact Sales
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="endpoints" className="space-y-6">
            <div className="space-y-8">
              {apiEndpoints.map((category, index) => (
                <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle>{category.category} APIs</CardTitle>
                    <CardDescription>
                      {category.category} related endpoints for institutional access
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {category.endpoints.map((endpoint, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-4">
                            <Badge className={getMethodColor(endpoint.method)}>
                              {endpoint.method}
                            </Badge>
                            <div>
                              <code className="text-sm font-mono">{endpoint.path}</code>
                              <p className="text-xs text-muted-foreground mt-1">{endpoint.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{endpoint.rateLimit}</div>
                            <div className="text-xs text-muted-foreground">Rate Limit</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="authentication" className="space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>API Key Management</CardTitle>
                <CardDescription>
                  Generate and manage your institutional API keys
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="api-key-name">API Key Name</Label>
                    <Input
                      id="api-key-name"
                      value={apiKeyName}
                      onChange={(e) => setApiKeyName(e.target.value)}
                      placeholder="Production Trading API"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Permissions</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select permissions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="read">Read Only</SelectItem>
                        <SelectItem value="trade">Trading</SelectItem>
                        <SelectItem value="full">Full Access</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="ip-whitelist" />
                    <Label htmlFor="ip-whitelist">Enable IP Whitelisting</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="rate-limiting" defaultChecked />
                    <Label htmlFor="rate-limiting">Rate Limiting</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="webhook-support" />
                    <Label htmlFor="webhook-support">Webhook Notifications</Label>
                  </div>
                </div>

                <Button className="w-full">
                  <Key className="h-4 w-4 mr-2" />
                  Generate API Key
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Authentication Methods</CardTitle>
                <CardDescription>
                  Multiple authentication options for different use cases
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-medium mb-2">API Key Authentication</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Standard API key authentication for most use cases
                    </p>
                    <code className="text-xs bg-background p-2 rounded block">
                      Authorization: Bearer your_api_key_here
                    </code>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-medium mb-2">OAuth 2.0</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Secure OAuth flow for third-party integrations
                    </p>
                    <Badge variant="secondary">Coming Soon</Badge>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-medium mb-2">mTLS</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Mutual TLS for maximum security requirements
                    </p>
                    <Badge>Enterprise Only</Badge>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-medium mb-2">HMAC Signing</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Request signing for enhanced security
                    </p>
                    <Badge>Available</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sla" className="space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Service Level Agreement</CardTitle>
                <CardDescription>
                  Our commitment to institutional-grade performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    {sla.map((metric, index) => (
                      <div key={index} className="flex justify-between items-center p-4 bg-muted/30 rounded-lg">
                        <div>
                          <div className="font-medium">{metric.metric}</div>
                          <div className="text-sm text-muted-foreground">Guaranteed: {metric.guarantee}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-500">{metric.actual}</div>
                          <div className="text-xs text-muted-foreground">Current</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-card/50 border border-border/50 rounded-lg">
                      <h4 className="font-medium text-foreground mb-2">
                        SLA Credits
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Automatic service credits when SLA targets are not met
                      </p>
                    </div>
                    
                    <div className="p-4 bg-card/50 border border-border/50 rounded-lg">
                      <h4 className="font-medium text-foreground mb-2">
                        99.99% Uptime
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Maximum 4.38 minutes downtime per month
                      </p>
                    </div>
                    
                    <div className="p-4 bg-card/50 border border-border/50 rounded-lg">
                      <h4 className="font-medium text-foreground mb-2">
                        Incident Response
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        24/7 monitoring with immediate incident response
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="onboarding" className="space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Get Started</CardTitle>
                <CardDescription>
                  Begin your institutional API integration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <h4 className="font-medium">Contact Information</h4>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company Name</Label>
                      <Input id="company" placeholder="Your Institution" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-name">Contact Name</Label>
                      <Input id="contact-name" placeholder="John Doe" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="john@institution.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" placeholder="+1 (555) 123-4567" />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Requirements</h4>
                    <div className="space-y-2">
                      <Label htmlFor="plan">Preferred Plan</Label>
                      <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="institutional">Institutional</SelectItem>
                          <SelectItem value="enterprise">Enterprise</SelectItem>
                          <SelectItem value="prime">Prime</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="volume">Expected Monthly Volume</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select volume range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-10m">$1M - $10M</SelectItem>
                          <SelectItem value="10-100m">$10M - $100M</SelectItem>
                          <SelectItem value="100m+">$100M+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timeline">Implementation Timeline</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select timeline" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30-days">30 days</SelectItem>
                          <SelectItem value="60-days">60 days</SelectItem>
                          <SelectItem value="90-days">90+ days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="requirements">Additional Requirements</Label>
                  <Textarea
                    id="requirements"
                    placeholder="Describe any specific integration requirements, compliance needs, or custom features..."
                    className="min-h-[100px]"
                  />
                </div>
                
                <div className="flex gap-4">
                  <Button className="flex-1">
                    Submit Request
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Schedule Call
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-3">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-6 text-center">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h4 className="font-medium">Fast Onboarding</h4>
                  <p className="text-sm text-muted-foreground">30-day implementation</p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-6 text-center">
                  <Shield className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h4 className="font-medium">Compliance Ready</h4>
                  <p className="text-sm text-muted-foreground">SOC 2 & regulatory compliance</p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h4 className="font-medium">Dedicated Support</h4>
                  <p className="text-sm text-muted-foreground">24/7 institutional support</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}

export default InstitutionalAPIs