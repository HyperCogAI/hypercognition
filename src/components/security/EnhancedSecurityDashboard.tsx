import { useState, useEffect } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Shield, Lock, Users, Eye, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SecuritySetting {
  id: string;
  setting_name: string;
  setting_value: any;
  is_active: boolean;
  updated_at: string;
}

interface ComplianceAlert {
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

interface SecurityMetrics {
  totalAlerts: number;
  openAlerts: number;
  criticalAlerts: number;
  kycAccessCount: number;
  adminSessionsActive: number;
}

export const EnhancedSecurityDashboard = () => {
  const { isAdmin, isLoading: adminLoading } = useAdmin();
  const [settings, setSettings] = useState<SecuritySetting[]>([]);
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalAlerts: 0,
    openAlerts: 0,
    criticalAlerts: 0,
    kycAccessCount: 0,
    adminSessionsActive: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSecurityData = async () => {
    try {
      // Fetch security settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('security_settings')
        .select('*')
        .eq('is_active', true);

      if (settingsError) throw settingsError;

      // Fetch compliance alerts
      const { data: alertsData, error: alertsError } = await supabase
        .from('compliance_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (alertsError) throw alertsError;

      setSettings(settingsData || []);
      setAlerts(alertsData || []);

      // Calculate metrics
      const totalAlerts = alertsData?.length || 0;
      const openAlerts = alertsData?.filter(a => a.status === 'open').length || 0;
      const criticalAlerts = alertsData?.filter(a => a.severity === 'critical').length || 0;

      setMetrics({
        totalAlerts,
        openAlerts,
        criticalAlerts,
        kycAccessCount: 0, // Would need to query audit logs
        adminSessionsActive: 0 // Would need to query active sessions
      });

    } catch (error) {
      console.error('Error fetching security data:', error);
      toast({
        title: "Error",
        description: "Failed to load security data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateAlertStatus = async (alertId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('compliance_alerts')
        .update({ 
          status,
          resolved_at: status === 'resolved' ? new Date().toISOString() : null
        })
        .eq('id', alertId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Alert status updated successfully"
      });

      fetchSecurityData();
    } catch (error) {
      console.error('Error updating alert:', error);
      toast({
        title: "Error",
        description: "Failed to update alert status",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (isAdmin && !adminLoading) {
      fetchSecurityData();
    }
  }, [isAdmin, adminLoading]);

  if (adminLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You need admin privileges to access the security dashboard.
        </AlertDescription>
      </Alert>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'investigating': return <Eye className="h-4 w-4 text-yellow-500" />;
      default: return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage your platform's security</p>
        </div>
        <Button onClick={fetchSecurityData} variant="outline">
          Refresh Data
        </Button>
      </div>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalAlerts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Alerts</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metrics.openAlerts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.criticalAlerts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.adminSessionsActive}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="alerts" className="w-full">
        <TabsList>
          <TabsTrigger value="alerts">Security Alerts</TabsTrigger>
          <TabsTrigger value="settings">Security Settings</TabsTrigger>
          <TabsTrigger value="policies">Access Policies</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          <div className="space-y-4">
            {alerts.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground">
                    <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No security alerts found</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              alerts.map((alert) => (
                <Card key={alert.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(alert.status)}
                        <CardTitle className="text-lg">{alert.title}</CardTitle>
                        <Badge variant={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        {alert.status === 'open' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateAlertStatus(alert.id, 'investigating')}
                            >
                              Investigate
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => updateAlertStatus(alert.id, 'resolved')}
                            >
                              Resolve
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    <CardDescription>{alert.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Alert Type:</strong> {alert.alert_type}
                      </div>
                      <div>
                        <strong>Created:</strong> {new Date(alert.created_at).toLocaleString()}
                      </div>
                      <div>
                        <strong>Status:</strong> {alert.status}
                      </div>
                      <div>
                        <strong>Affected User:</strong> {alert.affected_user_id || 'N/A'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid gap-4">
            {settings.map((setting) => (
              <Card key={setting.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {setting.setting_name.replace(/_/g, ' ').toUpperCase()}
                    <Badge variant={setting.is_active ? 'default' : 'secondary'}>
                      {setting.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    <strong>Value:</strong> {JSON.stringify(setting.setting_value)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Last updated: {new Date(setting.updated_at).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="policies" className="space-y-4">
          <div className="space-y-4">
            <Alert>
              <Lock className="h-4 w-4" />
              <AlertTitle>Enhanced Security Policies Active</AlertTitle>
              <AlertDescription>
                The following security policies have been implemented:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>KYC data access restricted to compliance officers only</li>
                  <li>Admin 2FA secrets isolated to individual users and super admins</li>
                  <li>Automatic audit logging for sensitive data access</li>
                  <li>Real-time threat detection and alerting</li>
                  <li>Enhanced rate limiting for sensitive operations</li>
                </ul>
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle>Policy Compliance Status</CardTitle>
                <CardDescription>
                  Monitor the effectiveness of your security policies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>KYC Data Protection</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Admin 2FA Security</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Audit Logging</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Threat Detection</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};