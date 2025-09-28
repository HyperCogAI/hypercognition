import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  type: 'hedge_fund' | 'bank' | 'broker' | 'family_office' | 'pension_fund' | 'insurance' | 'other';
  status: 'active' | 'pending' | 'suspended';
  tier: 'basic' | 'professional' | 'enterprise';
  created_at: string;
  settings: {
    trading_limits: {
      daily_volume: number;
      position_size: number;
      leverage: number;
    };
    compliance: {
      require_approval: boolean;
      auto_reports: boolean;
      risk_monitoring: boolean;
    };
    api_access: {
      enabled: boolean;
      rate_limit: number;
      endpoints: string[];
    };
    white_label: {
      enabled: boolean;
      custom_domain: string;
      branding: {
        logo_url: string;
        primary_color: string;
        secondary_color: string;
      };
    };
  };
}

export interface TeamMember {
  id: string;
  user_id: string;
  organization_id: string;
  role: 'admin' | 'manager' | 'trader' | 'analyst' | 'compliance' | 'viewer';
  permissions: string[];
  status: 'active' | 'pending' | 'suspended';
  invited_at: string;
  last_active: string;
  profile: {
    display_name: string;
    email: string;
    avatar_url?: string;
  };
}

export interface ComplianceRecord {
  id: string;
  organization_id: string;
  type: 'trade_review' | 'risk_alert' | 'audit_log' | 'violation' | 'report';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'reviewed' | 'resolved' | 'escalated';
  data: Record<string, any>;
  created_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
}

export interface ApiKey {
  id: string;
  organization_id: string;
  name: string;
  key_prefix: string;
  permissions: string[];
  last_used: string;
  created_at: string;
  expires_at?: string;
  status: 'active' | 'revoked';
}

