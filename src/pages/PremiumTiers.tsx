import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Check, Star, Zap, Crown, TrendingUp, Shield, Users } from "lucide-react"
import { SEOHead } from "@/components/seo/SEOHead"
import { useSubscription, type BillingPeriod, type SubscriptionTier } from "@/hooks/useSubscription"
import { toast } from "sonner"
import gradientBg from "@/assets/gradient-blur-enterprise.png"

const PremiumTiers = () => {
  const [isAnnual, setIsAnnual] = useState(false)
  const { currentTier, upgradeTo, isUpgrading, isLoading } = useSubscription()

  const handleUpgrade = (tierName: string) => {
    const tier = tierName.toLowerCase() as SubscriptionTier
    
    if (tier === 'elite') {
      toast.info('Elite tier is coming soon!')
      return
    }

    if (tier === 'basic') {
      upgradeTo({ tier: 'basic', billingPeriod: 'monthly' })
      return
    }

    const billingPeriod: BillingPeriod = isAnnual ? 'annual' : 'monthly'
    upgradeTo({ tier, billingPeriod })
  }

  const tiers = [
    {
      name: "Basic",
      icon: Star,
      description: "Perfect for getting started with AI trading",
      monthlyPrice: 0,
      annualPrice: 0,
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
      
      <div className="container mx-auto px-3 md:px-4 py-4 md:py-8">
        {/* Hero Section */}
        <div className="text-center mb-8 md:mb-12 space-y-4 md:space-y-6">
          <h1 className="text-2xl md:text-4xl font-bold text-foreground">
            Choose Your Trading Plan
          </h1>
          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlock the full potential of AI trading with our premium features and tools
          </p>
          
          {/* Billing Toggle */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
            <div className="flex items-center gap-3">
              <span className={`text-sm ${!isAnnual ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                Monthly
              </span>
              <Switch
                checked={isAnnual}
                onCheckedChange={setIsAnnual}
                className="data-[state=checked]:bg-primary"
              />
              <span className={`text-sm ${isAnnual ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                Annual
              </span>
            </div>
            {isAnnual && (
              <Badge variant="secondary" className="text-xs px-2 py-1">
                Save up to 20%
              </Badge>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-4 md:gap-6 lg:gap-8 md:grid-cols-3 mb-8 md:mb-12">
          {tiers.map((tier) => (
            <Card 
              key={tier.name} 
              className={`relative bg-card/80 backdrop-blur-sm border transition-all duration-300 hover:shadow-lg ${
                tier.popular 
                  ? 'ring-2 ring-primary/50 border-primary/30 shadow-lg' 
                  : 'border-border/50 hover:border-border'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-primary text-primary-foreground px-3 py-1 text-xs font-medium">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 mx-auto mb-3 bg-primary/10 rounded-lg flex items-center justify-center">
                  <tier.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl md:text-2xl text-foreground">{tier.name}</CardTitle>
                <CardDescription className="text-sm md:text-base">{tier.description}</CardDescription>
                
                <div className="mt-4">
                  <div className="text-3xl md:text-4xl font-bold text-foreground">
                    {getPrice(tier) === 0 ? (
                      'Free'
                    ) : (
                      <>
                        ${getPrice(tier).toLocaleString()}
                        <span className="text-sm md:text-lg font-normal text-muted-foreground">
                          /{isAnnual ? 'year' : 'month'}
                        </span>
                      </>
                    )}
                  </div>
                  {isAnnual && getPrice(tier) > 0 && (
                    <div className="text-xs md:text-sm text-green-500 font-medium mt-1">
                      Save {getSavings(tier)}% annually
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4 md:space-y-6">
                <div className="space-y-2 md:space-y-3">
                  {tier.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground/90">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <div className="pt-3 md:pt-4 border-t border-border/30">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Trading Agents:</span>
                      <span className="font-medium text-foreground">{tier.limits.agents}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Monthly Trades:</span>
                      <span className="font-medium text-foreground">{tier.limits.trades}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Support:</span>
                      <span className="font-medium text-foreground">{tier.limits.support}</span>
                    </div>
                  </div>
                </div>
                
                <Button 
                  className="w-full mt-4" 
                  variant="default"
                  size="lg"
                  disabled={
                    tier.name === "Elite" || 
                    isUpgrading || 
                    isLoading ||
                    currentTier === tier.name.toLowerCase()
                  }
                  onClick={() => handleUpgrade(tier.name)}
                >
                  {isLoading ? "Loading..." :
                   currentTier === tier.name.toLowerCase() ? "Current Plan" :
                   tier.name === "Basic" ? "Get Started Free" : 
                   tier.name === "Elite" ? "Coming Soon" : 
                   `Upgrade to ${tier.name}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Comparison Table */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader className="text-center pb-4 md:pb-6">
            <CardTitle className="text-xl md:text-2xl text-foreground">Feature Comparison</CardTitle>
            <CardDescription className="text-sm md:text-base">
              Compare all features across our premium tiers
            </CardDescription>
          </CardHeader>
          <CardContent className="px-3 md:px-6">
            {/* Mobile: Accordion style */}
            <div className="md:hidden space-y-4">
              {comparisonFeatures.map((category) => (
                <div key={category.category} className="border border-border/30 rounded-lg p-4">
                  <h3 className="font-semibold text-base mb-3 flex items-center gap-2 text-foreground">
                    {category.category === "Trading Features" && <TrendingUp className="h-4 w-4" />}
                    {category.category === "Analytics & Insights" && <Zap className="h-4 w-4" />}
                    {category.category === "Support & Services" && <Shield className="h-4 w-4" />}
                    {category.category}
                  </h3>
                  <div className="space-y-3">
                    {category.features.map((feature, index) => (
                      <div key={index} className="space-y-2">
                        <div className="font-medium text-sm text-foreground">{feature.name}</div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="text-center p-2 rounded bg-muted/50">
                            <div className="font-medium text-muted-foreground mb-1">Basic</div>
                            <div className="text-foreground">
                              {typeof feature.basic === 'boolean' ? (
                                feature.basic ? <Check className="h-3 w-3 text-primary mx-auto" /> : '—'
                              ) : (
                                feature.basic
                              )}
                            </div>
                          </div>
                          <div className="text-center p-2 rounded bg-primary/10">
                            <div className="font-medium text-muted-foreground mb-1">Pro</div>
                            <div className="text-foreground">
                              {typeof feature.pro === 'boolean' ? (
                                feature.pro ? <Check className="h-3 w-3 text-primary mx-auto" /> : '—'
                              ) : (
                                feature.pro
                              )}
                            </div>
                          </div>
                          <div className="text-center p-2 rounded bg-muted/50">
                            <div className="font-medium text-muted-foreground mb-1">Elite</div>
                            <div className="text-foreground">
                              {typeof feature.elite === 'boolean' ? (
                                feature.elite ? <Check className="h-3 w-3 text-primary mx-auto" /> : '—'
                              ) : (
                                feature.elite
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: Table style */}
            <div className="hidden md:block space-y-6 md:space-y-8">
              {/* Table Header */}
              <div className="grid grid-cols-4 gap-4 items-center py-3 border-b-2 border-border/50">
                <div className="font-semibold text-foreground">Features</div>
                <div className="text-center font-semibold text-foreground">Basic</div>
                <div className="text-center font-semibold text-primary">Pro</div>
                <div className="text-center font-semibold text-foreground">Elite</div>
              </div>

              {comparisonFeatures.map((category) => (
                <div key={category.category}>
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-foreground">
                    {category.category === "Trading Features" && <TrendingUp className="h-5 w-5" />}
                    {category.category === "Analytics & Insights" && <Zap className="h-5 w-5" />}
                    {category.category === "Support & Services" && <Shield className="h-5 w-5" />}
                    {category.category}
                  </h3>
                  
                  <div className="space-y-2">
                    {category.features.map((feature, index) => (
                      <div key={index} className="grid grid-cols-4 gap-4 items-center py-3 border-b border-border/20 hover:bg-muted/20 rounded-lg px-2">
                        <div className="font-medium text-sm text-foreground">{feature.name}</div>
                        <div className="text-center text-sm">
                          {typeof feature.basic === 'boolean' ? (
                            feature.basic ? <Check className="h-4 w-4 text-primary mx-auto" /> : <span className="text-muted-foreground">—</span>
                          ) : (
                            <span className="text-foreground">{feature.basic}</span>
                          )}
                        </div>
                        <div className="text-center text-sm">
                          {typeof feature.pro === 'boolean' ? (
                            feature.pro ? <Check className="h-4 w-4 text-primary mx-auto" /> : <span className="text-muted-foreground">—</span>
                          ) : (
                            <span className="text-foreground font-medium">{feature.pro}</span>
                          )}
                        </div>
                        <div className="text-center text-sm">
                          {typeof feature.elite === 'boolean' ? (
                            feature.elite ? <Check className="h-4 w-4 text-primary mx-auto" /> : <span className="text-muted-foreground">—</span>
                          ) : (
                            <span className="text-foreground">{feature.elite}</span>
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
        <Card className="mt-8 md:mt-12 relative overflow-hidden border-primary/30">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${gradientBg})` }}
          />
          <CardContent className="relative p-4 md:p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-foreground">
              Need Enterprise Solutions?
            </h3>
            <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6 max-w-2xl mx-auto leading-relaxed">
              Custom pricing and features for large organizations, institutions, and trading firms. 
              Get dedicated support, custom integrations, and enterprise-grade security.
            </p>
            <Button 
              size="default" 
              className="w-full sm:w-auto bg-[#5A8A9F] hover:bg-[#4A7A8F] text-white rounded-full px-8 py-2 text-sm font-medium border border-white/20"
            >
              Contact Sales
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

export default PremiumTiers