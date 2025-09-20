import { TrendingUp, Users, DollarSign, Brain } from "lucide-react"

const stats = [
  {
    icon: DollarSign,
    value: "$850M+",
    label: "Total Value Locked",
    description: "Actively managed by AI agents",
    color: "text-primary"
  },
  {
    icon: Brain,
    value: "1M+",
    label: "AI Agents Deployed",
    description: "Autonomous trading strategies",
    color: "text-accent"
  },
  {
    icon: TrendingUp,
    value: "94.2%",
    label: "Success Rate",
    description: "Profitable trading sessions",
    color: "text-secondary"
  },
  {
    icon: Users,
    value: "50K+",
    label: "Active Traders",
    description: "Growing community",
    color: "text-primary-glow"
  }
]

export const Stats = () => {
  return (
    <section className="py-16 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background to-card/20" />
      <div className="absolute inset-0 cyber-grid opacity-10" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
            Powering the Future of
            <span className="text-primary"> DeFi</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join thousands of traders leveraging AI to achieve consistent returns 
            in the decentralized finance ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group relative p-6 bg-card/40 backdrop-blur-sm rounded-xl border border-border/50 hover:border-primary/30 transition-all duration-300 hover:bg-card/60"
            >
              <div className="text-center space-y-4">
                <div className="w-12 h-12 mx-auto rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                
                <div className="space-y-2">
                  <div className={`text-3xl md:text-4xl font-bold ${stat.color}`}>
                    {stat.value}
                  </div>
                  <div className="font-semibold text-white">
                    {stat.label}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.description}
                  </div>
                </div>
              </div>
              
              {/* Glow effect on hover */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}