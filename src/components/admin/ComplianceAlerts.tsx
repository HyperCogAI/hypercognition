import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, CheckCircle, Eye, User } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

export const ComplianceAlerts = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [resolution, setResolution] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('compliance_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      setAlerts(data || []);
    } catch (error) {
      console.error('Error loading alerts:', error);
      toast({
        title: "Error",
        description: "Failed to load compliance alerts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resolveAlert = async (alertId: string, resolutionNotes: string) => {
    try {
      const { error } = await supabase
        .from('compliance_alerts')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
          metadata: {
            resolution_notes: resolutionNotes,
          },
        })
        .eq('id', alertId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Alert resolved",
      });

      await loadAlerts();
      setSelectedAlert(null);
      setResolution('');
    } catch (error) {
      console.error('Error resolving alert:', error);
      toast({
        title: "Error",
        description: "Failed to resolve alert",
        variant: "destructive",
      });
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'high':
        return <Badge className="bg-orange-600">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-600">Medium</Badge>;
      case 'low':
        return <Badge variant="secondary">Low</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading compliance alerts...</div>;
  }

  const openAlerts = alerts.filter(a => a.status === 'open');
  const resolvedAlerts = alerts.filter(a => a.status === 'resolved');

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Open</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{openAlerts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {alerts.filter(a => a.severity === 'critical' && a.status === 'open').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{resolvedAlerts.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Alerts</CardTitle>
          <CardDescription>Monitor and resolve compliance issues</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell className="capitalize">{alert.alert_type.replace(/_/g, ' ')}</TableCell>
                    <TableCell>{getSeverityBadge(alert.severity)}</TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">{alert.title}</div>
                    </TableCell>
                    <TableCell>
                      {alert.status === 'open' ? (
                        <Badge variant="secondary">Open</Badge>
                      ) : (
                        <Badge className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Resolved
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{new Date(alert.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedAlert(alert)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Compliance Alert Details</DialogTitle>
                            <DialogDescription>
                              {alert.alert_type.replace(/_/g, ' ')}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Severity</p>
                                {getSeverityBadge(alert.severity)}
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Status</p>
                                <Badge variant={alert.status === 'open' ? 'secondary' : 'default'}>
                                  {alert.status}
                                </Badge>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Created</p>
                                <p className="font-medium">
                                  {new Date(alert.created_at).toLocaleString()}
                                </p>
                              </div>
                              {alert.resolved_at && (
                                <div>
                                  <p className="text-sm text-muted-foreground">Resolved</p>
                                  <p className="font-medium">
                                    {new Date(alert.resolved_at).toLocaleString()}
                                  </p>
                                </div>
                              )}
                            </div>

                            <div>
                              <p className="text-sm text-muted-foreground mb-2">Title</p>
                              <p className="font-medium">{alert.title}</p>
                            </div>

                            <div>
                              <p className="text-sm text-muted-foreground mb-2">Description</p>
                              <p className="text-sm">{alert.description}</p>
                            </div>

                            {alert.affected_user_id && (
                              <div className="flex items-center gap-2 pt-2 border-t">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  Affected User ID: {alert.affected_user_id}
                                </span>
                              </div>
                            )}

                            {alert.status === 'open' && (
                              <div className="space-y-4 pt-4 border-t">
                                <Textarea
                                  placeholder="Resolution notes..."
                                  value={resolution}
                                  onChange={(e) => setResolution(e.target.value)}
                                  rows={4}
                                />
                                <Button
                                  onClick={() => resolveAlert(alert.id, resolution)}
                                  className="w-full"
                                  disabled={!resolution.trim()}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Resolve Alert
                                </Button>
                              </div>
                            )}

                            {alert.metadata?.resolution_notes && (
                              <div className="pt-4 border-t">
                                <p className="text-sm text-muted-foreground mb-2">Resolution Notes</p>
                                <p className="text-sm">{alert.metadata.resolution_notes}</p>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
