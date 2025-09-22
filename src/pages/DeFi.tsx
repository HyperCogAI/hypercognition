import React from 'react';
import { DeFiDashboard } from '@/components/defi/DeFiDashboard';
import { SEOHead } from '@/components/seo/SEOHead';

const DeFi = () => {
  return (
    <>
      <SEOHead
        title="DeFi Dashboard - Yield Farming & Liquidity Mining | HyperCognition"
        description="Access decentralized finance opportunities with yield farming and liquidity mining. Earn rewards by providing liquidity to AI agent trading pools."
        keywords="DeFi, yield farming, liquidity mining, cryptocurrency rewards, decentralized finance"
      />
      <div className="container mx-auto px-4 py-8">
        <DeFiDashboard />
      </div>
    </>
  );
};

export default DeFi;