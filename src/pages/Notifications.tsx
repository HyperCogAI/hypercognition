import React from 'react';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import { SEOHead } from '@/components/seo/SEOHead';
import { Bell } from 'lucide-react';

const Notifications = () => {
  return (
    <>
      <SEOHead 
        title="Notifications & Alerts - Manage Your Trading Alerts | HyperCognition"
        description="Manage price alerts, notification preferences, and stay informed about your AI agent trading portfolio with real-time notifications and custom alerts."
        keywords="price alerts, trading notifications, portfolio alerts, market notifications, AI trading alerts"
      />
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <header className="text-center space-y-4">
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-white">
              Notification Center
            </h1>
          </div>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Manage your <span className="text-primary font-medium">alerts and preferences</span> to stay informed about your portfolio
          </p>
        </header>

        <NotificationCenter />
      </div>
    </>
  );
};

export default Notifications;