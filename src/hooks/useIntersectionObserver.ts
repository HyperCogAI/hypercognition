import { useState, useEffect, useRef } from 'react'

interface IntersectionOptions extends IntersectionObserverInit {
  triggerOnce?: boolean
  skip?: boolean
}

export function useIntersectionObserver(
  options: IntersectionOptions = {}
): [React.RefObject<HTMLElement>, boolean] {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasTriggered, setHasTriggered] = useState(false)
  const elementRef = useRef<HTMLElement>(null)
  
  const { triggerOnce = false, skip = false, ...intersectionOptions } = options
  
  useEffect(() => {
    const element = elementRef.current
    if (!element || skip || (triggerOnce && hasTriggered)) {
      return
    }
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        const isElementIntersecting = entry.isIntersecting
        setIsIntersecting(isElementIntersecting)
        
        if (isElementIntersecting && triggerOnce) {
          setHasTriggered(true)
        }
      },
      {
        threshold: 0.1,
        ...intersectionOptions
      }
    )
    
    observer.observe(element)
    
    return () => {
      observer.unobserve(element)
    }
  }, [skip, triggerOnce, hasTriggered, intersectionOptions])
  
  return [elementRef, isIntersecting]
}

// Hook for lazy loading images
export function useLazyImage(src: string, placeholder?: string) {
  const [imageSrc, setImageSrc] = useState(placeholder || '')
  const [imageRef, isIntersecting] = useIntersectionObserver({
    triggerOnce: true,
    threshold: 0.1
  })
  
  useEffect(() => {
    if (isIntersecting && src) {
      const img = new Image()
      img.onload = () => setImageSrc(src)
      img.src = src
    }
  }, [isIntersecting, src])
  
  return { imageSrc, imageRef }
}

// Hook for lazy loading components
export function useLazyLoad(delay: number = 100) {
  const [shouldLoad, setShouldLoad] = useState(false)
  const [elementRef, isIntersecting] = useIntersectionObserver({
    triggerOnce: true,
    threshold: 0.1
  })
  
  useEffect(() => {
    if (isIntersecting) {
      const timer = setTimeout(() => setShouldLoad(true), delay)
      return () => clearTimeout(timer)
    }
  }, [isIntersecting, delay])
  
  return { shouldLoad, elementRef }
}