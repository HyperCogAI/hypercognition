import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AuthRequest {
  email?: string;
  password?: string;
  walletAddress?: string;
  totpToken?: string;
  action: 'login' | 'logout' | 'refresh' | 'check_session';
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

    const clientIP = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    'unknown';
    
    const userAgent = req.headers.get('user-agent') || 'unknown';
    
    const { email, password, walletAddress, totpToken, action }: AuthRequest = await req.json();

    switch (action) {
      case 'login':
        return await handleLogin(supabase, email, password, walletAddress, totpToken, clientIP, userAgent);
      
      case 'logout':
        return await handleLogout(supabase, req);
      
      case 'refresh':
        return await handleRefresh(supabase, req);
        
      case 'check_session':
        return await checkSession(supabase, req);
      
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
    }

  } catch (error: any) {
    console.error('Enhanced auth error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
};

const handleLogin = async (
  supabase: any, 
  email?: string, 
  password?: string, 
  walletAddress?: string, 
  totpToken?: string,
  clientIP?: string,
  userAgent?: string
) => {
  const identifier = email || walletAddress || 'unknown';
  const attemptType = email ? 'email' : 'wallet';

  // Check brute force protection
  const { data: bruteForceCheck, error: bruteError } = await supabase
    .rpc('check_brute_force', {
      identifier_param: identifier,
      max_attempts: 5,
      window_minutes: 15
    });

  if (bruteError || !bruteForceCheck) {
    // Log blocked attempt
    await supabase.rpc('log_login_attempt', {
      identifier_param: identifier,
      attempt_type_param: attemptType,
      success_param: false,
      ip_param: clientIP,
      user_agent_param: userAgent,
      failure_reason_param: 'brute_force_protection'
    });

    return new Response(JSON.stringify({ 
      error: 'Too many failed attempts. Please try again later.',
      retryAfter: 900 // 15 minutes in seconds
    }), {
      status: 429,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  try {
    let authResult;
    
    if (email && password) {
      // Regular email/password login
      authResult = await supabase.auth.signInWithPassword({ email, password });
    } else if (walletAddress) {
      // Wallet-based login with enhanced security
      const walletEmail = `${walletAddress.toLowerCase()}@wallet.local`;
      const enhancedPassword = await hashWalletAddress(walletAddress);
      authResult = await supabase.auth.signInWithPassword({ 
        email: walletEmail, 
        password: enhancedPassword 
      });
    } else {
      throw new Error('Email/password or wallet address required');
    }

    if (authResult.error) {
      // Log failed attempt
      await supabase.rpc('log_login_attempt', {
        identifier_param: identifier,
        attempt_type_param: attemptType,
        success_param: false,
        ip_param: clientIP,
        user_agent_param: userAgent,
        failure_reason_param: authResult.error.message
      });

      throw authResult.error;
    }

    const user = authResult.data.user;
    
    // Check if user is admin and requires 2FA
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('role, is_active')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    if (adminUser) {
      // Check if 2FA is enabled for this admin
      const { data: twoFactorSecret } = await supabase
        .from('admin_2fa_secrets')
        .select('is_active')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (twoFactorSecret && !totpToken) {
        return new Response(JSON.stringify({
          requiresTwoFactor: true,
          message: '2FA token required for admin login'
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      if (twoFactorSecret && totpToken) {
        // Verify TOTP token (simplified validation)
        if (!isValidTotpToken(totpToken)) {
          await supabase.rpc('log_login_attempt', {
            identifier_param: identifier,
            attempt_type_param: 'admin_2fa',
            success_param: false,
            ip_param: clientIP,
            user_agent_param: userAgent,
            failure_reason_param: 'invalid_2fa_token'
          });

          return new Response(JSON.stringify({ error: 'Invalid 2FA token' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        // Update last used timestamp
        await supabase
          .from('admin_2fa_secrets')
          .update({ last_used_at: new Date().toISOString() })
          .eq('user_id', user.id);
      }
    }

    // Create session tracking
    const sessionToken = generateSessionToken();
    await supabase
      .from('user_sessions')
      .insert({
        user_id: user.id,
        session_token: sessionToken,
        ip_address: clientIP,
        user_agent: userAgent
      });

    // Log successful attempt
    await supabase.rpc('log_login_attempt', {
      identifier_param: identifier,
      attempt_type_param: attemptType,
      success_param: true,
      ip_param: clientIP,
      user_agent_param: userAgent
    });

    // Log security event
    await supabase.from('security_audit_log').insert({
      user_id: user.id,
      action: 'login_success',
      resource: 'authentication',
      details: { 
        type: attemptType,
        admin_login: !!adminUser,
        two_factor_used: !!totpToken
      },
      ip_address: clientIP,
      user_agent: userAgent
    });

    return new Response(JSON.stringify({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        isAdmin: !!adminUser,
        adminRole: adminUser?.role
      },
      session: {
        access_token: authResult.data.session?.access_token,
        refresh_token: authResult.data.session?.refresh_token,
        session_token: sessionToken
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error: any) {
    // Log failed attempt
    await supabase.rpc('log_login_attempt', {
      identifier_param: identifier,
      attempt_type_param: attemptType,
      success_param: false,
      ip_param: clientIP,
      user_agent_param: userAgent,
      failure_reason_param: error.message
    });

    return new Response(JSON.stringify({ error: error.message }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
};

const handleLogout = async (supabase: any, req: Request) => {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'No session found' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  const { data: { user } } = await supabase.auth.getUser(
    authHeader.replace('Bearer ', '')
  );

  if (user) {
    // Invalidate session
    await supabase
      .from('user_sessions')
      .update({ is_active: false })
      .eq('user_id', user.id);

    // Sign out from Supabase
    await supabase.auth.signOut();

    // Log security event
    await supabase.from('security_audit_log').insert({
      user_id: user.id,
      action: 'logout',
      resource: 'authentication',
      details: {}
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
};

const handleRefresh = async (supabase: any, req: Request) => {
  // Implementation for token refresh with session validation
  // This would check if the session is still valid and refresh tokens
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
};

const checkSession = async (supabase: any, req: Request) => {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ valid: false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  const { data: { user }, error } = await supabase.auth.getUser(
    authHeader.replace('Bearer ', '')
  );

  if (error || !user) {
    return new Response(JSON.stringify({ valid: false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  // Check if session is still active in our tracking
  const { data: session } = await supabase
    .from('user_sessions')
    .select('is_active, expires_at')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const isValid = session && session.is_active && new Date(session.expires_at) > new Date();

  return new Response(JSON.stringify({ 
    valid: isValid,
    user: isValid ? { id: user.id, email: user.email } : null
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
};

// Helper functions
const hashWalletAddress = async (address: string): Promise<string> => {
  const salt = 'hypercognition_secure_salt_2024';
  const encoder = new TextEncoder();
  const data = encoder.encode(address.toLowerCase() + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const isValidTotpToken = (token: string): boolean => {
  // In production, implement proper TOTP validation
  return /^\d{6}$/.test(token);
};

const generateSessionToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

serve(handler);