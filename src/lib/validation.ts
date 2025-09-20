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
  return PATTERNS.ETHEREUM_ADDRESS.test(address)
}

export const validateTradeAmount = (balance: number, amount: number): boolean => {
  return amount > 0 && amount <= balance
}

export const sanitizeInput = (input: string | null | undefined): string => {
  if (!input) return ''
  return input.replace(/<[^>]*>/g, '') // Simple HTML removal
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