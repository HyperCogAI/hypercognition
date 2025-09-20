import { CyberButton } from "@/components/ui/cyber-button";
import { ArrowRight, Sparkles, Zap } from "lucide-react";

export const HyperCTA = () => {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-primary/5 to-background" />
      <div className="absolute inset-0 cyber-grid opacity-10" />
      
      {/* Animated Orbs */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-secondary/10 rounded-full blur-2xl animate-pulse delay-500" />

      <div className="max-w-4xl mx-auto text-center relative z-10 space-y-12">
        {/* Main CTA Content */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            Ready to Start
          </div>
          
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Enter the Future of
            <br />
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Autonomous Trading
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Join thousands of traders using AI agents to maximize returns, minimize risk, 
            and unlock the full potential of decentralized finance.
          </p>
        </div>

        {/* Benefits List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
          <div className="flex items-center gap-3 p-4 bg-card/30 rounded-lg border border-border/30">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <div className="text-left">
              <div className="font-medium text-white">Instant Deployment</div>
              <div className="text-sm text-muted-foreground">Launch AI agents in minutes</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-card/30 rounded-lg border border-border/30">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
              <ArrowRight className="w-4 h-4 text-accent" />
            </div>
            <div className="text-left">
              <div className="font-medium text-white">Continuous Learning</div>
              <div className="text-sm text-muted-foreground">Evolves with market conditions</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-card/30 rounded-lg border border-border/30">
            <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-secondary" />
            </div>
            <div className="text-left">
              <div className="font-medium text-white">Zero Maintenance</div>
              <div className="text-sm text-muted-foreground">Fully autonomous operation</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <CyberButton 
            variant="neon" 
            size="xl" 
            className="group min-w-[200px]"
          >
            <span className="text-primary-foreground group-hover:text-muted-foreground transition-colors">Launch HyperCognition</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-primary-foreground group-hover:text-muted-foreground transition-colors" />
          </CyberButton>
          
          <CyberButton 
            variant="analytics" 
            size="xl" 
            className="group min-w-[200px]"
          >
            <span className="text-primary-foreground group-hover:text-muted-foreground transition-colors">Explore Marketplace</span>
          </CyberButton>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-col sm:flex-row gap-8 justify-center items-center text-center pt-8 border-t border-border/30">
          <div className="space-y-1">
            <div className="text-2xl font-bold text-primary">$850M+</div>
            <div className="text-sm text-muted-foreground">Total Value Locked</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-accent">1M+</div>
            <div className="text-sm text-muted-foreground">AI Agents Deployed</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-secondary">24/7</div>
            <div className="text-sm text-muted-foreground">Autonomous Operation</div>
          </div>
        </div>
      </div>
    </section>
  );
};