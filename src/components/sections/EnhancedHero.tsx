import { CyberButton } from "@/components/ui/cyber-button"
import { AnimatedParticles } from "@/components/ui/animated-particles"
import { ArrowRight, Star, Zap, Shield, TrendingUp, Users, Target, Play, ChevronDown } from "lucide-react"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"

export function EnhancedHero() {
  const [typedText, setTypedText] = useState("")

  const heroTexts = [
    "AI-Powered Trading",
    "Autonomous Agents",
    "Smart Strategies",
    "Market Mastery"
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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pointer-events-none">
      
      {/* Animated Particles Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <AnimatedParticles />
      </div>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/70 via-background/50 to-background/70 z-5" />
      
      
      {/* Content */}
      <div className="relative z-20 container mx-auto px-4 md:px-6 text-center pt-[45px] md:pt-0">
        <div className="max-w-6xl mx-auto space-y-8 md:space-y-12 animate-fade-up">
          
          {/* Hero Headline */}
          <div className="space-y-6 md:space-y-8">
            <div className="space-y-4 md:space-y-6">
              
              <h1 className="text-[2.625rem] md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent leading-tight">
                <div className="mb-2 md:mb-4">The Future of</div>
                <span className="text-[2.625rem] md:text-6xl lg:text-7xl text-primary relative whitespace-nowrap">
                  {typedText}
                  <span className="animate-pulse">|</span>
                </span>
              </h1>
              
              <p className="text-sm md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed px-2 md:px-0">
                Deploy autonomous AI trading agents that learn, adapt, and execute strategies 24/7. 
                Experience the next generation of algorithmic trading with HyperCognition.
              </p>
            </div>

            {/* Key Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 max-w-4xl mx-auto py-6 md:py-8">
              <div className="flex items-center justify-center space-x-2 md:space-x-3 p-3 md:p-4 rounded-lg bg-card/30 border border-border/50 backdrop-blur-sm hover:bg-card/50 transition-colors">
                <Zap className="h-5 w-5 md:h-6 md:w-6 text-yellow-500" />
                <span className="text-xs md:text-sm font-medium">Lightning Fast Execution</span>
              </div>
              <div className="flex items-center justify-center space-x-2 md:space-x-3 p-3 md:p-4 rounded-lg bg-card/30 border border-border/50 backdrop-blur-sm hover:bg-card/50 transition-colors">
                <Shield className="h-5 w-5 md:h-6 md:w-6 text-green-500" />
                <span className="text-xs md:text-sm font-medium">Bank-Grade Security</span>
              </div>
              <div className="flex items-center justify-center space-x-2 md:space-x-3 p-3 md:p-4 rounded-lg bg-card/30 border border-border/50 backdrop-blur-sm hover:bg-card/50 transition-colors">
                <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-blue-500" />
                <span className="text-xs md:text-sm font-medium">AI-Driven Insights</span>
              </div>
            </div>
          </div>
          
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 max-w-5xl mx-auto">
            <div className="text-center p-4 md:p-6 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 backdrop-blur-sm">
              <div className="text-2xl md:text-4xl font-bold text-primary mb-1 md:mb-2">-</div>
              <div className="text-xs md:text-sm text-muted-foreground">Total Volume Traded</div>
            </div>
            <div className="text-center p-4 md:p-6 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 backdrop-blur-sm">
              <div className="text-2xl md:text-4xl font-bold text-accent mb-1 md:mb-2">1K+</div>
              <div className="text-xs md:text-sm text-muted-foreground">AI Agents Deployed</div>
            </div>
            <div className="text-center p-4 md:p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 backdrop-blur-sm">
              <div className="text-2xl md:text-4xl font-bold text-green-500 mb-1 md:mb-2">94.7%</div>
              <div className="text-xs md:text-sm text-muted-foreground">Success Rate</div>
            </div>
            <div className="text-center p-4 md:p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 backdrop-blur-sm">
              <div className="text-2xl md:text-4xl font-bold text-blue-500 mb-1 md:mb-2">24/7</div>
              <div className="text-xs md:text-sm text-muted-foreground">Automated Trading</div>
            </div>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center pt-4 pointer-events-auto">
            <Link to="/marketplace" className="w-full sm:w-auto">
              <CyberButton variant="neon" size="lg" className="group relative overflow-hidden w-full px-6 py-3 md:px-8 md:py-4 text-sm md:text-base justify-center hover:brightness-110 transition-all duration-300">
                <span className="relative z-10 text-white font-semibold text-center">Start Trading Now</span>
                <ArrowRight className="h-3 w-3 md:h-4 md:w-4 ml-2 text-white group-hover:translate-x-1 transition-transform" />
              </CyberButton>
            </Link>
            
            <Link to="/tutorials-hub" className="w-full sm:w-auto">
              <CyberButton variant="analytics" size="lg" className="group w-full px-6 py-3 md:px-8 md:py-4 text-sm md:text-base">
                <Play className="h-3 w-3 md:h-4 md:w-4 mr-2 text-white" />
                <span className="text-white font-semibold">Watch Demo</span>
              </CyberButton>
            </Link>
          </div>
        </div>
      </div>

    </section>
  )
}