import { useState, useEffect } from 'react'

export interface DeviceInfo {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isNative: boolean
  screenSize: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  orientation: 'portrait' | 'landscape'
  touchEnabled: boolean
  platform: 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'unknown'
}

export function useDeviceDetection(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isNative: false,
    screenSize: 'lg',
    orientation: 'landscape',
    touchEnabled: false,
    platform: 'unknown'
  })

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const userAgent = navigator.userAgent.toLowerCase()
      
      // Determine device type
      const isMobile = width < 768
      const isTablet = width >= 768 && width < 1024
      const isDesktop = width >= 1024
      
      // Determine screen size
      let screenSize: DeviceInfo['screenSize'] = 'lg'
      if (width < 640) screenSize = 'sm'
      else if (width < 768) screenSize = 'md'
      else if (width < 1024) screenSize = 'lg'
      else if (width < 1280) screenSize = 'xl'
      else screenSize = '2xl'
      
      // Determine orientation
      const orientation: DeviceInfo['orientation'] = height > width ? 'portrait' : 'landscape'
      
      // Check for touch support
      const touchEnabled = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      
      // Detect platform
      let platform: DeviceInfo['platform'] = 'unknown'
      if (userAgent.includes('iphone') || userAgent.includes('ipad')) platform = 'ios'
      else if (userAgent.includes('android')) platform = 'android'
      else if (userAgent.includes('windows')) platform = 'windows'
      else if (userAgent.includes('mac')) platform = 'macos'
      else if (userAgent.includes('linux')) platform = 'linux'
      
      // Check if running as native app (Capacitor)
      const isNative = !!(window as any).Capacitor
      
      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        isNative,
        screenSize,
        orientation,
        touchEnabled,
        platform
      })
    }

    updateDeviceInfo()
    
    window.addEventListener('resize', updateDeviceInfo)
    window.addEventListener('orientationchange', updateDeviceInfo)
    
    return () => {
      window.removeEventListener('resize', updateDeviceInfo)
      window.removeEventListener('orientationchange', updateDeviceInfo)
    }
  }, [])

  return deviceInfo
}

export function useResponsiveValue<T>(values: {
  mobile?: T
  tablet?: T
  desktop?: T
  default: T
}): T {
  const { isMobile, isTablet } = useDeviceDetection()
  
  if (isMobile && values.mobile !== undefined) return values.mobile
  if (isTablet && values.tablet !== undefined) return values.tablet
  if (values.desktop !== undefined) return values.desktop
  
  return values.default
}

export function useBreakpoint(breakpoint: 'sm' | 'md' | 'lg' | 'xl' | '2xl'): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const breakpoints = {
      sm: '(min-width: 640px)',
      md: '(min-width: 768px)',
      lg: '(min-width: 1024px)',
      xl: '(min-width: 1280px)',
      '2xl': '(min-width: 1536px)'
    }

    const mediaQuery = window.matchMedia(breakpoints[breakpoint])
    setMatches(mediaQuery.matches)

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [breakpoint])

  return matches
}

export function useViewport() {
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  })

  useEffect(() => {
    const updateViewport = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    window.addEventListener('resize', updateViewport)
    window.addEventListener('orientationchange', updateViewport)

    return () => {
      window.removeEventListener('resize', updateViewport)
      window.removeEventListener('orientationchange', updateViewport)
    }
  }, [])

  return viewport
}

export function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const updateScrollDirection = () => {
      const scrollY = window.scrollY
      const direction = scrollY > lastScrollY ? 'down' : 'up'
      
      if (direction !== scrollDirection && (scrollY - lastScrollY > 10 || scrollY - lastScrollY < -10)) {
        setScrollDirection(direction)
      }
      
      setLastScrollY(scrollY > 0 ? scrollY : 0)
    }

    window.addEventListener('scroll', updateScrollDirection)
    return () => window.removeEventListener('scroll', updateScrollDirection)
  }, [scrollDirection, lastScrollY])

  return scrollDirection
}

export function useSafeArea() {
  const [safeArea, setSafeArea] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  })

  useEffect(() => {
    const updateSafeArea = () => {
      if (CSS.supports('padding: env(safe-area-inset-top)')) {
        const computedStyle = getComputedStyle(document.documentElement)
        
        setSafeArea({
          top: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-top)') || '0'),
          right: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-right)') || '0'),
          bottom: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
          left: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-left)') || '0')
        })
      }
    }

    updateSafeArea()
    window.addEventListener('orientationchange', updateSafeArea)
    
    return () => window.removeEventListener('orientationchange', updateSafeArea)
  }, [])

  return safeArea
}