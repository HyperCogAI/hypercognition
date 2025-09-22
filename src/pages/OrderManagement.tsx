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
      
      <div className="container mx-auto p-6">
        <OrderManagementDashboard />
      </div>
    </>
  );
};

export default OrderManagement;