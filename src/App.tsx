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

const queryClient = new QueryClient();

// 3. Create modal
createWeb3Modal({
  wagmiConfig: config,
  projectId: 'your-project-id', // You'll need to get this from WalletConnect
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
  enableOnramp: true // Optional - false as default
})

const App = () => {
  console.log("App component is rendering");
  
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <FavoritesProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <div className="min-h-screen w-full bg-background text-foreground">
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
                </div>
              </BrowserRouter>
            </TooltipProvider>
          </FavoritesProvider>
        </AuthProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default App;
