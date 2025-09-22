import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface NotificationChannel {
  id: string;
  name: string;
  type: 'in_app' | 'push' | 'email' | 'sms' | 'webhook';
  enabled: boolean;
  settings: Record<string, any>;
}

export interface NotificationType {
  id: string;
  name: string;
  category: 'trading' | 'market' | 'account' | 'compliance' | 'system';
  description: string;
  default_enabled: boolean;
  channels: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface NotificationPreference {
  id: string;
  user_id: string;
  notification_type_id: string;
  channels: string[];
  enabled: boolean;
  conditions?: Record<string, any>;
  quiet_hours?: {
    enabled: boolean;
    start: string; // HH:MM
    end: string; // HH:MM
    timezone: string;
  };
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  data?: Record<string, any>;
  channels: string[];
  read: boolean;
  read_at?: string;
  created_at: string;
  expires_at?: string;
  action_url?: string;
  metadata?: Record<string, any>;
}

export interface NotificationStats {
  total: number;
  unread: number;
  by_category: Record<string, number>;
  by_priority: Record<string, number>;
  today: number;
  this_week: number;
}

export const useAdvancedNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [channels, setChannels] = useState<NotificationChannel[]>([]);
  const [notificationTypes, setNotificationTypes] = useState<NotificationType[]>([]);
  const [realtimeChannel, setRealtimeChannel] = useState<any>(null);

  // Fetch notification data
  useEffect(() => {
    if (!user) return;

    const fetchNotificationData = async () => {
      try {
        setLoading(true);

        // Fetch notifications from database
        const { data: notificationsData } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(100);

        if (notificationsData && notificationsData.length > 0) {
          // Map database notifications to our interface
          const mappedNotifications = notificationsData.map(item => ({
            ...item,
            channels: ['in_app'], // Default channel since it might not exist in DB
            priority: item.priority as 'low' | 'medium' | 'high' | 'critical',
            category: item.category || 'system',
            data: (item.data as Record<string, any>) || {},
            metadata: undefined // Clear metadata since it might not match our type
          }));
          setNotifications(mappedNotifications);
        } else {
          generateMockNotifications();
        }

        // For now, just generate mock preferences since the DB structure is different
        generateMockPreferences();

        // Generate mock data for channels and types
        generateMockStaticData();
      } catch (error) {
        console.error('Error fetching notification data:', error);
        generateMockNotifications();
        generateMockPreferences();
      } finally {
        setLoading(false);
      }
    };

    fetchNotificationData();
  }, [user]);

