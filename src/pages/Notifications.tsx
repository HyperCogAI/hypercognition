import React from 'react';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import { SEOHead } from '@/components/seo/SEOHead';

const Notifications = () => {
  return (
    <>
      <SEOHead 
        title="Notifications & Alerts - Manage Your Trading Alerts | HyperCognition"
        description="Manage price alerts, notification preferences, and stay informed about your AI agent trading portfolio with real-time notifications and custom alerts."
        keywords="price alerts, trading notifications, portfolio alerts, market notifications, AI trading alerts"
      />
      <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
        <NotificationCenter />
      </div>
    </>
  );
};

export default Notifications;