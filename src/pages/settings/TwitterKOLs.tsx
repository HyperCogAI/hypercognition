import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TwitterAccessSetup } from "@/components/settings/twitter-kols/TwitterAccessSetup";
import { WatchlistManager } from "@/components/settings/twitter-kols/WatchlistManager";
import { KOLAccountManager } from "@/components/settings/twitter-kols/KOLAccountManager";
import { Twitter } from "lucide-react";

export default function TwitterKOLs() {
  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Twitter className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Twitter KOL Monitoring</h1>
        </div>
        <p className="text-muted-foreground">
          Monitor Twitter KOLs for early gem signals with AI-powered detection
        </p>
      </div>

      <Tabs defaultValue="access" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="access">Twitter Access</TabsTrigger>
          <TabsTrigger value="watchlists">Watchlists</TabsTrigger>
          <TabsTrigger value="kols">KOL Accounts</TabsTrigger>
        </TabsList>

        <TabsContent value="access" className="space-y-6">
          <TwitterAccessSetup />
        </TabsContent>

        <TabsContent value="watchlists" className="space-y-6">
          <WatchlistManager />
        </TabsContent>

        <TabsContent value="kols" className="space-y-6">
          <KOLAccountManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
