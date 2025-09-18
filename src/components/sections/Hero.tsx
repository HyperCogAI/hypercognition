import { CyberButton } from "@/components/ui/cyber-button"
import { ArrowRight, Bot, TrendingUp, Zap } from "lucide-react"
import heroImage from "@/assets/hero-bg.jpg"

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      
      {/* Animated Grid Overlay */}
      <div className="absolute inset-0 cyber-grid opacity-20" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary glow-primary">
            <Bot className="h-4 w-4" />
            AI-Powered Trading Revolution
          </div>
          
          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Next-Gen DEX
            <br />
            <span className="gradient-animated bg-clip-text text-transparent">
              AI Trading Bots
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Experience the future of decentralized trading with our intelligent AI bots. 
            Maximize profits, minimize risks, trade smarter.
          </p>
          
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto py-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-accent">$2.5B+</div>
              <div className="text-sm text-muted-foreground">Total Volume</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary">98.7%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-secondary">10K+</div>
              <div className="text-sm text-muted-foreground">Active Traders</div>
            </div>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <CyberButton variant="cyber" size="xl" className="group">
              Launch App
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </CyberButton>
            
            <CyberButton variant="neon" size="xl" className="group">
              <Zap className="h-5 w-5" />
              Create AI Bot
              <TrendingUp className="h-5 w-5 group-hover:scale-110 transition-transform" />
            </CyberButton>
          </div>
        </div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/20 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-secondary/20 rounded-full blur-xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-accent/20 rounded-full blur-xl animate-pulse delay-2000" />
    </section>
  )
}