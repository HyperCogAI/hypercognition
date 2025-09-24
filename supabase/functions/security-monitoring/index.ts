import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MonitoringRequest {
  action: 'real_time_threats' | 'security_summary' | 'cleanup_logs' | 'generate_report';
  timeframe?: '1h' | '24h' | '7d' | '30d';
  includeDetails?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify admin access
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('role, is_active')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    if (!adminUser) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const { action, timeframe = '24h', includeDetails = false }: MonitoringRequest = await req.json();

    switch (action) {
      case 'real_time_threats':
        return await getRealTimeThreats(supabase, timeframe);
      
      case 'security_summary':
        return await getSecuritySummary(supabase, timeframe, includeDetails);
      
      case 'cleanup_logs':
        return await cleanupLogs(supabase);
        
      case 'generate_report':
        return await generateSecurityReport(supabase, timeframe);
      
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
    }

  } catch (error: any) {
    console.error('Security monitoring error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
};

const getRealTimeThreats = async (supabase: any, timeframe: string) => {
  const timeFilter = getTimeFilter(timeframe);
  
  // Get recent suspicious activities
  const { data: threats, error } = await supabase
    .from('security_audit_log')
    .select('*')
    .in('action', [
      'rate_limit_exceeded',
      'invalid_content_blocked',
      'suspicious_user_agent',
      'brute_force_protection',
      'login_failed'
    ])
    .gte('created_at', timeFilter)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(`Failed to fetch threats: ${error.message}`);
  }

  // Analyze threat patterns
  const threatAnalysis = analyzeThreatPatterns(threats || []);
  
  return new Response(JSON.stringify({
    success: true,
    threats: threats || [],
    analysis: threatAnalysis,
    lastUpdated: new Date().toISOString()
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
};

const getSecuritySummary = async (supabase: any, timeframe: string, includeDetails: boolean) => {
  const timeFilter = getTimeFilter(timeframe);
  
  // Get security events summary
  const { data: events } = await supabase
    .from('security_audit_log')
    .select('action, created_at, details')
    .gte('created_at', timeFilter);

  // Get login attempts summary
  const { data: loginAttempts } = await supabase
    .from('login_attempts')
    .select('success, attempt_type, created_at, failure_reason')
    .gte('created_at', timeFilter);

  // Get active rate limits
  const { data: rateLimits } = await supabase
    .from('rate_limits')
    .select('identifier, endpoint, request_count')
    .gte('created_at', timeFilter);

  const summary = {
    totalEvents: events?.length || 0,
    securityEvents: categorizeEvents(events || []),
    loginStats: analyzeLoginAttempts(loginAttempts || []),
    rateLimitStats: analyzeRateLimits(rateLimits || []),
    timeframe,
    generatedAt: new Date().toISOString()
  };

  if (includeDetails) {
    (summary as any).details = {
      recentEvents: events?.slice(0, 20) || [],
      failedLogins: loginAttempts?.filter((l: any) => !l.success).slice(0, 10) || [],
      topRateLimitedEndpoints: getTopRateLimitedEndpoints(rateLimits || [])
    };
  }

  return new Response(JSON.stringify({
    success: true,
    summary
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
};

const cleanupLogs = async (supabase: any) => {
  // Clean up old logs using the database function
  const { error: cleanupError } = await supabase.rpc('cleanup_expired_sessions');
  
  if (cleanupError) {
    throw new Error(`Cleanup failed: ${cleanupError.message}`);
  }

  // Clean up old security audit logs (keep 90 days)
  const { error: auditError } = await supabase
    .from('security_audit_log')
    .delete()
    .lt('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

  // Clean up old rate limit records
  const { error: rateLimitError } = await supabase
    .from('rate_limits')
    .delete()
    .lt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  return new Response(JSON.stringify({
    success: true,
    message: 'Security logs cleaned up successfully',
    cleanedAt: new Date().toISOString()
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
};

const generateSecurityReport = async (supabase: any, timeframe: string) => {
  const timeFilter = getTimeFilter(timeframe);
  
  // Comprehensive security report
  const [events, loginAttempts, rateLimits, adminActions] = await Promise.all([
    supabase.from('security_audit_log').select('*').gte('created_at', timeFilter),
    supabase.from('login_attempts').select('*').gte('created_at', timeFilter),
    supabase.from('rate_limits').select('*').gte('created_at', timeFilter),
    supabase.from('admin_privilege_log').select('*').gte('created_at', timeFilter)
  ]);

  const report = {
    reportId: crypto.randomUUID(),
    timeframe,
    generatedAt: new Date().toISOString(),
    
    // Executive Summary
    executiveSummary: {
      totalIncidents: events.data?.filter((e: any) => e.action.includes('failed') || e.action.includes('blocked')).length || 0,
      criticalThreats: events.data?.filter((e: any) => e.action.includes('brute_force') || e.action.includes('suspicious')).length || 0,
      successfulLogins: loginAttempts.data?.filter((l: any) => l.success).length || 0,
      failedLogins: loginAttempts.data?.filter((l: any) => !l.success).length || 0,
      rateLimitViolations: rateLimits.data?.length || 0,
      adminActions: adminActions.data?.length || 0
    },

    // Detailed Analysis
    analysis: {
      securityEvents: categorizeEvents(events.data || []),
      threatVectors: identifyThreatVectors(events.data || []),
      attackPatterns: analyzeAttackPatterns(loginAttempts.data || []),
      rateLimitTrends: analyzeRateLimitTrends(rateLimits.data || []),
      adminActivity: analyzeAdminActivity(adminActions.data || [])
    },

    // Recommendations
    recommendations: generateSecurityRecommendations(events.data || [], loginAttempts.data || [])
  };

  return new Response(JSON.stringify({
    success: true,
    report
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
};

// Helper functions
const getTimeFilter = (timeframe: string): string => {
  const now = new Date();
  const hours = {
    '1h': 1,
    '24h': 24,
    '7d': 24 * 7,
    '30d': 24 * 30
  }[timeframe] || 24;
  
  return new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();
};

const analyzeThreatPatterns = (threats: any[]) => {
  const patterns = {
    rateLimitExceeded: threats.filter(t => t.action === 'rate_limit_exceeded').length,
    contentBlocked: threats.filter(t => t.action === 'invalid_content_blocked').length,
    suspiciousAgents: threats.filter(t => t.action === 'suspicious_user_agent').length,
    bruteForce: threats.filter(t => t.action === 'brute_force_protection').length,
    
    // IP analysis
    uniqueIPs: new Set(threats.map(t => t.ip_address).filter(Boolean)).size,
    topAttackerIPs: getTopIPs(threats),
    
    // Trend analysis
    hourlyDistribution: getHourlyDistribution(threats)
  };

  return patterns;
};

const categorizeEvents = (events: any[]) => {
  return {
    authentication: events.filter(e => e.resource === 'authentication').length,
    trading: events.filter(e => e.resource === 'trading').length,
    admin: events.filter(e => e.resource === 'admin').length,
    api: events.filter(e => e.resource === 'api').length,
    other: events.filter(e => !['authentication', 'trading', 'admin', 'api'].includes(e.resource)).length
  };
};

const analyzeLoginAttempts = (attempts: any[]) => {
  const successful = attempts.filter(a => a.success);
  const failed = attempts.filter(a => !a.success);
  
  return {
    total: attempts.length,
    successful: successful.length,
    failed: failed.length,
    successRate: attempts.length > 0 ? (successful.length / attempts.length * 100).toFixed(2) : '0',
    commonFailureReasons: getCommonFailureReasons(failed),
    attemptTypes: {
      email: attempts.filter(a => a.attempt_type === 'email').length,
      wallet: attempts.filter(a => a.attempt_type === 'wallet').length,
      admin: attempts.filter(a => a.attempt_type === 'admin').length
    }
  };
};

const analyzeRateLimits = (limits: any[]) => {
  return {
    total: limits.length,
    byEndpoint: limits.reduce((acc, limit) => {
      acc[limit.endpoint] = (acc[limit.endpoint] || 0) + 1;
      return acc;
    }, {}),
    averageRequests: limits.length > 0 ? (limits.reduce((sum, l) => sum + l.request_count, 0) / limits.length).toFixed(2) : '0'
  };
};

const getTopIPs = (threats: any[]) => {
  const ipCounts = threats.reduce((acc, threat) => {
    if (threat.ip_address) {
      acc[threat.ip_address] = (acc[threat.ip_address] || 0) + 1;
    }
    return acc;
  }, {});

  return Object.entries(ipCounts)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 5)
    .map(([ip, count]) => ({ ip, count }));
};

const getHourlyDistribution = (events: any[]) => {
  const hours = new Array(24).fill(0);
  
  events.forEach(event => {
    const hour = new Date(event.created_at).getHours();
    hours[hour]++;
  });
  
  return hours;
};

const getCommonFailureReasons = (failedAttempts: any[]) => {
  const reasons = failedAttempts.reduce((acc, attempt) => {
    const reason = attempt.failure_reason || 'unknown';
    acc[reason] = (acc[reason] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(reasons)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 5)
    .map(([reason, count]) => ({ reason, count }));
};

const getTopRateLimitedEndpoints = (limits: any[]) => {
  const endpoints = limits.reduce((acc, limit) => {
    acc[limit.endpoint] = (acc[limit.endpoint] || 0) + limit.request_count;
    return acc;
  }, {});

  return Object.entries(endpoints)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 5)
    .map(([endpoint, requests]) => ({ endpoint, requests }));
};

const identifyThreatVectors = (events: any[]) => {
  // Identify common attack vectors and patterns
  return {
    xssAttempts: events.filter(e => e.details?.pattern?.includes('script')).length,
    sqlInjection: events.filter(e => e.details?.pattern?.includes('union')).length,
    bruteForce: events.filter(e => e.action === 'brute_force_protection').length,
    automation: events.filter(e => e.action === 'suspicious_user_agent').length
  };
};

const analyzeAttackPatterns = (attempts: any[]) => {
  // Analyze patterns in failed login attempts
  const failed = attempts.filter(a => !a.success);
  const ipPatterns = failed.reduce((acc, attempt) => {
    if (attempt.ip_address) {
      acc[attempt.ip_address] = (acc[attempt.ip_address] || 0) + 1;
    }
    return acc;
  }, {});

  return {
    distributedAttacks: Object.values(ipPatterns).filter(count => (count as number) > 1).length,
    concentratedAttacks: Object.values(ipPatterns).filter(count => (count as number) > 5).length,
    peakHour: getHourlyDistribution(failed).indexOf(Math.max(...getHourlyDistribution(failed)))
  };
};

const analyzeRateLimitTrends = (limits: any[]) => {
  // Analyze rate limiting trends over time
  return {
    totalViolations: limits.length,
    trendingEndpoints: getTopRateLimitedEndpoints(limits),
    peakHours: getHourlyDistribution(limits)
  };
};

const analyzeAdminActivity = (actions: any[]) => {
  return {
    totalActions: actions.length,
    actionTypes: actions.reduce((acc, action) => {
      acc[action.action] = (acc[action.action] || 0) + 1;
      return acc;
    }, {}),
    activeAdmins: new Set(actions.map(a => a.admin_user_id)).size
  };
};

const generateSecurityRecommendations = (events: any[], attempts: any[]) => {
  const recommendations = [];
  
  const failedLogins = attempts.filter(a => !a.success);
  if (failedLogins.length > 10) {
    recommendations.push({
      priority: 'HIGH',
      category: 'Authentication',
      recommendation: 'Consider implementing additional brute force protection measures',
      reason: `${failedLogins.length} failed login attempts detected`
    });
  }

  const suspiciousEvents = events.filter(e => e.action.includes('suspicious'));
  if (suspiciousEvents.length > 5) {
    recommendations.push({
      priority: 'MEDIUM',
      category: 'Bot Detection',
      recommendation: 'Review and enhance bot detection mechanisms',
      reason: `${suspiciousEvents.length} suspicious activities detected`
    });
  }

  const blockedContent = events.filter(e => e.action === 'invalid_content_blocked');
  if (blockedContent.length > 0) {
    recommendations.push({
      priority: 'LOW',
      category: 'Content Filtering',
      recommendation: 'Content filtering is working effectively, monitor for new patterns',
      reason: `${blockedContent.length} malicious content attempts blocked`
    });
  }

  return recommendations;
};

serve(handler);
