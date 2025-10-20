import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Client } from "https://esm.sh/@mtkruto/mtkruto@0.1.163";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code } = await req.json();
    
    console.log('Verifying code');
    
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
    
    // Fetch stored credentials
    const { data: credentials, error: credError } = await supabase
      .from('telegram_user_credentials')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (credError || !credentials) {
      throw new Error('No credentials found. Start authentication first.');
    }
    
    console.log('Credentials loaded');
    
    // Initialize client with stored credentials
    const client = new Client({
      apiId: parseInt(credentials.api_id_encrypted),
      apiHash: credentials.api_hash_encrypted,
    });
    
    await client.connect();
    console.log('Client connected');
    
    // Import the partial auth string
    if (credentials.session_string_encrypted) {
      await client.importAuthString(credentials.session_string_encrypted);
    }
    
    // Complete sign in with code
    await client.signIn(code);
    console.log('Signed in successfully');
    
    // Get user info
    const me = await client.getMe();
    console.log('Got user info:', me.firstName);
    
    // Export new auth string with full session
    const newAuthString = await client.exportAuthString();
    
    // Update credentials with authenticated session
    const { error: updateError } = await supabase
      .from('telegram_user_credentials')
      .update({
        session_string_encrypted: newAuthString,
        is_authenticated: true,
        telegram_user_id: me.id.toString(),
        telegram_username: me.username || null,
        telegram_first_name: me.firstName,
        last_validated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);
    
    if (updateError) {
      console.error('Error updating credentials:', updateError);
      throw updateError;
    }
    
    console.log('Authentication completed successfully');
    
    return new Response(
      JSON.stringify({ 
        success: true,
        user: {
          username: me.username,
          firstName: me.firstName,
          id: me.id
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Verification error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
