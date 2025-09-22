import React from 'react';
import { StakingDashboard } from '@/components/staking/StakingDashboard';
import { SEOHead } from '@/components/seo/SEOHead';

const Staking = () => {
  return (
    <>
      <SEOHead
        title="Staking Dashboard - Earn Rewards by Staking | HyperCognition"
        description="Stake your tokens to earn passive rewards. Choose from flexible or locked staking programs with competitive APY rates."
        keywords="staking rewards, token staking, passive income, cryptocurrency staking, stake-to-earn"
      />
      <div className="container mx-auto px-4 py-8">
        <StakingDashboard />
      </div>
    </>
  );
};

export default Staking;