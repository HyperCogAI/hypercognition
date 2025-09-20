import { MetricCard } from "@/components/ui/metric-card"
import { CyberButton } from "@/components/ui/cyber-button"
import { Bot, Brain, Shield, Zap, TrendingUp, BarChart3, ArrowRight } from "lucide-react"
import aiBotIcon from "@/assets/ai-bot-icon.png"

export function Features() {
  const features = [
    {
      icon: <Bot className="h-6 w-6 text-primary" />,
      title: "AI Trading Bots",
      description: "Deploy intelligent bots that learn from market patterns and execute optimal trades 24/7",
      metrics: { value: "347%", label: "Avg ROI" }
    },
    {
      icon: <Brain className="h-6 w-6 text-secondary" />,
      title: "Smart Analytics",
      description: "Advanced ML algorithms analyze thousands of market indicators in real-time",
      metrics: { value: "0.03s", label: "Execution Time" }
    },
    {
      icon: <Shield className="h-6 w-6 text-accent" />,
      title: "Risk Management",
      description: "Built-in stop-loss, take-profit, and portfolio diversification strategies",
      metrics: { value: "99.9%", label: "Security Score" }
    },
    {
      icon: <Zap className="h-6 w-6 text-primary" />,
      title: "Lightning Fast",
      description: "Sub-second trade execution with MEV protection and gas optimization",
      metrics: { value: "<50ms", label: "Latency" }
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-accent" />,
      title: "Profit Optimization",
      description: "Dynamic strategy adjustment based on market conditions and volatility",
      metrics: { value: "89%", label: "Win Rate" }
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-secondary" />,
      title: "Real-time Data",
      description: "Multi-exchange aggregation with live price feeds and order book depth",
      metrics: { value: "50+", label: "Data Sources" }
    }
  ]

  return (
    <section className="py-24 relative">
      {/* Background Elements */}
      <div className="absolute inset-0 cyber-grid opacity-5" />
      
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Powered by Advanced AI
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Our cutting-edge technology combines DeFi innovation with artificial intelligence 
            to deliver unprecedented trading performance
          </p>
        </div>

        {/* AI Bot Showcase */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="space-y-6 animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/10 px-4 py-2 text-sm font-medium text-secondary">
              <Brain className="h-4 w-4" />
              Neural Network Architecture
            </div>
            
            <h3 className="text-3xl md:text-4xl font-bold">
              Meet Your AI Trading Assistant
            </h3>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              Our AI bots use advanced machine learning models trained on millions of trading patterns. 
              They adapt to market conditions, manage risk automatically, and execute trades with 
              superhuman precision and speed.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <MetricCard
                title="Success Rate"
                value="92.4%"
                subtitle="+2.3% this month"
                trend="up"
                variant="glow"
                size="sm"
              />
              <MetricCard
                title="Active Bots"
                value="1,247"
                subtitle="24/7 trading"
                trend="up"
                variant="accent"
                size="sm"
              />
            </div>
            
            <CyberButton variant="ai" size="lg" className="group">
              <Bot className="h-5 w-5" />
              Deploy Your Bot
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </CyberButton>
          </div>
          
          <div className="relative flex justify-center animate-scale-in">
            <div className="relative">
              <img 
                src={aiBotIcon} 
                alt="AI Trading Bot"
                className="w-80 h-80 object-contain float"
              />
              
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-up">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group p-6 rounded-xl border border-border bg-card hover:border-primary/20 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  {feature.icon}
                </div>
                <div className="flex-1 space-y-2">
                  <h4 className="font-semibold text-lg">{feature.title}</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="pt-2">
                    <div className="text-2xl font-bold text-primary">{feature.metrics.value}</div>
                    <div className="text-xs text-muted-foreground">{feature.metrics.label}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}