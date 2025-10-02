import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { FileCheck, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
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

export const KYCManagement = () => {
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadVerifications();
  }, []);

  const loadVerifications = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('kyc_verifications')
        .select(`
          *,
          profiles (
            display_name,
            wallet_address
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setVerifications(data || []);
    } catch (error) {
      console.error('Error loading verifications:', error);
      toast({
        title: "Error",
        description: "Failed to load KYC verifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateVerificationStatus = async (
    verificationId: string,
    status: 'approved' | 'rejected',
    reason?: string
  ) => {
    try {
      const { error } = await supabase
        .from('kyc_verifications')
        .update({
          status,
          rejection_reason: reason || null,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', verificationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Verification ${status}`,
      });

      await loadVerifications();
      setSelectedVerification(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Error updating verification:', error);
      toast({
        title: "Error",
        description: "Failed to update verification",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="gap-1"><CheckCircle className="h-3 w-3" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Rejected</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading KYC verifications...</div>;
  }

  const pendingCount = verifications.filter(v => v.status === 'pending').length;
  const approvedCount = verifications.filter(v => v.status === 'approved').length;
  const rejectedCount = verifications.filter(v => v.status === 'rejected').length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{verifications.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Verifications Table */}
      <Card>
        <CardHeader>
          <CardTitle>KYC Verifications</CardTitle>
          <CardDescription>Review and manage user identity verifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Reviewed</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {verifications.map((verification) => (
                  <TableRow key={verification.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {verification.profiles?.display_name || 'Anonymous'}
                        </div>
                        <code className="text-xs text-muted-foreground">
                          {verification.profiles?.wallet_address?.slice(0, 10)}...
                        </code>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{verification.verification_type}</TableCell>
                    <TableCell>{getStatusBadge(verification.status)}</TableCell>
                    <TableCell>{new Date(verification.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {verification.reviewed_at
                        ? new Date(verification.reviewed_at).toLocaleDateString()
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedVerification(verification)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>KYC Verification Review</DialogTitle>
                            <DialogDescription>
                              Review verification for {verification.profiles?.display_name}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Type</p>
                                <p className="font-medium capitalize">{verification.verification_type}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Status</p>
                                {getStatusBadge(verification.status)}
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Submitted</p>
                                <p className="font-medium">
                                  {new Date(verification.created_at).toLocaleString()}
                                </p>
                              </div>
                              {verification.reviewed_at && (
                                <div>
                                  <p className="text-sm text-muted-foreground">Reviewed</p>
                                  <p className="font-medium">
                                    {new Date(verification.reviewed_at).toLocaleString()}
                                  </p>
                                </div>
                              )}
                            </div>

                            {verification.status === 'pending' && (
                              <div className="space-y-4 pt-4 border-t">
                                <Textarea
                                  placeholder="Rejection reason (optional)"
                                  value={rejectionReason}
                                  onChange={(e) => setRejectionReason(e.target.value)}
                                />
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => updateVerificationStatus(verification.id, 'approved')}
                                    className="flex-1"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve
                                  </Button>
                                  <Button
                                    onClick={() => updateVerificationStatus(
                                      verification.id,
                                      'rejected',
                                      rejectionReason
                                    )}
                                    variant="destructive"
                                    className="flex-1"
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject
                                  </Button>
                                </div>
                              </div>
                            )}

                            {verification.rejection_reason && (
                              <div className="pt-4 border-t">
                                <p className="text-sm text-muted-foreground mb-2">Rejection Reason</p>
                                <p className="text-sm">{verification.rejection_reason}</p>
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
