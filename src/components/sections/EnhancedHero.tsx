import { CyberButton } from "@/components/ui/cyber-button"
import { ArrowRight, Star, Zap, Shield, TrendingUp, Users, Target, Play, ChevronDown } from "lucide-react"
import { useState, useEffect } from "react"
import { OptimizedVideo } from "@/components/optimized/OptimizedVideo"
import heroVideo from "@/assets/hero-video.mp4"

export function EnhancedHero() {
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [videoError, setVideoError] = useState(false)
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
      {/* Background Video */}
      <div className="absolute top-0 left-0 right-0 bottom-0 z-0 flex items-start justify-center -mt-96">
        <OptimizedVideo
          src={heroVideo}
          className="w-full h-full max-w-full max-h-full object-cover opacity-40"
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={() => setVideoLoaded(true)}
          onError={() => setVideoError(true)}
        />
      </div>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/80 to-background/95 z-5" />
      
      {/* Animated Grid Overlay */}
      <div className="absolute inset-0 cyber-grid opacity-10 z-10" />
      
      {/* Floating Particles */}
      <div className="absolute inset-0 z-10">
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
      
      {/* Content */}
      <div className="relative z-20 container mx-auto px-6 text-center">
        <div className="max-w-6xl mx-auto space-y-12 animate-fade-up">
          
          {/* Hero Headline */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-4"
            >
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary mb-4">
                <Star className="h-4 w-4 mr-2" />
                Trusted by 10,000+ Traders Worldwide
              </div>
              
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
            </motion.div>

            {/* Key Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto py-8"
            >
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
            </motion.div>
          </div>
          
          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto"
          >
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
          </motion.div>
          
          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <CyberButton variant="neon" size="xl" className="group relative overflow-hidden">
              <span className="relative z-10 text-white font-semibold">Start Trading Now</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform text-white relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-glow opacity-0 group-hover:opacity-100 transition-opacity" />
            </CyberButton>
            
            <CyberButton variant="analytics" size="xl" className="group">
              <Play className="h-5 w-5 mr-2 text-white" />
              <span className="text-white font-semibold">Watch Demo</span>
            </CyberButton>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="flex flex-col items-center space-y-4"
          >
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Join 50,000+ active traders</span>
            </div>
            <div className="flex items-center space-x-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="ml-2 text-sm text-muted-foreground">4.9/5 from 2,500+ reviews</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={controls}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
      >
        <div className="flex flex-col items-center space-y-2 text-muted-foreground">
          <span className="text-xs uppercase tracking-wider">Scroll to explore</span>
          <ChevronDown className="h-5 w-5 animate-bounce" />
        </div>
      </motion.div>
    </section>
  )
}