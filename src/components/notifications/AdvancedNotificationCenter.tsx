import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, BellOff, Check, CheckCheck, Trash2, Filter, 
  Search, Settings, Smartphone, Mail, Globe, Zap,
  AlertTriangle, Info, CheckCircle, Clock, X
} from 'lucide-react';
import { useAdvancedNotifications } from '@/hooks/useAdvancedNotifications';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export const AdvancedNotificationCenter: React.FC = () => {
  const { 
    loading, 
    notifications, 
    preferences,
    channels,
    notificationTypes,
    getNotificationStats,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updatePreferences,
    requestPushPermission,
    getNotificationsByCategory,
    getUnreadNotifications
  } = useAdvancedNotifications();

  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const stats = getNotificationStats();
  
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium': return <Info className="h-4 w-4 text-blue-500" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-l-red-500';
      case 'high': return 'border-l-orange-500';
      case 'medium': return 'border-l-blue-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-muted';
    }
  };

  const getChannelIcon = (channelType: string) => {
    switch (channelType) {
      case 'push': return <Smartphone className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'webhook': return <Globe className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (showOnlyUnread && notification.read) return false;
    if (categoryFilter !== 'all' && notification.category !== categoryFilter) return false;
    if (priorityFilter !== 'all' && notification.priority !== priorityFilter) return false;
    if (searchFilter && !notification.title.toLowerCase().includes(searchFilter.toLowerCase()) &&
        !notification.message.toLowerCase().includes(searchFilter.toLowerCase())) return false;
    
    return true;
  });

  const handlePreferenceChange = (typeId: string, channels: string[], enabled: boolean) => {
    updatePreferences(typeId, channels, enabled);
  };

  const getPreferenceForType = (typeId: string) => {
    return preferences.find(p => p.notification_type_id === typeId);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white leading-tight">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Notifications
            </span>
          </h1>
          <p className="text-muted-foreground">
            Manage your notifications and stay updated on important events
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={markAllAsRead} disabled={stats.unread === 0}>
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
          <Button variant="outline" onClick={() => setActiveTab('settings')}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unread</p>
                <p className="text-2xl font-bold text-orange-500">{stats.unread}</p>
              </div>
              <BellOff className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today</p>
                <p className="text-2xl font-bold">{stats.today}</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">{stats.this_week}</p>
              </div>
              <Zap className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Notifications</TabsTrigger>
          <TabsTrigger value="unread">
            Unread ({stats.unread})
          </TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search notifications..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-64"
                  />
                </div>
                
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="trading">Trading</SelectItem>
                    <SelectItem value="market">Market</SelectItem>
                    <SelectItem value="account">Account</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="unread-only"
                    checked={showOnlyUnread}
                    onCheckedChange={(checked) => setShowOnlyUnread(checked === true)}
                  />
                  <Label htmlFor="unread-only">Unread only</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications List */}
          <ScrollArea className="h-[600px]">
            <div className="space-y-2">
              {filteredNotifications.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No notifications found</h3>
                    <p className="text-muted-foreground">
                      {searchFilter || categoryFilter !== 'all' || priorityFilter !== 'all' || showOnlyUnread 
                        ? 'Try adjusting your filters'
                        : 'You\'re all caught up!'
                      }
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredNotifications.map((notification) => (
                  <Card 
                    key={notification.id} 
                    className={`border-l-4 ${getPriorityColor(notification.priority)} ${
                      !notification.read ? 'bg-muted/30' : ''
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="mt-1">
                            {getPriorityIcon(notification.priority)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={`font-medium ${!notification.read ? 'font-semibold' : ''}`}>
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-primary rounded-full" />
                              )}
                              <Badge variant="outline" className="capitalize">
                                {notification.category}
                              </Badge>
                              {notification.metadata?.icon && (
                                <span>{notification.metadata.icon}</span>
                              )}
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-2">
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>{formatTimeAgo(notification.created_at)}</span>
                              
                              <div className="flex items-center gap-1">
                                {notification.channels.map((channel) => (
                                  <div key={channel} className="flex items-center gap-1">
                                    {getChannelIcon(channel)}
                                  </div>
                                ))}
                              </div>
                              
                              {notification.expires_at && (
                                <span>Expires: {new Date(notification.expires_at).toLocaleDateString()}</span>
                              )}
                            </div>
                            
                            {notification.action_url && (
                              <Button variant="link" className="p-0 h-auto mt-2 text-xs">
                                View Details →
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1 ml-4">
                          {!notification.read && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="unread" className="space-y-4">
          <ScrollArea className="h-[600px]">
            <div className="space-y-2">
              {getUnreadNotifications().map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`border-l-4 ${getPriorityColor(notification.priority)} bg-muted/30`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-1">
                          {getPriorityIcon(notification.priority)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{notification.title}</h4>
                            <div className="w-2 h-2 bg-primary rounded-full" />
                            <Badge variant="outline" className="capitalize">
                              {notification.category}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(notification.created_at)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {getUnreadNotifications().length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <CheckCheck className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium">All caught up!</h3>
                    <p className="text-muted-foreground">
                      You have no unread notifications.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          {/* Notification Channels */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Notification Channels
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure how you receive notifications
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {channels.map((channel) => (
                <div key={channel.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getChannelIcon(channel.type)}
                    <div>
                      <h4 className="font-medium">{channel.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {channel.type === 'push' && 'Browser push notifications'}
                        {channel.type === 'email' && 'Email notifications to your registered address'}
                        {channel.type === 'webhook' && 'HTTP webhooks to external services'}
                        {channel.type === 'in_app' && 'In-application notifications'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {channel.type === 'push' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={requestPushPermission}
                      >
                        Enable Push
                      </Button>
                    )}
                    <Switch
                      checked={channel.enabled}
                      onCheckedChange={(checked) => {
                        // Update channel enabled state
                        console.log(`${channel.name} ${checked ? 'enabled' : 'disabled'}`);
                      }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Notification Types */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Types</CardTitle>
              <p className="text-sm text-muted-foreground">
                Choose which types of notifications you want to receive
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {notificationTypes.map((type) => {
                const preference = getPreferenceForType(type.id);
                const isEnabled = preference?.enabled ?? type.default_enabled;
                const selectedChannels = preference?.channels ?? type.channels;
                
                return (
                  <div key={type.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{type.name}</h4>
                          <Badge variant="outline" className="capitalize">
                            {type.category}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {type.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {type.description}
                        </p>
                      </div>
                      
                      <Switch
                        checked={isEnabled}
                        onCheckedChange={(checked) => {
                          handlePreferenceChange(type.id, selectedChannels, checked);
                        }}
                      />
                    </div>
                    
                    {isEnabled && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Delivery Channels:</Label>
                        <div className="flex flex-wrap gap-2">
                          {channels.filter(c => c.enabled).map((channel) => (
                            <div key={channel.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`${type.id}-${channel.id}`}
                                checked={selectedChannels.includes(channel.id)}
                                onCheckedChange={(checked) => {
                                  const newChannels = checked
                                    ? [...selectedChannels, channel.id]
                                    : selectedChannels.filter(c => c !== channel.id);
                                  handlePreferenceChange(type.id, newChannels, isEnabled);
                                }}
                              />
                              <Label 
                                htmlFor={`${type.id}-${channel.id}`}
                                className="text-sm flex items-center gap-1"
                              >
                                {getChannelIcon(channel.type)}
                                {channel.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};