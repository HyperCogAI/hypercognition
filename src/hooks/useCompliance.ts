import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ComplianceFramework {
  id: string;
  name: string;
  region: string;
  type: 'mifid2' | 'sec' | 'cftc' | 'fca' | 'asic' | 'finra' | 'custom';
  status: 'active' | 'pending' | 'disabled';
  requirements: ComplianceRequirement[];
}

export interface ComplianceRequirement {
  id: string;
  framework_id: string;
  name: string;
  description: string;
  category: 'reporting' | 'record_keeping' | 'disclosure' | 'monitoring' | 'risk_management';
  severity: 'low' | 'medium' | 'high' | 'critical';
  frequency: 'real_time' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  automated: boolean;
  last_check: string;
  status: 'compliant' | 'non_compliant' | 'warning' | 'pending';
}

export interface ComplianceViolation {
  id: string;
  requirement_id: string;
  type: 'threshold_breach' | 'missing_data' | 'late_reporting' | 'policy_violation' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  detected_at: string;
  resolved_at?: string;
  data: Record<string, any>;
  remediation_actions: string[];
  assigned_to?: string;
}

export interface AuditTrail {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: Record<string, any>;
  ip_address: string;
  user_agent: string;
  timestamp: string;
  compliance_relevant: boolean;
}

export interface RegulatoryReport {
  id: string;
  framework_id: string;
  type: 'transaction_report' | 'position_report' | 'risk_report' | 'compliance_report';
  period_start: string;
  period_end: string;
  status: 'draft' | 'pending_review' | 'submitted' | 'acknowledged';
  generated_at: string;
  submitted_at?: string;
  file_url?: string;
  metadata: Record<string, any>;
}

export interface ComplianceMetrics {
  overall_score: number;
  frameworks_count: number;
  active_violations: number;
  resolved_violations: number;
  pending_reports: number;
  automation_coverage: number;
  last_audit_date: string;
}

