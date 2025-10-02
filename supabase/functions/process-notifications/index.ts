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

    const { batch_size = 50 } = await req.json()

    console.log(`[ProcessNotifications] Processing batch of ${batch_size} notifications`)

    // Get pending notifications from queue
    const { data: queueItems, error: queueError } = await supabaseClient
      .from('notification_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(batch_size)

    if (queueError) {
      console.error('[ProcessNotifications] Error fetching queue:', queueError)
      return new Response(JSON.stringify({ error: queueError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (!queueItems || queueItems.length === 0) {
      console.log('[ProcessNotifications] No pending notifications')
      return new Response(JSON.stringify({ 
        processed: 0,
        message: 'No pending notifications' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    let processed = 0
    let failed = 0

    // Process each notification
    for (const item of queueItems) {
      try {
        // Mark as processing
        await supabaseClient
          .from('notification_queue')
          .update({ status: 'processing', processed_at: new Date().toISOString() })
          .eq('id', item.id)

        const notificationData = item.notification_data

        // Get user preferences
        const { data: prefs } = await supabaseClient
          .from('notification_preferences')
          .select('*')
          .eq('user_id', item.user_id)
          .maybeSingle()

        // Check quiet hours
        if (prefs && prefs.quiet_hours_start && prefs.quiet_hours_end) {
          const now = new Date()
          const currentTime = now.toTimeString().split(' ')[0].substring(0, 5)
          
          if (currentTime >= prefs.quiet_hours_start && currentTime <= prefs.quiet_hours_end) {
            // Reschedule for after quiet hours
            const nextSchedule = new Date()
            const [endHour, endMinute] = prefs.quiet_hours_end.split(':')
            nextSchedule.setHours(parseInt(endHour), parseInt(endMinute), 0, 0)
            
            await supabaseClient
              .from('notification_queue')
              .update({ 
                status: 'pending',
                scheduled_for: nextSchedule.toISOString(),
                processed_at: null
              })
              .eq('id', item.id)
            
            continue
          }
        }

        // Create notification in main table
        const { data: notification, error: notifError } = await supabaseClient
          .from('notifications')
          .insert({
            user_id: item.user_id,
            type: notificationData.type,
            category: notificationData.category,
            priority: notificationData.priority || 'normal',
            title: notificationData.title,
            message: notificationData.message,
            action_url: notificationData.action_url,
            data: notificationData.data || {}
          })
          .select()
          .single()

        if (notifError) {
          console.error('[ProcessNotifications] Error creating notification:', notifError)
          throw notifError
        }

        // Determine which channels to send to based on preferences
        const channels: string[] = []
        if (prefs?.in_app_enabled !== false) channels.push('in_app')
        if (prefs?.push_enabled) channels.push('push')
        if (prefs?.email_enabled) channels.push('email')
        if (prefs?.sms_enabled) channels.push('sms')

        // Create delivery log entries for each channel
        for (const channel of channels) {
          // Check rate limit
          const { data: rateLimitCheck } = await supabaseClient
            .rpc('check_notification_rate_limit', {
              user_id_param: item.user_id,
              notification_type_param: notificationData.type,
              channel_param: channel,
              max_per_hour: channel === 'sms' ? 3 : 10
            })

          if (!rateLimitCheck) {
            console.log(`[ProcessNotifications] Rate limit exceeded for ${channel}`)
            continue
          }

          await supabaseClient
            .from('notification_delivery_log')
            .insert({
              notification_id: notification.id,
              user_id: item.user_id,
              channel,
              status: channel === 'in_app' ? 'delivered' : 'pending',
              sent_at: channel === 'in_app' ? new Date().toISOString() : null,
              delivered_at: channel === 'in_app' ? new Date().toISOString() : null
            })

          // For non-in-app channels, would trigger external services here
          // e.g., call send-email function, push notification service, etc.
        }

        // Mark queue item as completed
        await supabaseClient
          .from('notification_queue')
          .update({ status: 'completed' })
          .eq('id', item.id)

        processed++
        console.log(`[ProcessNotifications] Processed notification for user ${item.user_id}`)

      } catch (error) {
        console.error('[ProcessNotifications] Error processing item:', error)
        
        // Mark as failed
        await supabaseClient
          .from('notification_queue')
          .update({ 
            status: 'failed',
            error_message: error.message,
            processed_at: new Date().toISOString()
          })
          .eq('id', item.id)

        failed++
      }
    }

    console.log(`[ProcessNotifications] Completed: ${processed} processed, ${failed} failed`)

    return new Response(JSON.stringify({ 
      processed,
      failed,
      total: queueItems.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('[ProcessNotifications] Error:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
