import React from 'react';
import { RiskManagementDashboard } from '@/components/portfolio/RiskManagementDashboard';
import { SEOHead } from '@/components/seo/SEOHead';

const RiskManagement: React.FC = () => {
  return (
    <>
      <SEOHead 
        title="Risk Management Dashboard | HyperCognition"
        description="Advanced portfolio risk analysis, position sizing, and optimization tools for professional trading risk management."
        keywords="risk management, portfolio optimization, position sizing, VaR analysis, diversification"
      />
      
      <div className="container mx-auto p-6 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">
            Risk Management
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Monitor portfolio risk, optimize allocations, and calculate optimal position sizes with advanced analytics
          </p>
        </div>
        <RiskManagementDashboard />
      </div>
    </>
  );
};

export default RiskManagement;