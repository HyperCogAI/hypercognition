import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AnalyticsService, AnalyticsEvent, PortfolioMetrics, TradingMetrics } from '@/services/AnalyticsService';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useAdvancedAnalytics = (
  period: 'hourly' | 'daily' | 'weekly' | 'monthly' = 'daily'
) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Track analytics event
  const trackEventMutation = useMutation({
    mutationFn: (event: AnalyticsEvent) => 
      AnalyticsService.trackEvent(event),
    onError: (error: Error) => {
      console.error('Error tracking event:', error);
    }
  });

  // Get portfolio analytics
  const { 
    data: portfolioAnalytics = [], 
    isLoading: isLoadingPortfolio 
  } = useQuery({
    queryKey: ['portfolio-analytics', period],
    queryFn: () => AnalyticsService.getPortfolioAnalytics(period),
  });

  // Get trading analytics
  const { 
    data: tradingAnalytics = [], 
    isLoading: isLoadingTrading 
  } = useQuery({
    queryKey: ['trading-analytics', period],
    queryFn: () => AnalyticsService.getTradingAnalytics(period),
  });

  // Get analytics preferences
  const { 
    data: preferences, 
    isLoading: isLoadingPreferences 
  } = useQuery({
    queryKey: ['analytics-preferences'],
    queryFn: () => AnalyticsService.getAnalyticsPreferences(),
  });

  // Get performance summary
  const { 
    data: performanceSummary, 
    isLoading: isLoadingSummary 
  } = useQuery({
    queryKey: ['performance-summary'],
    queryFn: () => AnalyticsService.getPerformanceSummary(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Update preferences
  const updatePreferencesMutation = useMutation({
    mutationFn: (newPreferences: any) => 
      AnalyticsService.updateAnalyticsPreferences(newPreferences),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics-preferences'] });
      toast({
        title: 'Preferences Updated',
        description: 'Your analytics preferences have been saved.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Export analytics data
  const exportDataMutation = useMutation({
    mutationFn: ({ 
      startDate, 
      endDate, 
      dataType 
    }: { 
      startDate: Date; 
      endDate: Date; 
      dataType: 'portfolio' | 'trading' | 'events';
    }) => AnalyticsService.exportAnalyticsData(startDate, endDate, dataType),
    onSuccess: (result) => {
      if (result.success && result.data) {
        // Convert to CSV and download
        const csv = convertToCSV(result.data);
        downloadCSV(csv, 'analytics-export.csv');
        toast({
          title: 'Export Complete',
          description: 'Your analytics data has been exported.',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Export Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Get trending agents
  const { 
    data: trendingAgents = [], 
    isLoading: isLoadingTrending 
  } = useQuery({
    queryKey: ['trending-agents', period],
    queryFn: () => AnalyticsService.getTrendingAgents(period),
  });

  // Get top performers
  const { 
    data: topPerformers = [], 
    isLoading: isLoadingTopPerformers 
  } = useQuery({
    queryKey: ['top-performers', period],
    queryFn: () => AnalyticsService.getTopPerformers(period),
  });

  // Get market overview
  const { 
    data: marketOverview, 
    isLoading: isLoadingMarketOverview 
  } = useQuery({
    queryKey: ['market-overview', period],
    queryFn: () => AnalyticsService.getMarketOverview(period),
  });

  // Get anomaly alerts
  const { 
    data: anomalyAlerts = [], 
    isLoading: isLoadingAnomalies 
  } = useQuery({
    queryKey: ['anomaly-alerts'],
    queryFn: () => AnalyticsService.getAnomalyAlerts(20),
    refetchInterval: 60000, // Refresh every minute
  });

  const trackEvent = (event: AnalyticsEvent) => {
    trackEventMutation.mutate(event);
  };

  const updatePreferences = (newPreferences: any) => {
    updatePreferencesMutation.mutate(newPreferences);
  };

  const exportData = (
    startDate: Date, 
    endDate: Date, 
    dataType: 'portfolio' | 'trading' | 'events'
  ) => {
    exportDataMutation.mutate({ startDate, endDate, dataType });
  };

  return {
    portfolioAnalytics,
    tradingAnalytics,
    preferences,
    performanceSummary,
    trendingAgents,
    topPerformers,
    marketOverview,
    anomalyAlerts,
    isLoading: isLoadingPortfolio || isLoadingTrading || isLoadingPreferences,
    isLoadingSummary,
    isLoadingTrending,
    isLoadingTopPerformers,
    isLoadingMarketOverview,
    isLoadingAnomalies,
    trackEvent,
    updatePreferences,
    exportData,
    isExporting: exportDataMutation.isPending,
  };
};

// Helper function to convert data to CSV
function convertToCSV(data: any[]): string {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];
  
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      return typeof value === 'string' ? `"${value}"` : value;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}

// Helper function to download CSV
function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}