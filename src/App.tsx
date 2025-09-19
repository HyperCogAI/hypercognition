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
import Index from "./pages/Index";
import { AgentDetail } from "./pages/AgentDetail";
import { CreateAgent } from "./pages/CreateAgent";
import Portfolio from "./pages/Portfolio";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// 3. Create modal
createWeb3Modal({
  wagmiConfig: config,
  projectId: 'your-project-id', // You'll need to get this from WalletConnect
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
  enableOnramp: true // Optional - false as default
})

const App = () => (
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <FavoritesProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <SidebarProvider>
              <div className="min-h-screen flex w-full">
                <AppSidebar />
                <main className="flex-1 relative">
                  {/* Global sidebar trigger */}
                  <div className="sticky top-0 z-50 bg-gradient-to-r from-background/90 to-background/80 backdrop-blur-md border-b border-primary/10 p-2 shadow-lg">
                    <SidebarTrigger className="hover:bg-primary/10 transition-colors duration-300" />
                  </div>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/agent/:id" element={<AgentDetail />} />
                    <Route path="/create-agent" element={<CreateAgent />} />
                    <Route path="/portfolio" element={<Portfolio />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
            </SidebarProvider>
          </BrowserRouter>
        </TooltipProvider>
      </FavoritesProvider>
    </QueryClientProvider>
  </WagmiProvider>
);

export default App;
