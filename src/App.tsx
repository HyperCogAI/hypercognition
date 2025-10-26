import { Suspense, lazy, useState } from "react"
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WagmiProvider } from 'wagmi'
import { createWeb3Modal } from '@web3modal/wagmi/react'
import { config, WALLETCONNECT_PROJECT_ID } from './config/wagmi'
import { ConnectionProvider, WalletProvider, WalletModalProvider, wallets, endpoint } from './config/solana'
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { FavoritesProvider } from "@/contexts/FavoritesContext"
import { AuthProvider } from "@/contexts/AuthContext"
import { ErrorBoundary } from "@/components/error/ErrorBoundary"
import { CardSkeleton } from "@/components/ui/loading-skeleton"
import { MobileNavigation } from "@/components/mobile/MobileNavigation"
import { MobileToolbar } from "@/components/mobile/MobileToolbar"
import { useIsMobile } from "@/hooks/use-mobile"
import { LoadingScreen } from "@/components/ui/loading-screen"
import AITradingAssistant from "@/components/ai/AITradingAssistant"
import { NetworkSelectorButton } from "@/components/wallet/NetworkSelectorButton"
import { UnifiedWalletButton } from "@/components/wallet/UnifiedWalletButton"
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
const LazyEVMAuth = lazy(() => import('./pages/EVMAuth'));
const LazySolanaAuth = lazy(() => import('./pages/SolanaAuth'));
import Settings from "./pages/Settings";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Footer } from "./components/sections/Footer";
import { ScrollToTop } from "./components/ScrollToTop";

// Lazy loaded components - Core pages
const Marketplace = lazy(() => import('./pages/Marketplace'));
const MarketOverview = lazy(() => import('./pages/MarketOverview'));
const AgentDetail = lazy(() => import('./pages/AgentDetail').then(m => ({ default: m.AgentDetail })));
const CreateAgent = lazy(() => import('./pages/CreateAgent').then(m => ({ default: m.CreateAgent })));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const AlphaSignals = lazy(() => import('./pages/AlphaSignals'));
const KOLAnalytics = lazy(() => import('./pages/KOLAnalytics'));
const TelegramSignals = lazy(() => import('./pages/TelegramSignals'));

// Lazy loaded components - Analytics & Data
const Analytics = lazy(() => import('./pages/Analytics'));
const AdvancedAnalytics = lazy(() => import('./pages/AdvancedAnalytics'));
const EnhancedFeatures = lazy(() => import('./pages/EnhancedFeatures'));
const TechnicalAnalysis = lazy(() => import('./pages/TechnicalAnalysis'));
const TradingAcademy = lazy(() => import('./pages/TradingAcademy'));
const Community = lazy(() => import('./pages/Community'));
const PremiumTiers = lazy(() => import('./pages/PremiumTiers'));
const MultiLanguage = lazy(() => import('./pages/MultiLanguage'));
const WhiteLabel = lazy(() => import('./pages/WhiteLabel'));
const AdvancedAI = lazy(() => import('./pages/AdvancedAI'));
const InstitutionalAPIs = lazy(() => import('./pages/InstitutionalAPIs'));

// Lazy loaded components - Trading
const AdvancedTradingPage = lazy(() => import('./pages/AdvancedTrading'));
const EnhancedTrading = lazy(() => import('./pages/EnhancedTrading').then(m => ({ default: m.EnhancedTrading })));
const OrderManagement = lazy(() => import('./pages/OrderManagement'));
const RiskManagement = lazy(() => import('./pages/RiskManagement'));
const TradingSignals = lazy(() => import('./pages/TradingSignals'));
const RealTimeMarketPage = lazy(() => import('./pages/RealTimeMarket').then(m => ({ default: m.RealTimeMarketPage })));

// Lazy loaded components - Social & Community
const SocialTradingPage = lazy(() => import('./pages/SocialTrading'));
const Communities = lazy(() => import('./pages/Communities'));
const AgentComparison = lazy(() => import('./pages/AgentComparison'));
const Favorites = lazy(() => import('./pages/Favorites'));

// Lazy loaded components - DeFi & Blockchain
const DeFi = lazy(() => import('./pages/DeFi'));
const PredictionMarkets = lazy(() => import('./pages/PredictionMarkets'));
const MarketDetails = lazy(() => import('./pages/MarketDetails'));

