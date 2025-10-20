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
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    const url = new URL(req.url)
    const action = url.searchParams.get('action') || 'dashboard'

    console.log(`[Monitoring] Action: ${action}`)

    switch (action) {
      case 'dashboard': {
        // Get real-time dashboard metrics
        const { data: dashboard, error: dashboardError } = await supabaseAdmin
          .from('acp_monitoring_dashboard')
          .select('*')
          .single()

        if (dashboardError) {
          console.error('Dashboard error:', dashboardError)
          return new Response(
            JSON.stringify({ error: 'Failed to fetch dashboard' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true, dashboard }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'security-scan': {
        // Run security scan
        const { data: scanResults, error: scanError } = await supabaseAdmin
          .rpc('run_acp_security_scan')

        if (scanError) {
          console.error('Security scan error:', scanError)
          return new Response(
            JSON.stringify({ error: 'Security scan failed' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Count issues by severity
        const critical = scanResults.filter((r: any) => r.status === 'fail' && r.severity === 'critical').length
        const high = scanResults.filter((r: any) => r.status === 'fail' && r.severity === 'high').length
        const medium = scanResults.filter((r: any) => r.status === 'warn' && r.severity === 'medium').length

        return new Response(
          JSON.stringify({
            success: true,
            scan_results: scanResults,
            summary: {
              total_checks: scanResults.length,
              critical_issues: critical,
              high_issues: high,
              medium_issues: medium,
              passed: scanResults.filter((r: any) => r.status === 'pass').length
            }
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'performance': {
        // Get performance metrics
        const windowMinutes = parseInt(url.searchParams.get('window') || '60')
        
        const { data: metrics, error: metricsError } = await supabaseAdmin
          .rpc('aggregate_acp_performance_metrics', {
            window_minutes: windowMinutes
          })

        if (metricsError) {
          console.error('Performance metrics error:', metricsError)
          return new Response(
            JSON.stringify({ error: 'Failed to fetch performance metrics' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true, metrics }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'alerts': {
        // Check for active alerts
        const { data: alerts, error: alertsError } = await supabaseAdmin
          .rpc('check_acp_alerts')

        if (alertsError) {
          console.error('Alerts check error:', alertsError)
          return new Response(
            JSON.stringify({ error: 'Failed to check alerts' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true, alerts }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'audit-log': {
        // Get recent audit logs
        const limit = parseInt(url.searchParams.get('limit') || '100')
        const operation = url.searchParams.get('operation')
        const status = url.searchParams.get('status')

        let query = supabaseAdmin
          .from('acp_audit_log')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit)

        if (operation) {
          query = query.eq('operation', operation)
        }
        if (status) {
          query = query.eq('status', status)
        }

        const { data: logs, error: logsError } = await query

        if (logsError) {
          console.error('Audit log error:', logsError)
          return new Response(
            JSON.stringify({ error: 'Failed to fetch audit logs' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true, logs, count: logs.length }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'health': {
        // Simple health check
        const health = {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          uptime: process.uptime ? process.uptime() : 'N/A',
          version: '1.0.0'
        }

        return new Response(
          JSON.stringify(health),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default: {
        return new Response(
          JSON.stringify({ 
            error: 'Invalid action',
            available_actions: ['dashboard', 'security-scan', 'performance', 'alerts', 'audit-log', 'health']
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

  } catch (error) {
    console.error('Monitoring error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
