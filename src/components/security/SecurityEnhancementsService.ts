import { supabase } from '@/integrations/supabase/client';

export interface SecuritySetting {
  id: string;
  setting_name: string;
  setting_value: any;
  is_active: boolean;
  updated_at: string;
}

export interface ComplianceAlert {
  id: string;
  alert_type: string;
  severity: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  affected_user_id?: string;
  metadata: any;
}

export interface SecurityMetrics {
  totalAlerts: number;
  openAlerts: number;
  criticalAlerts: number;
  kycAccessCount: number;
  adminSessionsActive: number;
}

export const SecurityEnhancementsService = {
  async getSecuritySettings(): Promise<SecuritySetting[]> {
    const { data, error } = await supabase
      .from('security_settings')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  },

  async getComplianceAlerts(): Promise<ComplianceAlert[]> {
    const { data, error } = await supabase
      .from('compliance_alerts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  },

  async updateAlertStatus(alertId: string, status: string): Promise<void> {
    const { error } = await supabase
      .from('compliance_alerts')
      .update({ 
        status,
        resolved_at: status === 'resolved' ? new Date().toISOString() : null
      })
      .eq('id', alertId);

    if (error) throw error;
  },

  async getSecurityMetrics(): Promise<SecurityMetrics> {
    const alerts = await this.getComplianceAlerts();
    
    return {
      totalAlerts: alerts.length,
      openAlerts: alerts.filter(a => a.status === 'open').length,
      criticalAlerts: alerts.filter(a => a.severity === 'critical').length,
      kycAccessCount: 0, // Would need to query audit logs
      adminSessionsActive: 0 // Would need to query active sessions
    };
  },

  async logSensitiveOperation(operation: string, details: any = {}): Promise<void> {
    try {
      await supabase.functions.invoke('security-middleware', {
        body: {
          endpoint: 'log_sensitive_operation',
          operation,
          details
        }
      });
    } catch (error) {
      console.error('Failed to log sensitive operation:', error);
    }
  },

  async checkKYCAccess(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('is_compliance_officer');
      if (error) throw error;
      return data || false;
    } catch (error) {
      console.error('Error checking KYC access:', error);
      return false;
    }
  }
};