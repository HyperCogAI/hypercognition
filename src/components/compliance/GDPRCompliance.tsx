import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { 
  Shield, 
  Download, 
  Trash2, 
  Eye, 
  AlertTriangle,
  CheckCircle,
  FileText,
  Lock,
  User,
  Clock,
  Database
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GDPRRequest {
  id: string;
  type: 'data_export' | 'data_deletion' | 'data_rectification' | 'consent_withdrawal';
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  requestedAt: string;
  completedAt?: string;
  details?: any;
}

interface ConsentRecord {
  id: string;
  category: string;
  purpose: string;
  consentGiven: boolean;
  consentDate: string;
  withdrawalDate?: string;
  legal_basis: string;
}

interface DataCategory {
  category: string;
  description: string;
  dataTypes: string[];
  retention_period: string;
  legal_basis: string;
  can_export: boolean;
  can_delete: boolean;
}

export function GDPRCompliance() {
  const [loading, setLoading] = useState(true);
  const [gdprRequests, setGdprRequests] = useState<GDPRRequest[]>([]);
  const [consentRecords, setConsentRecords] = useState<ConsentRecord[]>([]);
  const [dataCategories] = useState<DataCategory[]>([
    {
      category: 'Profile Data',
      description: 'Basic user profile information',
      dataTypes: ['Name', 'Email', 'Phone', 'Address'],
      retention_period: '2 years after account closure',
      legal_basis: 'Contract performance',
      can_export: true,
      can_delete: true
    },
    {
      category: 'Trading Data',
      description: 'Trading history and preferences',
      dataTypes: ['Trade history', 'Portfolio', 'Preferences', 'Risk profile'],
      retention_period: '7 years (regulatory requirement)',
      legal_basis: 'Legal obligation',
      can_export: true,
      can_delete: false
    },
    {
      category: 'Marketing Data',
      description: 'Marketing preferences and communications',
      dataTypes: ['Email preferences', 'Communication history'],
      retention_period: 'Until consent withdrawn',
      legal_basis: 'Consent',
      can_export: true,
      can_delete: true
    },
    {
      category: 'Analytics Data',
      description: 'Usage analytics and performance data',
      dataTypes: ['Page views', 'Click tracking', 'Performance metrics'],
      retention_period: '13 months',
      legal_basis: 'Legitimate interest',
      can_export: true,
      can_delete: true
    }
  ]);
  const [newRequestType, setNewRequestType] = useState<'data_export' | 'data_deletion' | 'data_rectification'>('data_export');
  const [requestReason, setRequestReason] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadGDPRData();
  }, []);

  const loadGDPRData = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load GDPR requests
      const { data: requests } = await supabase
        .from('gdpr_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Load consent records
      const { data: consents } = await supabase
        .from('user_consents')
        .select('*')
        .eq('user_id', user.id)
        .order('consent_date', { ascending: false });

      setGdprRequests(requests || []);
      setConsentRecords(consents || []);
    } catch (error) {
      console.error('Error loading GDPR data:', error);
      toast({
        title: "Error",
        description: "Failed to load GDPR data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const submitGDPRRequest = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('gdpr_requests')
        .insert({
          user_id: user.id,
          request_type: newRequestType,
          status: 'pending',
          details: { reason: requestReason },
          requested_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Request Submitted",
        description: "Your GDPR request has been submitted and will be processed within 30 days.",
      });

      setRequestReason('');
      loadGDPRData();
    } catch (error) {
      console.error('Error submitting GDPR request:', error);
      toast({
        title: "Error",
        description: "Failed to submit GDPR request",
        variant: "destructive"
      });
    }
  };

  const updateConsent = async (consentId: string, newConsent: boolean) => {
    try {
      const { error } = await supabase
        .from('user_consents')
        .update({
          consent_given: newConsent,
          last_updated: new Date().toISOString(),
          withdrawal_date: newConsent ? null : new Date().toISOString()
        })
        .eq('id', consentId);

      if (error) throw error;

      toast({
        title: "Consent Updated",
        description: `Your consent has been ${newConsent ? 'granted' : 'withdrawn'}.`,
      });

      loadGDPRData();
    } catch (error) {
      console.error('Error updating consent:', error);
      toast({
        title: "Error",
        description: "Failed to update consent",
        variant: "destructive"
      });
    }
  };

  const downloadDataExport = async (requestId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-data-export', {
        body: { requestId }
      });

      if (error) throw error;

      // Create download link
      const blob = new Blob([JSON.stringify(data.exportData, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gdpr-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Download Started",
        description: "Your data export has been downloaded.",
      });
    } catch (error) {
      console.error('Error downloading data export:', error);
      toast({
        title: "Error",
        description: "Failed to download data export",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'rejected':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading GDPR data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* GDPR Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            GDPR Data Protection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You have the right to access, rectify, delete, or export your personal data under GDPR.
              Requests are processed within 30 days.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Tabs defaultValue="requests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="requests">Data Requests</TabsTrigger>
          <TabsTrigger value="consent">Consent Management</TabsTrigger>
          <TabsTrigger value="categories">Data Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          {/* Submit New Request */}
          <Card>
            <CardHeader>
              <CardTitle>Submit GDPR Request</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Request Type</label>
                <select 
                  className="w-full mt-1 p-2 border rounded-md"
                  value={newRequestType}
                  onChange={(e) => setNewRequestType(e.target.value as any)}
                >
                  <option value="data_export">Data Export (Access)</option>
                  <option value="data_deletion">Data Deletion (Right to be Forgotten)</option>
                  <option value="data_rectification">Data Rectification</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Reason (Optional)</label>
                <Textarea
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
                  placeholder="Please provide additional details about your request..."
                  className="mt-1"
                />
              </div>
              
              <Button onClick={submitGDPRRequest} className="w-full">
                Submit Request
              </Button>
            </CardContent>
          </Card>

          {/* Request History */}
          <Card>
            <CardHeader>
              <CardTitle>Request History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {gdprRequests.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No GDPR requests submitted yet.
                  </p>
                ) : (
                  gdprRequests.map(request => (
                    <div key={request.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(request.status)}
                            <h3 className="font-medium capitalize">
                              {request.type.replace('_', ' ')}
                            </h3>
                            <Badge variant={request.status === 'completed' ? 'default' : 'secondary'}>
                              {request.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Requested: {new Date(request.requestedAt).toLocaleDateString()}
                          </p>
                          {request.completedAt && (
                            <p className="text-sm text-muted-foreground">
                              Completed: {new Date(request.completedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        
                        {request.status === 'completed' && request.type === 'data_export' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => downloadDataExport(request.id)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Consent Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {consentRecords.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No consent records found.
                  </p>
                ) : (
                  consentRecords.map(consent => (
                    <div key={consent.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <h3 className="font-medium">{consent.category}</h3>
                          <p className="text-sm text-muted-foreground">{consent.purpose}</p>
                          <p className="text-xs text-muted-foreground">
                            Legal Basis: {consent.legal_basis}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {consent.consentGiven 
                              ? `Consented: ${new Date(consent.consentDate).toLocaleDateString()}`
                              : `Withdrawn: ${consent.withdrawalDate ? new Date(consent.withdrawalDate).toLocaleDateString() : 'Unknown'}`
                            }
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={consent.consentGiven}
                            onCheckedChange={(checked) => 
                              updateConsent(consent.id, checked as boolean)
                            }
                          />
                          <label className="text-sm">
                            {consent.consentGiven ? 'Granted' : 'Withdrawn'}
                          </label>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Categories We Process</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dataCategories.map((category, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h3 className="font-medium">{category.category}</h3>
                        <div className="flex gap-2">
                          {category.can_export && (
                            <Badge variant="outline">
                              <Download className="h-3 w-3 mr-1" />
                              Exportable
                            </Badge>
                          )}
                          {category.can_delete && (
                            <Badge variant="outline">
                              <Trash2 className="h-3 w-3 mr-1" />
                              Deletable
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {category.description}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>Data Types:</strong>
                          <ul className="list-disc list-inside text-muted-foreground mt-1">
                            {category.dataTypes.map((type, idx) => (
                              <li key={idx}>{type}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <strong>Retention Period:</strong>
                          <p className="text-muted-foreground mt-1">{category.retention_period}</p>
                          
                          <strong className="block mt-2">Legal Basis:</strong>
                          <p className="text-muted-foreground">{category.legal_basis}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}