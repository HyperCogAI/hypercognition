import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Palette, Settings, Users, Code, Briefcase, Crown, Upload, Download } from "lucide-react"
import { SEOHead } from "@/components/seo/SEOHead"

const WhiteLabel = () => {
  const [brandingSettings, setBrandingSettings] = useState({
    companyName: "YourTradingFirm",
    primaryColor: "#3b82f6",
    secondaryColor: "#1e40af",
    logoUrl: "",
    favicon: "",
    customDomain: "",
    emailFromName: "",
    supportEmail: ""
  })

  const [features, setFeatures] = useState({
    customBranding: true,
    apiAccess: true,
    whitelistedDomains: true,
    customEmailTemplates: true,
    advancedReporting: false,
    prioritySupport: true
  })

  const partnerTiers = [
    {
      name: "Starter",
      price: "$2,999/month",
      features: [
        "Basic white-label branding",
        "Custom domain support",
        "API access (500 calls/day)",
        "Email support",
        "Up to 1,000 users"
      ],
      limitations: [
        "HyperCognition branding in footer",
        "Limited customization options"
      ]
    },
    {
      name: "Professional",
      price: "$7,999/month",
      popular: true,
      features: [
        "Full white-label solution",
        "Complete brand customization",
        "API access (10,000 calls/day)",
        "Priority support",
        "Up to 10,000 users",
        "Custom email templates",
        "Advanced analytics"
      ],
      limitations: []
    },
    {
      name: "Enterprise",
      price: "Custom pricing",
      features: [
        "Unlimited white-label features",
        "Dedicated infrastructure",
        "Unlimited API calls",
        "24/7 dedicated support",
        "Unlimited users",
        "Custom integrations",
        "SLA guarantees",
        "On-premise deployment option"
      ],
      limitations: []
    }
  ]

  const integrationOptions = [
    {
      name: "REST API",
      description: "Complete REST API for all platform features",
      documentation: "/docs/api/rest",
      status: "Available"
    },
    {
      name: "WebSocket API",
      description: "Real-time data streaming and trading",
      documentation: "/docs/api/websocket", 
      status: "Available"
    },
    {
      name: "React SDK",
      description: "Pre-built React components and hooks",
      documentation: "/docs/sdk/react",
      status: "Available"
    },
    {
      name: "Mobile SDK",
      description: "iOS and Android native SDKs",
      documentation: "/docs/sdk/mobile",
      status: "Coming Soon"
    }
  ]

  const updateBrandingSetting = (key: string, value: string | boolean) => {
    setBrandingSettings(prev => ({ ...prev, [key]: value }))
  }

  const toggleFeature = (feature: string) => {
    setFeatures(prev => ({ ...prev, [feature]: !prev[feature] }))
  }

  return (
    <>
      <SEOHead
        title="White-Label Solutions - Partner with HyperCognition"
        description="Launch your own AI trading platform with our comprehensive white-label solution. Full customization, API access, and enterprise support."
        keywords="white-label trading, partner solutions, custom branding, trading platform API, enterprise solutions"
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-4">
            White-Label Solutions
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Launch your own AI trading platform with our comprehensive white-label solution
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="integration">Integration</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-6 text-center">
                  <Palette className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="font-semibold text-lg mb-2">Complete Customization</h3>
                  <p className="text-sm text-muted-foreground">
                    Brand the entire platform with your colors, logo, and custom domain
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-6 text-center">
                  <Code className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="font-semibold text-lg mb-2">Full API Access</h3>
                  <p className="text-sm text-muted-foreground">
                    Complete REST and WebSocket APIs for seamless integration
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-6 text-center">
                  <Crown className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="font-semibold text-lg mb-2">Enterprise Support</h3>
                  <p className="text-sm text-muted-foreground">
                    Dedicated support team and custom SLA agreements
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Why Choose Our White-Label Solution?</CardTitle>
                <CardDescription>
                  Everything you need to launch your own AI trading platform
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium">Rapid Deployment</h4>
                      <p className="text-sm text-muted-foreground">Launch in 30 days with our proven platform</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium">Regulatory Compliance</h4>
                      <p className="text-sm text-muted-foreground">Built-in compliance tools for global markets</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium">Scalable Infrastructure</h4>
                      <p className="text-sm text-muted-foreground">Handle millions of users with enterprise-grade architecture</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium">Revenue Sharing</h4>
                      <p className="text-sm text-muted-foreground">Flexible revenue models to maximize your profits</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium">Continuous Updates</h4>
                      <p className="text-sm text-muted-foreground">Regular feature updates and security patches</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium">Training & Support</h4>
                      <p className="text-sm text-muted-foreground">Comprehensive training for your team</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="branding" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle>Brand Customization</CardTitle>
                  <CardDescription>
                    Configure your platform's visual identity
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input
                      id="company-name"
                      value={brandingSettings.companyName}
                      onChange={(e) => updateBrandingSetting('companyName', e.target.value)}
                      placeholder="Your Trading Firm"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Primary Color</Label>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-10 h-10 rounded border cursor-pointer"
                          style={{ backgroundColor: brandingSettings.primaryColor }}
                        />
                        <Input
                          value={brandingSettings.primaryColor}
                          onChange={(e) => updateBrandingSetting('primaryColor', e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Secondary Color</Label>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-10 h-10 rounded border cursor-pointer"
                          style={{ backgroundColor: brandingSettings.secondaryColor }}
                        />
                        <Input
                          value={brandingSettings.secondaryColor}
                          onChange={(e) => updateBrandingSetting('secondaryColor', e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Logo Upload</Label>
                    <div className="flex items-center gap-4">
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Logo
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Recommended: 200x60px, PNG format
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="custom-domain">Custom Domain</Label>
                    <Input
                      id="custom-domain"
                      value={brandingSettings.customDomain}
                      onChange={(e) => updateBrandingSetting('customDomain', e.target.value)}
                      placeholder="trading.yourcompany.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="support-email">Support Email</Label>
                    <Input
                      id="support-email"
                      type="email"
                      value={brandingSettings.supportEmail}
                      onChange={(e) => updateBrandingSetting('supportEmail', e.target.value)}
                      placeholder="support@yourcompany.com"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle>Live Preview</CardTitle>
                  <CardDescription>
                    See how your branding will look
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg p-4 bg-background">
                    <div 
                      className="p-4 rounded-t-lg text-white"
                      style={{ backgroundColor: brandingSettings.primaryColor }}
                    >
                      <h3 className="font-bold text-lg">{brandingSettings.companyName}</h3>
                      <p className="text-sm opacity-90">AI Trading Platform</p>
                    </div>
                    <div className="p-4 border-l-4" style={{ borderColor: brandingSettings.secondaryColor }}>
                      <h4 className="font-medium">Welcome to your trading platform</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Start trading with AI-powered insights
                      </p>
                      <Button 
                        className="mt-3" 
                        style={{ backgroundColor: brandingSettings.secondaryColor }}
                      >
                        Get Started
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Available Features</CardTitle>
                <CardDescription>
                  Enable or disable platform features for your white-label solution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  {Object.entries(features).map(([key, enabled]) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div>
                        <h4 className="font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {key === 'customBranding' && 'Full brand customization capabilities'}
                          {key === 'apiAccess' && 'REST and WebSocket API access'}
                          {key === 'whitelistedDomains' && 'Domain restriction controls'}
                          {key === 'customEmailTemplates' && 'Branded email communications'}
                          {key === 'advancedReporting' && 'Enhanced analytics and reporting'}
                          {key === 'prioritySupport' && 'Dedicated customer support'}
                        </p>
                      </div>
                      <Switch
                        checked={enabled}
                        onCheckedChange={() => toggleFeature(key)}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integration" className="space-y-6">
            <div className="grid gap-6">
              {integrationOptions.map((option, index) => (
                <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{option.name}</h3>
                          <Badge variant={option.status === 'Available' ? 'default' : 'secondary'}>
                            {option.status}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground">{option.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Documentation
                        </Button>
                        {option.status === 'Available' && (
                          <Button size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Integration Support</CardTitle>
                <CardDescription>
                  Our team will help you integrate our platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4">
                    <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h4 className="font-medium">Dedicated Team</h4>
                    <p className="text-sm text-muted-foreground">Assigned integration specialists</p>
                  </div>
                  <div className="text-center p-4">
                    <Settings className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h4 className="font-medium">Custom Setup</h4>
                    <p className="text-sm text-muted-foreground">Tailored configuration assistance</p>
                  </div>
                  <div className="text-center p-4">
                    <Briefcase className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h4 className="font-medium">Training</h4>
                    <p className="text-sm text-muted-foreground">Comprehensive team training</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <div className="grid gap-8 lg:grid-cols-3">
              {partnerTiers.map((tier, index) => (
                <Card 
                  key={index} 
                  className={`bg-card/50 backdrop-blur-sm border-border/50 relative ${
                    tier.popular ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary/60 border border-white text-primary-foreground">Most Popular</Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">{tier.name}</CardTitle>
                    <div className="text-3xl font-bold">{tier.price}</div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <h4 className="font-medium">Features Included:</h4>
                      {tier.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    {tier.limitations.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-medium">Limitations:</h4>
                        {tier.limitations.map((limitation, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full" />
                            <span className="text-sm text-muted-foreground">{limitation}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <Button className="w-full" variant={tier.popular ? "default" : "outline"}>
                      {tier.name === "Enterprise" ? "Contact Sales" : "Get Started"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card 
              className="relative overflow-hidden border-primary/20"
              style={{
                backgroundImage: "url('/src/assets/gradient_blur_mid_blue.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat"
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background/80" />
              <CardContent className="relative z-10 p-8 text-center">
                <h3 className="text-2xl font-bold mb-4 text-foreground">Ready to Get Started?</h3>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Contact our partnership team to discuss your requirements and get a custom quote
                  for your white-label trading platform.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button size="lg">
                    Schedule Demo
                  </Button>
                  <Button size="lg" variant="outline">
                    Contact Sales
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}

export default WhiteLabel