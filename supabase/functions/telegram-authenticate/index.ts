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
    const { apiId, apiHash, phoneNumber } = await req.json();
    
    console.log('Starting Telegram authentication for phone:', phoneNumber);
    
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
    
    const session = new StringSession('');
    const client = new TelegramClient(session, parseInt(apiId), apiHash, {
      connectionRetries: 5,
    });
    
    await client.connect();
    
    const { phoneCodeHash } = await client.sendCode({
      apiId: parseInt(apiId),
      apiHash: apiHash,
    }, phoneNumber);
    
    const sessionString = session.save() as string;
    
    await supabase.from('telegram_user_credentials').upsert({
      user_id: user.id,
      api_id_encrypted: apiId,
      api_hash_encrypted: apiHash,
      phone_number_encrypted: phoneNumber,
      session_string_encrypted: sessionString,
      phone_code_hash: phoneCodeHash,
      is_authenticated: false,
    });
    
    console.log('Authentication code sent successfully');
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Code sent to your Telegram app',
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
