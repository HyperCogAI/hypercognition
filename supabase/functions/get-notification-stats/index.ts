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

    // Get userId from query params or body
    const url = new URL(req.url)
    const userId = url.searchParams.get('userId')

    if (!userId) {
      return new Response(JSON.stringify({ error: 'userId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log(`[NotificationStats] Getting stats for user ${userId}`)

    // Get notification counts by status
    const { data: notifications } = await supabaseClient
      .from('notifications')
      .select('id, read, priority, category, created_at')
      .eq('user_id', userId)

    const unreadCount = notifications?.filter(n => !n.read).length || 0
    const readCount = notifications?.filter(n => n.read).length || 0
    const totalCount = notifications?.length || 0

    // Get counts by priority
    const urgentCount = notifications?.filter(n => !n.read && n.priority === 'urgent').length || 0
    const highCount = notifications?.filter(n => !n.read && n.priority === 'high').length || 0

    // Get counts by category
    const categoryCount = notifications?.reduce((acc, n) => {
      acc[n.category] = (acc[n.category] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    // Get delivery stats
    const { data: deliveryLogs } = await supabaseClient
      .from('notification_delivery_log')
      .select('id, channel, status')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days

    const deliveryStats = deliveryLogs?.reduce((acc, log) => {
      const key = `${log.channel}_${log.status}`
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    // Get queued notifications count
    const { data: queued } = await supabaseClient
      .from('notification_queue')
      .select('id, status')
      .eq('user_id', userId)
      .eq('status', 'pending')

    const queuedCount = queued?.length || 0

    // Calculate delivery rate
    const totalDeliveries = deliveryLogs?.length || 0
    const successfulDeliveries = deliveryLogs?.filter(
      l => l.status === 'delivered' || l.status === 'sent'
    ).length || 0
    const deliveryRate = totalDeliveries > 0 
      ? ((successfulDeliveries / totalDeliveries) * 100).toFixed(2)
      : '0.00'

    const stats = {
      total: totalCount,
      unread: unreadCount,
      read: readCount,
      urgent: urgentCount,
      high: highCount,
      by_category: categoryCount,
      queued: queuedCount,
      delivery_stats: deliveryStats,
      delivery_rate: `${deliveryRate}%`,
      last_updated: new Date().toISOString()
    }

    console.log(`[NotificationStats] Stats for user ${userId}:`, stats)

    return new Response(JSON.stringify(stats), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('[NotificationStats] Error:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
