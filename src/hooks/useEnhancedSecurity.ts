import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { EnhancedSecurityValidator, SecurityValidationResult } from '@/lib/enhancedSecurity';

interface EnhancedSecurityCheckResult {
  allowed: boolean;
  reason?: string;
  retryAfter?: number;
  rateLimitStatus?: {
    remaining: number;
    resetTime: number;
  };
  securityFlags?: {
    suspicious: boolean;
    contentFiltered: boolean;
  };
  sanitizedContent?: string;
}

export const useEnhancedSecurity = () => {
  const [isChecking, setIsChecking] = useState(false);
  const { user } = useAuth();

  const validateInput = useCallback((input: string, options?: {
    maxLength?: number;
    allowHtml?: boolean;
    strictMode?: boolean;
  }): SecurityValidationResult => {
    return EnhancedSecurityValidator.validateAndSanitize(input, options);
  }, []);

  const validatePassword = useCallback((password: string) => {
    return EnhancedSecurityValidator.validatePassword(password);
  }, []);

  const validateEmail = useCallback((email: string) => {
    return EnhancedSecurityValidator.validateEmail(email);
  }, []);

  const validateWalletAddress = useCallback((address: string) => {
    return EnhancedSecurityValidator.validateWalletAddress(address);
  }, []);

  const generateSecureToken = useCallback((length?: number) => {
    return EnhancedSecurityValidator.generateSecureToken(length);
  }, []);

  const checkSecurity = useCallback(async (
    endpoint: string,
    contentToValidate?: string
  ): Promise<EnhancedSecurityCheckResult> => {
    setIsChecking(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('security-middleware', {
        body: {
          endpoint,
          identifier: user?.id,
          userAgent: navigator.userAgent,
          contentToValidate
        }
      });

      if (error) {
        console.error('Enhanced security check error:', error);
        return {
          allowed: false,
          reason: 'security_check_failed'
        };
      }

      return data as EnhancedSecurityCheckResult;
    } catch (error) {
      console.error('Enhanced security middleware error:', error);
      return {
        allowed: false,
        reason: 'network_error'
      };
    } finally {
      setIsChecking(false);
    }
  }, [user?.id]);

  const withSecurityCheck = useCallback(async <T>(
    endpoint: string,
    operation: () => Promise<T>,
    contentToValidate?: string
  ): Promise<T> => {
    const securityResult = await checkSecurity(endpoint, contentToValidate);
    
    if (!securityResult.allowed) {
      const error = new Error(`Security check failed: ${securityResult.reason}`);
      if (securityResult.retryAfter) {
        (error as any).retryAfter = securityResult.retryAfter;
      }
      throw error;
    }

    return await operation();
  }, [checkSecurity]);

  const validateAndSanitizeUserInput = useCallback(async (
    input: string,
    endpoint: string = 'general'
  ): Promise<{ valid: boolean; sanitized: string; errors: string[] }> => {
    // Client-side validation first
    const clientValidation = validateInput(input, {
      maxLength: 1000,
      allowHtml: false,
      strictMode: true
    });

    if (!clientValidation.valid) {
      return {
        valid: false,
        sanitized: clientValidation.sanitized,
        errors: clientValidation.errors
      };
    }

    // Server-side security check
    try {
      const securityCheck = await checkSecurity(endpoint, input);
      
      return {
        valid: securityCheck.allowed,
        sanitized: securityCheck.sanitizedContent || clientValidation.sanitized,
        errors: securityCheck.allowed ? [] : [securityCheck.reason || 'Security validation failed']
      };
    } catch (error) {
      return {
        valid: false,
        sanitized: clientValidation.sanitized,
        errors: ['Security check failed']
      };
    }
  }, [validateInput, checkSecurity]);

  return {
    // Input validation
    validateInput,
    validatePassword,
    validateEmail,
    validateWalletAddress,
    
    // Security utilities
    generateSecureToken,
    
    // Security checks
    checkSecurity,
    withSecurityCheck,
    validateAndSanitizeUserInput,
    
    // State
    isChecking
  };
};