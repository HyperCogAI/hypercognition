import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Check, Star, Zap, Crown, TrendingUp, Shield, Users } from "lucide-react"
import { SEOHead } from "@/components/seo/SEOHead"

const PremiumTiers = () => {
  const [isAnnual, setIsAnnual] = useState(false)

  const tiers = [
    {
      name: "Basic",
      icon: Star,
      description: "Perfect for getting started with AI trading",
      monthlyPrice: 29,
      annualPrice: 290,
      popular: false,
      features: [
        "Access to 3 AI trading agents",
        "Basic portfolio analytics",
        "Email support",
        "Mobile app access",
        "Standard market data",
        "Basic risk management tools"
      ],
      limits: {
        agents: "3 agents",
        trades: "50 trades/month",
        support: "Email only"
      }
    },
    {
      name: "Pro",
      icon: Zap,
      description: "Advanced tools for serious traders",
      monthlyPrice: 99,
      annualPrice: 990,
      popular: true,
      features: [
        "Access to 15 premium AI agents",
        "Advanced portfolio analytics",
        "Priority chat support",
        "Real-time market data",
        "Advanced risk management",
        "Custom trading strategies",
        "Performance tracking",
        "API access"
      ],
      limits: {
        agents: "15 agents",
        trades: "Unlimited",
        support: "Priority chat"
      }
    },
    {
      name: "Elite",
      icon: Crown,
      description: "Everything you need for professional trading",
      monthlyPrice: 299,
      annualPrice: 2990,
      popular: false,
      features: [
        "Access to ALL AI agents",
        "Institutional-grade analytics",
        "24/7 dedicated support",
        "Real-time market data + news",
        "Advanced risk management suite",
        "White-label solutions",
        "Custom AI agent development",
        "Direct market access",
        "Compliance tools",
        "Multi-exchange integration"
      ],
      limits: {
        agents: "Unlimited",
        trades: "Unlimited",
        support: "24/7 dedicated"
      }
    }
  ]

  const comparisonFeatures = [
    {
      category: "Trading Features",
      features: [
        { name: "AI Trading Agents", basic: "3", pro: "15", elite: "Unlimited" },
        { name: "Monthly Trades", basic: "50", pro: "Unlimited", elite: "Unlimited" },
        { name: "Real-time Data", basic: "Basic", pro: "Advanced", elite: "Premium" },
        { name: "Custom Strategies", basic: false, pro: true, elite: true },
        { name: "API Access", basic: false, pro: true, elite: true }
      ]
    },
    {
      category: "Analytics & Insights",
      features: [
        { name: "Portfolio Analytics", basic: "Basic", pro: "Advanced", elite: "Institutional" },
        { name: "Performance Tracking", basic: false, pro: true, elite: true },
        { name: "Risk Assessment", basic: "Basic", pro: "Advanced", elite: "Professional" },
        { name: "Market News Integration", basic: false, pro: true, elite: true },
        { name: "Predictive Analytics", basic: false, pro: false, elite: true }
      ]
    },
    {
      category: "Support & Services",
      features: [
        { name: "Support Level", basic: "Email", pro: "Priority Chat", elite: "24/7 Dedicated" },
        { name: "Response Time", basic: "24-48h", pro: "4-8h", elite: "< 1h" },
        { name: "Account Manager", basic: false, pro: false, elite: true },
        { name: "Custom Training", basic: false, pro: false, elite: true }
      ]
    }
  ]

  const getPrice = (tier: typeof tiers[0]) => {
    return isAnnual ? tier.annualPrice : tier.monthlyPrice
  }

  const getSavings = (tier: typeof tiers[0]) => {
    const monthlyCost = tier.monthlyPrice * 12
    const savings = monthlyCost - tier.annualPrice
    return Math.round((savings / monthlyCost) * 100)
  }

  return (
    <>
      <SEOHead
        title="Premium Plans - Unlock Advanced AI Trading"
        description="Choose the perfect plan for your AI trading journey. From basic to elite tiers with advanced features, analytics, and support."
        keywords="trading plans, premium features, AI trading subscription, pro trading tools, elite trading"
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-4">
            Choose Your Trading Plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Unlock the full potential of AI trading with our premium features and tools
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-sm ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-primary"
            />
            <span className={`text-sm ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
              Annual
            </span>
            {isAnnual && (
              <Badge variant="secondary" className="ml-2">
                Save up to 20%
              </Badge>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-8 md:grid-cols-3 mb-12">
          {tiers.map((tier) => (
            <Card 
              key={tier.name} 
              className={`relative bg-card/50 backdrop-blur-sm border-border/50 ${
                tier.popular ? 'ring-2 ring-primary' : ''
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-lg flex items-center justify-center">
                  <tier.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
                
                <div className="mt-4">
                  <div className="text-4xl font-bold">
                    ${getPrice(tier)}
                    <span className="text-lg font-normal text-muted-foreground">
                      /{isAnnual ? 'year' : 'month'}
                    </span>
                  </div>
                  {isAnnual && (
                    <div className="text-sm text-green-600">
                      Save {getSavings(tier)}% annually
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {tier.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <div className="pt-4 border-t border-border/50">
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Trading Agents:</span>
                      <span className="font-medium">{tier.limits.agents}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly Trades:</span>
                      <span className="font-medium">{tier.limits.trades}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Support:</span>
                      <span className="font-medium">{tier.limits.support}</span>
                    </div>
                  </div>
                </div>
                
                <Button 
                  className="w-full" 
                  variant={tier.popular ? "default" : "outline"}
                  size="lg"
                >
                  {tier.name === "Basic" ? "Start Free Trial" : `Upgrade to ${tier.name}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Comparison Table */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Feature Comparison</CardTitle>
            <CardDescription className="text-center">
              Compare all features across our premium tiers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {comparisonFeatures.map((category) => (
                <div key={category.category}>
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    {category.category === "Trading Features" && <TrendingUp className="h-5 w-5" />}
                    {category.category === "Analytics & Insights" && <Zap className="h-5 w-5" />}
                    {category.category === "Support & Services" && <Shield className="h-5 w-5" />}
                    {category.category}
                  </h3>
                  
                  <div className="space-y-3">
                    {category.features.map((feature, index) => (
                      <div key={index} className="grid grid-cols-4 gap-4 items-center py-2 border-b border-border/30">
                        <div className="font-medium">{feature.name}</div>
                        <div className="text-center">
                          {typeof feature.basic === 'boolean' ? (
                            feature.basic ? <Check className="h-4 w-4 text-primary mx-auto" /> : '—'
                          ) : (
                            feature.basic
                          )}
                        </div>
                        <div className="text-center">
                          {typeof feature.pro === 'boolean' ? (
                            feature.pro ? <Check className="h-4 w-4 text-primary mx-auto" /> : '—'
                          ) : (
                            feature.pro
                          )}
                        </div>
                        <div className="text-center">
                          {typeof feature.elite === 'boolean' ? (
                            feature.elite ? <Check className="h-4 w-4 text-primary mx-auto" /> : '—'
                          ) : (
                            feature.elite
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Enterprise CTA */}
        <Card className="mt-12 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="text-2xl font-bold mb-4">Need Enterprise Solutions?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Custom pricing and features for large organizations, institutions, and trading firms. 
              Get dedicated support, custom integrations, and enterprise-grade security.
            </p>
            <Button size="lg" variant="outline">
              Contact Sales
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

export default PremiumTiers