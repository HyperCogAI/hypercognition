import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import webpush from 'npm:web-push@3.6.6';

const supabase = createClient(
  'https://xdinlkmqmjlrmunsjswf.supabase.co',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Configure web-push with VAPID keys
const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    'mailto:notifications@hypercognition.io',
    vapidPublicKey,
    vapidPrivateKey
  );
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, title, body, url, signalId, priority } = await req.json();

    console.log(`Sending push notification to user ${userId}`);

    // Get user's push subscriptions
    const { data: subscriptions, error: subsError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (subsError) throw subsError;

    if (!subscriptions || subscriptions.length === 0) {
      console.log(`No active push subscriptions for user ${userId}`);
      return new Response(
        JSON.stringify({ message: 'No active subscriptions' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload = JSON.stringify({
      title,
      body,
      url,
      signal_id: signalId,
      priority,
      tag: `signal-${signalId}`,
    });

    // Send to all active subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
              },
            },
            payload
          );
          console.log(`Push sent successfully to subscription ${sub.id}`);
          return { success: true, subscriptionId: sub.id };
        } catch (error: any) {
          console.error(`Failed to send push to subscription ${sub.id}:`, error);
          
          // Deactivate subscription if it's invalid
          if (error.statusCode === 410 || error.statusCode === 404) {
            await supabase
              .from('push_subscriptions')
              .update({ is_active: false })
              .eq('id', sub.id);
          }
          
          throw error;
        }
      })
    );

    const successCount = results.filter(r => r.status === 'fulfilled').length;
    console.log(`Sent ${successCount}/${subscriptions.length} push notifications`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: successCount,
        total: subscriptions.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Push notification error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
