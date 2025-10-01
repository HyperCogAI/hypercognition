import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface PortfolioHolding {
  id: string;
  crypto_id: string;
  crypto_name: string;
  crypto_symbol: string;
  amount: number;
  purchase_price: number;
  purchase_date: string;
  exchange: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useCryptoPortfolio = () => {
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchHoldings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setHoldings([]);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("crypto_portfolio")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setHoldings(data || []);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addHolding = async (
    crypto_id: string,
    crypto_name: string,
    crypto_symbol: string,
    amount: number,
    purchase_price: number,
    exchange?: string,
    notes?: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to add holdings",
          variant: "destructive"
        });
        return false;
      }

      const { error } = await supabase.from("crypto_portfolio").insert({
        user_id: user.id,
        crypto_id,
        crypto_name,
        crypto_symbol,
        amount,
        purchase_price,
        exchange,
        notes
      });

      if (error) throw error;

      toast({
        title: "Holding Added",
        description: `${crypto_name} added to your portfolio`
      });

      fetchHoldings();
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add holding",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateHolding = async (
    holdingId: string,
    updates: Partial<Pick<PortfolioHolding, 'amount' | 'purchase_price' | 'exchange' | 'notes'>>
  ) => {
    try {
      const { error } = await supabase
        .from("crypto_portfolio")
        .update(updates)
        .eq("id", holdingId);

      if (error) throw error;

      toast({
        title: "Holding Updated",
        description: "Portfolio holding has been updated"
      });

      fetchHoldings();
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update holding",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteHolding = async (holdingId: string) => {
    try {
      const { error } = await supabase
        .from("crypto_portfolio")
        .delete()
        .eq("id", holdingId);

      if (error) throw error;

      toast({
        title: "Holding Deleted",
        description: "Holding removed from your portfolio"
      });

      fetchHoldings();
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete holding",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchHoldings();
  }, []);

  return {
    holdings,
    isLoading,
    addHolding,
    updateHolding,
    deleteHolding,
    refreshHoldings: fetchHoldings
  };
};