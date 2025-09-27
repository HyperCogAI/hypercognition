import React from 'react';
import { AdvancedNotificationCenter } from '@/components/notifications/AdvancedNotificationCenter';
import { SEOHead } from '@/components/seo/SEOHead';

const AdvancedNotifications: React.FC = () => {
  return (
    <>
      <SEOHead 
        title="Advanced Notifications | HyperCognition"
        description="Comprehensive notification management with real-time alerts, customizable preferences, and multi-channel delivery for trading activities."
        keywords="notifications, alerts, push notifications, email alerts, trading notifications, real-time updates"
      />
      
      <div className="container mx-auto px-3 md:px-4 py-4 md:py-6">
        <AdvancedNotificationCenter />
      </div>
    </>
  );
};

export default AdvancedNotifications;