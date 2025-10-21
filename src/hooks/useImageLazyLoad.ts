import { useEffect, useRef, useState } from 'react'

interface UseImageLazyLoadOptions {
  threshold?: number
  rootMargin?: string
}

/**
 * Hook for lazy loading images when they enter the viewport
 */
export function useImageLazyLoad(options: UseImageLazyLoadOptions = {}) {
  const { threshold = 0.1, rootMargin = '50px' } = options
  const [isVisible, setIsVisible] = useState(false)
  const elementRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    // If IntersectionObserver is not supported, load immediately
    if (!('IntersectionObserver' in window)) {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            observer.unobserve(element)
          }
        })
      },
      { threshold, rootMargin }
    )

    observer.observe(element)

    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [threshold, rootMargin])

  return { ref: elementRef, isVisible }
}
