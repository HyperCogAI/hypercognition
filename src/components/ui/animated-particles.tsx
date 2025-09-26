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
  const interactingRef = useRef(false)
  const interactingTimeoutRef = useRef<number | undefined>(undefined)
  const lastScrollTimeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      
      // Set actual size in memory (scaled to device pixel ratio)
      canvas.width = Math.ceil(rect.width * dpr)
      canvas.height = Math.ceil(rect.height * dpr)
      
      // Scale the canvas back down using CSS
      canvas.style.width = rect.width + 'px'
      canvas.style.height = rect.height + 'px'
      
      // Reset transform then scale for DPR to avoid cumulative scaling on resize
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)
    }

    const createParticles = () => {
      const particles: Particle[] = []
      const rect = canvas.getBoundingClientRect()
      const particleCount = Math.min(150, Math.floor((rect.width * rect.height) / 8000))
      
      for (let i = 0; i < particleCount; i++) {
        const displayWidth = Math.round(rect.width)
        const displayHeight = Math.round(rect.height)
        
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
      const rect = canvas.getBoundingClientRect()
      const displayWidth = Math.round(rect.width)
      const displayHeight = Math.round(rect.height)
      
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
        
        // Draw connections to nearby particles (disabled during touch/scroll)
        const isInteracting = interactingRef.current || (performance.now() - lastScrollTimeRef.current) < 450
        if (!isInteracting) {
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
        }
      })
      
      animationRef.current = requestAnimationFrame(animate)
    }

    resizeCanvas()
    createParticles()
    animate()

    // Throttled resize and mobile visual viewport handling
    let resizeRaf: number | null = null
    const onResize = () => {
      if (resizeRaf) cancelAnimationFrame(resizeRaf)
      resizeRaf = requestAnimationFrame(() => {
        resizeCanvas()
        createParticles()
      })
    }

    window.addEventListener('resize', onResize)

    // Pause connections while user scrolls/touches to avoid artifacts on mobile
    const markInteracting = () => {
      interactingRef.current = true
      lastScrollTimeRef.current = performance.now()
      if (interactingTimeoutRef.current) window.clearTimeout(interactingTimeoutRef.current)
      interactingTimeoutRef.current = window.setTimeout(() => {
        interactingRef.current = false
      }, 450)
    }
    const endInteracting = () => {
      if (interactingTimeoutRef.current) window.clearTimeout(interactingTimeoutRef.current)
      interactingRef.current = false
    }

    window.addEventListener('touchstart', markInteracting, { passive: true })
    window.addEventListener('touchmove', markInteracting, { passive: true })
    window.addEventListener('touchend', endInteracting, { passive: true })
    window.addEventListener('touchcancel', endInteracting, { passive: true })
    window.addEventListener('scroll', markInteracting, { passive: true })
    document.addEventListener('scroll', markInteracting, { passive: true, capture: true })

    // Handle mobile browser UI resize jitter
    const vv = window.visualViewport
    let vvDebounce: number | undefined
    const onVVResize = () => {
      // briefly mark interacting to disable line drawing and avoid edge artifacts
      markInteracting()
      if (vvDebounce) window.clearTimeout(vvDebounce)
      vvDebounce = window.setTimeout(() => {
        resizeCanvas()
        createParticles()
      }, 120)
    }
    vv?.addEventListener('resize', onVVResize)

    return () => {
      window.removeEventListener('resize', onResize)
      vv?.removeEventListener('resize', onVVResize)
      window.removeEventListener('touchstart', markInteracting)
      window.removeEventListener('touchmove', markInteracting)
      window.removeEventListener('touchend', endInteracting)
      window.removeEventListener('touchcancel', endInteracting)
      window.removeEventListener('scroll', markInteracting)
      document.removeEventListener('scroll', markInteracting, true)
      if (resizeRaf) cancelAnimationFrame(resizeRaf)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (interactingTimeoutRef.current) window.clearTimeout(interactingTimeoutRef.current)
      if (vvDebounce) window.clearTimeout(vvDebounce)
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