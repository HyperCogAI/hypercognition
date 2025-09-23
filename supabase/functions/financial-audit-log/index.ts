import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FinancialAuditEvent {
  userId: string;
  transactionType: 'trade_execution' | 'order_placement' | 'order_cancellation' | 'deposit' | 'withdrawal' | 'transfer';
  agentId?: string;
  orderId?: string;
  amount?: number;
  price?: number;
  currency?: string;
  exchangeInfo?: any;
  complianceFlags?: string[];
  riskScore?: number;
  metadata?: any;
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

    const clientIP = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    if (req.method === 'POST') {
      const auditEvent: FinancialAuditEvent = await req.json();
      return await logFinancialTransaction(supabase, auditEvent, clientIP, userAgent);
    }

    if (req.method === 'GET') {
      const url = new URL(req.url);
      const userId = url.searchParams.get('userId');
      const startDate = url.searchParams.get('startDate');
      const endDate = url.searchParams.get('endDate');
      const transactionType = url.searchParams.get('type');
      
      return await getAuditLogs(supabase, userId, startDate, endDate, transactionType);
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error: any) {
    console.error('Financial audit log error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
};

const logFinancialTransaction = async (
  supabase: any, 
  event: FinancialAuditEvent, 
  clientIP: string, 
  userAgent: string
) => {
  try {
    // Validate required fields
    if (!event.userId || !event.transactionType) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Calculate risk score if not provided
    const riskScore = event.riskScore || calculateRiskScore(event);

    // Check for compliance violations
    const complianceFlags = await checkComplianceViolations(supabase, event);

    // Log to financial audit table
    const { data: auditLog, error: auditError } = await supabase
      .from('financial_audit_log')
      .insert({
        user_id: event.userId,
        transaction_type: event.transactionType,
        agent_id: event.agentId,
        order_id: event.orderId,
        amount: event.amount,
        price: event.price,
        currency: event.currency || 'USD',
        exchange_info: event.exchangeInfo,
        compliance_flags: complianceFlags,
        risk_score: riskScore,
        ip_address: clientIP,
        user_agent: userAgent,
        metadata: event.metadata || {},
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (auditError) {
      console.error('Failed to insert audit log:', auditError);
      return new Response(JSON.stringify({ error: 'Failed to log transaction' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Log to general security audit log
    await supabase.from('security_audit_log').insert({
      user_id: event.userId,
      action: `financial_transaction_${event.transactionType}`,
      resource: 'financial_transactions',
      details: {
        audit_log_id: auditLog.id,
        amount: event.amount,
        agent_id: event.agentId,
        risk_score: riskScore,
        compliance_flags: complianceFlags
      },
      ip_address: clientIP,
      user_agent: userAgent
    });

    // Check for suspicious activity patterns
    await checkSuspiciousActivity(supabase, event);

    // Alert if high-risk transaction
    if (riskScore >= 7 || complianceFlags.length > 0) {
      await generateAlerts(supabase, auditLog, riskScore, complianceFlags);
    }

    return new Response(JSON.stringify({
      success: true,
      auditLogId: auditLog.id,
      riskScore,
      complianceFlags,
      timestamp: auditLog.created_at
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error: any) {
    console.error('Error logging financial transaction:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
};

const getAuditLogs = async (
  supabase: any,
  userId?: string | null,
  startDate?: string | null,
  endDate?: string | null,
  transactionType?: string | null
) => {
  try {
    let query = supabase
      .from('financial_audit_log')
      .select('*')
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    if (transactionType) {
      query = query.eq('transaction_type', transactionType);
    }

    const { data: logs, error } = await query.limit(1000);

    if (error) {
      return new Response(JSON.stringify({ error: 'Failed to fetch audit logs' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      logs: logs || [],
      total: logs?.length || 0
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error: any) {
    console.error('Error fetching audit logs:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
};

const calculateRiskScore = (event: FinancialAuditEvent): number => {
  let score = 0;

  // Base score by transaction type
  switch (event.transactionType) {
    case 'withdrawal':
      score += 3;
      break;
    case 'trade_execution':
      score += 2;
      break;
    case 'transfer':
      score += 2;
      break;
    default:
      score += 1;
  }

  // Amount-based scoring
  if (event.amount) {
    if (event.amount > 100000) score += 4;
    else if (event.amount > 50000) score += 3;
    else if (event.amount > 10000) score += 2;
    else if (event.amount > 1000) score += 1;
  }

  // Time-based scoring (unusual hours)
  const hour = new Date().getHours();
  if (hour < 6 || hour > 22) score += 1;

  return Math.min(score, 10); // Cap at 10
};

const checkComplianceViolations = async (supabase: any, event: FinancialAuditEvent): Promise<string[]> => {
  const flags: string[] = [];

  // Check daily transaction limits
  if (event.amount && event.amount > 50000) {
    const { data: dailyTotal } = await supabase
      .from('financial_audit_log')
      .select('amount')
      .eq('user_id', event.userId)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const totalDaily = dailyTotal?.reduce((sum, log) => sum + (log.amount || 0), 0) || 0;
    
    if (totalDaily + event.amount > 100000) {
      flags.push('daily_limit_exceeded');
    }
  }

  // Check for rapid successive transactions
  const { data: recentTransactions } = await supabase
    .from('financial_audit_log')
    .select('created_at')
    .eq('user_id', event.userId)
    .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()); // Last 5 minutes

  if (recentTransactions && recentTransactions.length > 5) {
    flags.push('rapid_transactions');
  }

  // Check for unusual trading patterns
  if (event.transactionType === 'trade_execution' && event.amount && event.amount > 10000) {
    flags.push('large_trade');
  }

  return flags;
};

const checkSuspiciousActivity = async (supabase: any, event: FinancialAuditEvent) => {
  // Check for pattern anomalies
  const { data: userPattern } = await supabase
    .from('financial_audit_log')
    .select('transaction_type, amount, created_at')
    .eq('user_id', event.userId)
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
    .order('created_at', { ascending: false })
    .limit(100);

  if (userPattern && userPattern.length > 10) {
    const avgAmount = userPattern.reduce((sum, log) => sum + (log.amount || 0), 0) / userPattern.length;
    
    // Flag if current transaction is 10x average
    if (event.amount && event.amount > avgAmount * 10) {
      await supabase.from('security_audit_log').insert({
        user_id: event.userId,
        action: 'suspicious_activity_detected',
        resource: 'financial_transactions',
        details: {
          reason: 'amount_anomaly',
          current_amount: event.amount,
          average_amount: avgAmount,
          multiplier: event.amount / avgAmount
        }
      });
    }
  }
};

const generateAlerts = async (supabase: any, auditLog: any, riskScore: number, complianceFlags: string[]) => {
  // Create alert for compliance team
  await supabase.from('compliance_alerts').insert({
    user_id: auditLog.user_id,
    alert_type: 'high_risk_transaction',
    severity: riskScore >= 8 ? 'critical' : 'high',
    details: {
      audit_log_id: auditLog.id,
      risk_score: riskScore,
      compliance_flags: complianceFlags,
      transaction_type: auditLog.transaction_type,
      amount: auditLog.amount
    },
    status: 'open',
    created_at: new Date().toISOString()
  });

  // Send real-time notification if critical
  if (riskScore >= 9) {
    // This would integrate with notification system
    console.log(`CRITICAL ALERT: High-risk transaction detected for user ${auditLog.user_id}`);
  }
};

serve(handler);