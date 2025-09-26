import { supabase } from '@/integrations/supabase/client';
import { SecurityEnhancementsService } from '@/components/security/SecurityEnhancementsService';

export interface KYCVerification {
  id: string;
  user_id: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'expired';
  verification_type: string;
  full_name?: string;
  date_of_birth?: string;
  nationality?: string;
  document_type?: string;
  document_number?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  phone_number?: string;
  risk_score?: number;
  reviewed_by?: string;
  reviewed_at?: string;
  verification_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AMLAlert {
  id: string;
  user_id?: string;
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  description: string;
  related_transaction_id?: string;
  auto_detected?: boolean;
  assigned_to?: string;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export const KYCAMLService = {
  async getKYCVerifications(): Promise<KYCVerification[]> {
    // Log sensitive data access
    await SecurityEnhancementsService.logSensitiveOperation('kyc_verifications_query', {
      operation: 'get_kyc_verifications'
    });

    const { data, error } = await supabase
      .from('kyc_verifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(kyc => ({
      ...kyc,
      status: kyc.status as 'pending' | 'under_review' | 'approved' | 'rejected' | 'expired'
    }));
  },

  async getAMLAlerts(): Promise<AMLAlert[]> {
    const { data, error } = await supabase
      .from('compliance_violations_real')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data?.map(violation => ({
      id: violation.id,
      user_id: violation.user_id || undefined,
      alert_type: violation.violation_type,
      severity: violation.severity as 'low' | 'medium' | 'high' | 'critical',
      status: violation.status as 'open' | 'investigating' | 'resolved' | 'false_positive',
      description: violation.description,
      related_transaction_id: violation.related_transaction_id || undefined,
      auto_detected: violation.auto_detected || true,
      assigned_to: violation.assigned_to || undefined,
      resolution_notes: violation.resolution_notes || undefined,
      created_at: violation.created_at,
      updated_at: violation.updated_at,
      resolved_at: violation.resolved_at || undefined
    })) || [];
  },

  async updateKYCStatus(id: string, status: string): Promise<void> {
    // Log sensitive data modification
    await SecurityEnhancementsService.logSensitiveOperation('kyc_status_update', {
      kyc_id: id,
      new_status: status
    });

    const { error } = await supabase
      .from('kyc_verifications')
      .update({ 
        status,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  },

  async updateAMLAlert(id: string, status: string, notes?: string): Promise<void> {
    const { error } = await supabase
      .from('compliance_violations_real')
      .update({
        status,
        resolution_notes: notes,
        resolved_at: status === 'resolved' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  },

  async createSuspiciousTransaction(data: {
    user_id?: string;
    amount: number;
    transaction_type: string;
    flagged_reason: string;
  }): Promise<void> {
    const { error } = await supabase
      .from('suspicious_transactions')
      .insert({
        user_id: data.user_id,
        amount: data.amount,
        transaction_type: data.transaction_type,
        review_notes: data.flagged_reason,
        review_status: 'pending',
        risk_score: 50 // Default risk score
      });

    if (error) throw error;
  }
};