import { CyberButton } from "@/components/ui/cyber-button"
import { ArrowRight } from "lucide-react"
import heroVideo from "@/assets/hero-video.mp4"

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video */}
      <div className="absolute top-0 left-0 right-0 bottom-0 z-0 flex items-start justify-center -mt-96">
        <video 
          className="w-full h-full max-w-full max-h-full object-contain opacity-90"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
      </div>
      
      {/* Animated Grid Overlay */}
      <div className="absolute inset-0 cyber-grid opacity-20 z-10" />
      
      {/* Content */}
      <div className="relative z-20 container mx-auto px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-up pt-[34rem]">
          
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
            <CyberButton variant="neon" size="xl" className="group">
              <span className="text-white">Launch Platform</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform text-white" />
            </CyberButton>
            
            <CyberButton variant="neon" size="xl" className="group">
              <span className="text-white">Deploy AI Agent</span>
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