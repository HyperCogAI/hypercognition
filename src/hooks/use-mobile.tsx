import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      setIsMobile(false)
      return
    }

    const media = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)

    const listener = () => {
      setIsMobile(media.matches)
    }

    // Attach listener with cross-browser support
    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', listener)
    } else {
      // Fallback for older Safari/iOS
      media.addListener(listener)
    }

    // Set initial state
    setIsMobile(media.matches)

    return () => {
      if (typeof media.removeEventListener === 'function') {
        media.removeEventListener('change', listener)
      } else {
        media.removeListener(listener)
      }
    }
  }, [])

  return !!isMobile;
}
