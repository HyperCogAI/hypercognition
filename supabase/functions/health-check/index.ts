import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: {
    database: 'up' | 'down';
    authentication: 'up' | 'down';
    external_apis: 'up' | 'down';
  };
  metrics: {
    response_time: number;
    active_connections: number;
    error_rate: number;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const startTime = Date.now();
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const healthCheck: HealthCheckResult = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'up',
        authentication: 'up',
        external_apis: 'up'
      },
      metrics: {
        response_time: 0,
        active_connections: 0,
        error_rate: 0.0
      }
    };

    // Test database connection
    try {
      const { data, error } = await supabaseClient
        .from('agents')
        .select('count(*)')
        .limit(1);
      
      if (error) {
        healthCheck.services.database = 'down';
        healthCheck.status = 'degraded';
      }
    } catch (error) {
      healthCheck.services.database = 'down';
      healthCheck.status = 'unhealthy';
    }

    // Test authentication service
    try {
      const { data, error } = await supabaseClient.auth.getSession();
      if (error && error.message !== 'Auth session missing!') {
        healthCheck.services.authentication = 'down';
        healthCheck.status = 'degraded';
      }
    } catch (error) {
      healthCheck.services.authentication = 'down';
      healthCheck.status = 'unhealthy';
    }

    // Test external APIs (mock check)
    try {
      // In a real implementation, you would test actual external APIs
      // For now, we'll simulate this check
      const externalApiResponse = await fetch('https://httpbin.org/status/200', {
        signal: AbortSignal.timeout(5000)
      });
      
      if (!externalApiResponse.ok) {
        healthCheck.services.external_apis = 'down';
        healthCheck.status = 'degraded';
      }
    } catch (error) {
      healthCheck.services.external_apis = 'down';
      if (healthCheck.status === 'healthy') {
        healthCheck.status = 'degraded';
      }
    }

    // Calculate response time
    healthCheck.metrics.response_time = Date.now() - startTime;

    // Get active connections (mock data)
    healthCheck.metrics.active_connections = Math.floor(Math.random() * 100) + 50;
    healthCheck.metrics.error_rate = Math.random() * 0.05; // 0-5% error rate

    // Log health check results
    console.log("Health check completed:", healthCheck);

    // Store health check in database for monitoring
    await supabaseClient
      .from('platform_metrics')
      .insert({
        metric_type: 'health_check',
        metric_value: healthCheck.status === 'healthy' ? 1 : 0,
        metadata: healthCheck
      });

    const statusCode = healthCheck.status === 'healthy' ? 200 : 
                      healthCheck.status === 'degraded' ? 206 : 503;

    return new Response(JSON.stringify(healthCheck), {
      status: statusCode,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in health-check function:", error);
    
    const unhealthyResponse: HealthCheckResult = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'down',
        authentication: 'down',
        external_apis: 'down'
      },
      metrics: {
        response_time: 0,
        active_connections: 0,
        error_rate: 1.0
      }
    };

    return new Response(JSON.stringify(unhealthyResponse), {
      status: 503,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);