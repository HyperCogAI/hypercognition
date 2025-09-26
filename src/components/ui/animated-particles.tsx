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
  const worldRef = useRef<{ width: number; height: number }>({ width: 0, height: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      
      // Lock world size at first init to avoid jitter on mobile scroll
      if (worldRef.current.width === 0 || worldRef.current.height === 0) {
        worldRef.current.width = Math.round(rect.width)
        worldRef.current.height = Math.round(rect.height)
      }

      // Set actual size in memory (scaled to device pixel ratio)
      canvas.width = Math.ceil(worldRef.current.width * dpr)
      canvas.height = Math.ceil(worldRef.current.height * dpr)
      
      // Scale the canvas back down using CSS (match the locked world size)
      canvas.style.width = worldRef.current.width + 'px'
      canvas.style.height = worldRef.current.height + 'px'
      
      // Reset transform then scale for DPR to avoid cumulative scaling on resize
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)
    }

    const createParticles = () => {
      const particles: Particle[] = []
      const displayWidth = Math.round(worldRef.current.width)
      const displayHeight = Math.round(worldRef.current.height)
      const particleCount = Math.min(150, Math.floor((displayWidth * displayHeight) / 8000))
      
      for (let i = 0; i < particleCount; i++) {
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
      const displayWidth = Math.round(worldRef.current.width)
      const displayHeight = Math.round(worldRef.current.height)
      
      // Pixel-perfect clear to avoid 1px artifacts at edges
      ctx.save()
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.restore()
      
      const particles = particlesRef.current
      // Improve line rendering to reduce aliasing artifacts
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      
      // Update and draw particles
      particles.forEach((particle, i) => {
        // Update position
        particle.x += particle.vx
        particle.y += particle.vy
        
        // Wrap around edges without landing exactly on bounds to avoid edge artifacts
        if (particle.x < 0) particle.x += displayWidth
        if (particle.x >= displayWidth) particle.x -= displayWidth
        if (particle.y < 0) particle.y += displayHeight
        if (particle.y >= displayHeight) particle.y -= displayHeight
        
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
          
          // Only draw lines if particles are close AND not wrapping around edges or edges proximity
          const nearEdge = (p: Particle) => (
            p.x < 1 || p.x > displayWidth - 1 || p.y < 1 || p.y > displayHeight - 1
          )
          if (
            distance < 100 &&
            Math.abs(dx) < displayWidth * 0.8 &&
            Math.abs(dy) < displayHeight * 0.8 &&
            !nearEdge(particle) &&
            !nearEdge(otherParticle)
          ) {
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(otherParticle.x, otherParticle.y)
            const lineOpacity = (1 - distance / 100) * Math.min(particle.opacity, otherParticle.opacity) * 0.6
            ctx.strokeStyle = `rgba(59, 130, 246, ${lineOpacity})`
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

    // No resize listeners: lock world size on mount to avoid mobile scroll jitter
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 w-full h-full block"
      style={{ 
        pointerEvents: 'none', 
        display: 'block',
        verticalAlign: 'top',
        overflow: 'hidden',
        border: 'none',
        outline: 'none',
        userSelect: 'none',
        WebkitTouchCallout: 'none'
      }}
    />
  )
}