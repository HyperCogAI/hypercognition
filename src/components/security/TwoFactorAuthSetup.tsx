import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Smartphone, 
  Key, 
  QrCode,
  CheckCircle,
  AlertTriangle,
  Copy,
  Download
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/hooks/useAdmin';
import { useToast } from '@/hooks/use-toast';

interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
  manualEntryKey: string;
  backupCodes: string[];
}

export function TwoFactorAuthSetup() {
  const { isAdmin } = useAdmin();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [setupData, setSetupData] = useState<TwoFactorSetup | null>(null);
  const [verificationToken, setVerificationToken] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      checkTwoFactorStatus();
    }
  }, [isAdmin]);

  const checkTwoFactorStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('admin_2fa_secrets')
        .select('is_active')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      setTwoFactorEnabled(!!data);
    } catch (error) {
      console.error('Error checking 2FA status:', error);
    }
  };

  const setupTwoFactor = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('admin-2fa', {
        body: { action: 'setup' }
      });

      if (error) throw error;

      setSetupData(data);
      toast({
        title: "2FA Setup Started",
        description: "Scan the QR code with your authenticator app.",
      });
    } catch (error) {
      console.error('Error setting up 2FA:', error);
      toast({
        title: "Setup Failed",
        description: "Failed to setup two-factor authentication.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyAndEnable = async () => {
    if (!setupData || !verificationToken) return;

    try {
      setLoading(true);

      const { data, error } = await supabase.functions.invoke('admin-2fa', {
        body: { 
          action: 'verify',
          token: verificationToken,
          secret: setupData.secret
        }
      });

      if (error) throw error;

      setBackupCodes(data.backupCodes);
      setTwoFactorEnabled(true);
      setShowBackupCodes(true);
      setSetupData(null);
      setVerificationToken('');

      toast({
        title: "2FA Enabled",
        description: "Two-factor authentication has been successfully enabled.",
      });
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      toast({
        title: "Verification Failed",
        description: "Invalid verification code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const disableTwoFactor = async () => {
    try {
      setLoading(true);

      const { error } = await supabase.functions.invoke('admin-2fa', {
        body: { action: 'disable' }
      });

      if (error) throw error;

      setTwoFactorEnabled(false);
      setBackupCodes([]);
      
      toast({
        title: "2FA Disabled",
        description: "Two-factor authentication has been disabled.",
      });
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      toast({
        title: "Disable Failed",
        description: "Failed to disable two-factor authentication.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateNewBackupCodes = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase.functions.invoke('admin-2fa', {
        body: { action: 'generate_backup_codes' }
      });

      if (error) throw error;

      setBackupCodes(data.backupCodes);
      setShowBackupCodes(true);

      toast({
        title: "Backup Codes Generated",
        description: "New backup codes have been generated.",
      });
    } catch (error) {
      console.error('Error generating backup codes:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate new backup codes.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Text copied to clipboard.",
    });
  };

  const downloadBackupCodes = () => {
    const content = `Two-Factor Authentication Backup Codes
Generated: ${new Date().toISOString()}

IMPORTANT: Store these codes in a safe place. Each code can only be used once.

${backupCodes.map((code, index) => `${index + 1}. ${code}`).join('\n')}

Instructions:
- Use these codes if you lose access to your authenticator app
- Each code can only be used once
- Generate new codes if you use all of them
- Keep these codes secure and private`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `2fa-backup-codes-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Admin access required for 2FA setup</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 2FA Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
            {twoFactorEnabled && (
              <Badge className="bg-green-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                Enabled
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Two-factor authentication adds an extra layer of security to your admin account.
              {twoFactorEnabled 
                ? " Your account is currently protected with 2FA."
                : " Enable 2FA to secure your admin access."
              }
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {!twoFactorEnabled && !setupData && (
        <Card>
          <CardHeader>
            <CardTitle>Enable Two-Factor Authentication</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Smartphone className="h-5 w-5 mt-1 text-blue-500" />
                <div>
                  <h4 className="font-medium">Step 1: Install Authenticator App</h4>
                  <p className="text-sm text-muted-foreground">
                    Download an authenticator app like Google Authenticator, Authy, or 1Password.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <QrCode className="h-5 w-5 mt-1 text-blue-500" />
                <div>
                  <h4 className="font-medium">Step 2: Scan QR Code</h4>
                  <p className="text-sm text-muted-foreground">
                    Scan the QR code or enter the secret key manually.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Key className="h-5 w-5 mt-1 text-blue-500" />
                <div>
                  <h4 className="font-medium">Step 3: Verify Setup</h4>
                  <p className="text-sm text-muted-foreground">
                    Enter the 6-digit code from your authenticator app.
                  </p>
                </div>
              </div>
            </div>
            
            <Button onClick={setupTwoFactor} disabled={loading} className="w-full">
              {loading ? 'Setting up...' : 'Start 2FA Setup'}
            </Button>
          </CardContent>
        </Card>
      )}

      {setupData && (
        <Card>
          <CardHeader>
            <CardTitle>Complete 2FA Setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* QR Code Display */}
            <div className="text-center space-y-4">
              <div className="inline-block p-4 bg-white border rounded-lg">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(setupData.qrCodeUrl)}`}
                  alt="2FA QR Code"
                  className="w-48 h-48"
                />
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Can't scan? Enter this code manually:
                </p>
                <div className="flex items-center gap-2 justify-center">
                  <code className="bg-gray-100 px-3 py-1 rounded text-sm">
                    {setupData.manualEntryKey}
                  </code>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(setupData.manualEntryKey)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Verification */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Verification Code</label>
                <Input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={verificationToken}
                  onChange={(e) => setVerificationToken(e.target.value)}
                  maxLength={6}
                  className="mt-1"
                />
              </div>
              
              <Button 
                onClick={verifyAndEnable} 
                disabled={loading || verificationToken.length !== 6}
                className="w-full"
              >
                {loading ? 'Verifying...' : 'Verify and Enable 2FA'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {twoFactorEnabled && (
        <Card>
          <CardHeader>
            <CardTitle>Manage Two-Factor Authentication</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                onClick={generateNewBackupCodes}
                disabled={loading}
              >
                Generate New Backup Codes
              </Button>
              
              <Button 
                variant="destructive" 
                onClick={disableTwoFactor}
                disabled={loading}
              >
                Disable 2FA
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showBackupCodes && backupCodes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Backup Codes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Save these backup codes in a secure location. Each code can only be used once.
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-2 gap-2 font-mono text-sm">
              {backupCodes.map((code, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span>{code}</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => copyToClipboard(code)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={downloadBackupCodes}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Codes
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => setShowBackupCodes(false)}
                className="flex-1"
              >
                Hide Codes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}