import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Building2, Users, Shield, Key, Settings, AlertTriangle, 
  CheckCircle, XCircle, Clock, Eye, UserPlus, Copy, 
  Download, BarChart3, Globe, Palette, Activity
} from 'lucide-react';
import { InstitutionalOnboarding } from './InstitutionalOnboarding';
import { useInstitutionalFeatures } from '@/hooks/useInstitutionalFeatures';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export const InstitutionalDashboard: React.FC = () => {
  const { 
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
    hasPermission
  } = useInstitutionalFeatures();

  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [newApiKeyName, setNewApiKeyName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'trader' | 'analyst' | 'compliance' | 'viewer'>('viewer');

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!organization) {
    return <InstitutionalOnboarding />;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'suspended': return 'text-red-400';
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  };

  const handleCreateApiKey = async () => {
    if (!newApiKeyName.trim()) return;
    
    try {
      await createApiKey(newApiKeyName, ['trading', 'portfolio']);
      setNewApiKeyName('');
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleInviteMember = async () => {
    if (!newMemberEmail.trim()) return;
    
    try {
      await inviteTeamMember(newMemberEmail, newMemberRole, ['trading']);
      setNewMemberEmail('');
      setNewMemberRole('viewer');
    } catch (error) {
      // Error handled in hook
    }
  };

  const copyApiKey = (keyPrefix: string) => {
    navigator.clipboard.writeText(`${keyPrefix}...`);
    toast({
      title: "Copied",
      description: "API key copied to clipboard",
    });
  };

  return (
    <div className="space-y-6">
      {/* Organization Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{organization.name}</h1>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="capitalize">
                {organization.type.replace('_', ' ')}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {organization.tier}
              </Badge>
              <span className={`text-sm ${getStatusColor(organization.status)}`}>
                {organization.status}
              </span>
            </div>
          </div>
        </div>
        
        {hasPermission('admin') && (
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Organization Settings
          </Button>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMembers.length}</div>
            <p className="text-xs text-muted-foreground">
              {teamMembers.filter(m => m.status === 'active').length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Keys</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apiKeys.length}</div>
            <p className="text-xs text-muted-foreground">
              {apiKeys.filter(k => k.status === 'active').length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Items</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {complianceRecords.filter(r => r.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Pending review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Volume Limit</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(organization.settings.trading_limits.daily_volume)}
            </div>
            <p className="text-xs text-muted-foreground">
              Current limit
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="team">Team Management</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="api">API Management</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {complianceRecords.slice(0, 5).map((record) => (
                  <div key={record.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${getSeverityColor(record.severity)}`} />
                      <div>
                        <div className="text-sm font-medium capitalize">
                          {record.type.replace('_', ' ')}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(record.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <Badge variant={record.status === 'pending' ? 'secondary' : 'outline'}>
                      {record.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Trading System</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <span className="text-xs text-green-400">Operational</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Market Data</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <span className="text-xs text-green-400">Operational</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Risk Monitoring</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <span className="text-xs text-green-400">Operational</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Compliance Engine</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-400" />
                    <span className="text-xs text-yellow-400">Degraded</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Team Members</h3>
            {hasPermission('admin') && (
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Email address"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="w-48"
                />
                <Select value={newMemberRole} onValueChange={(value: any) => setNewMemberRole(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trader">Trader</SelectItem>
                    <SelectItem value="analyst">Analyst</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleInviteMember}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite
                </Button>
              </div>
            )}
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">Member</th>
                      <th className="text-left p-4">Role</th>
                      <th className="text-left p-4">Status</th>
                      <th className="text-left p-4">Last Active</th>
                      <th className="text-left p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamMembers.map((member) => (
                      <tr key={member.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              {member.profile.display_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium">{member.profile.display_name}</div>
                              <div className="text-xs text-muted-foreground">{member.profile.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className="capitalize">
                            {member.role}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <span className={`text-sm ${getStatusColor(member.status)}`}>
                            {member.status}
                          </span>
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {new Date(member.last_active).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          {hasPermission('admin') && (
                            <Button variant="outline" size="sm">
                              Manage
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Compliance Records</h3>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>

          <div className="space-y-4">
            {complianceRecords.map((record) => (
              <Card key={record.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`w-3 h-3 rounded-full mt-1 ${getSeverityColor(record.severity)}`} />
                      <div>
                        <div className="font-medium capitalize">
                          {record.type.replace('_', ' ')}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {new Date(record.created_at).toLocaleString()}
                        </div>
                        {record.type === 'trade_review' && (
                          <div className="text-sm mt-2">
                            Trade ID: {record.data.trade_id} | Amount: {formatCurrency(record.data.amount)}
                          </div>
                        )}
                        {record.type === 'risk_alert' && (
                          <div className="text-sm mt-2">
                            {record.data.metric}: {record.data.value} (threshold: {record.data.threshold})
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={record.status === 'pending' ? 'secondary' : 'outline'}>
                        {record.status}
                      </Badge>
                      {record.status === 'pending' && hasPermission('compliance') && (
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => reviewComplianceRecord(record.id, 'approve')}
                          >
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => reviewComplianceRecord(record.id, 'reject')}
                          >
                            <XCircle className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => reviewComplianceRecord(record.id, 'escalate')}
                          >
                            <AlertTriangle className="h-3 w-3" />
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

        <TabsContent value="api" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">API Keys</h3>
            {hasPermission('admin') && (
              <div className="flex items-center gap-2">
                <Input
                  placeholder="API key name"
                  value={newApiKeyName}
                  onChange={(e) => setNewApiKeyName(e.target.value)}
                  className="w-48"
                />
                <Button onClick={handleCreateApiKey}>
                  <Key className="h-4 w-4 mr-2" />
                  Create Key
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {apiKeys.map((key) => (
              <Card key={key.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{key.name}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Created: {new Date(key.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Last used: {new Date(key.last_used).toLocaleDateString()}
                      </div>
                      <div className="flex gap-1 mt-2">
                        {key.permissions.map((permission) => (
                          <Badge key={permission} variant="outline" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="bg-muted px-2 py-1 rounded text-sm">
                        {key.key_prefix}...
                      </code>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => copyApiKey(key.key_prefix)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          {hasPermission('admin') && (
            <>
              {/* Trading Limits */}
              <Card>
                <CardHeader>
                  <CardTitle>Trading Limits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Daily Volume Limit</Label>
                      <Input 
                        type="number" 
                        defaultValue={organization.settings.trading_limits.daily_volume}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Max Position Size</Label>
                      <Input 
                        type="number" 
                        defaultValue={organization.settings.trading_limits.position_size}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Max Leverage</Label>
                      <Input 
                        type="number" 
                        defaultValue={organization.settings.trading_limits.leverage}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Compliance Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Compliance Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Require Trade Approval</Label>
                      <p className="text-sm text-muted-foreground">
                        Require manual approval for large trades
                      </p>
                    </div>
                    <Switch defaultChecked={organization.settings.compliance.require_approval} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Automatic Reports</Label>
                      <p className="text-sm text-muted-foreground">
                        Generate compliance reports automatically
                      </p>
                    </div>
                    <Switch defaultChecked={organization.settings.compliance.auto_reports} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Risk Monitoring</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable real-time risk monitoring
                      </p>
                    </div>
                    <Switch defaultChecked={organization.settings.compliance.risk_monitoring} />
                  </div>
                </CardContent>
              </Card>

              {/* White Label Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    White Label Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable White Label</Label>
                      <p className="text-sm text-muted-foreground">
                        Customize branding and domain
                      </p>
                    </div>
                    <Switch defaultChecked={organization.settings.white_label.enabled} />
                  </div>
                  
                  {organization.settings.white_label.enabled && (
                    <div className="space-y-4 border-t pt-4">
                      <div className="space-y-2">
                        <Label>Custom Domain</Label>
                        <Input 
                          defaultValue={organization.settings.white_label.custom_domain}
                          placeholder="your-domain.com"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Primary Color</Label>
                          <Input 
                            type="color" 
                            defaultValue={organization.settings.white_label.branding.primary_color}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Secondary Color</Label>
                          <Input 
                            type="color" 
                            defaultValue={organization.settings.white_label.branding.secondary_color}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};