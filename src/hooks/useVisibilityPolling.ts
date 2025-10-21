import { useEffect, useState } from 'react'

/**
 * Hook to detect if the page is visible (tab is active)
 * Useful for pausing expensive operations when tab is hidden
 */
export function useVisibilityPolling() {
  const [isVisible, setIsVisible] = useState(!document.hidden)

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return isVisible
}

/**
 * Hook that returns a polling interval that respects page visibility
 * Returns false when page is hidden to pause polling
 */
export function useAdaptivePolling(baseInterval: number) {
  const isVisible = useVisibilityPolling()
  return isVisible ? baseInterval : false
}
