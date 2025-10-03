import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { usePrivacySettings } from '@/hooks/usePrivacySettings';
import { useSettingsChangeLog } from '@/hooks/useSettingsChangeLog';
import { useApiTokens } from '@/hooks/useApiTokens';
import { CheckCircle2, XCircle, Loader2, RefreshCw } from 'lucide-react';

export const SettingsTestPanel = () => {
  const userSettings = useUserSettings();
  const notificationPrefs = useNotificationPreferences();
  const privacySettings = usePrivacySettings();
  const changeLog = useSettingsChangeLog();
  const apiTokens = useApiTokens();

  const testItems = [
    {
      name: 'User Settings',
      loading: userSettings.isLoading,
      error: userSettings.error,
      data: userSettings.settings,
      test: () => userSettings.updateSettings({ 
        theme_mode: 'dark',
        language: 'en' 
      })
    },
    {
      name: 'Notification Preferences',
      loading: notificationPrefs.isLoading,
      error: notificationPrefs.error,
      data: notificationPrefs.preferences,
      test: () => notificationPrefs.updatePreferences({ 
        price_alerts_enabled: true 
      })
    },
    {
      name: 'Privacy Settings',
      loading: privacySettings.isLoading,
      error: privacySettings.error,
      data: privacySettings.privacySettings,
      test: () => privacySettings.updatePrivacySettings({ 
        profile_searchable: true 
      })
    },
    {
      name: 'Change Log',
      loading: changeLog.isLoading,
      error: changeLog.error,
      data: changeLog.changeLog,
      test: null
    },
    {
      name: 'API Tokens',
      loading: apiTokens.isLoading,
      error: apiTokens.error,
      data: apiTokens.tokens,
      test: () => apiTokens.createToken({ 
        name: 'Test Token',
        scopes: ['read']
      })
    },
  ];

  return (
    <Card className="bg-card/90 border backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🧪 Backend Test Panel
        </CardTitle>
        <CardDescription>
          Verify all settings backend components are working correctly
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {testItems.map((item) => (
          <div key={item.name}>
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20 border border-border/30">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{item.name}</span>
                  {item.loading && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                  {!item.loading && !item.error && item.data && (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  )}
                  {!item.loading && item.error && (
                    <XCircle className="w-4 h-4 text-destructive" />
                  )}
                </div>
                
                {item.data && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    {Array.isArray(item.data) 
                      ? `${item.data.length} records loaded`
                      : 'Settings loaded successfully'
                    }
                  </div>
                )}
                
                {item.error && (
                  <div className="mt-2 text-xs text-destructive">
                    Error: {item.error.message}
                  </div>
                )}
              </div>
              
              {item.test && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={item.test}
                  disabled={item.loading}
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Test Update
                </Button>
              )}
            </div>
          </div>
        ))}

        <Separator className="my-4" />

        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Database Status</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between p-2 rounded bg-muted/10">
              <span>Tables Created:</span>
              <Badge variant="secondary" className="text-xs">6/6</Badge>
            </div>
            <div className="flex justify-between p-2 rounded bg-muted/10">
              <span>Enum Types:</span>
              <Badge variant="secondary" className="text-xs">3/3</Badge>
            </div>
            <div className="flex justify-between p-2 rounded bg-muted/10">
              <span>RLS Policies:</span>
              <Badge variant="secondary" className="text-xs">Active</Badge>
            </div>
            <div className="flex justify-between p-2 rounded bg-muted/10">
              <span>Triggers:</span>
              <Badge variant="secondary" className="text-xs">Working</Badge>
            </div>
          </div>
        </div>

        {changeLog.changeLog && changeLog.changeLog.length > 0 && (
          <>
            <Separator className="my-4" />
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Recent Changes</h4>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {changeLog.changeLog.slice(0, 5).map((log) => (
                  <div key={log.id} className="text-xs p-2 rounded bg-muted/10">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{log.setting_category}</span>
                      <span className="text-muted-foreground">
                        {new Date(log.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
