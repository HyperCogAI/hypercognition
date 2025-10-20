import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const supabase = createClient(
  'https://xdinlkmqmjlrmunsjswf.supabase.co',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { signal } = await req.json();

    console.log(`Dispatching alert for signal ${signal.id}`);

    // Get user's notification preferences
    const { data: prefs } = await supabase
      .from('notification_preferences')
      .select('twitter_kol_alerts_enabled')
      .eq('user_id', signal.user_id)
      .single();

    if (!prefs?.twitter_kol_alerts_enabled) {
      console.log(`User ${signal.user_id} has KOL alerts disabled`);
      return new Response(
        JSON.stringify({ message: 'Alerts disabled for user' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get KOL username
    const { data: kolAccount } = await supabase
      .from('twitter_kol_accounts')
      .select('twitter_username')
      .eq('id', signal.kol_account_id)
      .single();

    const kolUsername = kolAccount?.twitter_username || 'KOL';

    // Determine emoji and title based on gem type
    const gemTypeEmoji: Record<string, string> = {
      token: '🪙',
      nft: '🖼️',
      protocol: '⚡',
      airdrop: '🎁',
      alpha: '🔥',
    };

    const emoji = gemTypeEmoji[signal.gem_type] || '🚨';
    const title = `${emoji} Gem Alert from @${kolUsername}`;
    const message = `AI detected ${signal.gem_type} with ${signal.confidence_score}% confidence`;

    // Create notification
    const { error: notifError } = await supabase
      .from('notifications')
      .insert({
        user_id: signal.user_id,
        type: 'twitter_kol_gem_alert',
        category: 'trading',
        priority: signal.confidence_score >= 85 ? 'high' : 'medium',
        title,
        message,
        action_url: `/kol-signals?signal=${signal.id}`,
        data: {
          signal_id: signal.id,
          tweet_url: signal.tweet_url,
          confidence_score: signal.confidence_score,
          gem_type: signal.gem_type,
          kol_username: kolUsername,
        },
      });

    if (notifError) {
      console.error('Error creating notification:', notifError);
      throw notifError;
    }

    // Update signal status
    await supabase
      .from('twitter_kol_signals')
      .update({ user_action: 'alerted' })
      .eq('id', signal.id);

    console.log(`Alert dispatched successfully for signal ${signal.id}`);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Alert dispatcher error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