export const useCompliance = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([]);
  const [violations, setViolations] = useState<ComplianceViolation[]>([]);
  const [auditTrail, setAuditTrail] = useState<AuditTrail[]>([]);
  const [reports, setReports] = useState<RegulatoryReport[]>([]);
  const [selectedFramework, setSelectedFramework] = useState<string>('');

  // Fetch compliance data
  useEffect(() => {
    if (!user) return;

    const fetchComplianceData = async () => {
      try {
        setLoading(true);
        // For now, generate mock data since compliance tables don't exist yet
        generateMockData();
      } catch (error) {
        console.error('Error fetching compliance data:', error);
        generateMockData();
      } finally {
        setLoading(false);
      }
    };

    fetchComplianceData();
  }, [user]);

  // Generate mock data for demonstration
  const generateMockData = () => {
    const mockFrameworks: ComplianceFramework[] = [
      {
        id: 'mifid2_eu',
        name: 'MiFID II',
        region: 'European Union',
        type: 'mifid2',
        status: 'active',
        requirements: [
          {
            id: 'req_1',
            framework_id: 'mifid2_eu',
            name: 'Transaction Reporting',
            description: 'Report all transactions to relevant competent authorities within T+1',
            category: 'reporting',
            severity: 'critical',
            frequency: 'daily',
            automated: true,
            last_check: new Date().toISOString(),
            status: 'compliant'
          },
          {
            id: 'req_2',
            framework_id: 'mifid2_eu',
            name: 'Best Execution Monitoring',
            description: 'Monitor and demonstrate best execution for client orders',
            category: 'monitoring',
            severity: 'high',
            frequency: 'real_time',
            automated: true,
            last_check: new Date().toISOString(),
            status: 'warning'
          }
        ]
      },
      {
        id: 'sec_us',
        name: 'SEC Regulations',
        region: 'United States',
        type: 'sec',
        status: 'active',
        requirements: [
          {
            id: 'req_3',
            framework_id: 'sec_us',
            name: 'Form PF Reporting',
            description: 'File Form PF for private fund advisers',
            category: 'reporting',
            severity: 'critical',
            frequency: 'quarterly',
            automated: false,
            last_check: new Date(Date.now() - 86400000).toISOString(),
            status: 'pending'
          }
        ]
      }
    ];

    const mockViolations: ComplianceViolation[] = [
      {
        id: 'viol_1',
        requirement_id: 'req_2',
        type: 'threshold_breach',
        severity: 'medium',
        status: 'open',
        detected_at: new Date(Date.now() - 3600000).toISOString(),
        data: {
          order_id: 'ORD_123456',
          execution_venue: 'Exchange A',
          price_difference: 0.002,
          threshold: 0.001
        },
        remediation_actions: [
          'Review execution venue selection',
          'Update best execution policy',
          'Notify compliance team'
        ]
      },
      {
        id: 'viol_2',
        requirement_id: 'req_1',
        type: 'late_reporting',
        severity: 'high',
        status: 'investigating',
        detected_at: new Date(Date.now() - 7200000).toISOString(),
        data: {
          report_type: 'transaction_report',
          due_date: new Date(Date.now() - 86400000).toISOString(),
          delay_hours: 2
        },
        remediation_actions: [
          'Submit overdue report immediately',
          'Investigate system delay',
          'Implement monitoring alerts'
        ],
        assigned_to: 'compliance_officer_1'
      }
    ];

    const mockAuditTrail: AuditTrail[] = [
      {
        id: 'audit_1',
        user_id: user?.id || 'user_1',
        action: 'CREATE_ORDER',
        resource_type: 'order',
        resource_id: 'ORD_123456',
        details: {
          symbol: 'AAPL',
          quantity: 1000,
          price: 150.50,
          side: 'buy'
        },
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0...',
        timestamp: new Date().toISOString(),
        compliance_relevant: true
      },
      {
        id: 'audit_2',
        user_id: user?.id || 'user_1',
        action: 'UPDATE_POSITION',
        resource_type: 'position',
        resource_id: 'POS_789',
        details: {
          symbol: 'TSLA',
          old_quantity: 500,
          new_quantity: 750
        },
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0...',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        compliance_relevant: true
      }
    ];

    const mockReports: RegulatoryReport[] = [
      {
        id: 'report_1',
        framework_id: 'mifid2_eu',
        type: 'transaction_report',
        period_start: new Date(Date.now() - 86400000).toISOString(),
        period_end: new Date().toISOString(),
        status: 'submitted',
        generated_at: new Date(Date.now() - 3600000).toISOString(),
        submitted_at: new Date(Date.now() - 1800000).toISOString(),
        file_url: '/reports/transaction_report_20241201.xml',
        metadata: {
          transaction_count: 1247,
          file_size: '2.3MB',
          submission_id: 'SUB_20241201_001'
        }
      },
      {
        id: 'report_2',
        framework_id: 'sec_us',
        type: 'position_report',
        period_start: new Date(Date.now() - 2592000000).toISOString(), // 30 days ago
        period_end: new Date().toISOString(),
        status: 'pending_review',
        generated_at: new Date(Date.now() - 7200000).toISOString(),
        metadata: {
          position_count: 89,
          total_value: 50000000
        }
      }
    ];

    setFrameworks(mockFrameworks);
    setViolations(mockViolations);
    setAuditTrail(mockAuditTrail);
    setReports(mockReports);
    setSelectedFramework(mockFrameworks[0]?.id || '');
  };

  // Calculate compliance metrics
  const complianceMetrics: ComplianceMetrics = useMemo(() => {
    const totalRequirements = frameworks.reduce((sum, f) => sum + f.requirements.length, 0);
    const compliantRequirements = frameworks.reduce((sum, f) => 
      sum + f.requirements.filter(r => r.status === 'compliant').length, 0);
    
    const overallScore = totalRequirements > 0 ? (compliantRequirements / totalRequirements) * 100 : 0;
    const activeViolations = violations.filter(v => v.status === 'open').length;
    const resolvedViolations = violations.filter(v => v.status === 'resolved').length;
    const pendingReports = reports.filter(r => r.status === 'draft' || r.status === 'pending_review').length;
    
    const automatedRequirements = frameworks.reduce((sum, f) => 
      sum + f.requirements.filter(r => r.automated).length, 0);
    const automationCoverage = totalRequirements > 0 ? (automatedRequirements / totalRequirements) * 100 : 0;

    return {
      overall_score: overallScore,
      frameworks_count: frameworks.length,
      active_violations: activeViolations,
      resolved_violations: resolvedViolations,
      pending_reports: pendingReports,
      automation_coverage: automationCoverage,
      last_audit_date: auditTrail[0]?.timestamp || new Date().toISOString()
    };
  }, [frameworks, violations, reports, auditTrail]);

  // Resolve violation
  const resolveViolation = async (violationId: string, resolution: string) => {
    try {
      setViolations(prev => prev.map(violation => 
        violation.id === violationId 
          ? {
              ...violation,
              status: 'resolved',
              resolved_at: new Date().toISOString(),
              remediation_actions: [...violation.remediation_actions, resolution]
            }
          : violation
      ));

      toast({
        title: "Violation Resolved",
        description: "The compliance violation has been marked as resolved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resolve violation",
        variant: "destructive",
      });
    }
  };

  // Generate report
  const generateReport = async (frameworkId: string, reportType: RegulatoryReport['type'], periodStart: string, periodEnd: string) => {
    try {
      const newReport: RegulatoryReport = {
        id: `report_${Date.now()}`,
        framework_id: frameworkId,
        type: reportType,
        period_start: periodStart,
        period_end: periodEnd,
        status: 'draft',
        generated_at: new Date().toISOString(),
        metadata: {
          status: 'generating'
        }
      };

      setReports(prev => [newReport, ...prev]);

      // Simulate report generation
      setTimeout(() => {
        setReports(prev => prev.map(report => 
          report.id === newReport.id 
            ? {
                ...report,
                status: 'pending_review',
                file_url: `/reports/${reportType}_${Date.now()}.pdf`,
                metadata: {
                  ...report.metadata,
                  status: 'completed',
                  file_size: '1.8MB'
                }
              }
            : report
        ));
      }, 3000);

      toast({
        title: "Report Generation Started",
        description: "Your regulatory report is being generated.",
      });

      return newReport;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Run compliance check
  const runComplianceCheck = async (requirementId?: string) => {
    try {
      toast({
        title: "Compliance Check Started",
        description: requirementId ? "Running specific requirement check..." : "Running full compliance check...",
      });

      // Simulate compliance check
      setTimeout(() => {
        if (requirementId) {
          setFrameworks(prev => prev.map(framework => ({
            ...framework,
            requirements: framework.requirements.map(req => 
              req.id === requirementId 
                ? { ...req, last_check: new Date().toISOString(), status: 'compliant' }
                : req
            )
          })));
        } else {
          setFrameworks(prev => prev.map(framework => ({
            ...framework,
            requirements: framework.requirements.map(req => ({
              ...req,
              last_check: new Date().toISOString()
            }))
          })));
        }

        toast({
          title: "Compliance Check Complete",
          description: "All checks have been completed successfully.",
        });
      }, 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to run compliance check",
        variant: "destructive",
      });
    }
  };

  // Create audit log entry
  const logAuditEvent = async (action: string, resourceType: string, resourceId: string, details: Record<string, any>) => {
    try {
      const auditEntry: AuditTrail = {
        id: `audit_${Date.now()}`,
        user_id: user?.id || 'system',
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        details,
        ip_address: '192.168.1.100', // In real app, get actual IP
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        compliance_relevant: true
      };

      setAuditTrail(prev => [auditEntry, ...prev]);
      
      return auditEntry;
    } catch (error) {
      console.error('Failed to log audit event:', error);
    }
  };

  return {
    loading,
    frameworks,
    violations,
    auditTrail,
    reports,
    complianceMetrics,
    selectedFramework,
    setSelectedFramework,
    resolveViolation,
    generateReport,
    runComplianceCheck,
    logAuditEvent,
    getFrameworkRequirements: (frameworkId: string) => {
      const framework = frameworks.find(f => f.id === frameworkId);
      return framework?.requirements || [];
    },
    getViolationsByFramework: (frameworkId: string) => {
      const requirements = frameworks.find(f => f.id === frameworkId)?.requirements || [];
      const requirementIds = requirements.map(r => r.id);
      return violations.filter(v => requirementIds.includes(v.requirement_id));
    }
  };
};