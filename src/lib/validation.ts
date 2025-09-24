import { z } from "zod"
import DOMPurify from "dompurify"

// Input validation utilities
export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

// Common validation patterns
const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  ETHEREUM_ADDRESS: /^0x[a-fA-F0-9]{40}$/,
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
  SAFE_STRING: /^[a-zA-Z0-9\s\-_.,'!?]+$/
}

// Validation functions
export const validators = {
  required: (value: any, message = 'This field is required') => {
    if (value === null || value === undefined || value === '') {
      throw new ValidationError(message)
    }
    return value
  },

  string: (value: any, minLength = 0, maxLength = 1000) => {
    if (typeof value !== 'string') {
      throw new ValidationError('Must be a string')
    }
    if (value.length < minLength) {
      throw new ValidationError(`Must be at least ${minLength} characters`)
    }
    if (value.length > maxLength) {
      throw new ValidationError(`Must be no more than ${maxLength} characters`)
    }
    return value
  },

  number: (value: any, min?: number, max?: number) => {
    const num = Number(value)
    if (isNaN(num)) {
      throw new ValidationError('Must be a valid number')
    }
    if (min !== undefined && num < min) {
      throw new ValidationError(`Must be at least ${min}`)
    }
    if (max !== undefined && num > max) {
      throw new ValidationError(`Must be no more than ${max}`)
    }
    return num
  },

  email: (value: string) => {
    if (!PATTERNS.EMAIL.test(value)) {
      throw new ValidationError('Must be a valid email address')
    }
    return value
  },

  uuid: (value: string) => {
    if (!PATTERNS.UUID.test(value)) {
      throw new ValidationError('Must be a valid UUID')
    }
    return value
  },

  ethereumAddress: (value: string) => {
    if (!PATTERNS.ETHEREUM_ADDRESS.test(value)) {
      throw new ValidationError('Must be a valid Ethereum address')
    }
    return value
  },

  username: (value: string) => {
    if (!PATTERNS.USERNAME.test(value)) {
      throw new ValidationError('Username must be 3-20 characters, letters, numbers, and underscores only')
    }
    return value
  },

  safeString: (value: string) => {
    if (!PATTERNS.SAFE_STRING.test(value)) {
      throw new ValidationError('Contains invalid characters')
    }
    return value
  },

  rating: (value: number) => {
    return validators.number(value, 1, 5)
  },

  amount: (value: number) => {
    return validators.number(value, 0.000001, 1000000)
  },

  price: (value: number) => {
    return validators.number(value, 0.000001, 10000)
  }
}

// Sanitization functions
export const sanitizers = {
  trim: (value: string) => value.trim(),
  
  lowercase: (value: string) => value.toLowerCase(),
  
  removeHtml: (value: string) => {
    return value.replace(/<[^>]*>/g, '')
  },
  
  alphanumeric: (value: string) => {
    return value.replace(/[^a-zA-Z0-9]/g, '')
  },
  
  currency: (value: number) => {
    return Math.round(value * 1000000) / 1000000 // 6 decimal places
  }
}

// Validation schema builder
export class ValidationSchema {
  private rules: Array<{ field: string; validator: (value: any) => any }> = []
  
  field(name: string, validator: (value: any) => any) {
    this.rules.push({ field: name, validator })
    return this
  }
  
  validate(data: Record<string, any>) {
    const result: Record<string, any> = {}
    const errors: Record<string, string> = {}
    
    for (const rule of this.rules) {
      try {
        result[rule.field] = rule.validator(data[rule.field])
      } catch (error) {
        if (error instanceof ValidationError) {
          errors[rule.field] = error.message
        } else {
          errors[rule.field] = 'Validation failed'
        }
      }
    }
    
    if (Object.keys(errors).length > 0) {
      const error = new Error('Validation failed')
      ;(error as any).errors = errors
      throw error
    }
    
    return result
  }
}

// Helper functions for tests
export const validateEmail = (email: string): boolean => {
  return PATTERNS.EMAIL.test(email)
}

export const validateWalletAddress = (address: string): boolean => {
  // Ethereum address validation
  const ethRegex = /^0x[a-fA-F0-9]{40}$/;
  // Solana address validation (base58, 32-44 characters)
  const solRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  
  return ethRegex.test(address) || solRegex.test(address);
}

export const validateTradeAmount = (balance: number, amount: number): boolean => {
  return amount > 0 && amount <= balance
}

