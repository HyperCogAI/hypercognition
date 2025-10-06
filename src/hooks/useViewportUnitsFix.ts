import { useEffect } from 'react'

/**
 * Fixes viewport unit inconsistencies across different mobile browsers
 * Particularly addresses WebView browsers like Metamask that calculate vh differently
 * Sets a CSS variable --dvh (dynamic viewport height) that updates on resize
 */
export function useViewportUnitsFix() {
  useEffect(() => {
    const setVH = () => {
      // Use visualViewport API for better accuracy in WebViews
      const height = window.visualViewport?.height || window.innerHeight
      document.documentElement.style.setProperty('--dvh', `${height}px`)
    }

    // Set initial value
    setVH()

    // Update on resize and orientation change
    window.addEventListener('resize', setVH)
    window.addEventListener('orientationchange', setVH)
    
    // Also listen to visualViewport events if available
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', setVH)
    }

    return () => {
      window.removeEventListener('resize', setVH)
      window.removeEventListener('orientationchange', setVH)
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', setVH)
      }
    }
  }, [])
}
