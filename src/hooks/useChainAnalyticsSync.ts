import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useChainAnalyticsSync(autoSync: boolean = true, intervalMs: number = 60000) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const { toast } = useToast();

  const syncChainAnalytics = async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    try {
      console.log('[ChainSync] Starting chain analytics sync...');
      
      const { data, error } = await supabase.functions.invoke('chain-analytics-sync', {
        body: {}
      });

      if (error) throw error;

      console.log('[ChainSync] Sync completed:', data);
      setLastSyncTime(new Date());
      
      return data;
    } catch (error) {
      console.error('[ChainSync] Error:', error);
      toast({
        title: "Sync Error",
        description: "Failed to sync chain analytics data",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsSyncing(false);
    }
  };

  const syncMarketSentiment = async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    try {
      console.log('[SentimentSync] Starting market sentiment sync...');
      
      const { data, error } = await supabase.functions.invoke('market-sentiment-sync', {
        body: {}
      });

      if (error) throw error;

      console.log('[SentimentSync] Sync completed:', data);
      setLastSyncTime(new Date());
      
      return data;
    } catch (error) {
      console.error('[SentimentSync] Error:', error);
      toast({
        title: "Sync Error",
        description: "Failed to sync market sentiment data",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsSyncing(false);
    }
  };

  const syncPriceData = async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    try {
      console.log('[PriceSync] Starting price data sync...');
      
      const { data, error } = await supabase.functions.invoke('price-data-sync', {
        body: {}
      });

      if (error) throw error;

      console.log('[PriceSync] Sync completed:', data);
      setLastSyncTime(new Date());
      
      return data;
    } catch (error) {
      console.error('[PriceSync] Error:', error);
      toast({
        title: "Sync Error",
        description: "Failed to sync price data",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsSyncing(false);
    }
  };

  const syncAll = async () => {
    try {
      await Promise.all([
        syncChainAnalytics(),
        syncMarketSentiment(),
        syncPriceData()
      ]);
      
      toast({
        title: "Sync Complete",
        description: "All analytics data has been updated",
      });
    } catch (error) {
      console.error('[Sync] Error syncing all data:', error);
    }
  };

  useEffect(() => {
    if (autoSync) {
      // Initial sync
      syncAll();
      
      // Set up interval for periodic syncing
      const interval = setInterval(syncAll, intervalMs);
      
      return () => clearInterval(interval);
    }
  }, [autoSync, intervalMs]);

  return {
    syncChainAnalytics,
    syncMarketSentiment,
    syncPriceData,
    syncAll,
    isSyncing,
    lastSyncTime
  };
}