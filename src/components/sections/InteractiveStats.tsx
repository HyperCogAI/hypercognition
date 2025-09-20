import { useEffect, useState } from "react"

interface AnimatedMetric {
  value: number
  label: string
  prefix?: string
  suffix?: string
  decimals?: number
}

interface InteractiveStatsProps {
  className?: string
}

export const InteractiveStats = ({ className = "" }: InteractiveStatsProps) => {
  const [metrics, setMetrics] = useState<AnimatedMetric[]>([
    { value: 850000000, label: "TOTAL VALUE LOCKED", prefix: "$", suffix: "", decimals: 0 },
    { value: 1247893, label: "AI AGENTS DEPLOYED", prefix: "", suffix: "", decimals: 0 },
    { value: 94.2, label: "SUCCESS RATE", prefix: "", suffix: "%", decimals: 1 },
    { value: 12, label: "AVG RESPONSE TIME", prefix: "", suffix: "ms", decimals: 0 },
  ])

  const [animatedValues, setAnimatedValues] = useState<number[]>([0, 0, 0, 0])

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => prev.map((metric, index) => {
        let newValue = metric.value
        switch (index) {
          case 0: // TVL - fluctuates ±1M
            newValue += (Math.random() - 0.5) * 2000000
            break
          case 1: // Agents - slowly increases
            newValue += Math.floor(Math.random() * 10)
            break
          case 2: // Success rate - slight variations
            newValue += (Math.random() - 0.5) * 0.5
            newValue = Math.min(99.9, Math.max(90, newValue))
            break
          case 3: // Response time - varies 8-20ms
            newValue = 8 + Math.random() * 12
            break
        }
        return { ...metric, value: newValue }
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  // Animate values smoothly
  useEffect(() => {
    metrics.forEach((metric, index) => {
      const start = animatedValues[index]
      const end = metric.value
      const duration = 2000
      const startTime = Date.now()

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const easeOutQuart = 1 - Math.pow(1 - progress, 4)
        const currentValue = start + (end - start) * easeOutQuart

        setAnimatedValues(prev => {
          const newValues = [...prev]
          newValues[index] = currentValue
          return newValues
        })

        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }

      requestAnimationFrame(animate)
    })
  }, [metrics])

  const formatValue = (value: number, metric: AnimatedMetric): string => {
    let formattedValue: string

    if (value >= 1000000000) {
      formattedValue = (value / 1000000000).toFixed(metric.decimals || 0) + "B"
    } else if (value >= 1000000) {
      formattedValue = (value / 1000000).toFixed(metric.decimals || 0) + "M"
    } else if (value >= 1000) {
      formattedValue = (value / 1000).toFixed(metric.decimals || 0) + "K"
    } else {
      formattedValue = value.toFixed(metric.decimals || 0)
    }

    return `${metric.prefix || ""}${formattedValue}${metric.suffix || ""}`
  }

  return (
    <div className={`relative overflow-hidden bg-gradient-to-b from-background to-card/20 ${className}`}>
      {/* Animated Grid Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="cyber-grid h-full w-full" />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 15 }, (_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random()}s`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-8 md:p-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Real-Time AI
              <span className="text-primary"> Performance</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Live metrics from the HyperCognition AI trading ecosystem
            </p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((metric, index) => (
              <div
                key={index}
                className="group relative p-6 bg-card/20 backdrop-blur-sm rounded-xl border border-border/30 hover:border-primary/50 transition-all duration-500 hover:scale-105 hover:bg-card/40"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Glow Effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative space-y-3">
                  {/* Value with smooth counter animation */}
                  <div className="text-2xl md:text-3xl font-bold text-primary font-mono transition-all duration-300">
                    {formatValue(animatedValues[index], metric)}
                  </div>
                  
                  {/* Label */}
                  <div className="text-xs text-muted-foreground font-medium tracking-wider">
                    {metric.label}
                  </div>
                  
                  {/* Live indicator */}
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                    <span className="text-xs text-accent font-semibold">LIVE</span>
                  </div>
                </div>

                {/* Animated border effect */}
                <div className="absolute inset-0 rounded-xl border-2 border-transparent bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
              </div>
            ))}
          </div>

          {/* Interactive Elements */}
          <div className="mt-12 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
              Real-time data from HyperCognition network
            </div>
            
            <button className="group relative px-8 py-4 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-lg hover:scale-105 transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10">Deploy Your AI Agent</span>
            </button>
          </div>
        </div>
      </div>

      {/* Additional Visual Effects */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-accent/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-secondary/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: "2s" }} />
    </div>
  )
}