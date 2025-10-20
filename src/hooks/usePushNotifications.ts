import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const VAPID_PUBLIC_KEY = 'YOUR_VAPID_PUBLIC_KEY'; // Generate this with: npx web-push generate-vapid-keys

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { session } = useAuth();

  useEffect(() => {
    // Check if Push API is supported
    setIsSupported('serviceWorker' in navigator && 'PushManager' in window);

    // Check current subscription status
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(async (registration) => {
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      });
    }
  }, []);

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribeToPush = async () => {
    if (!isSupported || !session) return;

    setIsLoading(true);
    try {
      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast({
          title: "Permission denied",
          description: "Please enable notifications in your browser settings",
          variant: "destructive",
        });
        return;
      }

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // Save subscription to database
      const subscriptionJSON = subscription.toJSON();
      const { error } = await supabase
        .from('push_subscriptions' as any)
        .upsert({
          user_id: session.user.id,
          endpoint: subscriptionJSON.endpoint!,
          p256dh: subscriptionJSON.keys!.p256dh,
          auth: subscriptionJSON.keys!.auth,
          user_agent: navigator.userAgent,
          device_type: 'web',
          is_active: true,
        } as any);

      if (error) throw error;

      setIsSubscribed(true);
      toast({
        title: "Notifications enabled",
        description: "You'll receive push notifications for high-confidence signals",
      });

    } catch (error: any) {
      console.error('Push subscription error:', error);
      toast({
        title: "Failed to enable notifications",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribeFromPush = async () => {
    if (!isSupported || !session) return;

    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();

        // Remove from database
        await supabase
          .from('push_subscriptions' as any)
          .update({ is_active: false } as any)
          .eq('user_id', session.user.id)
          .eq('endpoint', subscription.endpoint);
      }

      setIsSubscribed(false);
      toast({
        title: "Notifications disabled",
        description: "You won't receive push notifications anymore",
      });

    } catch (error: any) {
      console.error('Push unsubscribe error:', error);
      toast({
        title: "Failed to disable notifications",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isSupported,
    isSubscribed,
    isLoading,
    subscribeToPush,
    unsubscribeFromPush,
  };
}
