import { useCallback, useState } from "react"

export const useErrorBoundary = () => {
  const [error, setError] = useState<Error | null>(null)

  const resetError = useCallback(() => {
    setError(null)
  }, [])

  const captureError = useCallback((error: Error) => {
    setError(error)
    console.error('Captured error:', error)
  }, [])

  // This will trigger the nearest error boundary
  const throwError = useCallback((error: Error) => {
    throw error
  }, [])

  return {
    error,
    resetError,
    captureError,
    throwError
  }
}