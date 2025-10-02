import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useChainAnalyticsSync(autoSync: boolean = true, intervalMs: number = 60000) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const isSyncingRef = useRef(false);
  const { toast } = useToast();

  const syncChainAnalytics = async () => {
    try {
      console.log('[ChainSync] Starting chain analytics sync...');
      
      const { data, error } = await supabase.functions.invoke('chain-analytics-sync', {
        body: {}
      });

      if (error) throw error;

      console.log('[ChainSync] Sync completed:', data);
      
      return data;
    } catch (error) {
      console.error('[ChainSync] Error:', error);
      throw error;
    }
  };

  const syncMarketSentiment = async () => {
    try {
      console.log('[SentimentSync] Starting market sentiment sync...');
      
      const { data, error } = await supabase.functions.invoke('market-sentiment-sync', {
        body: {}
      });

      if (error) throw error;

      console.log('[SentimentSync] Sync completed:', data);
      
      return data;
    } catch (error) {
      console.error('[SentimentSync] Error:', error);
      throw error;
    }
  };

  const syncPriceData = async () => {
    try {
      console.log('[PriceSync] Starting price data sync...');
      
      const { data, error } = await supabase.functions.invoke('price-data-sync', {
        body: {}
      });

      if (error) throw error;

      console.log('[PriceSync] Sync completed:', data);
      
      return data;
    } catch (error) {
      console.error('[PriceSync] Error:', error);
      throw error;
    }
  };

  const syncAll = useCallback(async () => {
    if (isSyncingRef.current) {
      console.log('[Sync] Already syncing, skipping...');
      return;
    }
    
    isSyncingRef.current = true;
    setIsSyncing(true);
    try {
      await Promise.all([
        syncChainAnalytics(),
        syncMarketSentiment(),
        syncPriceData()
      ]);
      
      setLastSyncTime(new Date());
      console.log('[Sync] All data synced successfully');
    } catch (error) {
      console.error('[Sync] Error syncing data:', error);
      toast({
        title: "Sync Error",
        description: "Failed to sync analytics data",
        variant: "destructive"
      });
    } finally {
      isSyncingRef.current = false;
      setIsSyncing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]); // syncChainAnalytics, syncMarketSentiment, syncPriceData are stable


  useEffect(() => {
    if (autoSync) {
      // Initial sync
      syncAll();
      
      // Set up interval for periodic syncing
      const interval = setInterval(syncAll, intervalMs);
      
      return () => clearInterval(interval);
    }
  }, [autoSync, intervalMs, syncAll]);

  return {
    syncChainAnalytics,
    syncMarketSentiment,
    syncPriceData,
    syncAll,
    isSyncing,
    lastSyncTime
  };
}