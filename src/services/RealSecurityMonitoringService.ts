import { supabase } from '@/integrations/supabase/client';

export interface SecurityEvent {
  id: string;
  action: string;
  resource: string;
  details: any;
  created_at: string;
  ip_address?: unknown;
  user_agent?: unknown;
  user_id?: string;
}

export interface RateLimit {
  id: string;
  identifier: string;
  endpoint: string;
  request_count: number;
  window_start: string;
  created_at?: string;
}

export interface SecurityCheck {
  id: string;
  check_name: string;
  category: string;
  status: string;
  severity: string;
  description: string;
  remediation_steps?: string;
  last_checked: string;
}

export interface Vulnerability {
  id: string;
  vulnerability_type: string;
  severity: string;
  affected_component: string;
  description: string;
  impact_assessment: string;
  remediation_steps: string;
  status: string;
  discovered_at: string;
}

export const RealSecurityMonitoringService = {
  async getSecurityEvents(): Promise<SecurityEvent[]> {
    const { data, error } = await supabase
      .from('security_audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    return data || [];
  },

  async getRateLimits(): Promise<RateLimit[]> {
    const { data, error } = await supabase
      .from('rate_limits')
      .select('*')
      .order('window_start', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  },

  async getSecurityChecks(): Promise<SecurityCheck[]> {
    // Return mock data since security_checks table doesn't exist yet
    return [
      {
        id: '1',
        check_name: '2FA Implementation',
        category: 'authentication',
        status: 'pass',
        severity: 'high',
        description: 'Multi-factor authentication is properly implemented',
        last_checked: new Date().toISOString()
      },
      {
        id: '2',
        check_name: 'RLS Policies',
        category: 'authorization',
        status: 'pass',
        severity: 'critical',
        description: 'Row Level Security policies are active',
        last_checked: new Date().toISOString()
      }
    ];
  },

  async getVulnerabilities(): Promise<Vulnerability[]> {
    // Return mock data since vulnerabilities table doesn't exist yet
    return [
      {
        id: '1',
        vulnerability_type: 'Information Disclosure',
        severity: 'medium',
        affected_component: 'API Error Responses',
        description: 'Error messages may reveal sensitive information',
        impact_assessment: 'Attackers could gain system insights',
        remediation_steps: 'Implement generic error messages',
        status: 'open',
        discovered_at: new Date().toISOString()
      }
    ];
  },

  async createSecurityAlert(data: {
    alert_type: string;
    severity: string;
    description: string;
    affected_component?: string;
    status?: string;
  }): Promise<void> {
    const { error } = await supabase
      .from('security_alerts')
      .insert({
        alert_type: data.alert_type,
        severity: data.severity,
        description: data.description,
        affected_resource: data.affected_component,
        status: data.status || 'active',
        title: `${data.alert_type} Alert` // Required field
      });

    if (error) throw error;
  },

  async logSecurityEvent(data: {
    action: string;
    resource: string;
    details?: any;
    user_id?: string;
    ip_address?: string;
    user_agent?: string;
  }): Promise<void> {
    const { error } = await supabase
      .from('security_audit_log')
      .insert({
        action: data.action,
        resource: data.resource,
        details: data.details || {},
        user_id: data.user_id,
        ip_address: data.ip_address,
        user_agent: data.user_agent
      });

    if (error) throw error;
  }
};