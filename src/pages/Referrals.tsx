import React from 'react';
import { ReferralDashboard } from '@/components/referrals/ReferralDashboard';
import { SEOHead } from '@/components/seo/SEOHead';

const Referrals = () => {
  return (
    <>
      <SEOHead
        title="Referral Program - Earn Rewards for Inviting Friends | HyperCognition"
        description="Join our referral program and earn rewards for every friend you invite. Generate custom referral codes and track your earnings."
        keywords="referral program, invite friends, referral rewards, affiliate program, earn commissions"
      />
      <div className="container mx-auto px-4 py-8">
        <ReferralDashboard />
      </div>
    </>
  );
};

export default Referrals;