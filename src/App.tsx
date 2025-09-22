import { Suspense } from "react"
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WagmiProvider } from 'wagmi'
import { createWeb3Modal } from '@web3modal/wagmi/react'
import { config } from './config/wagmi'
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { FavoritesProvider } from "@/contexts/FavoritesContext"
import { AuthProvider } from "@/contexts/AuthContext"
import { ErrorBoundary } from "@/components/error/ErrorBoundary"
import { AgentCardSkeleton } from "@/components/ui/loading-skeleton"
import AdminDashboard from "./pages/AdminDashboard";
import LogoGenerator from "./pages/LogoGenerator";
import AgentLogoShowcase from "./pages/AgentLogoShowcase";
import TradingSignals from "./pages/TradingSignals";
import { MobileNavigation } from "@/components/mobile/MobileNavigation"
import { useMobile } from "@/hooks/useMobile"
import AITradingAssistant from "@/components/ai/AITradingAssistant"
import AdvancedAnalytics from "./pages/AdvancedAnalytics";
import Notifications from "./pages/Notifications";
import Index from "./pages/Home";
import Marketplace from "./pages/Marketplace";
import { AgentDetail } from "./pages/AgentDetail";
import { CreateAgent } from "./pages/CreateAgent";
import Portfolio from "./pages/Portfolio";
import Analytics from "./pages/Analytics";
import { AdvancedTradingPage } from "./pages/AdvancedTrading";
import Favorites from "./pages/Favorites";
import AgentComparison from "./pages/AgentComparison";
import Communities from "./pages/Communities";
import NotFound from "./pages/NotFound";
import ACP from "./pages/ACP";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CookiePolicy from "./pages/CookiePolicy";
import Contact from "./pages/Contact";
import { EnhancedTrading } from "./pages/EnhancedTrading";
import OrderManagement from "./pages/OrderManagement";
import RiskManagement from "./pages/RiskManagement";
import TechnicalAnalysis from "./pages/TechnicalAnalysis";
import InstitutionalFeatures from "./pages/InstitutionalFeatures";
import ComplianceRegulatory from "./pages/ComplianceRegulatory";
import AdvancedNotifications from "./pages/AdvancedNotifications";
import SocialTradingPage from "./pages/SocialTrading";
import { RealTimeMarketPage } from "./pages/RealTimeMarket";
import AIAssistant from "./pages/AIAssistant";
import MultiExchange from "./pages/MultiExchange";
import CustomerSupport from "./pages/CustomerSupport";
const DeFi = lazy(() => import('./pages/DeFi'));
const NFTMarketplace = lazy(() => import('./pages/NFTMarketplace'));
const Staking = lazy(() => import('./pages/Staking'));
const Referrals = lazy(() => import('./pages/Referrals'));
import { ProtectedRoute } from "./components/ProtectedRoute";

// Create query client with performance optimizations
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

// 3. Create modal
createWeb3Modal({
  wagmiConfig: config,
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project-id',
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
  enableOnramp: true // Optional - false as default
})

// App Layout Component
const AppLayout = () => {
  const { isMobile } = useMobile()

  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 pb-16">
          <ErrorBoundary>
            <Suspense fallback={<div className="p-8"><AgentCardSkeleton /></div>}>
              <Routes>
                <Route path="/" element={<Index />} />
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
            <Suspense fallback={<div className="p-8"><AgentCardSkeleton /></div>}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/multi-exchange" element={<ProtectedRoute><MultiExchange /></ProtectedRoute>} />
                <Route path="/enhanced-trading" element={<EnhancedTrading />} />
                <Route path="/advanced-trading" element={<AdvancedTradingPage />} />
          <Route path="/real-time-market" element={<RealTimeMarketPage />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/customer-support" element={<CustomerSupport />} />
                <Route path="/agent/:id" element={<AgentDetail />} />
                <Route path="/create-agent" element={<ProtectedRoute><CreateAgent /></ProtectedRoute>} />
                <Route path="/portfolio" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
                <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                <Route path="/trading-signals" element={<TradingSignals />} />
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
);

export default App;
