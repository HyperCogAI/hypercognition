import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Settings, Save, AlertCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface AdminSettingsProps {
  adminRole: string | null;
}

export const AdminSettings = ({ adminRole }: AdminSettingsProps) => {
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    registrationEnabled: true,
    kycRequired: false,
    maxOrderSize: 10000,
    minOrderSize: 10,
    tradingFeesPercent: 0.1,
  });
  const { toast } = useToast();

  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "System settings have been updated successfully",
    });
  };

  const isSuperAdmin = adminRole === 'super_admin';

  return (
    <div className="space-y-6">
      {!isSuperAdmin && (
        <Card className="border-orange-500">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-orange-600">
              <AlertCircle className="h-5 w-5" />
              <p className="font-medium">Super Admin access required to modify settings</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
          <CardDescription>Configure global system behavior</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground">
                Temporarily disable the platform for maintenance
              </p>
            </div>
            <Switch
              checked={settings.maintenanceMode}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, maintenanceMode: checked })
              }
              disabled={!isSuperAdmin}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>User Registration</Label>
              <p className="text-sm text-muted-foreground">
                Allow new users to create accounts
              </p>
            </div>
            <Switch
              checked={settings.registrationEnabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, registrationEnabled: checked })
              }
              disabled={!isSuperAdmin}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>KYC Required</Label>
              <p className="text-sm text-muted-foreground">
                Require KYC verification for trading
              </p>
            </div>
            <Switch
              checked={settings.kycRequired}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, kycRequired: checked })
              }
              disabled={!isSuperAdmin}
            />
          </div>
        </CardContent>
      </Card>

      {/* Trading Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Trading Settings</CardTitle>
          <CardDescription>Configure trading limits and fees</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Maximum Order Size ($)</Label>
            <Input
              type="number"
              value={settings.maxOrderSize}
              onChange={(e) =>
                setSettings({ ...settings, maxOrderSize: Number(e.target.value) })
              }
              disabled={!isSuperAdmin}
            />
          </div>

          <div className="space-y-2">
            <Label>Minimum Order Size ($)</Label>
            <Input
              type="number"
              value={settings.minOrderSize}
              onChange={(e) =>
                setSettings({ ...settings, minOrderSize: Number(e.target.value) })
              }
              disabled={!isSuperAdmin}
            />
          </div>

          <div className="space-y-2">
            <Label>Trading Fees (%)</Label>
            <Input
              type="number"
              step="0.01"
              value={settings.tradingFeesPercent}
              onChange={(e) =>
                setSettings({ ...settings, tradingFeesPercent: Number(e.target.value) })
              }
              disabled={!isSuperAdmin}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      {isSuperAdmin && (
        <div className="flex justify-end">
          <Button onClick={handleSaveSettings} size="lg">
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      )}
    </div>
  );
};
