import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Play, 
  Database, 
  TrendingUp, 
  Newspaper, 
  CheckCircle2, 
  XCircle, 
  Loader2 
} from 'lucide-react';

export const AnalyticsTestPanel: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any>({});
  const { toast } = useToast();

  const testChainSync = async () => {
    setTesting(true);
    try {
      console.log('Testing chain-analytics-sync...');
      const { data, error } = await supabase.functions.invoke('chain-analytics-sync', {
        body: {}
      });

      if (error) throw error;

      setResults(prev => ({
        ...prev,
        chainSync: { success: true, data }
      }));

      toast({
        title: "Chain Sync Success",
        description: `Synced ${data.metrics?.chains || 0} chains, ${data.metrics?.tokens || 0} tokens`,
      });

      return data;
    } catch (error: any) {
      console.error('Chain sync error:', error);
      setResults(prev => ({
        ...prev,
        chainSync: { success: false, error: error.message }
      }));

      toast({
        title: "Chain Sync Failed",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    } finally {
      setTesting(false);
    }
  };

  const testSentimentSync = async () => {
    setTesting(true);
    try {
      console.log('Testing market-sentiment-sync...');
      const { data, error } = await supabase.functions.invoke('market-sentiment-sync', {
        body: {}
      });

      if (error) throw error;

      setResults(prev => ({
        ...prev,
        sentimentSync: { success: true, data }
      }));

      toast({
        title: "Sentiment Sync Success",
        description: `Fear & Greed Index: ${data.sentiment?.fear_greed_index || 'N/A'}`,
      });

      return data;
    } catch (error: any) {
      console.error('Sentiment sync error:', error);
      setResults(prev => ({
        ...prev,
        sentimentSync: { success: false, error: error.message }
      }));

      toast({
        title: "Sentiment Sync Failed",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    } finally {
      setTesting(false);
    }
  };

  const testDatabaseQueries = async () => {
    setTesting(true);
    try {
      console.log('Testing database queries...');
      
      // Test chain metrics
      const { data: chainMetrics, error: chainError } = await supabase
        .from('chain_metrics')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(5);

      if (chainError) throw chainError;

      // Test token metrics
      const { data: tokenMetrics, error: tokenError } = await supabase
        .from('token_metrics')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(5);

      if (tokenError) throw tokenError;

      // Test market sentiment
      const { data: sentiment, error: sentimentError } = await supabase
        .from('market_sentiment')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(5);

      if (sentimentError) throw sentimentError;

      // Test market news
      const { data: news, error: newsError } = await supabase
        .from('market_news')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(5);

      if (newsError) throw newsError;

      setResults(prev => ({
        ...prev,
        database: {
          success: true,
          data: {
            chainMetrics: chainMetrics?.length || 0,
            tokenMetrics: tokenMetrics?.length || 0,
            sentiment: sentiment?.length || 0,
            news: news?.length || 0
          }
        }
      }));

      toast({
        title: "Database Test Success",
        description: `Found ${chainMetrics?.length || 0} chain metrics, ${news?.length || 0} news articles`,
      });

    } catch (error: any) {
      console.error('Database test error:', error);
      setResults(prev => ({
        ...prev,
        database: { success: false, error: error.message }
      }));

      toast({
        title: "Database Test Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setTesting(false);
    }
  };

  const runAllTests = async () => {
    setResults({});
    setTesting(true);
    
    try {
      await testChainSync();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await testSentimentSync();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await testDatabaseQueries();
      
      toast({
        title: "All Tests Complete",
        description: "Backend is fully functional!",
      });
    } catch (error) {
      console.error('Test suite error:', error);
    } finally {
      setTesting(false);
    }
  };

  const ResultBadge = ({ result }: { result: any }) => {
    if (!result) return null;
    
    return result.success ? (
      <Badge className="gap-1 bg-green-100 text-green-700 border-green-200">
        <CheckCircle2 className="h-3 w-3" />
        Success
      </Badge>
    ) : (
      <Badge variant="destructive" className="gap-1">
        <XCircle className="h-3 w-3" />
        Failed
      </Badge>
    );
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Backend Analytics Test Panel
        </CardTitle>
        <CardDescription>
          Test and verify enterprise analytics backend functionality
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Button
            onClick={testChainSync}
            disabled={testing}
            className="gap-2"
            variant="outline"
          >
            {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}
            Chain Sync
          </Button>

          <Button
            onClick={testSentimentSync}
            disabled={testing}
            className="gap-2"
            variant="outline"
          >
            {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Newspaper className="h-4 w-4" />}
            Sentiment Sync
          </Button>

          <Button
            onClick={testDatabaseQueries}
            disabled={testing}
            className="gap-2"
            variant="outline"
          >
            {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
            Database Query
          </Button>

          <Button
            onClick={runAllTests}
            disabled={testing}
            className="gap-2"
          >
            {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Run All Tests
          </Button>
        </div>

        {Object.keys(results).length > 0 && (
          <div className="space-y-3 pt-4 border-t border-border/50">
            <h3 className="font-semibold text-sm">Test Results:</h3>
            
            {results.chainSync && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-medium">Chain Analytics Sync</span>
                </div>
                <ResultBadge result={results.chainSync} />
              </div>
            )}

            {results.sentimentSync && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Newspaper className="h-4 w-4" />
                  <span className="text-sm font-medium">Market Sentiment Sync</span>
                </div>
                <ResultBadge result={results.sentimentSync} />
              </div>
            )}

            {results.database && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  <span className="text-sm font-medium">Database Queries</span>
                </div>
                <div className="flex items-center gap-2">
                  {results.database.success && results.database.data && (
                    <span className="text-xs text-muted-foreground">
                      {results.database.data.chainMetrics} chains, {results.database.data.news} news
                    </span>
                  )}
                  <ResultBadge result={results.database} />
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};