import { useState, useCallback, useRef } from 'react'

interface DebounceOptions {
  delay: number
  immediate?: boolean
}

export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  options: DebounceOptions
): [T, () => void] {
  const [isDebouncing, setIsDebouncing] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout>()
  const callbackRef = useRef<T>(callback)
  
  // Update callback ref when callback changes
  callbackRef.current = callback
  
  const debouncedCallback = useCallback(
    ((...args: Parameters<T>) => {
      const { delay, immediate } = options
      
      if (immediate && !debounceRef.current) {
        callbackRef.current(...args)
      }
      
      clearTimeout(debounceRef.current)
      setIsDebouncing(true)
      
      debounceRef.current = setTimeout(() => {
        setIsDebouncing(false)
        if (!immediate) {
          callbackRef.current(...args)
        }
        debounceRef.current = undefined
      }, delay)
    }) as T,
    [options.delay, options.immediate]
  )
  
  const cancel = useCallback(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = undefined
    setIsDebouncing(false)
  }, [])
  
  return [debouncedCallback, cancel]
}

interface ThrottleOptions {
  delay: number
  leading?: boolean
  trailing?: boolean
}

export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  options: ThrottleOptions
): T {
  const lastCallRef = useRef<number>(0)
  const timeoutRef = useRef<NodeJS.Timeout>()
  const callbackRef = useRef<T>(callback)
  
  callbackRef.current = callback
  
  const throttledCallback = useCallback(
    ((...args: Parameters<T>) => {
      const { delay, leading = true, trailing = true } = options
      const now = Date.now()
      const timeSinceLastCall = now - lastCallRef.current
      
      if (timeSinceLastCall >= delay) {
        if (leading) {
          callbackRef.current(...args)
          lastCallRef.current = now
        }
      } else if (trailing) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => {
          callbackRef.current(...args)
          lastCallRef.current = Date.now()
        }, delay - timeSinceLastCall)
      }
    }) as T,
    [options.delay, options.leading, options.trailing]
  )
  
  return throttledCallback
}