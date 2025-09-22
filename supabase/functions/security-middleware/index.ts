import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SecurityCheckRequest {
  endpoint: string;
  identifier?: string;
  userAgent?: string;
  contentToValidate?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { endpoint, identifier, userAgent, contentToValidate }: SecurityCheckRequest = await req.json();
    
    // Get client IP
    const clientIP = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    'unknown';

    const rateLimitIdentifier = identifier || clientIP;

    // Check rate limits based on endpoint type
    let maxRequests = 100;
    let windowMinutes = 15;
    
    switch (endpoint) {
      case 'trading':
        maxRequests = 10;
        windowMinutes = 1;
        break;
      case 'auth':
        maxRequests = 5;
        windowMinutes = 5;
        break;
      case 'social':
        maxRequests = 30;
        windowMinutes = 1;
        break;
      case 'admin':
        maxRequests = 20;
        windowMinutes = 5;
        break;
    }

    // Check rate limit using database function
    const { data: rateLimitCheck, error: rateLimitError } = await supabase
      .rpc('check_rate_limit', {
        identifier_param: rateLimitIdentifier,
        endpoint_param: endpoint,
        max_requests: maxRequests,
        window_minutes: windowMinutes
      });

    if (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError);
      return new Response(JSON.stringify({ 
        allowed: false, 
        reason: 'rate_limit_check_failed' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    if (!rateLimitCheck) {
      // Log security event for rate limit exceeded
      await supabase.from('security_audit_log').insert({
        action: 'rate_limit_exceeded',
        resource: endpoint,
        details: {
          identifier: rateLimitIdentifier,
          max_requests: maxRequests,
          window_minutes: windowMinutes,
          user_agent: userAgent
        },
        ip_address: clientIP,
        user_agent: userAgent
      });

      return new Response(JSON.stringify({ 
        allowed: false, 
        reason: 'rate_limit_exceeded',
        retryAfter: windowMinutes * 60
      }), {
        status: 429,
        headers: { 
          'Content-Type': 'application/json',
          'Retry-After': (windowMinutes * 60).toString(),
          ...corsHeaders 
        }
      });
    }

    // Validate content if provided
    let contentValid = true;
    if (contentToValidate) {
      const { data: validationResult, error: validationError } = await supabase
        .rpc('validate_input_security', {
          input_text: contentToValidate,
          max_length: 10000,
          allow_html: false
        });

      if (validationError || !validationResult) {
        contentValid = false;
        
        // Log security event for invalid content
        await supabase.from('security_audit_log').insert({
          action: 'invalid_content_blocked',
          resource: endpoint,
          details: {
            identifier: rateLimitIdentifier,
            content_length: contentToValidate.length,
            user_agent: userAgent
          },
          ip_address: clientIP,
          user_agent: userAgent
        });
      }
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /bot|crawler|spider|scraper/i,
      /curl|wget|python-requests|node-fetch/i
    ];

    const isSuspicious = userAgent && suspiciousPatterns.some(pattern => 
      pattern.test(userAgent)
    );

    if (isSuspicious) {
      // Log suspicious activity
      await supabase.from('security_audit_log').insert({
        action: 'suspicious_user_agent',
        resource: endpoint,
        details: {
          identifier: rateLimitIdentifier,
          user_agent: userAgent,
          endpoint: endpoint
        },
        ip_address: clientIP,
        user_agent: userAgent
      });

      // Allow but with reduced rate limits
      maxRequests = Math.floor(maxRequests / 2);
    }

    const result = {
      allowed: contentValid,
      reason: contentValid ? 'allowed' : 'invalid_content',
      rateLimitStatus: {
        remaining: maxRequests - 1,
        resetTime: Date.now() + (windowMinutes * 60 * 1000)
      },
      securityFlags: {
        suspicious: isSuspicious,
        contentFiltered: !contentValid
      }
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error: any) {
    console.error('Security middleware error:', error);
    return new Response(JSON.stringify({ 
      allowed: false, 
      reason: 'security_check_failed',
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
};

serve(handler);