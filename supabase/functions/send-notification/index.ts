import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { 
      userId, 
      type, 
      category, 
      priority, 
      title, 
      message, 
      actionUrl, 
      data 
    } = await req.json()

    console.log(`[SendNotification] Sending ${type} notification to user ${userId}`)

    // Check user's notification preferences
    const { data: prefs } = await supabaseClient
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    // Check if user has this notification type enabled
    if (prefs) {
      const typeMap: Record<string, string> = {
        'price_alert': 'price_alerts',
        'order_filled': 'order_updates',
        'order_cancelled': 'order_updates',
        'portfolio_update': 'portfolio_updates',
        'social_mention': 'social_updates',
        'social_like': 'social_updates',
        'social_comment': 'social_updates',
      }

      const prefKey = typeMap[type]
      if (prefKey && !prefs[prefKey]) {
        console.log(`[SendNotification] User ${userId} has ${type} notifications disabled`)
        return new Response(JSON.stringify({ 
          success: false, 
          message: 'Notification type disabled by user' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    // Create notification
    const { data: notification, error } = await supabaseClient
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        category,
        priority: priority || 'medium',
        title,
        message,
        action_url: actionUrl,
        data: data || {}
      })
      .select()
      .single()

    if (error) {
      console.error('[SendNotification] Error creating notification:', error)
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log(`[SendNotification] Notification ${notification.id} created`)

    return new Response(JSON.stringify({ 
      success: true, 
      notification 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('[SendNotification] Error:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})