const Staking = lazy(() => import('./pages/Staking'));
const SolanaDashboard = lazy(() => import('./pages/SolanaDashboard'));
const SolanaStaking = lazy(() => import('./pages/SolanaStaking'));
const SolanaTradingSignalsPage = lazy(() => import('./pages/SolanaTradingSignals'));
const TutorialsHub = lazy(() => import('./pages/TutorialsHub'));

// Lazy loaded components - Administrative
const Admin = lazy(() => import('./pages/Admin'));
const ChainOverrides = lazy(() => import('./pages/admin/ChainOverrides'));
const InstitutionalFeatures = lazy(() => import('./pages/InstitutionalFeatures'));
const ComplianceRegulatory = lazy(() => import('./pages/ComplianceRegulatory'));
const CustomerSupport = lazy(() => import('./pages/CustomerSupport'));

// Lazy loaded components - Notifications & Tools
const Notifications = lazy(() => import('./pages/Notifications'));
const AdvancedNotifications = lazy(() => import('./pages/AdvancedNotifications'));
const AIAssistant = lazy(() => import('./pages/AIAssistant'));
const LogoGenerator = lazy(() => import('./pages/LogoGenerator'));
const AgentLogoShowcase = lazy(() => import('./pages/AgentLogoShowcase'));

// Lazy loaded components - Support & Legal
const ACP = lazy(() => import('./pages/ACP'));
const Referrals = lazy(() => import('./pages/Referrals'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const CookiePolicy = lazy(() => import('./pages/CookiePolicy'));
const Contact = lazy(() => import('./pages/Contact'));

// Create query client with enhanced performance optimizations
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors except 401/403
        if (error?.status >= 400 && error?.status < 500 && ![401, 403].includes(error.status)) {
          return false
        }
        return failureCount < 3
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: 'always',
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

// 3. Create modal - Must be called before components render
const web3Modal = createWeb3Modal({
  wagmiConfig: config,
  projectId: WALLETCONNECT_PROJECT_ID,
  metadata: {
    name: 'HyperCognition',
    description: 'AI Agent Trading Marketplace',
    url: 'https://hypercognition.io',
    icons: ['https://gxgmqrtsbqmpngbpuuxx.supabase.co/storage/v1/object/public/images/Hyper_Cognition_logo3large-7.png']
  },
  enableAnalytics: true,
  enableOnramp: true,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-font-family': 'inherit',
    '--w3m-accent': '#00d9ff',
    '--w3m-color-mix': '#00d9ff',
    '--w3m-color-mix-strength': 20,
    '--w3m-border-radius-master': '8px',
    '--w3m-z-index': 9999,
  } as any,
  featuredWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
  ]
})

console.log('Web3Modal created:', web3Modal)

