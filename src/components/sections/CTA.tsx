import { CyberButton } from "@/components/ui/cyber-button"
import { ArrowRight, Rocket, Sparkles } from "lucide-react"

export function CTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10" />
      <div className="absolute inset-0 cyber-grid opacity-10" />
      
      {/* Floating Orbs */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-primary/20 rounded-full blur-2xl animate-pulse" />
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-secondary/20 rounded-full blur-2xl animate-pulse delay-1000" />
      <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-accent/20 rounded-full blur-xl animate-pulse delay-2000" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-medium text-accent glow-accent">
            <Sparkles className="h-4 w-4" />
            Ready to Start Trading?
          </div>
          
          {/* Main Heading */}
          <h2 className="text-4xl md:text-6xl font-bold">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Join the AI Trading
            </span>
            <br />
            <span className="text-foreground">Revolution Today</span>
          </h2>
          
          {/* Description */}
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Get started with our platform in minutes. Deploy your first AI trading bot 
            and start earning passive income from cryptocurrency markets.
          </p>
          
          {/* Benefits List */}
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto py-8">
            <div className="flex items-center gap-3 text-left">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-primary" />
              </div>
              <span className="text-sm">No Setup Fees</span>
            </div>
            <div className="flex items-center gap-3 text-left">
              <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-secondary" />
              </div>
              <span className="text-sm">24/7 Support</span>
            </div>
            <div className="flex items-center gap-3 text-left">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-accent" />
              </div>
              <span className="text-sm">Cancel Anytime</span>
            </div>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <CyberButton variant="cyber" size="xl" className="group min-w-48">
              <Rocket className="h-5 w-5" />
              Launch Trading Bot
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </CyberButton>
            
            <CyberButton variant="outline" size="xl" className="min-w-48">
              View Documentation
            </CyberButton>
          </div>
          
          {/* Trust Indicators */}
          <div className="pt-8 border-t border-border/20">
            <p className="text-sm text-muted-foreground mb-4">Trusted by traders worldwide</p>
            <div className="flex justify-center items-center gap-8 text-2xl font-bold opacity-60">
              <span>$2.5B+</span>
              <span className="text-muted-foreground">•</span>
              <span>10K+</span>
              <span className="text-muted-foreground">•</span>
              <span>98.7%</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}