import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { TelegramClient } from "npm:telegram@2.24.19";
import { StringSession } from "npm:telegram@2.24.19/sessions";
import { Api } from "npm:telegram@2.24.19";

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
    
    console.log('Verifying Telegram code');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    
    if (!user) {
      throw new Error('Unauthorized');
    }
    
    const { data: credentials } = await supabase
      .from('telegram_user_credentials')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (!credentials) {
      throw new Error('No credentials found. Start authentication first.');
    }
    
    const session = new StringSession(credentials.session_string_encrypted);
    const client = new TelegramClient(
      session, 
      parseInt(credentials.api_id_encrypted), 
      credentials.api_hash_encrypted, 
      { connectionRetries: 5 }
    );
    
    await client.connect();
    
    const result = await client.invoke(
      new Api.auth.SignIn({
        phoneNumber: credentials.phone_number_encrypted,
        phoneCodeHash: credentials.phone_code_hash,
        phoneCode: code,
      })
    );
    
    const newSessionString = session.save() as string;
    
    await supabase.from('telegram_user_credentials').update({
      session_string_encrypted: newSessionString,
      is_authenticated: true,
      telegram_user_id: result.user.id.toString(),
      telegram_username: result.user.username,
      telegram_first_name: result.user.firstName,
      last_validated_at: new Date().toISOString(),
    }).eq('user_id', user.id);
    
    console.log('Authentication successful');
    
    return new Response(
      JSON.stringify({ 
        success: true,
        user: {
          username: result.user.username,
          firstName: result.user.firstName,
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
