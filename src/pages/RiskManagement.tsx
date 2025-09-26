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
      
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white leading-tight">
            Risk{" "}
            <span className="text-white">
              Management
            </span>
          </h1>
          <p className="text-muted-foreground">
            Monitor portfolio risk, optimize allocations, and calculate optimal position sizes
          </p>
        </div>
        <RiskManagementDashboard />
      </div>
    </>
  );
};

export default RiskManagement;