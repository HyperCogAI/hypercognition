import { Brain, TrendingUp, Shield, Zap, Users, DollarSign } from "lucide-react";
import { CyberButton } from "@/components/ui/cyber-button";
import { MetricCard } from "@/components/ui/metric-card";

const features = [
  {
    icon: Brain,
    title: "Autonomous AI Agents",
    description: "Deploy self-evolving trading agents that learn from market patterns and adapt strategies in real-time",
    metrics: { value: "98%", label: "Adaptation Rate" }
  },
  {
    icon: TrendingUp,
    title: "Reinforcement Learning",
    description: "Advanced RL algorithms that continuously optimize trading performance through market interaction",
    metrics: { value: "34%", label: "Avg. Returns" }
  },
  {
    icon: Shield,
    title: "Risk Management",
    description: "AI-powered risk assessment with dynamic position sizing and automated stop-loss mechanisms",
    metrics: { value: "99.7%", label: "Uptime" }
  },
  {
    icon: Zap,
    title: "Real-time Execution",
    description: "Lightning-fast order execution with minimal slippage across multiple DEX protocols",
    metrics: { value: "<2ms", label: "Latency" }
  },
  {
    icon: Users,
    title: "Agent Marketplace",
    description: "Discover, deploy, and monetize AI trading strategies in our decentralized marketplace",
    metrics: { value: "2.5K+", label: "Active Agents" }
  },
  {
    icon: DollarSign,
    title: "Yield Optimization",
    description: "Automated yield farming and liquidity mining with intelligent strategy switching",
    metrics: { value: "47%", label: "APY Average" }
  }
];

export const HyperFeatures = () => {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/20 to-background" />
      <div className="absolute inset-0 cyber-grid opacity-20" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/5 border border-primary/15 text-primary text-sm font-medium">
            🚀 Platform Features
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              HyperCognition
            </span>
            <br />
            AI Infrastructure
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            The most advanced AI-native DeFi platform, enabling autonomous trading agents 
            that evolve through continuous learning and market adaptation.
          </p>
        </div>

        {/* Featured AI Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20 items-center">
          <div className="space-y-6">
            <h3 className="text-2xl md:text-3xl font-bold text-white">
              Deploy Your First
              <span className="text-primary"> AI Agent</span>
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Create intelligent trading agents with customizable risk parameters, 
              strategy preferences, and learning objectives. Our platform handles 
              the complex AI infrastructure while you focus on results.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <MetricCard
                title="Learning Speed"
                value="24/7"
                subtitle="Continuous"
                variant="glow"
                size="sm"
              />
              <MetricCard
                title="Success Rate"
                value="94.2%"
                subtitle="Profitable"
                variant="accent"
                size="sm"
                trend="up"
              />
            </div>

            <div className="flex gap-4">
              <CyberButton variant="cyber" size="lg">
                Deploy Agent
              </CyberButton>
              <CyberButton variant="outline" size="lg">
                View Marketplace
              </CyberButton>
            </div>
          </div>

          <div className="relative">
            <div className="bg-gradient-to-br from-card/80 to-card-glow/50 backdrop-blur-sm rounded-2xl p-8 border border-border/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">HyperAgent Alpha</h4>
                  <p className="text-sm text-muted-foreground">Adaptive Trading AI</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                  <span className="text-sm text-muted-foreground">24h Performance</span>
                  <span className="text-accent font-medium">+12.4%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                  <span className="text-sm text-muted-foreground">Risk Score</span>
                  <span className="text-primary font-medium">Conservative</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                  <span className="text-sm text-muted-foreground">Active Strategies</span>
                  <span className="text-white font-medium">7</span>
                </div>
              </div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-accent/20 rounded-full blur-xl animate-pulse" />
            <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-primary/15 rounded-full blur-2xl animate-pulse" />
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative p-6 bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 hover:border-primary/30 transition-all duration-300 hover:bg-card/70"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 space-y-3">
                  <h3 className="font-semibold text-white group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                  <MetricCard
                    title={feature.metrics.label}
                    value={feature.metrics.value}
                    size="sm"
                    variant="default"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};