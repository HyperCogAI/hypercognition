import { Suspense, lazy } from "react"
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WagmiProvider } from 'wagmi'
import { createWeb3Modal } from '@web3modal/wagmi/react'
import { config } from './config/wagmi'
import { ConnectionProvider, WalletProvider, WalletModalProvider, wallets, endpoint } from './config/solana'
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { FavoritesProvider } from "@/contexts/FavoritesContext"
import { AuthProvider } from "@/contexts/AuthContext"
import { ErrorBoundary } from "@/components/error/ErrorBoundary"
import { CardSkeleton } from "@/components/ui/loading-skeleton"
import { MobileNavigation } from "@/components/mobile/MobileNavigation"
import { useMobile } from "@/hooks/useMobile"
import AITradingAssistant from "@/components/ai/AITradingAssistant"
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Lazy loaded components - Core pages
const Marketplace = lazy(() => import('./pages/Marketplace'));
const AgentDetail = lazy(() => import('./pages/AgentDetail').then(m => ({ default: m.AgentDetail })));
const CreateAgent = lazy(() => import('./pages/CreateAgent').then(m => ({ default: m.CreateAgent })));
const Portfolio = lazy(() => import('./pages/Portfolio'));

// Lazy loaded components - Analytics & Data
const Analytics = lazy(() => import('./pages/Analytics'));
const AdvancedAnalytics = lazy(() => import('./pages/AdvancedAnalytics'));
const TechnicalAnalysis = lazy(() => import('./pages/TechnicalAnalysis'));

// Lazy loaded components - Trading
const AdvancedTradingPage = lazy(() => import('./pages/AdvancedTrading').then(m => ({ default: m.AdvancedTradingPage })));
const EnhancedTrading = lazy(() => import('./pages/EnhancedTrading').then(m => ({ default: m.EnhancedTrading })));
const OrderManagement = lazy(() => import('./pages/OrderManagement'));
const RiskManagement = lazy(() => import('./pages/RiskManagement'));
const TradingSignals = lazy(() => import('./pages/TradingSignals'));
const RealTimeMarketPage = lazy(() => import('./pages/RealTimeMarket').then(m => ({ default: m.RealTimeMarketPage })));
const MultiExchange = lazy(() => import('./pages/MultiExchange'));

// Lazy loaded components - Social & Community
const SocialTradingPage = lazy(() => import('./pages/SocialTrading'));
const Communities = lazy(() => import('./pages/Communities'));
const AgentComparison = lazy(() => import('./pages/AgentComparison'));
const Favorites = lazy(() => import('./pages/Favorites'));

// Lazy loaded components - DeFi & Blockchain
const DeFi = lazy(() => import('./pages/DeFi'));
const NFTMarketplace = lazy(() => import('./pages/NFTMarketplace'));
const Staking = lazy(() => import('./pages/Staking'));
const SolanaDashboard = lazy(() => import('./pages/SolanaDashboard'));
const SolanaStaking = lazy(() => import('./pages/SolanaStaking'));
const SolanaTradingSignalsPage = lazy(() => import('./pages/SolanaTradingSignals'));

// Lazy loaded components - Administrative
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
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

// 3. Create modal
createWeb3Modal({
  wagmiConfig: config,
  projectId: 'demo-project-id',
  enableAnalytics: true,
  enableOnramp: true
})

// App Layout Component
const AppLayout = () => {
  const { isMobile } = useMobile()

  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 pb-16">
          <ErrorBoundary>
            <Suspense fallback={<div className="p-8"><CardSkeleton /></div>}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/home" element={<Home />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/multi-exchange" element={<ProtectedRoute><MultiExchange /></ProtectedRoute>} />
                <Route path="/enhanced-trading" element={<EnhancedTrading />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/customer-support" element={<CustomerSupport />} />
                <Route path="/agent/:id" element={<AgentDetail />} />
                <Route path="/create-agent" element={<ProtectedRoute><CreateAgent /></ProtectedRoute>} />
                <Route path="/portfolio" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
                <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                <Route path="/advanced-analytics" element={<ProtectedRoute><AdvancedAnalytics /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
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
          <AITradingAssistant />
        </main>
        <MobileNavigation />
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 relative">
          <div className="sticky top-0 z-50 bg-gradient-to-r from-background/90 to-background/80 backdrop-blur-md border-b border-primary/10 p-2 shadow-lg">
            <SidebarTrigger className="hover:bg-primary/10 transition-colors duration-300" />
          </div>
          <ErrorBoundary>
            <Suspense fallback={<div className="p-8"><CardSkeleton /></div>}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/home" element={<Home />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/multi-exchange" element={<ProtectedRoute><MultiExchange /></ProtectedRoute>} />
                <Route path="/enhanced-trading" element={<EnhancedTrading />} />
                <Route path="/advanced-trading" element={<AdvancedTradingPage />} />
          <Route path="/real-time-market" element={<RealTimeMarketPage />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
                <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/customer-support" element={<CustomerSupport />} />
          <Route path="/defi" element={<DeFi />} />
          <Route path="/solana" element={<SolanaDashboard />} />
          <Route path="/nft-marketplace" element={<NFTMarketplace />} />
          <Route path="/staking" element={<Staking />} />
          <Route path="/solana-staking" element={<SolanaStaking />} />
          <Route path="/referrals" element={<Referrals />} />
                <Route path="/agent/:id" element={<AgentDetail />} />
                <Route path="/create-agent" element={<ProtectedRoute><CreateAgent /></ProtectedRoute>} />
                <Route path="/portfolio" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
                <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                 <Route path="/trading-signals" element={<TradingSignals />} />
                 <Route path="/solana-signals" element={<SolanaTradingSignalsPage />} />
                <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
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
                <Route path="/acp" element={<ProtectedRoute><ACP /></ProtectedRoute>} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/cookies" element={<CookiePolicy />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
          <AITradingAssistant />
        </main>
      </div>
    </SidebarProvider>
  )
}

const App = () => (
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

export default App;
