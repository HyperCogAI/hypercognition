import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Client } from "jsr:@mtkruto/mtkruto@0.63";

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
    apiId: parseInt(credentials.api_id_encrypted),
    apiHash: credentials.api_hash_encrypted,
  });
  
  await client.connect();
  await client.importAuthString(credentials.session_string_encrypted);
  
  return client;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { channelUsername, watchlistId } = await req.json();
    
    console.log('Adding channel:', channelUsername);
    
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
    
    // Resolve channel
    const cleanUsername = channelUsername.replace('@', '');
    const chat = await client.getChat(cleanUsername);
    
    if (!chat) {
      throw new Error('Channel not found');
    }
    
    console.log('Channel found:', chat.title);
    
    // Check if user is a member by trying to get messages
    let isUserMember = false;
    try {
      await client.getHistory(chat.id, { limit: 1 });
      isUserMember = true;
    } catch (error) {
      console.log('User not a member:', error.message);
      isUserMember = false;
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
    
  } catch (error) {
    console.error('Add channel error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