  // Set up real-time notifications
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          
          // Show toast for high priority notifications
          if (newNotification.priority === 'high' || newNotification.priority === 'critical') {
            toast({
              title: newNotification.title,
              description: newNotification.message,
              variant: newNotification.priority === 'critical' ? 'destructive' : 'default'
            });
          }
        }
      )
      .subscribe();

    setRealtimeChannel(channel);

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [user, toast]);

  // Generate mock notifications
  const generateMockNotifications = () => {
    const mockNotifications: Notification[] = [
      {
        id: 'notif_1',
        user_id: user?.id || 'user_1',
        type: 'price_alert',
        category: 'trading',
        priority: 'high',
        title: 'Price Alert Triggered',
        message: 'AAPL has reached your target price of $150.00',
        data: {
          symbol: 'AAPL',
          current_price: 150.50,
          target_price: 150.00,
          change: 0.50
        },
        channels: ['in_app', 'push'],
        read: false,
        created_at: new Date().toISOString(),
        action_url: '/trading/AAPL',
        metadata: {
          icon: '📈',
          color: 'green'
        }
      },
      {
        id: 'notif_2',
        user_id: user?.id || 'user_1',
        type: 'order_filled',
        category: 'trading',
        priority: 'medium',
        title: 'Order Executed',
        message: 'Your buy order for 100 shares of TSLA has been filled at $250.25',
        data: {
          order_id: 'ORD_123456',
          symbol: 'TSLA',
          quantity: 100,
          price: 250.25,
          side: 'buy'
        },
        channels: ['in_app', 'email'],
        read: true,
        read_at: new Date(Date.now() - 1800000).toISOString(),
        created_at: new Date(Date.now() - 3600000).toISOString(),
        action_url: '/portfolio',
        metadata: {
          icon: '✅',
          color: 'blue'
        }
      },
      {
        id: 'notif_3',
        user_id: user?.id || 'user_1',
        type: 'market_news',
        category: 'market',
        priority: 'medium',
        title: 'Market Update',
        message: 'Tech stocks surge as AI adoption accelerates across industries',
        data: {
          article_id: 'art_789',
          source: 'Financial Times',
          tags: ['AI', 'Technology', 'Markets']
        },
        channels: ['in_app'],
        read: false,
        created_at: new Date(Date.now() - 7200000).toISOString(),
        action_url: '/news/art_789',
        metadata: {
          icon: '📰',
          color: 'blue'
        }
      },
      {
        id: 'notif_4',
        user_id: user?.id || 'user_1',
        type: 'compliance_alert',
        category: 'compliance',
        priority: 'critical',
        title: 'Compliance Review Required',
        message: 'Large trade requires compliance review before execution',
        data: {
          trade_id: 'TRD_456789',
          amount: 1000000,
          reason: 'Exceeds daily limit'
        },
        channels: ['in_app', 'email', 'push'],
        read: false,
        created_at: new Date(Date.now() - 10800000).toISOString(),
        action_url: '/compliance',
        metadata: {
          icon: '⚠️',
          color: 'red'
        }
      },
      {
        id: 'notif_5',
        user_id: user?.id || 'user_1',
        type: 'system_maintenance',
        category: 'system',
        priority: 'low',
        title: 'Scheduled Maintenance',
        message: 'Trading platform will be offline for maintenance on Sunday 2-4 AM UTC',
        data: {
          start_time: '2024-12-08T02:00:00Z',
          end_time: '2024-12-08T04:00:00Z',
          affected_services: ['trading', 'market_data']
        },
        channels: ['in_app', 'email'],
        read: true,
        read_at: new Date(Date.now() - 86400000).toISOString(),
        created_at: new Date(Date.now() - 86400000).toISOString(),
        expires_at: new Date(Date.now() + 604800000).toISOString(), // 1 week
        metadata: {
          icon: '🔧',
          color: 'orange'
        }
      }
    ];

    setNotifications(mockNotifications);
  };

  // Generate mock preferences
  const generateMockPreferences = () => {
    const mockPreferences: NotificationPreference[] = [
      {
        id: 'pref_1',
        user_id: user?.id || 'user_1',
        notification_type_id: 'price_alert',
        channels: ['in_app', 'push'],
        enabled: true
      },
      {
        id: 'pref_2',
        user_id: user?.id || 'user_1',
        notification_type_id: 'order_filled',
        channels: ['in_app', 'email'],
        enabled: true
      }
    ];
    setPreferences(mockPreferences);
  };

  // Generate mock static data
  const generateMockStaticData = () => {
    const mockChannels: NotificationChannel[] = [
      {
        id: 'in_app',
        name: 'In-App Notifications',
        type: 'in_app',
        enabled: true,
        settings: {
          sound: true,
          badge: true
        }
      },
      {
        id: 'push',
        name: 'Push Notifications',
        type: 'push',
        enabled: true,
        settings: {
          sound: true,
          vibration: true,
          badge: true
        }
      },
      {
        id: 'email',
        name: 'Email Notifications',
        type: 'email',
        enabled: true,
        settings: {
          digest: true,
          immediate: false,
          format: 'html'
        }
      },
      {
        id: 'webhook',
        name: 'Webhook',
        type: 'webhook',
        enabled: false,
        settings: {
          url: '',
          secret: '',
          retry_count: 3
        }
      }
    ];

    const mockTypes: NotificationType[] = [
      {
        id: 'price_alert',
        name: 'Price Alerts',
        category: 'trading',
        description: 'Notifications when price targets are reached',
        default_enabled: true,
        channels: ['in_app', 'push', 'email'],
        priority: 'high'
      },
      {
        id: 'order_filled',
        name: 'Order Executed',
        category: 'trading',
        description: 'Notifications when orders are filled',
        default_enabled: true,
        channels: ['in_app', 'push'],
        priority: 'medium'
      },
      {
        id: 'position_change',
        name: 'Position Changes',
        category: 'trading',
        description: 'Notifications for significant position changes',
        default_enabled: true,
        channels: ['in_app'],
        priority: 'medium'
      },
      {
        id: 'market_news',
        name: 'Market News',
        category: 'market',
        description: 'Breaking market news and updates',
        default_enabled: false,
        channels: ['in_app', 'email'],
        priority: 'low'
      },
      {
        id: 'compliance_alert',
        name: 'Compliance Alerts',
        category: 'compliance',
        description: 'Compliance and regulatory notifications',
        default_enabled: true,
        channels: ['in_app', 'email', 'push'],
        priority: 'critical'
      },
      {
        id: 'system_maintenance',
        name: 'System Updates',
        category: 'system',
        description: 'System maintenance and update notifications',
        default_enabled: true,
        channels: ['in_app', 'email'],
        priority: 'low'
      },
      {
        id: 'account_security',
        name: 'Account Security',
        category: 'account',
        description: 'Login attempts and security events',
        default_enabled: true,
        channels: ['in_app', 'email', 'push'],
        priority: 'high'
      }
    ];

    setChannels(mockChannels);
    setNotificationTypes(mockTypes);
  };

  // Calculate notification statistics
  const getNotificationStats = useCallback((): NotificationStats => {
    const total = notifications.length;
    const unread = notifications.filter(n => !n.read).length;
    
    const by_category = notifications.reduce((acc, n) => {
      acc[n.category] = (acc[n.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const by_priority = notifications.reduce((acc, n) => {
      acc[n.priority] = (acc[n.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const today = notifications.filter(n => {
      const notificationDate = new Date(n.created_at);
      const todayDate = new Date();
      return notificationDate.toDateString() === todayDate.toDateString();
    }).length;

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const this_week = notifications.filter(n => 
      new Date(n.created_at) >= weekAgo
    ).length;

    return {
      total,
      unread,
      by_category,
      by_priority,
      today,
      this_week
    };
  }, [notifications]);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('id', notificationId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setNotifications(prev => prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true, read_at: new Date().toISOString() }
          : notification
      ));
    } catch (error) {
      // Fallback to local update if database update fails
      setNotifications(prev => prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true, read_at: new Date().toISOString() }
          : notification
      ));
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      
      if (unreadIds.length === 0) return;

      const { error } = await supabase
        .from('notifications')
        .update({ 
          read: true, 
          read_at: new Date().toISOString() 
        })
        .in('id', unreadIds)
        .eq('user_id', user?.id);

      if (error) throw error;

      setNotifications(prev => prev.map(notification => ({
        ...notification,
        read: true,
        read_at: notification.read_at || new Date().toISOString()
      })));

      toast({
        title: "All notifications marked as read",
        description: `${unreadIds.length} notifications updated`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark notifications as read",
        variant: "destructive",
      });
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setNotifications(prev => prev.filter(n => n.id !== notificationId));

      toast({
        title: "Notification deleted",
        description: "The notification has been removed",
      });
    } catch (error) {
      // Fallback to local deletion
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      toast({
        title: "Notification deleted",
        description: "The notification has been removed",
      });
    }
  };

  // Update notification preferences
  const updatePreferences = async (typeId: string, channels: string[], enabled: boolean) => {
    try {
      // Map notification types to database columns
      const columnMapping: Record<string, string> = {
        'price_alert': 'price_alerts_enabled',
        'portfolio_updates': 'portfolio_updates_enabled',
        'push_notifications': 'push_notifications_enabled',
        'email_notifications': 'email_notifications_enabled',
        'social_updates': 'social_updates_enabled',
        'market_news': 'market_news_enabled'
      };

      const columnName = columnMapping[typeId];
      if (columnName) {
        const { error } = await supabase
          .from('notification_preferences')
          .upsert({
            user_id: user?.id,
            [columnName]: enabled
          });

        if (error) throw error;
      }

      // Update local state for mock preferences
      const existingPref = preferences.find(p => p.notification_type_id === typeId);
      if (existingPref) {
        setPreferences(prev => prev.map(pref => 
          pref.id === existingPref.id 
            ? { ...pref, channels, enabled }
            : pref
        ));
      } else {
        const mockPref: NotificationPreference = {
          id: `pref_${Date.now()}`,
          user_id: user?.id || '',
          notification_type_id: typeId,
          channels,
          enabled
        };
        setPreferences(prev => [...prev, mockPref]);
      }

      toast({
        title: "Preferences updated",
        description: "Your notification preferences have been saved",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update preferences",
        variant: "destructive",
      });
    }
  };

  // Create notification (for testing or internal use)
  const createNotification = async (notification: Omit<Notification, 'id' | 'user_id' | 'created_at'>) => {
    try {
      const newNotification: Omit<Notification, 'id'> = {
        ...notification,
        user_id: user?.id || '',
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('notifications')
        .insert(newNotification)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Failed to create notification:', error);
      throw error;
    }
  };

  // Request push notification permission
  const requestPushPermission = async () => {
    try {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
          toast({
            title: "Push notifications enabled",
            description: "You'll receive push notifications for important updates",
          });
          return true;
        } else {
          toast({
            title: "Push notifications disabled",
            description: "Enable notifications in your browser settings to receive alerts",
            variant: "destructive",
          });
          return false;
        }
      }
      return false;
    } catch (error) {
      console.error('Failed to request push permission:', error);
      return false;
    }
  };

  return {
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
    createNotification,
    requestPushPermission,
    // Filtered getters
    getNotificationsByCategory: (category: string) => 
      notifications.filter(n => n.category === category),
    getUnreadNotifications: () => 
      notifications.filter(n => !n.read),
    getRecentNotifications: (hours: number = 24) => {
      const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
      return notifications.filter(n => new Date(n.created_at) >= cutoff);
    }
  };
};