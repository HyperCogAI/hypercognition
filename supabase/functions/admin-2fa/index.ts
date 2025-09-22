import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { encode } from "https://deno.land/std@0.190.0/encoding/base32.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TwoFactorRequest {
  action: 'setup' | 'verify' | 'disable' | 'generate_backup_codes';
  token?: string;
  secret?: string;
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

    // Get user from authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Check if user is admin
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('role, is_active')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    if (!adminUser) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const { action, token, secret }: TwoFactorRequest = await req.json();

    switch (action) {
      case 'setup':
        return await setupTwoFactor(supabase, user.id);
      
      case 'verify':
        if (!token || !secret) {
          return new Response(JSON.stringify({ error: 'Token and secret required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
        return await verifyTwoFactor(supabase, user.id, token, secret);
      
      case 'disable':
        return await disableTwoFactor(supabase, user.id);
      
      case 'generate_backup_codes':
        return await generateBackupCodes(supabase, user.id);
      
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
    }

  } catch (error: any) {
    console.error('2FA error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
};

const setupTwoFactor = async (supabase: any, userId: string) => {
  // Generate a random secret (32 bytes = 256 bits)
  const secret = generateSecret();
  
  // Create QR code data
  const serviceName = 'HyperCognition';
  const accountName = `admin_${userId.substring(0, 8)}`;
  const otpAuthUrl = `otpauth://totp/${serviceName}:${accountName}?secret=${secret}&issuer=${serviceName}`;
  
  return new Response(JSON.stringify({
    success: true,
    secret,
    qrCodeUrl: otpAuthUrl,
    manualEntryKey: secret
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
};

const verifyTwoFactor = async (supabase: any, userId: string, token: string, secret: string) => {
  // In a real implementation, you would verify the TOTP token against the secret
  // For now, we'll do a simple validation and store the encrypted secret
  
  if (!isValidToken(token)) {
    return new Response(JSON.stringify({ error: 'Invalid token format' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  // Generate backup codes
  const backupCodes = generateBackupCodes();
  
  // Store encrypted secret and backup codes
  const { error } = await supabase
    .from('admin_2fa_secrets')
    .upsert({
      user_id: userId,
      secret_encrypted: await encryptSecret(secret),
      backup_codes: await encryptBackupCodes(backupCodes),
      is_active: true
    });

  if (error) {
    console.error('Failed to store 2FA secret:', error);
    return new Response(JSON.stringify({ error: 'Failed to enable 2FA' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  // Log security event
  await supabase.from('security_audit_log').insert({
    user_id: userId,
    action: '2fa_enabled',
    resource: 'authentication',
    details: { method: 'totp' }
  });

  return new Response(JSON.stringify({
    success: true,
    backupCodes: backupCodes
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
};

const disableTwoFactor = async (supabase: any, userId: string) => {
  const { error } = await supabase
    .from('admin_2fa_secrets')
    .update({ is_active: false })
    .eq('user_id', userId);

  if (error) {
    return new Response(JSON.stringify({ error: 'Failed to disable 2FA' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  // Log security event
  await supabase.from('security_audit_log').insert({
    user_id: userId,
    action: '2fa_disabled',
    resource: 'authentication',
    details: {}
  });

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
};

const generateBackupCodes = async (supabase: any, userId: string) => {
  const codes = generateBackupCodes();
  
  const { error } = await supabase
    .from('admin_2fa_secrets')
    .update({ backup_codes: await encryptBackupCodes(codes) })
    .eq('user_id', userId);

  if (error) {
    return new Response(JSON.stringify({ error: 'Failed to generate backup codes' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  return new Response(JSON.stringify({
    success: true,
    backupCodes: codes
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
};

// Helper functions
const generateSecret = (): string => {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return encode(bytes).replace(/=/g, '');
};

const generateBackupCodes = (): string[] => {
  const codes = [];
  for (let i = 0; i < 10; i++) {
    const code = Array.from({ length: 8 }, () => 
      Math.floor(Math.random() * 10)
    ).join('');
    codes.push(code);
  }
  return codes;
};

const isValidToken = (token: string): boolean => {
  return /^\d{6}$/.test(token);
};

const encryptSecret = async (secret: string): Promise<string> => {
  // In production, use proper encryption
  // For now, just base64 encode (NOT SECURE - implement proper encryption)
  return btoa(secret);
};

const encryptBackupCodes = async (codes: string[]): Promise<string[]> => {
  // In production, use proper encryption
  return codes.map(code => btoa(code));
};

serve(handler);