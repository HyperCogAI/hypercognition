import React from 'react';
import { UnifiedStakingDashboard } from '@/components/staking/UnifiedStakingDashboard';
import { SEOHead } from '@/components/seo/SEOHead';

const Staking = () => {
  return (
    <>
      <SEOHead
        title="Staking Dashboard - Earn Rewards by Staking | HyperCognition"
        description="Stake your tokens to earn passive rewards. Choose from traditional and Solana staking programs with competitive APY rates."
        keywords="staking rewards, token staking, passive income, cryptocurrency staking, stake-to-earn, solana staking, validator staking"
      />
      <div className="container mx-auto px-4 py-8">
        <UnifiedStakingDashboard />
      </div>
    </>
  );
};

export default Staking;