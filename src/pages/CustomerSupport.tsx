import { CustomerSupportDashboard } from '@/components/support/CustomerSupportDashboard';
import { SEOHead } from '@/components/seo/SEOHead';

const CustomerSupport = () => {
  return (
    <>
      <SEOHead 
        title="Customer Support - HyperCognition"
        description="Get help from our 24/7 support team. Create tickets, browse knowledge base, or start live chat for immediate assistance."
        keywords="customer support, help desk, live chat, support tickets, FAQ, technical support"
      />
      <div className="container mx-auto px-3 md:px-4 py-4 md:py-8">
        <CustomerSupportDashboard />
      </div>
    </>
  );
};

export default CustomerSupport;