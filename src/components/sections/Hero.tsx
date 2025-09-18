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
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-2 text-sm font-medium text-primary backdrop-blur-sm">
            <Bot className="h-4 w-4" />
            🧠 HyperCognition AI
          </div>
          
          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-white">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              AI-Native DeFi
            </span>
            <br />
            <span className="text-white/90">Ecosystem</span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Deploy autonomous trading agents that continuously evolve through reinforcement learning.
            Build, customize, and monetize AI-powered trading strategies in the first truly intelligent DeFi platform.
          </p>
          
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto py-8">
            <div className="text-center p-4 rounded-lg bg-card/30 border border-border/50 backdrop-blur-sm">
              <div className="text-3xl md:text-4xl font-bold text-primary">1M+</div>
              <div className="text-sm text-muted-foreground">AI Agents Deployed</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-card/30 border border-border/50 backdrop-blur-sm">
              <div className="text-3xl md:text-4xl font-bold text-accent">$850M</div>
              <div className="text-sm text-muted-foreground">TVL Managed</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-card/30 border border-border/50 backdrop-blur-sm">
              <div className="text-3xl md:text-4xl font-bold text-primary-glow">94%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <CyberButton variant="default" size="xl" className="group bg-gradient-to-r from-primary to-accent hover:from-primary-glow hover:to-accent text-white border-0">
              Launch Platform
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </CyberButton>
            
            <CyberButton variant="outline" size="xl" className="border-primary/30 text-primary hover:bg-primary/5">
              Deploy AI Agent
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