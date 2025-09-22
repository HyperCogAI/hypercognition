import React from 'react';
import { ComplianceDashboard } from '@/components/compliance/ComplianceDashboard';
import { SEOHead } from '@/components/seo/SEOHead';

const ComplianceRegulatory: React.FC = () => {
  return (
    <>
      <SEOHead 
        title="Compliance & Regulatory | HyperCognition"
        description="Comprehensive compliance monitoring and regulatory reporting tools for MiFID II, SEC, CFTC, and other financial regulations."
        keywords="compliance monitoring, regulatory reporting, MiFID II, SEC compliance, audit trail, risk management"
      />
      
      <div className="container mx-auto p-6">
        <ComplianceDashboard />
      </div>
    </>
  );
};

export default ComplianceRegulatory;