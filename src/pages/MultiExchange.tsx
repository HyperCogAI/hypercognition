import { MultiExchangeDashboard } from '@/components/trading/MultiExchangeDashboard';
import { SEOHead } from '@/components/seo/SEOHead';
import { TrendingUp } from 'lucide-react';

const MultiExchange = () => {
  return (
    <>
      <SEOHead 
        title="Multi-Exchange Trading - HyperCognition"
        description="Trade across multiple cryptocurrency exchanges with unified portfolio management, arbitrage detection, and best execution pricing."
        keywords="multi-exchange trading, crypto arbitrage, portfolio management, cross-exchange trading"
      />
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <header className="text-center space-y-4">
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-white">
              Multi-Exchange Trading
            </h1>
          </div>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Trade across multiple exchanges with <span className="text-primary font-medium">unified portfolio management</span> and arbitrage detection
          </p>
        </header>

        <MultiExchangeDashboard />
      </div>
    </>
  );
};

export default MultiExchange;