import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Globe, Shield, AlertTriangle, CheckCircle, FileText, Download, Upload, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Jurisdiction {
  id: string;
  name: string;
  code: string;
  flag: string;
  status: 'compliant' | 'pending' | 'non_compliant';
  regulations: string[];
  lastAudit: string;
  nextAudit: string;
  complianceScore: number;
  requirements: ComplianceRequirement[];
}

interface ComplianceRequirement {
  id: string;
  name: string;
  description: string;
  status: 'met' | 'pending' | 'not_met';
  deadline?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface RegulatoryReport {
  id: string;
  jurisdiction: string;
  type: string;
  period: string;
  status: 'submitted' | 'pending' | 'draft';
  dueDate: string;
  submittedDate?: string;
}

const MultiJurisdictionCompliance: React.FC = () => {
  const [jurisdictions, setJurisdictions] = useState<Jurisdiction[]>([]);
  const [reports, setReports] = useState<RegulatoryReport[]>([]);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    // Initialize jurisdictions
    const mockJurisdictions: Jurisdiction[] = [
      {
        id: '1',
        name: 'United States',
        code: 'US',
        flag: '🇺🇸',
        status: 'compliant',
        regulations: ['SEC', 'CFTC', 'FinCEN', 'FINRA'],
        lastAudit: '2024-01-15',
        nextAudit: '2024-07-15',
        complianceScore: 95,
        requirements: [
          {
            id: '1',
            name: 'AML Program',
            description: 'Anti-Money Laundering compliance program',
            status: 'met',
            priority: 'critical'
          },
          {
            id: '2',
            name: 'KYC Procedures',
            description: 'Know Your Customer verification processes',
            status: 'met',
            priority: 'critical'
          },
          {
            id: '3',
            name: 'Trading Surveillance',
            description: 'Market manipulation detection systems',
            status: 'met',
            priority: 'high'
          }
        ]
      },
      {
        id: '2',
        name: 'European Union',
        code: 'EU',
        flag: '🇪🇺',
        status: 'compliant',
        regulations: ['MiFID II', 'GDPR', 'AMLD5', 'EMIR'],
        lastAudit: '2024-01-10',
        nextAudit: '2024-04-10',
        complianceScore: 92,
        requirements: [
          {
            id: '4',
            name: 'GDPR Compliance',
            description: 'General Data Protection Regulation compliance',
            status: 'met',
            priority: 'critical'
          },
          {
            id: '5',
            name: 'MiFID II Reporting',
            description: 'Markets in Financial Instruments Directive reporting',
            status: 'met',
            priority: 'high'
          },
          {
            id: '6',
            name: 'Best Execution',
            description: 'Best execution policies and procedures',
            status: 'pending',
            deadline: '2024-02-15',
            priority: 'medium'
          }
        ]
      },
      {
        id: '3',
        name: 'United Kingdom',
        code: 'UK',
        flag: '🇬🇧',
        status: 'pending',
        regulations: ['FCA Rules', 'PRA Requirements', 'UK GDPR'],
        lastAudit: '2023-12-01',
        nextAudit: '2024-03-01',
        complianceScore: 78,
        requirements: [
          {
            id: '7',
            name: 'FCA Authorization',
            description: 'Financial Conduct Authority authorization',
            status: 'pending',
            deadline: '2024-02-01',
            priority: 'critical'
          },
          {
            id: '8',
            name: 'SMCR Implementation',
            description: 'Senior Managers and Certification Regime',
            status: 'not_met',
            deadline: '2024-01-31',
            priority: 'high'
          }
        ]
      },
      {
        id: '4',
        name: 'Singapore',
        code: 'SG',
        flag: '🇸🇬',
        status: 'compliant',
        regulations: ['MAS Rules', 'SFA', 'PDPA'],
        lastAudit: '2024-01-08',
        nextAudit: '2024-06-08',
        complianceScore: 89,
        requirements: [
          {
            id: '9',
            name: 'MAS Licensing',
            description: 'Monetary Authority of Singapore licensing',
            status: 'met',
            priority: 'critical'
          },
          {
            id: '10',
            name: 'PDPA Compliance',
            description: 'Personal Data Protection Act compliance',
            status: 'met',
            priority: 'high'
          }
        ]
      }
    ];

    const mockReports: RegulatoryReport[] = [
      {
        id: '1',
        jurisdiction: 'US',
        type: 'SAR Filing',
        period: 'Q4 2023',
        status: 'submitted',
        dueDate: '2024-01-31',
        submittedDate: '2024-01-25'
      },
      {
        id: '2',
        jurisdiction: 'EU',
        type: 'MiFID II Transaction Reporting',
        period: 'Q4 2023',
        status: 'submitted',
        dueDate: '2024-01-30',
        submittedDate: '2024-01-28'
      },
      {
        id: '3',
        jurisdiction: 'UK',
        type: 'FCA Return',
        period: 'Q4 2023',
        status: 'pending',
        dueDate: '2024-02-15'
      },
      {
        id: '4',
        jurisdiction: 'SG',
        type: 'MAS Quarterly Report',
        period: 'Q4 2023',
        status: 'draft',
        dueDate: '2024-02-10'
      }
    ];

    setJurisdictions(mockJurisdictions);
    setReports(mockReports);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'compliant':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Compliant</Badge>;
      case 'pending':
        return <Badge variant="secondary"><AlertTriangle className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'non_compliant':
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Non-Compliant</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRequirementBadge = (status: string) => {
    switch (status) {
      case 'met':
        return <Badge className="bg-green-500">Met</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'not_met':
        return <Badge variant="destructive">Not Met</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'high':
        return <Badge className="bg-orange-500">High</Badge>;
      case 'medium':
        return <Badge variant="secondary">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getReportStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Badge className="bg-green-500">Submitted</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const generateReport = () => {
    toast({
      title: "Report Generated",
      description: "Regulatory report has been generated and is ready for submission.",
    });
  };

  const submitReport = () => {
    toast({
      title: "Report Submitted",
      description: "Report has been successfully submitted to the regulatory authority.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Multi-Jurisdiction Compliance</h1>
          <p className="text-muted-foreground">Global regulatory compliance management</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate Regulatory Report</DialogTitle>
                <DialogDescription>Create a new regulatory compliance report</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Jurisdiction</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select jurisdiction" />
                    </SelectTrigger>
                    <SelectContent>
                      {jurisdictions.map((jurisdiction) => (
                        <SelectItem key={jurisdiction.id} value={jurisdiction.code}>
                          {jurisdiction.flag} {jurisdiction.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Report Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sar">Suspicious Activity Report</SelectItem>
                      <SelectItem value="transaction">Transaction Report</SelectItem>
                      <SelectItem value="quarterly">Quarterly Return</SelectItem>
                      <SelectItem value="annual">Annual Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Reporting Period</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="q1-2024">Q1 2024</SelectItem>
                      <SelectItem value="q4-2023">Q4 2023</SelectItem>
                      <SelectItem value="q3-2023">Q3 2023</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={generateReport} className="w-full">
                  Generate Report
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jurisdictions</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jurisdictions.length}</div>
            <p className="text-xs text-muted-foreground">
              {jurisdictions.filter(j => j.status === 'compliant').length} compliant
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(jurisdictions.reduce((sum, j) => sum + j.complianceScore, 0) / jurisdictions.length)}%
            </div>
            <Progress value={Math.round(jurisdictions.reduce((sum, j) => sum + j.complianceScore, 0) / jurisdictions.length)} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.filter(r => r.status === 'pending' || r.status === 'draft').length}</div>
            <p className="text-xs text-muted-foreground">
              Due this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {jurisdictions.reduce((sum, j) => sum + j.requirements.filter(r => r.priority === 'critical' && r.status !== 'met').length, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="jurisdictions">Jurisdictions</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Status by Jurisdiction</CardTitle>
                <CardDescription>Current compliance status across all jurisdictions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {jurisdictions.map((jurisdiction) => (
                    <div key={jurisdiction.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{jurisdiction.flag}</span>
                        <div>
                          <p className="font-medium">{jurisdiction.name}</p>
                          <p className="text-sm text-muted-foreground">Score: {jurisdiction.complianceScore}%</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(jurisdiction.status)}
                        <p className="text-sm text-muted-foreground mt-1">
                          Next audit: {jurisdiction.nextAudit}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Deadlines</CardTitle>
                <CardDescription>Critical compliance deadlines and requirements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {jurisdictions.flatMap(j => 
                    j.requirements.filter(r => r.deadline && r.status !== 'met')
                  ).sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime()).map((requirement, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{requirement.name}</p>
                        <p className="text-sm text-muted-foreground">{requirement.description}</p>
                      </div>
                      <div className="text-right">
                        {getPriorityBadge(requirement.priority)}
                        <p className="text-sm text-muted-foreground mt-1">
                          Due: {requirement.deadline}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="jurisdictions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {jurisdictions.map((jurisdiction) => (
              <Card key={jurisdiction.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{jurisdiction.flag}</span>
                      <CardTitle className="text-lg">{jurisdiction.name}</CardTitle>
                    </div>
                    {getStatusBadge(jurisdiction.status)}
                  </div>
                  <CardDescription>Compliance Score: {jurisdiction.complianceScore}%</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Regulations</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {jurisdiction.regulations.map((regulation, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {regulation}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Last Audit</span>
                      <span className="text-sm font-medium">{jurisdiction.lastAudit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Next Audit</span>
                      <span className="text-sm font-medium">{jurisdiction.nextAudit}</span>
                    </div>
                  </div>

                  <Progress value={jurisdiction.complianceScore} className="h-2" />

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="requirements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Requirements</CardTitle>
              <CardDescription>Detailed requirements across all jurisdictions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {jurisdictions.map((jurisdiction) => (
                  <div key={jurisdiction.id} className="border rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="text-xl">{jurisdiction.flag}</span>
                      <h3 className="font-semibold">{jurisdiction.name}</h3>
                      {getStatusBadge(jurisdiction.status)}
                    </div>
                    
                    <div className="space-y-3">
                      {jurisdiction.requirements.map((requirement) => (
                        <div key={requirement.id} className="flex items-center justify-between p-3 bg-muted rounded">
                          <div>
                            <p className="font-medium">{requirement.name}</p>
                            <p className="text-sm text-muted-foreground">{requirement.description}</p>
                            {requirement.deadline && (
                              <p className="text-sm text-muted-foreground">Deadline: {requirement.deadline}</p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {getPriorityBadge(requirement.priority)}
                            {getRequirementBadge(requirement.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Regulatory Reports</CardTitle>
              <CardDescription>Manage and track regulatory submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{report.type}</h3>
                      <p className="text-sm text-muted-foreground">
                        {jurisdictions.find(j => j.code === report.jurisdiction)?.name} • {report.period}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Due: {report.dueDate}
                        {report.submittedDate && ` • Submitted: ${report.submittedDate}`}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getReportStatusBadge(report.status)}
                      <div className="flex space-x-2">
                        {report.status === 'draft' && (
                          <Button variant="outline" size="sm">
                            <Upload className="w-4 h-4 mr-1" />
                            Submit
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Monitoring</CardTitle>
              <CardDescription>Real-time compliance monitoring and alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Monitoring Settings</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Real-time Monitoring</Label>
                      <p className="text-sm text-muted-foreground">Enable continuous compliance monitoring</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Automated Alerts</Label>
                      <p className="text-sm text-muted-foreground">Send alerts for compliance violations</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Deadline Reminders</Label>
                      <p className="text-sm text-muted-foreground">Remind about upcoming deadlines</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold">Recent Alerts</h3>
                  
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      UK FCA Authorization deadline approaching (7 days remaining)
                    </AlertDescription>
                  </Alert>
                  
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      US SAR Filing successfully submitted for Q4 2023
                    </AlertDescription>
                  </Alert>
                  
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      EU GDPR compliance review completed successfully
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MultiJurisdictionCompliance;