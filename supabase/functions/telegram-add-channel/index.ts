import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Client } from "jsr:@mtkruto/mtkruto@0.63";
import { decrypt } from "../_shared/encryption.ts";
import { checkRateLimit } from "../_shared/rateLimiter.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function getTelegramClient(userId: string, supabase: any) {
  const { data: credentials } = await supabase
    .from('telegram_user_credentials')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (!credentials || !credentials.is_authenticated) {
    throw new Error('User not authenticated with Telegram');
  }
  
  const client = new Client({
    apiId: parseInt(await decrypt(credentials.api_id_encrypted)),
    apiHash: await decrypt(credentials.api_hash_encrypted),
  });
  
  await client.connect();
  await client.importAuthString(await decrypt(credentials.session_string_encrypted));
  
  return client;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { channelUsername, watchlistId } = await req.json();
    
    console.log('Adding channel:', channelUsername);
    
    // Rate limiting - 10 channel operations per minute
    const rateCheck = checkRateLimit(`telegram-channel:${channelUsername}`, { maxRequests: 10, windowMinutes: 1 });
    if (!rateCheck.allowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded', retryAfter: rateCheck.retryAfter }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }
    
    // Get Telegram client
    const client = await getTelegramClient(user.id, supabase);
    console.log('Client initialized');
    
    try {
      // Resolve channel
      const cleanUsername = channelUsername.replace('@', '');
      const chat = await client.getChat(cleanUsername);
      
      if (!chat) {
        throw new Error('Channel not found');
      }
      
      console.log('Channel found:', chat.title);
      
      // Check if user is a member by trying to get messages
      let isUserMember = false;
      let membershipError = null;
      try {
        await client.getHistory(chat.id, { limit: 1 });
        isUserMember = true;
        console.log('User is a member');
      } catch (error) {
        membershipError = error.message;
        if (error.message.includes('CHANNEL_PRIVATE') || error.message.includes('forbidden')) {
          console.log('User not a member - needs to join:', error.message);
          isUserMember = false;
        } else {
          // Other errors should be thrown (network, API issues)
          console.error('Unexpected error checking membership:', error);
          throw new Error(`Failed to verify membership: ${error.message}`);
        }
      }
      
      // Store channel
      const { data: newChannel, error } = await supabase
        .from('telegram_kol_channels')
        .insert({
          watchlist_id: watchlistId,
          channel_username: cleanUsername,
          channel_id: chat.id.toString(),
          channel_title: chat.title,
          channel_type: chat.type,
          is_user_member: isUserMember,
          added_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error storing channel:', error);
        throw error;
      }
      
      console.log('Channel stored successfully');
      
      return new Response(
        JSON.stringify({ 
          success: true,
          channel: {
            title: chat.title,
            username: cleanUsername,
            isUserMember,
            message: isUserMember 
              ? 'Channel added successfully' 
              : 'Channel added but you need to join it first in Telegram'
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } finally {
      await client.disconnect();
      console.log('Client disconnected');
    }
    
  } catch (error) {
    console.error('Add channel error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
