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
import { MobileNavigation } from "@/components/mobile/MobileNavigation"
import { useMobile } from "@/hooks/useMobile"
import Index from "./pages/Index";
import { AgentDetail } from "./pages/AgentDetail";
import { CreateAgent } from "./pages/CreateAgent";
import { Portfolio } from "./pages/Portfolio";
import { Analytics } from "./pages/Analytics";
import Favorites from "./pages/Favorites";
import AgentComparison from "./pages/AgentComparison";
import Communities from "./pages/Communities";
import NotFound from "./pages/NotFound";
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
  projectId: 'your-project-id', // You'll need to get this from WalletConnect
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
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/agent/:id" element={<AgentDetail />} />
            <Route path="/create-agent" element={<ProtectedRoute><CreateAgent /></ProtectedRoute>} />
            <Route path="/portfolio" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
            <Route path="/compare" element={<AgentComparison />} />
            <Route path="/communities" element={<Communities />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
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
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/agent/:id" element={<AgentDetail />} />
            <Route path="/create-agent" element={<ProtectedRoute><CreateAgent /></ProtectedRoute>} />
            <Route path="/portfolio" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
            <Route path="/compare" element={<AgentComparison />} />
            <Route path="/communities" element={<Communities />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
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