// App Layout Component
const AppLayout = () => {
  const isMobile = useIsMobile()
  const location = window.location
  const pathname = location.pathname
  const isAIAssistantPage = pathname === '/ai-assistant'
  const isACPPage = pathname === '/acp'

  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col">
        <MobileToolbar />
        <main className="flex-1 pb-16 pt-[calc(4rem+env(safe-area-inset-top))]">
          <ErrorBoundary level="page" name="Mobile App">
            <Suspense fallback={
              <div className="p-4">
                <div className="flex items-center justify-center min-h-[400px]">
                  <div className="text-center space-y-4">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">Loading HyperCognition</h2>
                      <p className="text-sm text-muted-foreground">Preparing your trading experience...</p>
                    </div>
                  </div>
                </div>
              </div>
            }>
              <ScrollToTop />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/home" element={<Home />} />
            <Route path="/auth" element={<LazyEVMAuth />} />
            <Route path="/evm-auth" element={<LazyEVMAuth />} />
            <Route path="/solana-auth" element={<LazySolanaAuth />} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/enhanced-trading" element={<MarketOverview />} />
                <Route path="/advanced-trading" element={<AdvancedTradingPage />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/market-overview" element={<MarketOverview />} />
                <Route path="/customer-support" element={<CustomerSupport />} />
                <Route path="/defi" element={<DeFi />} />
                <Route path="/prediction-markets" element={<PredictionMarkets />} />
                <Route path="/prediction-markets/:id" element={<MarketDetails />} />
                <Route path="/solana" element={<SolanaDashboard />} />
                <Route path="/staking" element={<Staking />} />
                <Route path="/solana-staking" element={<SolanaStaking />} />
                <Route path="/solana-signals" element={<SolanaTradingSignalsPage />} />
                <Route path="/referrals" element={<Referrals />} />
                <Route path="/ai-assistant" element={<AIAssistant />} />
                <Route path="/trading-signals" element={<TradingSignals />} />
                <Route path="/alpha-signals" element={<AlphaSignals />} />
                <Route path="/kol-analytics" element={<KOLAnalytics />} />
                <Route path="/telegram-signals" element={<TelegramSignals />} />
                <Route path="/real-time-market" element={<RealTimeMarketPage />} />
                <Route path="/social-trading" element={<SocialTradingPage />} />
                <Route path="/order-management" element={<ProtectedRoute><OrderManagement /></ProtectedRoute>} />
                <Route path="/technical-analysis" element={<ProtectedRoute><TechnicalAnalysis /></ProtectedRoute>} />
                <Route path="/risk-management" element={<ProtectedRoute><RiskManagement /></ProtectedRoute>} />
                <Route path="/community" element={<Community />} />
                <Route path="/tutorials" element={<TutorialsHub />} />
                <Route path="/trading-academy" element={<TradingAcademy />} />
                <Route path="/institutional" element={<ProtectedRoute><InstitutionalFeatures /></ProtectedRoute>} />
                <Route path="/compliance" element={<ProtectedRoute><ComplianceRegulatory /></ProtectedRoute>} />
                <Route path="/white-label" element={<WhiteLabel />} />
                <Route path="/advanced-ai" element={<AdvancedAI />} />
                <Route path="/enhanced-features" element={<EnhancedFeatures />} />
                <Route path="/institutional-apis" element={<InstitutionalAPIs />} />
                <Route path="/multi-language" element={<MultiLanguage />} />
                <Route path="/premium" element={<PremiumTiers />} />
                <Route path="/agent/:id" element={<AgentDetail />} />
                <Route path="/create-agent" element={<ProtectedRoute><CreateAgent /></ProtectedRoute>} />
                <Route path="/portfolio" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
                <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                <Route path="/advanced-analytics" element={<ProtectedRoute><AdvancedAnalytics /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                <Route path="/advanced-notifications" element={<ProtectedRoute><AdvancedNotifications /></ProtectedRoute>} />
                <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
                <Route path="/admin/chain-overrides" element={<ProtectedRoute><ChainOverrides /></ProtectedRoute>} />
                <Route path="/logo-generator" element={<LogoGenerator />} />
                <Route path="/agent-logo-showcase" element={<AgentLogoShowcase />} />
                <Route path="/compare" element={<AgentComparison />} />
                <Route path="/communities" element={<Communities />} />
                <Route path="/acp" element={<ProtectedRoute><ACP /></ProtectedRoute>} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/cookies" element={<CookiePolicy />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
          {!isAIAssistantPage && (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl mb-8">
              <AITradingAssistant />
            </div>
          )}
        </main>
        <Footer />
        <MobileNavigation />
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col h-screen overflow-y-auto" data-scroll-root>
          {!isACPPage && (
              <div className="sticky top-0 z-50 bg-gradient-to-r from-background/80 to-background/80 backdrop-blur-md border-b border-border/30 px-5 h-28 shadow-lg flex items-center gap-2">
                <SidebarTrigger className="text-[hsl(215,10%,27%)] hover:bg-muted transition-colors duration-300" />
                <div className="ml-auto flex items-center gap-2">
                  <NetworkSelectorButton />
                  <UnifiedWalletButton />
                </div>
              </div>
          )}
          <main className="flex-1">
            <ErrorBoundary level="page" name="Desktop App">
              <Suspense fallback={
                <div className="p-8">
                  <div className="flex items-center justify-center min-h-[500px]">
                    <div className="text-center space-y-6">
                      <div className="mx-auto w-16 h-16 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
                      </div>
                      <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-white">
                          Loading HyperCognition
                        </h2>
                        <p className="text-muted-foreground">Initializing AI trading platform...</p>
                      </div>
                      <div className="w-64 h-2 bg-muted rounded-full overflow-hidden mx-auto">
                        <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full animate-pulse" style={{ width: '70%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              }>
                <ScrollToTop />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/auth" element={<LazyEVMAuth />} />
                  <Route path="/evm-auth" element={<LazyEVMAuth />} />
                  <Route path="/solana-auth" element={<LazySolanaAuth />} />
                  <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                  <Route path="/enhanced-trading" element={<MarketOverview />} />
                  <Route path="/advanced-trading" element={<AdvancedTradingPage />} />
            <Route path="/real-time-market" element={<RealTimeMarketPage />} />
            <Route path="/ai-assistant" element={<AIAssistant />} />
                  <Route path="/marketplace" element={<Marketplace />} />
                  <Route path="/market-overview" element={<MarketOverview />} />
            <Route path="/customer-support" element={<CustomerSupport />} />
            <Route path="/defi" element={<DeFi />} />
            <Route path="/prediction-markets" element={<PredictionMarkets />} />
            <Route path="/prediction-markets/:id" element={<MarketDetails />} />
            <Route path="/solana" element={<SolanaDashboard />} />
            
            <Route path="/staking" element={<Staking />} />
            <Route path="/solana-staking" element={<SolanaStaking />} />
            <Route path="/referrals" element={<Referrals />} />
                  <Route path="/agent/:id" element={<AgentDetail />} />
                  <Route path="/create-agent" element={<ProtectedRoute><CreateAgent /></ProtectedRoute>} />
                  <Route path="/portfolio" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
                  <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                  <Route path="/advanced-analytics" element={<ProtectedRoute><AdvancedAnalytics /></ProtectedRoute>} />
                   <Route path="/trading-signals" element={<TradingSignals />} />
                   <Route path="/alpha-signals" element={<AlphaSignals />} />
                   <Route path="/kol-analytics" element={<KOLAnalytics />} />
                   <Route path="/telegram-signals" element={<TelegramSignals />} />
                   <Route path="/solana-signals" element={<SolanaTradingSignalsPage />} />
                   <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                  <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
                  <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
                  <Route path="/logo-generator" element={<LogoGenerator />} />
                  <Route path="/agent-logo-showcase" element={<AgentLogoShowcase />} />
                  <Route path="/compare" element={<AgentComparison />} />
                  <Route path="/communities" element={<Communities />} />
                  <Route path="/order-management" element={<ProtectedRoute><OrderManagement /></ProtectedRoute>} />
                  <Route path="/risk-management" element={<ProtectedRoute><RiskManagement /></ProtectedRoute>} />
                  <Route path="/technical-analysis" element={<ProtectedRoute><TechnicalAnalysis /></ProtectedRoute>} />
                  <Route path="/institutional" element={<ProtectedRoute><InstitutionalFeatures /></ProtectedRoute>} />
                  <Route path="/compliance" element={<ProtectedRoute><ComplianceRegulatory /></ProtectedRoute>} />
                  <Route path="/advanced-notifications" element={<ProtectedRoute><AdvancedNotifications /></ProtectedRoute>} />
                  <Route path="/social-trading" element={<SocialTradingPage />} />
                    <Route path="/tutorials" element={<TutorialsHub />} />
                    <Route path="/trading-academy" element={<TradingAcademy />} />
                  <Route path="/community" element={<Community />} />
                  <Route path="/premium" element={<PremiumTiers />} />
                  <Route path="/multi-language" element={<MultiLanguage />} />
                  <Route path="/white-label" element={<WhiteLabel />} />
                  <Route path="/advanced-ai" element={<AdvancedAI />} />
                  <Route path="/enhanced-features" element={<EnhancedFeatures />} />
                  <Route path="/institutional-apis" element={<InstitutionalAPIs />} />
                  <Route path="/acp" element={<ProtectedRoute><ACP /></ProtectedRoute>} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/cookies" element={<CookiePolicy />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
            {!isAIAssistantPage && (
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl mb-12">
                <AITradingAssistant />
              </div>
            )}
          </main>
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  )
}

const App = () => {
  const [showLoading, setShowLoading] = useState(true);

  const handleLoadingComplete = () => {
    setShowLoading(false);
    // Ensure page starts at top after loading screen
    setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, 100);
  };

  if (showLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
              <AuthProvider>
                <FavoritesProvider>
                  <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <ScrollToTop />
                    <AppLayout />
                  </BrowserRouter>
                  </TooltipProvider>
                </FavoritesProvider>
              </AuthProvider>
            </QueryClientProvider>
          </WagmiProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default App;
