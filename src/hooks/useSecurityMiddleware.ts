import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SecurityCheckResult {
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
}

export const useSecurityMiddleware = () => {
  const [isChecking, setIsChecking] = useState(false);
  const { user } = useAuth();

  const checkSecurity = useCallback(async (
    endpoint: string,
    contentToValidate?: string
  ): Promise<SecurityCheckResult> => {
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
        console.error('Security check error:', error);
        return {
          allowed: false,
          reason: 'security_check_failed'
        };
      }

      return data as SecurityCheckResult;
    } catch (error) {
      console.error('Security middleware error:', error);
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

  return {
    checkSecurity,
    withSecurityCheck,
    isChecking
  };
};