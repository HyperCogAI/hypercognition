import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface PriceAlert {
  id: string;
  crypto_id: string;
  crypto_name: string;
  crypto_symbol: string;
  alert_type: "price_above" | "price_below" | "percent_change";
  target_value: number;
  current_value: number | null;
  is_active: boolean;
  is_triggered: boolean;
  triggered_at: string | null;
  created_at: string;
}

export const useCryptoPriceAlerts = () => {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchAlerts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setAlerts([]);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("crypto_price_alerts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAlerts((data || []) as PriceAlert[]);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createAlert = async (
    crypto_id: string,
    crypto_name: string,
    crypto_symbol: string,
    alert_type: "price_above" | "price_below" | "percent_change",
    target_value: number
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to create price alerts",
          variant: "destructive"
        });
        return false;
      }

      const { error } = await supabase.from("crypto_price_alerts").insert({
        user_id: user.id,
        crypto_id,
        crypto_name,
        crypto_symbol,
        alert_type,
        target_value
      });

      if (error) throw error;

      toast({
        title: "Alert Created",
        description: `Price alert for ${crypto_name} has been created`
      });

      fetchAlerts();
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create price alert",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from("crypto_price_alerts")
        .delete()
        .eq("id", alertId);

      if (error) throw error;

      toast({
        title: "Alert Deleted",
        description: "Price alert has been deleted"
      });

      fetchAlerts();
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete alert",
        variant: "destructive"
      });
      return false;
    }
  };

  const toggleAlert = async (alertId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("crypto_price_alerts")
        .update({ is_active: isActive })
        .eq("id", alertId);

      if (error) throw error;

      fetchAlerts();
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update alert",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  return {
    alerts,
    isLoading,
    createAlert,
    deleteAlert,
    toggleAlert,
    refreshAlerts: fetchAlerts
  };
};