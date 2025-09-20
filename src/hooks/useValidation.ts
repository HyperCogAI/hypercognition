import { useState, useCallback } from "react"
import { z } from "zod"

interface ValidationResult<T> {
  data: T | null
  errors: Record<string, string[]>
  isValid: boolean
}

export const useValidation = <T>(schema: z.ZodSchema<T>) => {
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [isValid, setIsValid] = useState(true)

  const validate = useCallback((data: unknown): ValidationResult<T> => {
    try {
      const validatedData = schema.parse(data)
      setErrors({})
      setIsValid(true)
      return {
        data: validatedData,
        errors: {},
        isValid: true
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string[]> = {}
        
        error.errors.forEach((err) => {
          const path = err.path.join('.')
          if (!fieldErrors[path]) {
            fieldErrors[path] = []
          }
          fieldErrors[path].push(err.message)
        })
        
        setErrors(fieldErrors)
        setIsValid(false)
        
        return {
          data: null,
          errors: fieldErrors,
          isValid: false
        }
      }
      
      throw error
    }
  }, [schema])

  const clearErrors = useCallback(() => {
    setErrors({})
    setIsValid(true)
  }, [])

  const getFieldError = useCallback((fieldName: string): string | undefined => {
    return errors[fieldName]?.[0]
  }, [errors])

  const hasFieldError = useCallback((fieldName: string): boolean => {
    return Boolean(errors[fieldName]?.length)
  }, [errors])

  return {
    validate,
    clearErrors,
    getFieldError,
    hasFieldError,
    errors,
    isValid
  }
}