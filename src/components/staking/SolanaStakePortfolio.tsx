import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CyberButton } from '@/components/ui/cyber-button';
import { Inbox } from 'lucide-react';

export const SolanaStakePortfolio = () => {
  // Mock empty state - will be populated when user has actual stakes
  const hasStakes = false;

  if (!hasStakes) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Solana Stakes</CardTitle>
          <CardDescription>
            Your active Solana staking positions will appear here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-6 mb-4">
              <Inbox className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Active Stakes</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md">
              Start staking your SOL tokens to earn passive rewards. Choose from our
              available pools or delegate to a validator.
            </p>
            <CyberButton disabled>
              Coming Soon
            </CyberButton>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Placeholder for future stake cards */}
    </div>
  );
};
