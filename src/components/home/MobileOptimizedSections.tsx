import { MetricCard } from "@/components/ui/metric-card"
import { CyberButton } from "@/components/ui/cyber-button"
import { EnhancedCard } from "@/components/ui/enhanced-card"
import { Bot, Brain, Shield, Zap, TrendingUp, BarChart3, ArrowRight, ChevronRight } from "lucide-react"
import { useDeviceDetection } from '@/hooks/useDeviceDetection'
import { cn } from "@/lib/utils"

interface MobileStatsProps {
  className?: string
}

export function MobileStats({ className }: MobileStatsProps) {
  const { isMobile } = useDeviceDetection()
  
  const stats = [
    { value: "1K+", label: "AI Agents", color: "text-primary" },
    { value: "94%", label: "Success Rate", color: "text-accent" },
    { value: "24/7", label: "Trading", color: "text-secondary" },
    { value: "<50ms", label: "Latency", color: "text-primary-glow" }
  ]

  if (isMobile) {
    return (
      <div className={cn("grid grid-cols-2 gap-3", className)}>
        {stats.map((stat, index) => (
          <EnhancedCard key={index} className="p-4 text-center">
            <div className={cn("text-2xl font-bold", stat.color)}>{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </EnhancedCard>
        ))}
      </div>
    )
  }

  return (
    <div className={cn("grid grid-cols-4 gap-6", className)}>
      {stats.map((stat, index) => (
        <EnhancedCard key={index} className="p-6 text-center">
          <div className={cn("text-3xl font-bold", stat.color)}>{stat.value}</div>
          <div className="text-sm text-muted-foreground">{stat.label}</div>
        </EnhancedCard>
      ))}
    </div>
  )
}

interface MobileFeaturesProps {
  className?: string
}

export function MobileFeatures({ className }: MobileFeaturesProps) {
  const { isMobile } = useDeviceDetection()
  
  const features = [
    {
      icon: <Bot className="h-5 w-5 text-primary" />,
      title: "AI Trading Bots",
      description: "Deploy intelligent bots that learn from market patterns",
      metric: "347% ROI"
    },
    {
      icon: <Brain className="h-5 w-5 text-secondary" />,
      title: "Smart Analytics",
      description: "Advanced ML algorithms analyze market indicators",
      metric: "0.03s execution"
    },
    {
      icon: <Shield className="h-5 w-5 text-accent" />,
      title: "Risk Management",
      description: "Built-in stop-loss and portfolio protection",
      metric: "99.9% secure"
    },
    {
      icon: <Zap className="h-5 w-5 text-primary" />,
      title: "Lightning Fast",
      description: "Sub-second execution with MEV protection",
      metric: "<50ms latency"
    }
  ]

  if (isMobile) {
    return (
      <div className={cn("space-y-4", className)}>
        {features.map((feature, index) => (
          <EnhancedCard key={index} className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                {feature.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm">{feature.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
                <div className="text-sm font-bold text-primary mt-1">{feature.metric}</div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </div>
          </EnhancedCard>
        ))}
      </div>
    )
  }

  return (
    <div className={cn("grid md:grid-cols-2 gap-6", className)}>
      {features.map((feature, index) => (
        <EnhancedCard key={index} className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              {feature.icon}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-lg">{feature.title}</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
              <div className="text-lg font-bold text-primary mt-2">{feature.metric}</div>
            </div>
          </div>
        </EnhancedCard>
      ))}
    </div>
  )
}

interface MobileCTAProps {
  className?: string
}

export function MobileCTA({ className }: MobileCTAProps) {
  const { isMobile } = useDeviceDetection()
  
  if (isMobile) {
    return (
      <div className={cn("space-y-4", className)}>
        <CyberButton variant="neon" size="lg" className="w-full group">
          <span>Launch Platform</span>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </CyberButton>
        
        <CyberButton variant="analytics" size="lg" className="w-full">
          <Bot className="h-4 w-4" />
          Deploy AI Agent
        </CyberButton>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col sm:flex-row gap-4 justify-center", className)}>
      <CyberButton variant="neon" size="xl" className="group">
        <span>Launch Platform</span>
        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
      </CyberButton>
      
      <CyberButton variant="analytics" size="xl" className="group">
        <Bot className="h-5 w-5" />
        Deploy AI Agent
      </CyberButton>
    </div>
  )
}

interface MobileMetricsProps {
  className?: string
}

export function MobileMetrics({ className }: MobileMetricsProps) {
  const { isMobile } = useDeviceDetection()
  
  const metrics = [
    { title: "Success Rate", value: "92.4%", subtitle: "+2.3% this month", trend: "up" as const },
    { title: "Active Bots", value: "1,247", subtitle: "24/7 trading", trend: "up" as const },
    { title: "TVL Managed", value: "$2.4M", subtitle: "+15% this week", trend: "up" as const },
    { title: "Users", value: "3,421", subtitle: "Growing fast", trend: "up" as const }
  ]

  if (isMobile) {
    return (
      <div className={cn("grid grid-cols-2 gap-3", className)}>
        {metrics.map((metric, index) => (
          <MetricCard
            key={index}
            title={metric.title}
            value={metric.value}
            subtitle={metric.subtitle}
            trend={metric.trend}
            variant="glow"
            size="sm"
          />
        ))}
      </div>
    )
  }

  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)}>
      {metrics.map((metric, index) => (
        <MetricCard
          key={index}
          title={metric.title}
          value={metric.value}
          subtitle={metric.subtitle}
          trend={metric.trend}
          variant="glow"
          size="default"
        />
      ))}
    </div>
  )
}