export const sanitizeInput = (input: string | null | undefined): string => {
  if (!input) return ''
  
  // Enhanced XSS protection
  let sanitized = input
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/<[^>]*>/g, ''); // Remove all HTML tags
  
  // SQL injection protection
  if (/(\bunion\b|\bselect\b|\binsert\b|\bupdate\b|\bdelete\b|\bdrop\b|\bcreate\b|\balter\b)\s+/i.test(sanitized)) {
    sanitized = sanitized.replace(/(\bunion\b|\bselect\b|\binsert\b|\bupdate\b|\bdelete\b|\bdrop\b|\bcreate\b|\balter\b)\s+/gi, '');
  }
  
  return sanitized;
}

// Pre-built schemas for common use cases
export const schemas = {
  agentRating: new ValidationSchema()
    .field('rating', (v) => validators.rating(validators.required(v)))
    .field('review', (v) => v ? validators.string(validators.safeString(v), 10, 500) : undefined)
    .field('agentId', (v) => validators.uuid(validators.required(v))),
    
  comment: new ValidationSchema()
    .field('content', (v) => validators.string(validators.safeString(validators.required(v)), 5, 1000))
    .field('agentId', (v) => validators.uuid(validators.required(v))),
    
  tradingOrder: new ValidationSchema()
    .field('agentId', (v) => validators.uuid(validators.required(v)))
    .field('type', (v) => {
      const type = validators.required(v)
      if (!['market', 'limit', 'stop_loss', 'take_profit'].includes(type)) {
        throw new ValidationError('Invalid order type')
      }
      return type
    })
    .field('side', (v) => {
      const side = validators.required(v)
      if (!['buy', 'sell'].includes(side)) {
        throw new ValidationError('Invalid order side')
      }
      return side
    })
    .field('amount', (v) => validators.amount(validators.required(v)))
    .field('price', (v) => v ? validators.price(v) : undefined)
}

export const tradeOrderSchema = schemas.tradingOrder

// Zod schemas for enhanced validation
export const emailSchema = z.string().email("Please enter a valid email address")

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")

export const agentNameSchema = z
  .string()
  .min(2, "Agent name must be at least 2 characters")
  .max(50, "Agent name must be less than 50 characters")
  .regex(/^[a-zA-Z0-9\s-_]+$/, "Agent name can only contain letters, numbers, spaces, hyphens, and underscores")

export const agentSymbolSchema = z
  .string()
  .min(2, "Symbol must be at least 2 characters")
  .max(10, "Symbol must be less than 10 characters")
  .regex(/^[A-Z0-9]+$/, "Symbol can only contain uppercase letters and numbers")

export const descriptionSchema = z
  .string()
  .max(500, "Description must be less than 500 characters")
  .optional()

export const priceSchema = z
  .number()
  .positive("Price must be positive")
  .max(1000000, "Price cannot exceed 1,000,000")

export const searchQuerySchema = z
  .string()
  .max(100, "Search query must be less than 100 characters")
  .regex(/^[a-zA-Z0-9\s\-_.]+$/, "Search query contains invalid characters")

// Agent creation form schema
export const createAgentSchema = z.object({
  name: agentNameSchema,
  symbol: agentSymbolSchema,
  description: descriptionSchema,
  initialPrice: priceSchema,
  chain: z.enum(["ethereum", "polygon", "arbitrum", "optimism"], {
    errorMap: () => ({ message: "Please select a valid chain" })
  }),
  tradingStrategy: z.enum(["conservative", "moderate", "aggressive"], {
    errorMap: () => ({ message: "Please select a trading strategy" })
  })
})

// Enhanced sanitization functions
export const sanitizeHtml = (input: string): string => {
  if (typeof window !== 'undefined' && DOMPurify.isSupported) {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: []
    })
  }
  // Fallback for server-side or when DOMPurify is not available
  return input.replace(/<[^>]*>/g, '')
}

export const sanitizeSearchQuery = (query: string): string => {
  return query
    .replace(/[^\w\s\-_.]/g, '')
    .trim()
    .slice(0, 100)
}

export const sanitizeAgentName = (name: string): string => {
  return name
    .replace(/[^\w\s\-_]/g, '')
    .trim()
    .slice(0, 50)
}

// Export type inference helpers
export type CreateAgentFormData = z.infer<typeof createAgentSchema>