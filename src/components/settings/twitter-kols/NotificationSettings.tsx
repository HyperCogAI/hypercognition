import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bell, Mail, MessageSquare, Smartphone, Info } from "lucide-react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function NotificationSettings() {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [minConfidencePush, setMinConfidencePush] = useState(70);
  const [minConfidenceEmail, setMinConfidenceEmail] = useState(85);
  const [isSaving, setIsSaving] = useState(false);

  const { isSupported, isSubscribed, subscribeToPush, unsubscribeFromPush, isLoading } = usePushNotifications();
  const { toast } = useToast();

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    const { data } = await supabase
      .from('notification_preferences')
      .select('*')
      .single();

    if (data) {
      const prefs = data as any;
      setPushEnabled(prefs.push_notifications_enabled ?? true);
      setEmailEnabled(prefs.email_alerts_enabled ?? false);
      setSmsEnabled(prefs.sms_alerts_enabled ?? false);
      setMinConfidencePush(prefs.min_confidence_for_push ?? 70);
      setMinConfidenceEmail(prefs.min_confidence_for_email ?? 85);
    }
  };

  const savePreferences = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          push_notifications_enabled: pushEnabled,
          email_alerts_enabled: emailEnabled,
          sms_alerts_enabled: smsEnabled,
          min_confidence_for_push: minConfidencePush,
          min_confidence_for_email: minConfidenceEmail,
        } as any);

      if (error) throw error;

      toast({
        title: "Settings saved",
        description: "Your notification preferences have been updated",
      });
    } catch (error: any) {
      toast({
        title: "Failed to save",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePushToggle = async (enabled: boolean) => {
    setPushEnabled(enabled);
    if (enabled && !isSubscribed) {
      await subscribeToPush();
    } else if (!enabled && isSubscribed) {
      await unsubscribeFromPush();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Get instant alerts on your device when high-confidence signals are detected
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isSupported && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Push notifications are not supported in this browser
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between">
            <Label htmlFor="push-enabled">Enable Push Notifications</Label>
            <Switch
              id="push-enabled"
              checked={pushEnabled}
              onCheckedChange={handlePushToggle}
              disabled={!isSupported || isLoading}
            />
          </div>

          {pushEnabled && (
            <div className="space-y-2">
              <Label>Minimum Confidence: {minConfidencePush}%</Label>
              <Slider
                value={[minConfidencePush]}
                onValueChange={([value]) => setMinConfidencePush(value)}
                min={50}
                max={100}
                step={5}
              />
              <p className="text-sm text-muted-foreground">
                Only send push notifications for signals with {minConfidencePush}% confidence or higher
              </p>
            </div>
          )}

          {isSubscribed && (
            <Alert className="bg-success/10 border-success">
              <Smartphone className="h-4 w-4 text-success" />
              <AlertDescription className="text-success">
                Push notifications are active on this device
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Alerts
          </CardTitle>
          <CardDescription>
            Receive detailed email reports for very high confidence signals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-enabled">Enable Email Alerts</Label>
            <Switch
              id="email-enabled"
              checked={emailEnabled}
              onCheckedChange={setEmailEnabled}
            />
          </div>

          {emailEnabled && (
            <div className="space-y-2">
              <Label>Minimum Confidence: {minConfidenceEmail}%</Label>
              <Slider
                value={[minConfidenceEmail]}
                onValueChange={([value]) => setMinConfidenceEmail(value)}
                min={70}
                max={100}
                step={5}
              />
              <p className="text-sm text-muted-foreground">
                Only send emails for signals with {minConfidenceEmail}% confidence or higher
              </p>
            </div>
          )}

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Email alerts include full signal details, extracted tokens, and direct links
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            SMS Alerts (Coming Soon)
          </CardTitle>
          <CardDescription>
            Get text message alerts for critical signals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="sms-enabled">Enable SMS Alerts</Label>
            <Switch
              id="sms-enabled"
              checked={smsEnabled}
              onCheckedChange={setSmsEnabled}
              disabled
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={savePreferences} disabled={isSaving} className="w-full">
        {isSaving ? "Saving..." : "Save Notification Settings"}
      </Button>
    </div>
  );
}