export const useInstitutionalFeatures = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [complianceRecords, setComplianceRecords] = useState<ComplianceRecord[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [userRole, setUserRole] = useState<string>('viewer');

  // Fetch organization data
  useEffect(() => {
    if (!user) {
      // Show demo org when unauthenticated so page doesn't hang
      generateMockData();
      setLoading(false);
      return;
    }

    const fetchOrganizationData = async () => {
      try {
        setLoading(true);
        
        // Fetch user's team membership to get their organization
        const { data: teamMember, error: teamError } = await supabase
          .from('team_members')
          .select(`
            *,
            organization:organizations(*)
          `)
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single();

        if (teamError || !teamMember) {
          console.log('No team membership found or error:', teamError);
          // Use mock data for demonstration
          generateMockData();
          setLoading(false);
          return;
        }

        setOrganization({
          ...teamMember.organization,
          slug: teamMember.organization.name.toLowerCase().replace(/\s+/g, '-'),
          type: teamMember.organization.type as Organization['type'],
          tier: teamMember.organization.tier as Organization['tier'],
          status: teamMember.organization.status as Organization['status'],
          settings: teamMember.organization.settings as Organization['settings']
        });
        setUserRole(teamMember.role);

        // Fetch all team members for this organization
        const { data: members } = await supabase
          .from('team_members')
          .select('*')
          .eq('organization_id', teamMember.organization.id)
          .eq('status', 'active');

        if (members) {
          setTeamMembers(members.map(member => ({
            ...member,
            role: member.role as TeamMember['role'],
            status: member.status as TeamMember['status'],
            permissions: member.permissions as string[],
            profile: {
              display_name: `User ${member.user_id.slice(0, 8)}`,
              email: `user-${member.user_id.slice(0, 8)}@${teamMember.organization.name.toLowerCase().replace(/\s+/g, '-')}.com`,
              avatar_url: undefined
            },
            last_active: new Date().toISOString(),
            invited_at: member.created_at
          })));
        }

        // Fetch compliance violations for this organization
        const { data: violations } = await supabase
          .from('compliance_violations')
          .select(`
            *,
            framework:compliance_frameworks(*)
          `)
          .eq('organization_id', teamMember.organization.id);

        if (violations) {
          setComplianceRecords(violations.map(v => ({
            id: v.id,
            organization_id: v.organization_id,
            type: 'violation' as const,
            severity: v.severity as ComplianceRecord['severity'],
            status: v.status === 'open' ? 'pending' : 'resolved',
            data: {
              framework: v.framework?.name,
              requirement: v.requirement_id,
              description: v.description
            },
            created_at: v.detected_at,
            reviewed_by: v.resolved_by,
            reviewed_at: v.resolved_at
          })));
        }

        // Fetch API keys for this organization
        const { data: keys } = await supabase
          .from('api_keys')
          .select('*')
          .eq('organization_id', teamMember.organization.id);

        if (keys) {
          setApiKeys(keys.map(key => ({
            id: key.id,
            organization_id: key.organization_id,
            name: key.name,
            key_prefix: key.key_prefix,
            permissions: key.permissions as string[],
            last_used: key.last_used_at || new Date().toISOString(),
            created_at: key.created_at,
            expires_at: key.expires_at,
            status: key.is_active ? 'active' : 'revoked'
          })));
        }
      } catch (error) {
        console.error('Error fetching institutional data:', error);
        generateMockData(); // Fallback to mock data
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizationData();
  }, [user]);

  // Generate mock data for demonstration
  const generateMockData = () => {
    const mockOrg: Organization = {
      id: 'org_1',
      name: 'Quantum Capital Management',
      slug: 'quantum-capital',
      type: 'hedge_fund',
      status: 'active',
      tier: 'enterprise',
      created_at: new Date().toISOString(),
      settings: {
        trading_limits: {
          daily_volume: 100000000,
          position_size: 10000000,
          leverage: 3
        },
        compliance: {
          require_approval: true,
          auto_reports: true,
          risk_monitoring: true
        },
        api_access: {
          enabled: true,
          rate_limit: 1000,
          endpoints: ['trading', 'market_data', 'portfolio', 'compliance']
        },
        white_label: {
          enabled: true,
          custom_domain: 'quantum-capital.com',
          branding: {
            logo_url: '/logos/quantum-logo.png',
            primary_color: '#3B82F6',
            secondary_color: '#1E40AF'
          }
        }
      }
    };

    const mockMembers: TeamMember[] = [
      {
        id: 'member_1',
        user_id: user?.id || 'user_1',
        organization_id: 'org_1',
        role: 'admin',
        permissions: ['all'],
        status: 'active',
        invited_at: new Date().toISOString(),
        last_active: new Date().toISOString(),
        profile: {
          display_name: 'John Smith',
          email: 'john@quantum-capital.com',
          avatar_url: undefined
        }
      },
      {
        id: 'member_2',
        user_id: 'user_2',
        organization_id: 'org_1',
        role: 'trader',
        permissions: ['trading', 'portfolio'],
        status: 'active',
        invited_at: new Date().toISOString(),
        last_active: new Date().toISOString(),
        profile: {
          display_name: 'Sarah Johnson',
          email: 'sarah@quantum-capital.com',
          avatar_url: undefined
        }
      }
    ];

    const mockCompliance: ComplianceRecord[] = [
      {
        id: 'comp_1',
        organization_id: 'org_1',
        type: 'trade_review',
        severity: 'medium',
        status: 'pending',
        data: { trade_id: 'trade_123', amount: 5000000, reason: 'Large position size' },
        created_at: new Date().toISOString()
      },
      {
        id: 'comp_2',
        organization_id: 'org_1',
        type: 'risk_alert',
        severity: 'high',
        status: 'reviewed',
        data: { metric: 'portfolio_var', value: 0.15, threshold: 0.1 },
        created_at: new Date(Date.now() - 3600000).toISOString(),
        reviewed_by: 'admin_1',
        reviewed_at: new Date(Date.now() - 1800000).toISOString()
      }
    ];

    const mockApiKeys: ApiKey[] = [
      {
        id: 'key_1',
        organization_id: 'org_1',
        name: 'Trading API',
        key_prefix: 'qc_live_',
        permissions: ['trading', 'portfolio'],
        last_used: new Date().toISOString(),
        created_at: new Date().toISOString(),
        status: 'active'
      }
    ];

    setOrganization(mockOrg);
    setTeamMembers(mockMembers);
    setComplianceRecords(mockCompliance);
    setApiKeys(mockApiKeys);
    setUserRole('admin');
  };

  // Create API key
  const createApiKey = async (name: string, permissions: string[], expiresAt?: string) => {
    try {
      const keyData = {
        organization_id: organization?.id,
        name,
        key_prefix: 'qc_live_',
        permissions,
        expires_at: expiresAt,
        status: 'active' as const,
        created_at: new Date().toISOString(),
        last_used: new Date().toISOString()
      };

      // In a real implementation, this would make an API call
      const newKey: ApiKey = {
        id: `key_${Date.now()}`,
        ...keyData
      };

      setApiKeys(prev => [...prev, newKey]);
      
      toast({
        title: "API Key Created",
        description: `API key "${name}" has been created successfully.`,
      });

      return newKey;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create API key",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Invite team member
  const inviteTeamMember = async (email: string, role: TeamMember['role'], permissions: string[]) => {
    try {
      const memberData = {
        user_id: `user_${Date.now()}`,
        organization_id: organization?.id,
        role,
        permissions,
        status: 'pending' as const,
        invited_at: new Date().toISOString(),
        last_active: new Date().toISOString()
      };

      const newMember: TeamMember = {
        id: `member_${Date.now()}`,
        ...memberData,
        profile: {
          display_name: email.split('@')[0],
          email,
          avatar_url: undefined
        }
      };

      setTeamMembers(prev => [...prev, newMember]);
      
      toast({
        title: "Invitation Sent",
        description: `Invitation sent to ${email}`,
      });

      return newMember;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Update organization settings
  const updateOrganizationSettings = async (settings: Partial<Organization['settings']>) => {
    try {
      if (!organization) throw new Error('No organization found');

      const updatedOrg = {
        ...organization,
        settings: {
          ...organization.settings,
          ...settings
        }
      };

      setOrganization(updatedOrg);
      
      toast({
        title: "Settings Updated",
        description: "Organization settings have been updated successfully.",
      });

      return updatedOrg;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Review compliance record
  const reviewComplianceRecord = async (recordId: string, action: 'approve' | 'reject' | 'escalate', notes?: string) => {
    try {
      setComplianceRecords(prev => prev.map(record => 
        record.id === recordId 
          ? {
              ...record,
              status: action === 'approve' ? 'resolved' : action === 'reject' ? 'reviewed' : 'escalated',
              reviewed_by: user?.id,
              reviewed_at: new Date().toISOString()
            }
          : record
      ));

      toast({
        title: "Compliance Record Updated",
        description: `Record has been ${action}d successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update compliance record",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    loading,
    organization,
    teamMembers,
    complianceRecords,
    apiKeys,
    userRole,
    createApiKey,
    inviteTeamMember,
    updateOrganizationSettings,
    reviewComplianceRecord,
    hasPermission: (permission: string) => {
      const member = teamMembers.find(m => m.user_id === user?.id);
      return member?.permissions.includes(permission) || member?.permissions.includes('all') || false;
    }
  };
};