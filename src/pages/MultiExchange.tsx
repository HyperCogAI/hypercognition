import { MultiExchangeDashboard } from '@/components/trading/MultiExchangeDashboard';
import { SEOHead } from '@/components/seo/SEOHead';

const MultiExchange = () => {
  return (
    <>
      <SEOHead 
        title="Multi-Exchange Trading - HyperCognition"
        description="Trade across multiple cryptocurrency exchanges with unified portfolio management, arbitrage detection, and best execution pricing."
        keywords="multi-exchange trading, crypto arbitrage, portfolio management, cross-exchange trading"
      />
      <div className="container mx-auto px-4 py-8">
        <MultiExchangeDashboard />
      </div>
    </>
  );
};

export default MultiExchange;