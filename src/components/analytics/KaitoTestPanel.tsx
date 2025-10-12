import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useKaitoAttention } from '@/hooks/useKaitoAttention';
import { Sparkles, Check, X, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

/**
 * Test panel for Kaito integration
 * Add this component to Analytics page temporarily for testing
 */
export const KaitoTestPanel = () => {
  const [username, setUsername] = useState('VitalikButerin');
  const [testResults, setTestResults] = useState<any[]>([]);
  const { syncForUsername, isSyncing, score, formatYaps, getInfluenceTier } = useKaitoAttention();

  const runTest = async (testUsername: string) => {
    setTestResults(prev => [...prev, {
      username: testUsername,
      status: 'running',
      timestamp: new Date().toISOString()
    }]);

    try {
      await syncForUsername(testUsername);
      setTestResults(prev => prev.map(r => 
        r.username === testUsername && r.status === 'running'
          ? { ...r, status: 'success' }
          : r
      ));
    } catch (error) {
      setTestResults(prev => prev.map(r => 
        r.username === testUsername && r.status === 'running'
          ? { ...r, status: 'failed', error: error.message }
          : r
      ));
    }
  };

  const runSampleTests = async () => {
    const sampleUsernames = ['VitalikButerin', 'elonmusk', 'brian_armstrong', 'naval'];
    for (const username of sampleUsernames) {
      await runTest(username);
      // Wait 3 seconds between calls to respect rate limits
      if (username !== sampleUsernames[sampleUsernames.length - 1]) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
  };

  return (
    <Card className="border-2 border-primary/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Kaito Integration Test Panel
        </CardTitle>
        <CardDescription>
          Test the Kaito API integration and verify data flow
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Manual Test */}
        <div className="space-y-3">
          <Label htmlFor="username">Test Username</Label>
          <div className="flex gap-2">
            <Input
              id="username"
              placeholder="Enter Twitter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={() => runTest(username)}
              disabled={isSyncing || !username}
            >
              {isSyncing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test Single'
              )}
            </Button>
          </div>
        </div>

        {/* Batch Test */}
        <div>
          <Button 
            onClick={runSampleTests}
            disabled={isSyncing}
            variant="outline"
            className="w-full"
          >
            {isSyncing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Running Batch Test...
              </>
            ) : (
              'Run Batch Test (4 samples)'
            )}
          </Button>
        </div>

        {/* Current Score Display */}
        {score && (
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="text-sm font-semibold mb-2">Latest Score Retrieved:</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Username:</div>
              <div className="font-mono">@{score.twitter_username}</div>
              
              <div>30d Yaps:</div>
              <div className="font-bold text-primary">{formatYaps(score.yaps_30d)}</div>
              
              <div>Tier:</div>
              <Badge className={getInfluenceTier(score.yaps_30d).color}>
                {getInfluenceTier(score.yaps_30d).tier}
              </Badge>
              
              <div>Updated:</div>
              <div className="text-xs">{new Date(score.updated_at).toLocaleString()}</div>
            </div>
          </div>
        )}

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-semibold">Test Results:</div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {testResults.map((result, i) => (
                <div 
                  key={i}
                  className="flex items-center justify-between p-2 rounded border text-sm"
                >
                  <span className="font-mono">@{result.username}</span>
                  <div className="flex items-center gap-2">
                    {result.status === 'running' && (
                      <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    )}
                    {result.status === 'success' && (
                      <Check className="h-4 w-4 text-green-500" />
                    )}
                    {result.status === 'failed' && (
                      <X className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-xs ${
                      result.status === 'success' ? 'text-green-600' :
                      result.status === 'failed' ? 'text-red-600' :
                      'text-blue-600'
                    }`}>
                      {result.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="p-3 rounded bg-muted text-xs space-y-2">
          <div className="font-semibold">Testing Instructions:</div>
          <ol className="list-decimal list-inside space-y-1">
            <li>Enter a Twitter username and click "Test Single"</li>
            <li>Or click "Run Batch Test" to test 4 sample accounts</li>
            <li>Check the test results below</li>
            <li>Verify data in Supabase dashboard → kaito_attention_scores table</li>
            <li>Check edge function logs for any errors</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};
