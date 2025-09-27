import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, AlertTriangle, CheckCircle, Clock, FileText, 
  Download, Play, Eye, Filter, Calendar, Users, 
  BarChart3, Activity, Settings, Zap, Search
} from 'lucide-react';
import { useCompliance } from '@/hooks/useCompliance';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export const ComplianceDashboard: React.FC = () => {
  const { 
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
    getFrameworkRequirements,
    getViolationsByFramework
  } = useCompliance();

  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [reportType, setReportType] = useState<'transaction_report' | 'position_report' | 'risk_report' | 'compliance_report'>('transaction_report');
  const [reportPeriod, setReportPeriod] = useState('last_30_days');
  const [violationFilter, setViolationFilter] = useState('all');
  const [auditFilter, setAuditFilter] = useState('');

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': case 'resolved': case 'submitted': return 'text-green-400';
      case 'warning': case 'investigating': case 'pending_review': return 'text-yellow-400';
      case 'non_compliant': case 'open': case 'critical': return 'text-red-400';
      case 'pending': case 'draft': return 'text-blue-400';
      default: return 'text-muted-foreground';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-blue-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-orange-400';
      case 'critical': return 'text-red-400';
      default: return 'text-muted-foreground';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleGenerateReport = async () => {
    if (!selectedFramework) return;
    
    const now = new Date();
    const periodStart = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000)).toISOString(); // 30 days ago
    const periodEnd = now.toISOString();
    
    try {
      await generateReport(selectedFramework, reportType, periodStart, periodEnd);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleResolveViolation = async (violationId: string) => {
    const resolution = prompt('Enter resolution details:');
    if (resolution) {
      await resolveViolation(violationId, resolution);
    }
  };

  const filteredViolations = violations.filter(violation => {
    if (violationFilter === 'all') return true;
    return violation.status === violationFilter;
  });

  const filteredAuditTrail = auditTrail.filter(entry => {
    if (!auditFilter) return true;
    return entry.action.toLowerCase().includes(auditFilter.toLowerCase()) ||
           entry.resource_type.toLowerCase().includes(auditFilter.toLowerCase());
  });

  const currentFramework = frameworks.find(f => f.id === selectedFramework);
  const currentRequirements = getFrameworkRequirements(selectedFramework);
  const currentViolations = getViolationsByFramework(selectedFramework);

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
            Compliance &{" "}
            <span className="text-white">
              Regulatory
            </span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Monitor regulatory compliance and manage risk across all frameworks
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Select value={selectedFramework} onValueChange={setSelectedFramework}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Select Framework" />
            </SelectTrigger>
            <SelectContent>
              {frameworks.map((framework) => (
                <SelectItem key={framework.id} value={framework.id}>
                  {framework.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={() => runComplianceCheck()}
            disabled={loading}
            size="sm"
          >
            <Play className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Run Check</span>
            <span className="sm:hidden">Check</span>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">
              {complianceMetrics.overall_score.toFixed(1)}%
            </div>
            <Progress value={complianceMetrics.overall_score} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Overall compliance rating
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Violations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-red-400">
              {complianceMetrics.active_violations}
            </div>
            <p className="text-xs text-muted-foreground">
              {complianceMetrics.resolved_violations} resolved this month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Automation Coverage</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">
              {complianceMetrics.automation_coverage.toFixed(0)}%
            </div>
            <Progress value={complianceMetrics.automation_coverage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Automated compliance checks
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">
              {complianceMetrics.pending_reports}
            </div>
            <p className="text-xs text-muted-foreground">
              Regulatory reports pending
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="relative">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-1 bg-background/50 backdrop-blur-sm border border-border/50 p-1 h-auto">
            <TabsTrigger 
              value="overview"
              className="px-3 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 hover:bg-muted/50"
            >
              <span className="hidden sm:inline">Overview</span>
              <span className="sm:hidden">Home</span>
            </TabsTrigger>
            <TabsTrigger 
              value="frameworks"
              className="px-3 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 hover:bg-muted/50"
            >
              <span className="hidden sm:inline">Frameworks</span>
              <span className="sm:hidden">Frame</span>
            </TabsTrigger>
            <TabsTrigger 
              value="violations"
              className="px-3 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 hover:bg-muted/50"
            >
              <span className="hidden sm:inline">Violations</span>
              <span className="sm:hidden">Viol</span>
            </TabsTrigger>
            <TabsTrigger 
              value="reports"
              className="px-3 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 hover:bg-muted/50"
            >
              Reports
            </TabsTrigger>
            <TabsTrigger 
              value="audit"
              className="px-3 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 hover:bg-muted/50"
            >
              Audit
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Violations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Recent Violations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {violations.slice(0, 5).map((violation) => (
                  <div key={violation.id} className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${getSeverityColor(violation.severity)}`} />
                      <div>
                        <div className="font-medium capitalize">
                          {violation.type.replace('_', ' ')}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(violation.detected_at)}
                        </div>
                      </div>
                    </div>
                    <Badge variant={violation.status === 'open' ? 'destructive' : 'secondary'}>
                      {violation.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Framework Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Framework Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {frameworks.map((framework) => {
                  const compliantReqs = framework.requirements.filter(r => r.status === 'compliant').length;
                  const totalReqs = framework.requirements.length;
                  const percentage = totalReqs > 0 ? (compliantReqs / totalReqs) * 100 : 0;
                  
                  return (
                    <div key={framework.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{framework.name}</div>
                          <div className="text-sm text-muted-foreground">{framework.region}</div>
                        </div>
                        <Badge variant={framework.status === 'active' ? 'default' : 'secondary'}>
                          {framework.status}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{compliantReqs}/{totalReqs} requirements</span>
                          <span>{percentage.toFixed(0)}%</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Recent Reports */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recent Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Type</th>
                      <th className="text-left p-2">Framework</th>
                      <th className="text-left p-2">Period</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Generated</th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.slice(0, 5).map((report) => (
                      <tr key={report.id} className="border-b hover:bg-muted/50">
                        <td className="p-2 capitalize">
                          {report.type.replace('_', ' ')}
                        </td>
                        <td className="p-2">
                          {frameworks.find(f => f.id === report.framework_id)?.name}
                        </td>
                        <td className="p-2">
                          {new Date(report.period_start).toLocaleDateString()} - {new Date(report.period_end).toLocaleDateString()}
                        </td>
                        <td className="p-2">
                          <span className={`text-sm ${getStatusColor(report.status)}`}>
                            {report.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-2">{formatDate(report.generated_at)}</td>
                        <td className="p-2">
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3" />
                            </Button>
                            {report.file_url && (
                              <Button size="sm" variant="outline">
                                <Download className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="frameworks" className="space-y-4">
          {currentFramework && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{currentFramework.name}</span>
                    <Badge variant={currentFramework.status === 'active' ? 'default' : 'secondary'}>
                      {currentFramework.status}
                    </Badge>
                  </CardTitle>
                  <p className="text-muted-foreground">{currentFramework.region}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Requirements</h4>
                      <Button 
                        onClick={() => runComplianceCheck()}
                        size="sm"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Check All
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      {currentRequirements.map((requirement) => (
                        <Card key={requirement.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h5 className="font-medium">{requirement.name}</h5>
                                  <Badge variant="outline" className="capitalize">
                                    {requirement.category}
                                  </Badge>
                                  <Badge variant="outline" className="capitalize">
                                    {requirement.frequency.replace('_', ' ')}
                                  </Badge>
                                  {requirement.automated && (
                                    <Badge variant="outline">
                                      <Zap className="h-3 w-3 mr-1" />
                                      Auto
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {requirement.description}
                                </p>
                                <div className="text-xs text-muted-foreground">
                                  Last checked: {formatDate(requirement.last_check)}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`text-sm ${getStatusColor(requirement.status)}`}>
                                  {requirement.status.replace('_', ' ')}
                                </span>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => runComplianceCheck(requirement.id)}
                                >
                                  <Play className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="violations" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Compliance Violations</h3>
            <Select value={violationFilter} onValueChange={setViolationFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Violations</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {filteredViolations.map((violation) => (
              <Card key={violation.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`w-3 h-3 rounded-full mt-1 ${getSeverityColor(violation.severity)}`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h5 className="font-medium capitalize">
                            {violation.type.replace('_', ' ')}
                          </h5>
                          <Badge variant="outline" className="capitalize">
                            {violation.severity}
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-muted-foreground mb-3">
                          Detected: {formatDate(violation.detected_at)}
                          {violation.resolved_at && (
                            <span> • Resolved: {formatDate(violation.resolved_at)}</span>
                          )}
                        </div>

                        {violation.type === 'threshold_breach' && violation.data && (
                          <div className="text-sm mb-3 p-2 bg-muted rounded">
                            Order: {violation.data.order_id} | 
                            Price difference: {violation.data.price_difference} | 
                            Threshold: {violation.data.threshold}
                          </div>
                        )}

                        <div className="space-y-1">
                          <h6 className="text-sm font-medium">Remediation Actions:</h6>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {violation.remediation_actions.map((action, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                                {action}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant={violation.status === 'open' ? 'destructive' : 'secondary'}>
                        {violation.status}
                      </Badge>
                      {violation.status === 'open' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleResolveViolation(violation.id)}
                        >
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Regulatory Reports</h3>
            <div className="flex items-center gap-2">
              <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transaction_report">Transaction Report</SelectItem>
                  <SelectItem value="position_report">Position Report</SelectItem>
                  <SelectItem value="risk_report">Risk Report</SelectItem>
                  <SelectItem value="compliance_report">Compliance Report</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleGenerateReport}>
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Type</th>
                  <th className="text-left p-4">Framework</th>
                  <th className="text-left p-4">Period</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Generated</th>
                  <th className="text-left p-4">File</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id} className="border-b hover:bg-muted/50">
                    <td className="p-4 capitalize">
                      {report.type.replace('_', ' ')}
                    </td>
                    <td className="p-4">
                      {frameworks.find(f => f.id === report.framework_id)?.name}
                    </td>
                    <td className="p-4">
                      {new Date(report.period_start).toLocaleDateString()} - {new Date(report.period_end).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <Badge variant={report.status === 'submitted' ? 'default' : 'secondary'}>
                        {report.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="p-4">{formatDate(report.generated_at)}</td>
                    <td className="p-4">
                      {report.file_url ? (
                        <span className="text-xs bg-muted px-2 py-1 rounded">
                          {report.metadata.file_size || 'Available'}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Generating...</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3" />
                        </Button>
                        {report.file_url && (
                          <Button size="sm" variant="outline">
                            <Download className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Audit Trail</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Filter actions..."
                  value={auditFilter}
                  onChange={(e) => setAuditFilter(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {filteredAuditTrail.map((entry) => (
              <Card key={entry.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{entry.action}</span>
                          <Badge variant="outline" className="capitalize">
                            {entry.resource_type}
                          </Badge>
                          {entry.compliance_relevant && (
                            <Badge variant="outline">
                              <Shield className="h-3 w-3 mr-1" />
                              Compliance
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Resource ID: {entry.resource_id}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          IP: {entry.ip_address} • {formatDate(entry.timestamp)}
                        </div>
                        {Object.keys(entry.details).length > 0 && (
                          <details className="mt-2">
                            <summary className="text-sm cursor-pointer text-muted-foreground hover:text-foreground">
                              View Details
                            </summary>
                            <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
                              {JSON.stringify(entry.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};