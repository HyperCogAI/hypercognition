import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface WatchlistItem {
  id: string;
  crypto_id: string;
  crypto_name: string;
  crypto_symbol: string;
  created_at: string;
}

export const useCryptoWatchlist = () => {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchWatchlist = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setWatchlist([]);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("crypto_watchlist")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWatchlist(data || []);
    } catch (error) {
      console.error("Error fetching watchlist:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToWatchlist = async (crypto_id: string, crypto_name: string, crypto_symbol: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to add favorites",
          variant: "destructive"
        });
        return false;
      }

      const { error } = await supabase.from("crypto_watchlist").insert({
        user_id: user.id,
        crypto_id,
        crypto_name,
        crypto_symbol
      });

      if (error) throw error;

      toast({
        title: "Added to Watchlist",
        description: `${crypto_name} has been added to your watchlist`
      });

      fetchWatchlist();
      return true;
    } catch (error: any) {
      if (error.code === "23505") {
        toast({
          title: "Already in Watchlist",
          description: "This cryptocurrency is already in your watchlist",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to add to watchlist",
          variant: "destructive"
        });
      }
      return false;
    }
  };

  const removeFromWatchlist = async (crypto_id: string) => {
    try {
      const { error } = await supabase
        .from("crypto_watchlist")
        .delete()
        .eq("crypto_id", crypto_id);

      if (error) throw error;

      toast({
        title: "Removed from Watchlist",
        description: "Cryptocurrency removed from your watchlist"
      });

      fetchWatchlist();
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove from watchlist",
        variant: "destructive"
      });
      return false;
    }
  };

  const isInWatchlist = (crypto_id: string) => {
    return watchlist.some(item => item.crypto_id === crypto_id);
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  return {
    watchlist,
    isLoading,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    refreshWatchlist: fetchWatchlist
  };
};