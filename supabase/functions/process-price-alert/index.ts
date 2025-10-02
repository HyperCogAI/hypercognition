import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AlertCheckRequest {
  agentId: string
  currentPrice: number
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get request body
    const { agentId, currentPrice }: AlertCheckRequest = await req.json()

    if (!agentId || !currentPrice) {
      return new Response(
        JSON.stringify({ error: 'Agent ID and current price are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Checking price alerts for agent ${agentId} at price ${currentPrice}`)

    // Fetch all active alerts for this agent
    const { data: alerts, error: alertsError } = await supabase
      .from('price_alerts')
      .select('*')
      .eq('agent_id', agentId)
      .eq('is_active', true)
      .eq('is_triggered', false)

    if (alertsError) {
      console.error('Error fetching alerts:', alertsError)
      throw alertsError
    }

    if (!alerts || alerts.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No active alerts found', triggered: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let triggeredCount = 0
    const triggeredAlerts = []

    // Check each alert
    for (const alert of alerts) {
      let shouldTrigger = false

      switch (alert.alert_type) {
        case 'price_above':
          shouldTrigger = currentPrice >= alert.target_value
          break
        case 'price_below':
          shouldTrigger = currentPrice <= alert.target_value
          break
        case 'percent_change':
          if (alert.current_value) {
            const percentChange = Math.abs(((currentPrice - alert.current_value) / alert.current_value) * 100)
            shouldTrigger = percentChange >= alert.target_value
          }
          break
      }

      if (shouldTrigger) {
        // Update alert as triggered
        const { error: updateError } = await supabase
          .from('price_alerts')
          .update({
            is_triggered: true,
            triggered_at: new Date().toISOString(),
            current_value: currentPrice,
            updated_at: new Date().toISOString()
          })
          .eq('id', alert.id)

        if (updateError) {
          console.error(`Error updating alert ${alert.id}:`, updateError)
          continue
        }

        // Create notification
        const notificationTitle = 'Price Alert Triggered'
        let notificationMessage = `${alert.agent_name} (${alert.agent_symbol}) `

        switch (alert.alert_type) {
          case 'price_above':
            notificationMessage += `has risen above $${alert.target_value}`
            break
          case 'price_below':
            notificationMessage += `has dropped below $${alert.target_value}`
            break
          case 'percent_change':
            notificationMessage += `has changed by more than ${alert.target_value}%`
            break
        }

        notificationMessage += `. Current price: $${currentPrice}`

        const { error: notifError } = await supabase
          .from('notifications')
          .insert({
            user_id: alert.user_id,
            type: 'price_alert',
            category: 'trading',
            priority: 'high',
            title: notificationTitle,
            message: notificationMessage,
            action_url: `/agent/${alert.agent_id}`,
            data: {
              alert_id: alert.id,
              agent_id: alert.agent_id,
              agent_symbol: alert.agent_symbol,
              old_price: alert.current_value,
              new_price: currentPrice,
              alert_type: alert.alert_type,
              target_value: alert.target_value
            }
          })

        if (notifError) {
          console.error(`Error creating notification for alert ${alert.id}:`, notifError)
        }

        triggeredCount++
        triggeredAlerts.push({
          alertId: alert.id,
          userId: alert.user_id,
          alertType: alert.alert_type,
          targetValue: alert.target_value,
          currentPrice: currentPrice
        })

        console.log(`Alert ${alert.id} triggered for user ${alert.user_id}`)
      } else {
        // Update current value for tracking
        await supabase
          .from('price_alerts')
          .update({
            current_value: currentPrice,
            updated_at: new Date().toISOString()
          })
          .eq('id', alert.id)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        checked: alerts.length,
        triggered: triggeredCount,
        triggeredAlerts: triggeredAlerts
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error processing alerts:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})