import { useLayoutEffect } from 'react'

/**
 * Fixes viewport unit inconsistencies across different mobile browsers
 * Particularly addresses WebView browsers like Metamask that calculate vh differently
 * Sets CSS variables --dvh and --vh that update on resize, scroll, and orientation change
 */
export function useViewportUnitsFix() {
  useLayoutEffect(() => {
    const setVH = () => {
      const vv = window.visualViewport
      const dpr = window.devicePixelRatio || 1
      let height = vv?.height ?? window.innerHeight
      
      // Avoid fractional pixels that some webviews mis-handle
      height = Math.round(height * dpr) / dpr

      document.documentElement.style.setProperty('--dvh', `${height}px`)
      document.documentElement.style.setProperty('--vh', `${height / 100}px`)

      if (import.meta.env.DEV) {
        // Only log once for debugging
        if (!(window as any).__loggedVhOnce) {
          (window as any).__loggedVhOnce = true
          console.info('[ViewportFix] innerHeight=', window.innerHeight, 'visualViewport.height=', vv?.height, 'clientHeight=', document.documentElement.clientHeight)
        }
      }
    }

    // Set immediately before paint
    setVH()
    
    const opts = { passive: true } as AddEventListenerOptions

    window.addEventListener('resize', setVH, opts)
    window.addEventListener('orientationchange', setVH, opts)
    
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', setVH, opts)
      window.visualViewport.addEventListener('scroll', setVH, opts)
    }

    return () => {
      window.removeEventListener('resize', setVH)
      window.removeEventListener('orientationchange', setVH)
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', setVH)
        window.visualViewport.removeEventListener('scroll', setVH)
      }
    }
  }, [])
}
