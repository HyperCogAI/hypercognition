import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  User, 
  FileText, 
  Search,
  Flag,
  Clock,
  Database,
  DollarSign,
  TrendingUp,
  Eye
} from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';

interface KYCRecord {
  id: string;
  userId: string;
  userEmail: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'expired';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  documents: {
    type: string;
    status: 'uploaded' | 'verified' | 'rejected';
    uploadedAt: string;
  }[];
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    nationality: string;
    address: string;
  };
  verificationChecks: {
    identityVerification: boolean;
    addressVerification: boolean;
    sanctionsScreening: boolean;
    pepCheck: boolean;
    biometricMatch: boolean;
  };
}

interface AMLAlert {
  id: string;
  userId: string;
  userEmail: string;
  alertType: 'suspicious_transaction' | 'high_velocity' | 'sanctions_match' | 'pep_match' | 'unusual_pattern';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  description: string;
  transactionId?: string;
  amount?: number;
  currency?: string;
  detectedAt: string;
  investigatedBy?: string;
  resolutionNotes?: string;
}

interface ComplianceMetrics {
  totalKYCs: number;
  pendingReviews: number;
  activeAlerts: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  monthlyApprovals: number;
  averageReviewTime: number; // in hours
}

export function KYCAMLDashboard() {
  const { isAdmin } = useAdmin();
  const [loading, setLoading] = useState(true);
  const [kycRecords, setKycRecords] = useState<KYCRecord[]>([]);
  const [amlAlerts, setAmlAlerts] = useState<AMLAlert[]>([]);
  const [metrics, setMetrics] = useState<ComplianceMetrics | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<KYCRecord | null>(null);

  useEffect(() => {
    if (isAdmin) {
      loadComplianceData();
    }
  }, [isAdmin]);

  const loadComplianceData = async () => {
    try {
      setLoading(true);
      
      // Generate mock data for demonstration
      const mockKYCs = generateMockKYCRecords();
      const mockAlerts = generateMockAMLAlerts();
      const mockMetrics = calculateMetrics(mockKYCs, mockAlerts);
      
      setKycRecords(mockKYCs);
      setAmlAlerts(mockAlerts);
      setMetrics(mockMetrics);
      
    } catch (error) {
      console.error('Error loading compliance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockKYCRecords = (): KYCRecord[] => {
    const statuses: KYCRecord['status'][] = ['pending', 'under_review', 'approved', 'rejected'];
    const riskLevels: KYCRecord['riskLevel'][] = ['low', 'medium', 'high', 'critical'];
    
    return Array.from({ length: 25 }, (_, i) => ({
      id: `kyc_${i + 1}`,
      userId: `user_${i + 1}`,
      userEmail: `user${i + 1}@example.com`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      riskLevel: riskLevels[Math.floor(Math.random() * riskLevels.length)],
      submittedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      reviewedAt: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      reviewedBy: Math.random() > 0.5 ? 'compliance_officer_1' : undefined,
      documents: [
        {
          type: 'passport',
          status: Math.random() > 0.3 ? 'verified' : 'uploaded',
          uploadedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          type: 'proof_of_address',
          status: Math.random() > 0.4 ? 'verified' : 'uploaded',
          uploadedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      ],
      personalInfo: {
        firstName: `John${i}`,
        lastName: `Doe${i}`,
        dateOfBirth: '1990-01-01',
        nationality: 'US',
        address: `${100 + i} Main St, City, State`
      },
      verificationChecks: {
        identityVerification: Math.random() > 0.2,
        addressVerification: Math.random() > 0.3,
        sanctionsScreening: Math.random() > 0.1,
        pepCheck: Math.random() > 0.1,
        biometricMatch: Math.random() > 0.4
      }
    }));
  };

  const generateMockAMLAlerts = (): AMLAlert[] => {
    const alertTypes: AMLAlert['alertType'][] = [
      'suspicious_transaction', 'high_velocity', 'sanctions_match', 'pep_match', 'unusual_pattern'
    ];
    const severities: AMLAlert['severity'][] = ['low', 'medium', 'high', 'critical'];
    const statuses: AMLAlert['status'][] = ['open', 'investigating', 'resolved', 'false_positive'];
    
    return Array.from({ length: 15 }, (_, i) => ({
      id: `aml_${i + 1}`,
      userId: `user_${i + 1}`,
      userEmail: `user${i + 1}@example.com`,
      alertType: alertTypes[Math.floor(Math.random() * alertTypes.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      description: `Automated alert triggered due to ${alertTypes[Math.floor(Math.random() * alertTypes.length)].replace('_', ' ')}`,
      transactionId: `tx_${Date.now()}_${i}`,
      amount: Math.floor(Math.random() * 100000) + 1000,
      currency: 'USD',
      detectedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      investigatedBy: Math.random() > 0.5 ? 'aml_analyst_1' : undefined,
      resolutionNotes: Math.random() > 0.7 ? 'Reviewed and cleared' : undefined
    }));
  };

  const calculateMetrics = (kycs: KYCRecord[], alerts: AMLAlert[]): ComplianceMetrics => {
    const riskDistribution = {
      low: kycs.filter(k => k.riskLevel === 'low').length,
      medium: kycs.filter(k => k.riskLevel === 'medium').length,
      high: kycs.filter(k => k.riskLevel === 'high').length,
      critical: kycs.filter(k => k.riskLevel === 'critical').length
    };
    
    const thisMonth = new Date();
    thisMonth.setDate(1);
    
    return {
      totalKYCs: kycs.length,
      pendingReviews: kycs.filter(k => k.status === 'pending' || k.status === 'under_review').length,
      activeAlerts: alerts.filter(a => a.status === 'open' || a.status === 'investigating').length,
      riskDistribution,
      monthlyApprovals: kycs.filter(k => k.status === 'approved' && new Date(k.reviewedAt || '') >= thisMonth).length,
      averageReviewTime: 24
    };
  };

  const updateKYCStatus = async (recordId: string, newStatus: KYCRecord['status']) => {
    setKycRecords(prev => prev.map(record => 
      record.id === recordId 
        ? { 
            ...record, 
            status: newStatus, 
            reviewedAt: new Date().toISOString(),
            reviewedBy: 'current_admin'
          }
        : record
    ));
  };

  const updateAMLAlert = async (alertId: string, newStatus: AMLAlert['status'], notes?: string) => {
    setAmlAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { 
            ...alert, 
            status: newStatus,
            investigatedBy: 'current_analyst',
            resolutionNotes: notes || alert.resolutionNotes
          }
        : alert
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'resolved':
        return 'bg-green-500';
      case 'rejected':
      case 'critical':
        return 'bg-red-500';
      case 'under_review':
      case 'investigating':
        return 'bg-yellow-500';
      case 'pending':
      case 'open':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredKYCs = kycRecords.filter(record => 
    record.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.personalInfo.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.personalInfo.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAlerts = amlAlerts.filter(alert => 
    alert.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alert.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Admin access required for KYC/AML dashboard</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Compliance Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Total KYCs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalKYCs}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Pending Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{metrics.pendingReviews}</div>
              <p className="text-xs text-muted-foreground">Require attention</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Active Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{metrics.activeAlerts}</div>
              <p className="text-xs text-muted-foreground">AML monitoring</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Monthly Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{metrics.monthlyApprovals}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Avg Review Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.averageReviewTime}h</div>
              <p className="text-xs text-muted-foreground">Target: &lt; 48h</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Users</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by email, name, or transaction ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="kyc" className="space-y-4">
        <TabsList>
          <TabsTrigger value="kyc">KYC Management</TabsTrigger>
          <TabsTrigger value="aml">AML Monitoring</TabsTrigger>
          <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
          <TabsTrigger value="reports">Compliance Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="kyc" className="space-y-4">
          <div className="grid gap-4">
            {filteredKYCs.map(record => (
              <Card key={record.id} className="cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => setSelectedRecord(record)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <User className="h-4 w-4" />
                        <h3 className="font-medium">
                          {record.personalInfo.firstName} {record.personalInfo.lastName}
                        </h3>
                        <Badge className={getRiskColor(record.riskLevel)}>
                          {record.riskLevel} risk
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{record.userEmail}</p>
                      <p className="text-xs text-muted-foreground">
                        Submitted: {new Date(record.submittedAt).toLocaleDateString()}
                      </p>
                      
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          <span className="text-xs">
                            {record.documents.filter(d => d.status === 'verified').length}/{record.documents.length} docs verified
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          <span className="text-xs">
                            {Object.values(record.verificationChecks).filter(Boolean).length}/5 checks passed
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(record.status)}>
                        {record.status.replace('_', ' ')}
                      </Badge>
                      {record.status === 'pending' && (
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateKYCStatus(record.id, 'approved');
                            }}
                          >
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateKYCStatus(record.id, 'rejected');
                            }}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="aml" className="space-y-4">
          <div className="grid gap-4">
            {filteredAlerts.map(alert => (
              <Card key={alert.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Flag className="h-4 w-4 text-red-500" />
                        <h3 className="font-medium capitalize">
                          {alert.alertType.replace('_', ' ')} Alert
                        </h3>
                        <Badge className={getStatusColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.userEmail}</p>
                      <p className="text-sm">{alert.description}</p>
                      
                      {alert.transactionId && (
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Transaction: {alert.transactionId}</span>
                          {alert.amount && (
                            <span>Amount: ${alert.amount.toLocaleString()}</span>
                          )}
                          <span>Detected: {new Date(alert.detectedAt).toLocaleDateString()}</span>
                        </div>
                      )}
                      
                      {alert.resolutionNotes && (
                        <div className="bg-muted p-2 rounded text-sm">
                          <strong>Resolution:</strong> {alert.resolutionNotes}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(alert.status)}>
                        {alert.status.replace('_', ' ')}
                      </Badge>
                      {alert.status === 'open' && (
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateAMLAlert(alert.id, 'investigating')}
                          >
                            Investigate
                          </Button>
                          <Button 
                            size="sm" 
                            variant="secondary"
                            onClick={() => updateAMLAlert(alert.id, 'false_positive', 'Marked as false positive after review')}
                          >
                            False Positive
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Risk Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(metrics.riskDistribution).map(([level, count]) => {
                      const percentage = (count / metrics.totalKYCs) * 100;
                      return (
                        <div key={level} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="capitalize flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${getRiskColor(level)}`}></div>
                              {level} Risk
                            </span>
                            <span>{count} ({percentage.toFixed(1)}%)</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Risk Factors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>High Transaction Volume</span>
                      <span className="text-yellow-500">12 users</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Sanctions List Match</span>
                      <span className="text-red-500">2 users</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>PEP Status</span>
                      <span className="text-orange-500">5 users</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Incomplete Documentation</span>
                      <span className="text-yellow-500">8 users</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Suspicious Activity Report</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Generate SAR for regulatory submission
                  </p>
                  <Button className="w-full">Generate SAR</Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">KYC Status Report</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Monthly KYC completion statistics
                  </p>
                  <Button className="w-full">Download Report</Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Risk Assessment Report</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Comprehensive risk analysis
                  </p>
                  <Button className="w-full">Generate Report</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* KYC Record Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  KYC Details - {selectedRecord.personalInfo.firstName} {selectedRecord.personalInfo.lastName}
                </CardTitle>
                <Button variant="ghost" onClick={() => setSelectedRecord(null)}>×</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <Badge className={getStatusColor(selectedRecord.status)}>
                    {selectedRecord.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <Label>Risk Level</Label>
                  <Badge className={getRiskColor(selectedRecord.riskLevel)}>
                    {selectedRecord.riskLevel}
                  </Badge>
                </div>
              </div>
              
              <div>
                <Label className="text-base font-medium">Personal Information</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <Label className="text-sm">Email</Label>
                    <p className="text-sm">{selectedRecord.userEmail}</p>
                  </div>
                  <div>
                    <Label className="text-sm">Date of Birth</Label>
                    <p className="text-sm">{selectedRecord.personalInfo.dateOfBirth}</p>
                  </div>
                  <div>
                    <Label className="text-sm">Nationality</Label>
                    <p className="text-sm">{selectedRecord.personalInfo.nationality}</p>
                  </div>
                  <div>
                    <Label className="text-sm">Address</Label>
                    <p className="text-sm">{selectedRecord.personalInfo.address}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="text-base font-medium">Verification Checks</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {Object.entries(selectedRecord.verificationChecks).map(([check, passed]) => (
                    <div key={check} className="flex items-center gap-2">
                      {passed ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-sm capitalize">{check.replace(/([A-Z])/g, ' $1').trim()}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <Label className="text-base font-medium">Documents</Label>
                <div className="space-y-2 mt-2">
                  {selectedRecord.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm capitalize">{doc.type.replace('_', ' ')}</span>
                      <Badge className={getStatusColor(doc.status)}>
                        {doc.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    updateKYCStatus(selectedRecord.id, 'approved');
                    setSelectedRecord(null);
                  }}
                  className="flex-1"
                >
                  Approve
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => {
                    updateKYCStatus(selectedRecord.id, 'rejected');
                    setSelectedRecord(null);
                  }}
                  className="flex-1"
                >
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}