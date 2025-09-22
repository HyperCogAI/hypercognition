import React from 'react';
import { InstitutionalDashboard } from '@/components/institutional/InstitutionalDashboard';
import { SEOHead } from '@/components/seo/SEOHead';

const InstitutionalFeatures: React.FC = () => {
  return (
    <>
      <SEOHead 
        title="Institutional Features | HyperCognition"
        description="Enterprise-grade institutional features including team management, compliance tools, API access, and white-label solutions for professional trading organizations."
        keywords="institutional trading, team management, compliance, API access, white label, enterprise trading"
      />
      
      <div className="container mx-auto p-6">
        <InstitutionalDashboard />
      </div>
    </>
  );
};

export default InstitutionalFeatures;