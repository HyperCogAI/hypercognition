import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { TelegramClient } from "npm:telegram@2.24.19";
import { StringSession } from "npm:telegram@2.24.19/sessions";

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
  
  const session = new StringSession(credentials.session_string_encrypted);
  const client = new TelegramClient(
    session, 
    parseInt(credentials.api_id_encrypted), 
    credentials.api_hash_encrypted,
    { connectionRetries: 5 }
  );
  
  await client.connect();
  return client;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { channelUsername, watchlistId } = await req.json();
    
    console.log('Adding Telegram channel:', channelUsername);
    
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
    
    const client = await getTelegramClient(user.id, supabase);
    
    const cleanUsername = channelUsername.replace('@', '');
    const channel = await client.getEntity(cleanUsername);
    
    if (!channel) {
      return new Response(
        JSON.stringify({ error: 'Channel not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    let isUserMember = false;
    try {
      await client.getMessages(channel, { limit: 1 });
      isUserMember = true;
    } catch (error) {
      console.log('User is not a member of this channel');
      isUserMember = false;
    }
    
    const { data: newChannel, error } = await supabase
      .from('telegram_kol_channels')
      .insert({
        watchlist_id: watchlistId,
        channel_username: channel.username || cleanUsername,
        channel_id: channel.id.toString(),
        channel_title: channel.title,
        channel_type: channel.megagroup ? 'supergroup' : 'channel',
        is_user_member: isUserMember,
        added_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) throw error;
    
    console.log('Channel added successfully:', newChannel.channel_title);
    
    return new Response(
      JSON.stringify({ 
        success: true,
        channel: {
          title: channel.title,
          username: channel.username,
          isUserMember,
          message: isUserMember ? 'Channel added successfully' : 'You need to join this channel in Telegram first'
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
