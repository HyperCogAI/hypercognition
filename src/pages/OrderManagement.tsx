import React from 'react';
import { OrderManagementDashboard } from '@/components/trading/OrderManagementDashboard';
import { SEOHead } from '@/components/seo/SEOHead';

const OrderManagement: React.FC = () => {
  return (
    <>
      <SEOHead 
        title="Order Management Dashboard | HyperCognition"
        description="Advanced order management with real-time tracking, modification capabilities, and comprehensive execution analytics for professional trading."
        keywords="order management, trading dashboard, order tracking, execution analytics, advanced orders"
      />
      
      <div className="container mx-auto p-6 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">
            Order Management
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Advanced order tracking, management, and execution analytics for professional trading
          </p>
        </div>
        <OrderManagementDashboard />
      </div>
    </>
  );
};

export default OrderManagement;