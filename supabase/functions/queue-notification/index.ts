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
      priority = 'normal',
      title,
      message,
      actionUrl,
      data = {},
      scheduledFor,
      batchable = false
    } = await req.json()

    console.log(`[QueueNotification] Queueing ${type} notification for user ${userId}`)

    // Validate required fields
    if (!userId || !type || !title || !message) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: userId, type, title, message' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get user preferences
    const { data: prefs } = await supabaseClient
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    // Check if user has this type enabled
    const typeMap: Record<string, string> = {
      'price_alert': 'price_alerts',
      'order_filled': 'order_updates',
      'order_cancelled': 'order_updates',
      'portfolio_update': 'portfolio_updates',
      'social_mention': 'social_updates',
      'social_like': 'social_updates',
      'social_comment': 'social_updates',
      'security_alert': 'security_alerts'
    }

    const prefKey = typeMap[type]
    if (prefKey && prefs && !prefs[prefKey]) {
      console.log(`[QueueNotification] User ${userId} has ${type} notifications disabled`)
      return new Response(JSON.stringify({ 
        success: false,
        message: 'Notification type disabled by user' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Determine priority value
    const priorityMap: Record<string, number> = {
      'urgent': 10,
      'high': 8,
      'normal': 5,
      'low': 2
    }

    const priorityValue = priorityMap[priority] || 5

    // Calculate scheduled time
    let scheduledTime = scheduledFor ? new Date(scheduledFor) : new Date()

    // If batching is enabled and user wants it
    if (batchable && prefs?.batch_notifications) {
      const batchInterval = prefs.batch_interval_minutes || 60
      const now = new Date()
      const minutesToNextBatch = batchInterval - (now.getMinutes() % batchInterval)
      scheduledTime = new Date(now.getTime() + minutesToNextBatch * 60000)
    }

    // Queue the notification
    const { data: queued, error: queueError } = await supabaseClient
      .from('notification_queue')
      .insert({
        user_id: userId,
        notification_data: {
          type,
          category: category || 'general',
          priority,
          title,
          message,
          action_url: actionUrl,
          data
        },
        scheduled_for: scheduledTime.toISOString(),
        priority: priorityValue,
        status: 'pending'
      })
      .select()
      .single()

    if (queueError) {
      console.error('[QueueNotification] Error queuing notification:', queueError)
      return new Response(JSON.stringify({ error: queueError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log(`[QueueNotification] Notification ${queued.id} queued for ${scheduledTime.toISOString()}`)

    return new Response(JSON.stringify({ 
      success: true,
      queued_id: queued.id,
      scheduled_for: scheduledTime.toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('[QueueNotification] Error:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
