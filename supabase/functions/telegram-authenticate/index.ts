import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Client } from "jsr:@mtkruto/mtkruto@0.63";
import { encrypt } from "../_shared/encryption.ts";
import { checkRateLimit } from "../_shared/rateLimiter.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { apiId, apiHash, phoneNumber } = await req.json();
    
    console.log('Starting Telegram authentication for phone:', phoneNumber.slice(-4));
    
    // Rate limiting - 3 attempts per 5 minutes
    const rateCheck = checkRateLimit(`telegram-auth:${phoneNumber}`, { maxRequests: 3, windowMinutes: 5 });
    if (!rateCheck.allowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.', retryAfter: rateCheck.retryAfter }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }
    
    console.log('User authenticated:', user.id);
    
    // Initialize MTKruto client
    const client = new Client({
      apiId: parseInt(apiId),
      apiHash: apiHash,
    });
    
    let phoneCodeHash: string;
    
    try {
      await client.connect();
      console.log('Client connected');
      
      // Send code and capture phone_code_hash
      const result = await client.sendCode(phoneNumber);
      phoneCodeHash = result.phoneCodeHash;
      console.log('Code sent successfully');
      
      // Export auth string for later use
      const authString = await client.exportAuthString();
      console.log('Auth string exported');
      
      // Encrypt sensitive data
      const encryptedApiId = await encrypt(apiId);
      const encryptedApiHash = await encrypt(apiHash);
      const encryptedPhone = await encrypt(phoneNumber);
      const encryptedSession = await encrypt(authString);
      const encryptedCodeHash = await encrypt(phoneCodeHash);
      
      // Store credentials
      const { error: insertError } = await supabase
        .from('telegram_user_credentials')
        .upsert({
          user_id: user.id,
          api_id_encrypted: encryptedApiId,
          api_hash_encrypted: encryptedApiHash,
          phone_number_encrypted: encryptedPhone,
          session_string_encrypted: encryptedSession,
          phone_code_hash: encryptedCodeHash,
          is_authenticated: false,
        }, {
          onConflict: 'user_id'
        });
      
      if (insertError) {
        console.error('Error storing credentials:', insertError);
        throw insertError;
      }
      
      console.log('Credentials stored successfully');
    } finally {
      await client.disconnect();
      console.log('Client disconnected');
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Code sent to your phone',
        phoneNumber: phoneNumber.slice(-4)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Authentication error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
