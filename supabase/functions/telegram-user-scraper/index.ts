// Phase 2.1: User-scoped Telegram scraper
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
    const { watchlistId } = await req.json();
    
    console.log('Starting user-scoped Telegram scraper');
    
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
    
    // Rate limiting
    const rateCheck = checkRateLimit(`telegram-sync:${user.id}`, { maxRequests: 10, windowMinutes: 5 });
    if (!rateCheck.allowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded', retryAfter: rateCheck.retryAfter }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get user's watchlists
    const watchlistQuery = supabase
      .from('telegram_kol_watchlists')
      .select(`
        *,
        telegram_kol_channels (*)
      `)
      .eq('user_id', user.id)
      .eq('is_active', true);
    
    if (watchlistId) {
      watchlistQuery.eq('id', watchlistId);
    }
    
    const { data: watchlists } = await watchlistQuery;
    
    let totalSignalsCreated = 0;
    let client: any = null;
    
    try {
      client = await getTelegramClient(user.id, supabase);
      
      for (const watchlist of watchlists || []) {
        for (const channel of watchlist.telegram_kol_channels || []) {
          if (!channel.is_user_member) {
            console.log(`User not member of ${channel.channel_username}, skipping`);
            continue;
          }
          
          try {
            // Get message history
            const messages = await client.getHistory(channel.channel_id, {
              limit: 50,
              offsetId: channel.last_message_id || 0,
            });
            
            console.log(`Fetched ${messages.length} messages from ${channel.channel_username}`);
            
            for (const message of messages) {
              const messageText = message.text || '';
              if (!messageText) continue;
              
              // Check if already processed
              const { data: existing } = await supabase
                .from('telegram_kol_signals')
                .select('id')
                .eq('channel_id', channel.id)
                .eq('message_id', message.id)
                .single();
              
              if (existing) continue;
              
              // Invoke AI analyzer
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
                      forward_from: message.forwardFrom,
                    },
                    channel_id: channel.id,
                    watchlist_id: watchlist.id,
                    user_id: user.id,
                    channel_title: channel.channel_title,
                  }
                }
              );
              
              if (analyzeResult?.signalCreated) {
                totalSignalsCreated++;
              }
            }
            
            // Update last message ID
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
      }
    } finally {
      if (client) {
        await client.disconnect();
      }
    }
    
    console.log(`User scraper completed. Created ${totalSignalsCreated} signals`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        signalsCreated: totalSignalsCreated 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('User scraper error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
