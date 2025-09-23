import { CyberButton } from "@/components/ui/cyber-button"
import { ArrowRight, Star, Zap, Shield, TrendingUp, Users, Target, Play, ChevronDown } from "lucide-react"
import { useState, useEffect } from "react"

export function EnhancedHero() {
  const [typedText, setTypedText] = useState("")

  const heroTexts = [
    "AI-Powered Trading",
    "Autonomous Agents",
    "Smart Strategies",
    "Future of Finance"
  ]

  useEffect(() => {
    let currentIndex = 0
    let currentText = ""
    let isDeleting = false
    let timeout: NodeJS.Timeout

    const typeWriter = () => {
      const fullText = heroTexts[currentIndex]
      
      if (isDeleting) {
        currentText = fullText.substring(0, currentText.length - 1)
      } else {
        currentText = fullText.substring(0, currentText.length + 1)
      }

      setTypedText(currentText)

      let speed = isDeleting ? 50 : 100

      if (!isDeleting && currentText === fullText) {
        speed = 2000
        isDeleting = true
      } else if (isDeleting && currentText === "") {
        isDeleting = false
        currentIndex = (currentIndex + 1) % heroTexts.length
        speed = 500
      }

      timeout = setTimeout(typeWriter, speed)
    }

    typeWriter()
    return () => clearTimeout(timeout)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/80 to-background/95 z-5" />
      
      {/* Animated Grid Overlay */}
      <div className="absolute inset-0 cyber-grid opacity-10 z-10" />
      
      
      {/* Content */}
      <div className="relative z-20 container mx-auto px-6 text-center">
        <div className="max-w-6xl mx-auto space-y-12 animate-fade-up">
          
          {/* Hero Headline */}
          <div className="space-y-6">
            <div className="space-y-4">
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent leading-tight">
                The Future of{" "}
                <span className="text-primary relative">
                  {typedText}
                  <span className="animate-pulse">|</span>
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Deploy autonomous AI trading agents that learn, adapt, and execute strategies 24/7. 
                Experience the next generation of algorithmic trading with HyperCognition.
              </p>
            </div>

            {/* Key Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto py-8">
              <div className="flex items-center justify-center space-x-3 p-4 rounded-lg bg-card/30 border border-border/50 backdrop-blur-sm hover:bg-card/50 transition-colors">
                <Zap className="h-6 w-6 text-yellow-500" />
                <span className="text-sm font-medium">Lightning Fast Execution</span>
              </div>
              <div className="flex items-center justify-center space-x-3 p-4 rounded-lg bg-card/30 border border-border/50 backdrop-blur-sm hover:bg-card/50 transition-colors">
                <Shield className="h-6 w-6 text-green-500" />
                <span className="text-sm font-medium">Bank-Grade Security</span>
              </div>
              <div className="flex items-center justify-center space-x-3 p-4 rounded-lg bg-card/30 border border-border/50 backdrop-blur-sm hover:bg-card/50 transition-colors">
                <TrendingUp className="h-6 w-6 text-blue-500" />
                <span className="text-sm font-medium">AI-Driven Insights</span>
              </div>
            </div>
          </div>
          
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 backdrop-blur-sm">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">$2.4B+</div>
              <div className="text-sm text-muted-foreground">Total Volume Traded</div>
            </div>
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 backdrop-blur-sm">
              <div className="text-3xl md:text-4xl font-bold text-accent mb-2">1K+</div>
              <div className="text-sm text-muted-foreground">AI Agents Deployed</div>
            </div>
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 backdrop-blur-sm">
              <div className="text-3xl md:text-4xl font-bold text-green-500 mb-2">94.7%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 backdrop-blur-sm">
              <div className="text-3xl md:text-4xl font-bold text-blue-500 mb-2">24/7</div>
              <div className="text-sm text-muted-foreground">Automated Trading</div>
            </div>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <CyberButton variant="neon" size="xl" className="group relative overflow-hidden">
              <span className="relative z-10 text-primary-foreground font-semibold">Start Trading Now</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform text-primary-foreground relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-glow opacity-0 group-hover:opacity-100 transition-opacity" />
            </CyberButton>
            
            <CyberButton variant="analytics" size="xl" className="group">
              <Play className="h-5 w-5 mr-2 text-white" />
              <span className="text-white font-semibold">Watch Demo</span>
            </CyberButton>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 -ml-12 z-20 animate-bounce">
        <div className="flex flex-col items-center space-y-2 text-muted-foreground">
          <span className="text-xs uppercase tracking-wider">Scroll to explore</span>
          <ChevronDown className="h-5 w-5" />
        </div>
      </div>
    </section>
  )
}