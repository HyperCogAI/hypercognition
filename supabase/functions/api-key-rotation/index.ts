import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ApiKeyRotationRequest {
  action: 'rotate' | 'revoke' | 'list_keys' | 'generate_new';
  keyId?: string;
  permissions?: string[];
  expiresIn?: number; // hours
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

    // Check if user has API key management permissions
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('role, permissions, is_active')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    if (!adminUser) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const { action, keyId, permissions, expiresIn }: ApiKeyRotationRequest = await req.json();

    switch (action) {
      case 'generate_new':
        return await generateNewApiKey(supabase, user.id, permissions, expiresIn);
      
      case 'rotate':
        if (!keyId) {
          return new Response(JSON.stringify({ error: 'Key ID required for rotation' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
        return await rotateApiKey(supabase, user.id, keyId);
      
      case 'revoke':
        if (!keyId) {
          return new Response(JSON.stringify({ error: 'Key ID required for revocation' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
        return await revokeApiKey(supabase, user.id, keyId);
      
      case 'list_keys':
        return await listApiKeys(supabase, user.id);
      
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
    }

  } catch (error: any) {
    console.error('API key rotation error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
};

const generateNewApiKey = async (supabase: any, userId: string, permissions: string[] = [], expiresIn?: number) => {
  // Generate secure API key
  const keyPrefix = 'hc_' + generateRandomString(8);
  const keySecret = generateRandomString(32);
  const fullKey = `${keyPrefix}.${keySecret}`;
  
  // Calculate expiration date
  const expiresAt = expiresIn 
    ? new Date(Date.now() + expiresIn * 60 * 60 * 1000).toISOString()
    : null;

  // Store encrypted key in database
  const { data, error } = await supabase
    .from('api_keys')
    .insert({
      created_by: userId,
      organization_id: await getOrganizationId(supabase, userId),
      key_prefix: keyPrefix,
      permissions: permissions,
      expires_at: expiresAt,
      is_active: true,
      name: `API Key ${new Date().toISOString().split('T')[0]}`
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create API key:', error);
    return new Response(JSON.stringify({ error: 'Failed to create API key' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  // Log security event
  await supabase.from('security_audit_log').insert({
    user_id: userId,
    action: 'api_key_generated',
    resource: 'api_keys',
    details: { 
      key_id: data.id,
      permissions,
      expires_at: expiresAt
    }
  });

  return new Response(JSON.stringify({
    success: true,
    key: fullKey, // Only returned once during creation
    keyInfo: {
      id: data.id,
      prefix: keyPrefix,
      permissions,
      expires_at: expiresAt,
      created_at: data.created_at
    }
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
};

const rotateApiKey = async (supabase: any, userId: string, keyId: string) => {
  // Get existing key
  const { data: existingKey, error: fetchError } = await supabase
    .from('api_keys')
    .select('*')
    .eq('id', keyId)
    .eq('created_by', userId)
    .single();

  if (fetchError || !existingKey) {
    return new Response(JSON.stringify({ error: 'API key not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  // Generate new key with same permissions
  const keyPrefix = 'hc_' + generateRandomString(8);
  const keySecret = generateRandomString(32);
  const fullKey = `${keyPrefix}.${keySecret}`;

  // Update existing key
  const { data, error } = await supabase
    .from('api_keys')
    .update({
      key_prefix: keyPrefix,
      last_used_at: null // Reset usage tracking
    })
    .eq('id', keyId)
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: 'Failed to rotate API key' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  // Log security event
  await supabase.from('security_audit_log').insert({
    user_id: userId,
    action: 'api_key_rotated',
    resource: 'api_keys',
    details: { 
      key_id: keyId,
      old_prefix: existingKey.key_prefix,
      new_prefix: keyPrefix
    }
  });

  return new Response(JSON.stringify({
    success: true,
    key: fullKey, // Only returned once during rotation
    keyInfo: {
      id: data.id,
      prefix: keyPrefix,
      permissions: data.permissions,
      expires_at: data.expires_at
    }
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
};

const revokeApiKey = async (supabase: any, userId: string, keyId: string) => {
  const { error } = await supabase
    .from('api_keys')
    .update({ is_active: false })
    .eq('id', keyId)
    .eq('created_by', userId);

  if (error) {
    return new Response(JSON.stringify({ error: 'Failed to revoke API key' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  // Log security event
  await supabase.from('security_audit_log').insert({
    user_id: userId,
    action: 'api_key_revoked',
    resource: 'api_keys',
    details: { key_id: keyId }
  });

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
};

const listApiKeys = async (supabase: any, userId: string) => {
  const { data: keys, error } = await supabase
    .from('api_keys')
    .select('id, name, key_prefix, permissions, expires_at, last_used_at, is_active, created_at')
    .eq('created_by', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch API keys' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  return new Response(JSON.stringify({
    success: true,
    keys: keys || []
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
};

// Helper functions
const generateRandomString = (length: number): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const getOrganizationId = async (supabase: any, userId: string): Promise<string | null> => {
  const { data } = await supabase
    .from('team_members')
    .select('organization_id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle();
  
  return data?.organization_id || null;
};

serve(handler);