import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CyberButton } from '@/components/ui/cyber-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { SEOHead } from '@/components/seo/SEOHead';
import { SettingsTestPanel } from '@/components/settings/SettingsTestPanel';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { usePrivacySettings } from '@/hooks/usePrivacySettings';
import { TelegramAuthentication } from '@/components/settings/telegram-kols/TelegramAuthentication';
import { TelegramWatchlistManager } from '@/components/settings/telegram-kols/TelegramWatchlistManager';
import { TelegramChannelManager } from '@/components/settings/telegram-kols/TelegramChannelManager';
import {
  User,
  Shield,
  Bell,
  Monitor,
  Palette,
  Key,
  Globe,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Moon,
  Sun,
  Smartphone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  MessageCircle,
  Twitter
} from 'lucide-react';

const Settings = () => {
  // Backend hooks
  const { settings, updateSettings, isLoading: isLoadingSettings } = useUserSettings();
  const { preferences, updatePreferences } = useNotificationPreferences();
  const { privacySettings, updatePrivacySettings } = usePrivacySettings();

  // Local state for form
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>((settings?.theme_mode as any) || 'dark');
  const [language, setLanguage] = useState(settings?.language || 'en');
  const [currency, setCurrency] = useState(settings?.currency || 'USD');
  const [notifications, setNotifications] = useState({
    email: settings?.email_notifications_enabled ?? true,
    push: settings?.push_notifications_enabled ?? true,
    sms: false,
    trades: preferences?.portfolio_updates_enabled ?? true,
    news: preferences?.market_news_enabled ?? true,
    priceAlerts: preferences?.price_alerts_enabled ?? true
  });
  const [trading, setTrading] = useState({
    defaultLeverage: '10x',
    riskLevel: 'medium',
    autoTrading: settings?.auto_approve_transactions ?? false,
    paperMode: true,
    stopLoss: settings?.default_slippage_tolerance?.toString() || '5'
  });
  const [security, setSecurity] = useState({
    twoFactor: settings?.two_factor_enabled ?? false,
    sessionTimeout: settings?.session_timeout_minutes?.toString() || '30',
    ipWhitelist: false,
    apiAccess: false
  });
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSave = (section: string) => {
    // Save to backend based on section
    if (section === 'Account') {
      updateSettings({
        language,
        currency,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
    } else if (section === 'Security') {
      updateSettings({
        session_timeout_minutes: parseInt(security.sessionTimeout),
      });
    } else if (section === 'Notifications') {
      updatePreferences({
        price_alerts_enabled: notifications.priceAlerts,
        market_news_enabled: notifications.news,
        email_notifications_enabled: notifications.email,
        push_notifications_enabled: notifications.push,
      });
    }
    
    toast({
      title: "Settings Saved",
      description: `${section} settings have been updated successfully.`,
    });
  };

  const handleExportData = () => {
    toast({
      title: "Data Export Started",
      description: "Your data export will be ready for download shortly.",
    });
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Account Deletion",
      description: "Please contact support to delete your account.",
      variant: "destructive"
    });
  };

  return (
    <>
      <SEOHead
        title="Settings - HyperCognition"
        description="Customize your trading platform with personal preferences, security settings, and trading configurations."
        keywords="settings, preferences, security, trading configuration, notifications"
      />
      
      <div className="min-h-screen bg-background p-3 md:p-4 lg:p-6">
        <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
            <div className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-xl bg-primary/10 border border-primary/20">
              <User className="w-6 h-6 md:w-7 md:h-7 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
                Settings
              </h1>
              <p className="text-sm md:text-base text-muted-foreground mt-1">
                Customize your HyperCognition experience
              </p>
            </div>
          </div>

          {/* Settings Tabs */}
          <Tabs defaultValue="testing" className="space-y-4 md:space-y-6">
            <div className="w-full overflow-x-auto">
              <TabsList className="inline-flex w-full min-w-max h-11 md:h-12 bg-card/80 border border-border/50 backdrop-blur-sm p-1 rounded-lg">
                <TabsTrigger 
                  value="testing" 
                  className="flex items-center gap-2 px-3 md:px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-sm"
                >
                  <Monitor className="w-4 h-4" />
                  <span className="hidden sm:inline">🧪 Test</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="account" 
                  className="flex items-center gap-2 px-3 md:px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-sm"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Account</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="security" 
                  className="flex items-center gap-2 px-3 md:px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-sm"
                >
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">Security</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="notifications" 
                  className="flex items-center gap-2 px-3 md:px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-sm"
                >
                  <Bell className="w-4 h-4" />
                  <span className="hidden sm:inline">Notifications</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="trading" 
                  className="flex items-center gap-2 px-3 md:px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-sm"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span className="hidden sm:inline">Trading</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="appearance" 
                  className="flex items-center gap-2 px-3 md:px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-sm"
                >
                  <Palette className="w-4 h-4" />
                  <span className="hidden sm:inline">Appearance</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="advanced" 
                  className="flex items-center gap-2 px-3 md:px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-sm"
                >
                  <Monitor className="w-4 h-4" />
                  <span className="hidden sm:inline">Advanced</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="twitter-kols" 
                  className="flex items-center gap-2 px-3 md:px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-sm"
                >
                  <Twitter className="w-4 h-4" />
                  <span className="hidden sm:inline">Twitter KOLs</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="telegram-kols" 
                  className="flex items-center gap-2 px-3 md:px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Telegram KOLs</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Backend Test Panel - Remove in production */}
            <TabsContent value="testing" className="space-y-6">
              <SettingsTestPanel />
            </TabsContent>

            {/* Account Settings */}
            <TabsContent value="account" className="space-y-4 md:space-y-6">
              <Card className="bg-card/90 border backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                    <User className="w-5 h-5 text-primary" />
                    Profile Information
                  </CardTitle>
                  <CardDescription className="text-sm md:text-base">
                    Manage your personal information and account details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
                      <Input 
                        id="firstName" 
                        placeholder="Enter your first name" 
                        className="bg-background/60 border-border/60 focus:border-primary/50" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
                      <Input 
                        id="lastName" 
                        placeholder="Enter your last name" 
                        className="bg-background/60 border-border/60 focus:border-primary/50" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="your@email.com" 
                        className="bg-background/60 border-border/60 focus:border-primary/50" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                      <Input 
                        id="phone" 
                        placeholder="+1 (555) 123-4567" 
                        className="bg-background/60 border-border/60 focus:border-primary/50" 
                      />
                    </div>
                  </div>
                  
                  <Separator className="bg-border/30" />
                  
                  <div className="space-y-4">
                    <h4 className="text-base md:text-lg font-semibold text-foreground">Account Status</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30">
                        <div className="space-y-1">
                          <p className="font-medium text-sm">Verification Status</p>
                          <p className="text-xs text-muted-foreground">Complete KYC verification</p>
                        </div>
                        <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30 text-xs px-2 py-1">
                          Verified
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30">
                        <div className="space-y-1">
                          <p className="font-medium text-sm">Account Tier</p>
                          <p className="text-xs text-muted-foreground">Current subscription level</p>
                        </div>
                        <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 text-xs px-2 py-1">
                          Pro Trader
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <CyberButton variant="cyber" onClick={() => handleSave('Account')} className="px-6">
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </CyberButton>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Settings */}
            <TabsContent value="security" className="space-y-6">
              <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <span>Security & Privacy</span>
                  </CardTitle>
                  <CardDescription>
                    Protect your account with advanced security features
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">Two-Factor Authentication</p>
                        <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                      </div>
                      <Switch
                        checked={security.twoFactor}
                        onCheckedChange={(checked) => setSecurity({...security, twoFactor: checked})}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">API Access</p>
                        <p className="text-sm text-muted-foreground">Enable programmatic trading</p>
                      </div>
                      <Switch
                        checked={security.apiAccess}
                        onCheckedChange={(checked) => setSecurity({...security, apiAccess: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">IP Whitelist</p>
                        <p className="text-sm text-muted-foreground">Restrict access to specific IPs</p>
                      </div>
                      <Switch
                        checked={security.ipWhitelist}
                        onCheckedChange={(checked) => setSecurity({...security, ipWhitelist: checked})}
                      />
                    </div>
                  </div>

                  <Separator className="bg-border/50" />

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                      <Select value={security.sessionTimeout} onValueChange={(value) => setSecurity({...security, sessionTimeout: value})}>
                        <SelectTrigger className="bg-background/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border/50">
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="120">2 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {security.apiAccess && (
                      <div className="space-y-2">
                        <Label htmlFor="apiKey">API Key</Label>
                        <div className="flex space-x-2">
                          <div className="relative flex-1">
                            <Input
                              id="apiKey"
                              type={showApiKey ? "text" : "password"}
                              value="sk-1234567890abcdef"
                              readOnly
                              className="bg-background/50 pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                              onClick={() => setShowApiKey(!showApiKey)}
                            >
                              {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                          <CyberButton variant="outline" size="sm">
                            <RefreshCw className="h-4 w-4" />
                          </CyberButton>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <CyberButton variant="cyber" onClick={() => handleSave('Security')}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </CyberButton>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Settings */}
            <TabsContent value="notifications" className="space-y-6">
              <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="h-5 w-5 text-primary" />
                    <span>Notification Preferences</span>
                  </CardTitle>
                  <CardDescription>
                    Configure how you receive alerts and updates
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold">Delivery Methods</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>Email Notifications</span>
                          </div>
                          <Switch
                            checked={notifications.email}
                            onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Smartphone className="h-4 w-4 text-muted-foreground" />
                            <span>Push Notifications</span>
                          </div>
                          <Switch
                            checked={notifications.push}
                            onCheckedChange={(checked) => setNotifications({...notifications, push: checked})}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Bell className="h-4 w-4 text-muted-foreground" />
                            <span>SMS Alerts</span>
                          </div>
                          <Switch
                            checked={notifications.sms}
                            onCheckedChange={(checked) => setNotifications({...notifications, sms: checked})}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold">Content Types</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            <span>Trading Activity</span>
                          </div>
                          <Switch
                            checked={notifications.trades}
                            onCheckedChange={(checked) => setNotifications({...notifications, trades: checked})}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            <span>Market News</span>
                          </div>
                          <Switch
                            checked={notifications.news}
                            onCheckedChange={(checked) => setNotifications({...notifications, news: checked})}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                            <span>Price Alerts</span>
                          </div>
                          <Switch
                            checked={notifications.priceAlerts}
                            onCheckedChange={(checked) => setNotifications({...notifications, priceAlerts: checked})}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <CyberButton variant="cyber" onClick={() => handleSave('Notifications')}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </CyberButton>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Trading Settings */}
            <TabsContent value="trading" className="space-y-6">
              <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <span>Trading Configuration</span>
                  </CardTitle>
                  <CardDescription>
                    Set your default trading preferences and risk parameters
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="leverage">Default Leverage</Label>
                        <Select value={trading.defaultLeverage} onValueChange={(value) => setTrading({...trading, defaultLeverage: value})}>
                          <SelectTrigger className="bg-background/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-border/50">
                            <SelectItem value="1x">1x (No Leverage)</SelectItem>
                            <SelectItem value="2x">2x</SelectItem>
                            <SelectItem value="5x">5x</SelectItem>
                            <SelectItem value="10x">10x</SelectItem>
                            <SelectItem value="20x">20x</SelectItem>
                            <SelectItem value="50x">50x</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="riskLevel">Risk Level</Label>
                        <Select value={trading.riskLevel} onValueChange={(value) => setTrading({...trading, riskLevel: value})}>
                          <SelectTrigger className="bg-background/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-border/50">
                            <SelectItem value="conservative">Conservative</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="aggressive">Aggressive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="stopLoss">Default Stop Loss (%)</Label>
                        <Input
                          id="stopLoss"
                          type="number"
                          value={trading.stopLoss}
                          onChange={(e) => setTrading({...trading, stopLoss: e.target.value})}
                          className="bg-background/50"
                          placeholder="5"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="font-medium">Auto Trading</p>
                          <p className="text-sm text-muted-foreground">Enable AI autonomous trading</p>
                        </div>
                        <Switch
                          checked={trading.autoTrading}
                          onCheckedChange={(checked) => setTrading({...trading, autoTrading: checked})}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="font-medium">Paper Trading Mode</p>
                          <p className="text-sm text-muted-foreground">Trade with virtual funds</p>
                        </div>
                        <Switch
                          checked={trading.paperMode}
                          onCheckedChange={(checked) => setTrading({...trading, paperMode: checked})}
                        />
                      </div>

                      {trading.paperMode && (
                        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                          <div className="flex items-center space-x-2">
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                            <p className="text-sm font-medium text-amber-500">Paper Trading Active</p>
                          </div>
                          <p className="text-xs text-amber-500/80 mt-1">
                            You're currently trading with virtual funds. Switch to live trading when ready.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <CyberButton variant="cyber" onClick={() => handleSave('Trading')}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </CyberButton>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Appearance Settings */}
            <TabsContent value="appearance" className="space-y-6">
              <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Palette className="h-5 w-5 text-primary" />
                    <span>Appearance & Display</span>
                  </CardTitle>
                  <CardDescription>
                    Customize the look and feel of your trading interface
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="theme">Theme</Label>
                        <Select value={theme} onValueChange={(value) => setTheme(value as any)}>
                          <SelectTrigger className="bg-background/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-border/50">
                            <SelectItem value="dark">
                              <div className="flex items-center space-x-2">
                                <Moon className="h-4 w-4" />
                                <span>Dark Mode</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="light">
                              <div className="flex items-center space-x-2">
                                <Sun className="h-4 w-4" />
                                <span>Light Mode</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="language">Language</Label>
                        <Select value={language} onValueChange={setLanguage}>
                          <SelectTrigger className="bg-background/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-border/50">
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Español</SelectItem>
                            <SelectItem value="fr">Français</SelectItem>
                            <SelectItem value="de">Deutsch</SelectItem>
                            <SelectItem value="ja">日本語</SelectItem>
                            <SelectItem value="ko">한국어</SelectItem>
                            <SelectItem value="zh">中文</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="currency">Display Currency</Label>
                        <Select value={currency} onValueChange={setCurrency}>
                          <SelectTrigger className="bg-background/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-border/50">
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="EUR">EUR (€)</SelectItem>
                            <SelectItem value="GBP">GBP (£)</SelectItem>
                            <SelectItem value="JPY">JPY (¥)</SelectItem>
                            <SelectItem value="BTC">BTC (₿)</SelectItem>
                            <SelectItem value="ETH">ETH (Ξ)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
                        <h4 className="font-medium mb-2">Theme Preview</h4>
                        <div className="space-y-2">
                          <div className="h-2 bg-primary/30 rounded"></div>
                          <div className="h-2 bg-secondary/30 rounded w-3/4"></div>
                          <div className="h-2 bg-accent/30 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <CyberButton variant="cyber" onClick={() => handleSave('Appearance')}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </CyberButton>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Advanced Settings */}
            <TabsContent value="advanced" className="space-y-6">
              <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Monitor className="h-5 w-5 text-primary" />
                    <span>Advanced Options</span>
                  </CardTitle>
                  <CardDescription>
                    Data management and account administration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold mb-4">Data Management</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <CyberButton variant="outline" onClick={handleExportData} className="justify-start">
                          <Download className="h-4 w-4 mr-2" />
                          Export Trading Data
                        </CyberButton>
                        <CyberButton variant="outline" className="justify-start">
                          <Upload className="h-4 w-4 mr-2" />
                          Import Settings
                        </CyberButton>
                      </div>
                    </div>

                    <Separator className="bg-border/50" />

                    <div>
                      <h4 className="text-lg font-semibold mb-4 text-red-400">Danger Zone</h4>
                      <div className="space-y-4 p-4 rounded-lg border border-red-500/20 bg-red-500/5">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="font-medium text-red-400">Delete Account</p>
                            <p className="text-sm text-muted-foreground">
                              Permanently delete your account and all associated data
                            </p>
                          </div>
                          <CyberButton 
                            variant="destructive" 
                            onClick={handleDeleteAccount}
                            className="bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Account
                          </CyberButton>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Twitter KOLs Settings */}
            <TabsContent value="twitter-kols" className="space-y-6">
              <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Twitter className="h-5 w-5 text-primary" />
                    <span>Twitter KOL Monitoring</span>
                  </CardTitle>
                  <CardDescription>
                    Configure Twitter API credentials and manage KOL watchlists
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Twitter KOL settings coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Telegram KOLs Settings */}
            <TabsContent value="telegram-kols" className="space-y-6">
              <TelegramAuthentication />
              <TelegramWatchlistManager />
              <TelegramChannelManager />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default Settings;