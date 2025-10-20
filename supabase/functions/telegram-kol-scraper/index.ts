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
    console.log('Starting Telegram scraper');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    const { data: activeWatchlists } = await supabase
      .from('telegram_kol_watchlists')
      .select(`
        *,
        telegram_kol_channels (*)
      `)
      .eq('is_active', true);
    
    let totalSignalsCreated = 0;
    
    for (const watchlist of activeWatchlists || []) {
      try {
        const client = await getTelegramClient(watchlist.user_id, supabase);
        
        for (const channel of watchlist.telegram_kol_channels || []) {
          if (!channel.is_user_member) {
            console.log(`User not member of ${channel.channel_username}, skipping`);
            continue;
          }
          
          try {
            const messages = await client.getMessages(channel.channel_id, { 
              limit: 50,
              offsetId: channel.last_message_id || 0,
            });
            
            console.log(`Fetched ${messages.length} messages from ${channel.channel_username}`);
            
            for (const message of messages) {
              if (!message.text && !message.message) continue;
              
              const messageText = message.text || message.message;
              
              const { data: existing } = await supabase
                .from('telegram_kol_signals')
                .select('id')
                .eq('channel_id', channel.id)
                .eq('message_id', message.id)
                .single();
              
              if (existing) continue;
              
              const { data: analyzeResult } = await supabase.functions.invoke(
                'telegram-kol-ai-analyzer',
                {
                  body: {
                    message: {
                      message_id: message.id,
                      text: messageText,
                      date: message.date,
                      message_url: `https://t.me/${channel.channel_username}/${message.id}`,
                      has_photo: !!message.photo,
                      has_video: !!message.video,
                      has_document: !!message.document,
                      forward_from: message.fwdFrom,
                    },
                    channel_id: channel.id,
                    watchlist_id: watchlist.id,
                    user_id: watchlist.user_id,
                    channel_title: channel.channel_title,
                  }
                }
              );
              
              if (analyzeResult?.signalCreated) {
                totalSignalsCreated++;
              }
            }
            
            if (messages.length > 0) {
              const lastMessageId = Math.max(...messages.map(m => m.id));
              await supabase
                .from('telegram_kol_channels')
                .update({
                  last_message_id: lastMessageId,
                  last_checked_at: new Date().toISOString(),
                })
                .eq('id', channel.id);
            }
            
          } catch (channelError) {
            console.error(`Error processing channel ${channel.channel_username}:`, channelError);
          }
        }
        
      } catch (userError) {
        console.error(`Error processing watchlist for user ${watchlist.user_id}:`, userError);
      }
    }
    
    console.log(`Scraper completed. Created ${totalSignalsCreated} signals`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        signalsCreated: totalSignalsCreated 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Scraper error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
