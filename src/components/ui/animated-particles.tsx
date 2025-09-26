import { useEffect, useRef } from "react"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  opacity: number
  size: number
}

export function AnimatedParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const particlesRef = useRef<Particle[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      
      // Set actual size in memory (scaled to device pixel ratio)
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      
      // Scale the canvas back down using CSS
      canvas.style.width = rect.width + 'px'
      canvas.style.height = rect.height + 'px'
      
      // Scale the drawing context so everything draws at the correct size
      ctx.scale(dpr, dpr)
    }

    const createParticles = () => {
      const particles: Particle[] = []
      const particleCount = Math.min(150, Math.floor((canvas.style.width ? parseInt(canvas.style.width) : canvas.width) * (canvas.style.height ? parseInt(canvas.style.height) : canvas.height) / 8000))
      
      for (let i = 0; i < particleCount; i++) {
        const displayWidth = canvas.style.width ? parseInt(canvas.style.width) : canvas.width
        const displayHeight = canvas.style.height ? parseInt(canvas.style.height) : canvas.height
        
        particles.push({
          x: Math.random() * displayWidth,
          y: Math.random() * displayHeight,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          opacity: Math.random() * 0.8 + 0.4, // Increased base opacity
          size: Math.random() * 2 + 1
        })
      }
      particlesRef.current = particles
    }

    const animate = () => {
      const displayWidth = canvas.style.width ? parseInt(canvas.style.width) : canvas.width
      const displayHeight = canvas.style.height ? parseInt(canvas.style.height) : canvas.height
      
      ctx.clearRect(0, 0, displayWidth, displayHeight)
      
      const particles = particlesRef.current
      
      // Update and draw particles
      particles.forEach((particle, i) => {
        // Update position
        particle.x += particle.vx
        particle.y += particle.vy
        
        // Wrap around edges
        if (particle.x < 0) particle.x = displayWidth
        if (particle.x > displayWidth) particle.x = 0
        if (particle.y < 0) particle.y = displayHeight
        if (particle.y > displayHeight) particle.y = 0
        
        // Animate opacity
        particle.opacity += (Math.random() - 0.5) * 0.01
        particle.opacity = Math.max(0.3, Math.min(1.0, particle.opacity))
        
        // Draw particle
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(59, 130, 246, ${particle.opacity})` // Blue primary color
        ctx.fill()
        
        // Draw connections to nearby particles
        particles.slice(i + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x
          const dy = particle.y - otherParticle.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance < 100) {
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(otherParticle.x, otherParticle.y)
            const lineOpacity = (1 - distance / 100) * Math.min(particle.opacity, otherParticle.opacity) * 0.6
            ctx.strokeStyle = `rgba(59, 130, 246, ${lineOpacity})` // Blue primary color
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      })
      
      animationRef.current = requestAnimationFrame(animate)
    }

    resizeCanvas()
    createParticles()
    animate()

    const handleResize = () => {
      resizeCanvas()
      createParticles()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 w-full h-full"
      style={{ pointerEvents: 'none' }}
    />
  )
}