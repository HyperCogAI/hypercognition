import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type SubscriptionTier = 'basic' | 'pro' | 'elite';
export type BillingPeriod = 'monthly' | 'annual';

interface Subscription {
  id: string;
  tier: SubscriptionTier;
  billing_period: BillingPeriod;
  status: string;
  expires_at: string | null;
}

export const useSubscription = () => {
  const queryClient = useQueryClient();

  // Fetch current subscription
  const { data: subscription, isLoading } = useQuery({
    queryKey: ['user-subscription'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      return data as Subscription | null;
    },
  });

  // Upgrade subscription mutation
  const upgradeMutation = useMutation({
    mutationFn: async ({ tier, billingPeriod }: { tier: SubscriptionTier; billingPeriod: BillingPeriod }) => {
      const { data, error } = await supabase.rpc('upgrade_subscription', {
        new_tier: tier,
        new_billing_period: billingPeriod,
      });

      if (error) throw error;
      
      const result = data as { success: boolean; error?: string };
      if (!result.success) {
        throw new Error(result.error || 'Failed to upgrade subscription');
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-subscription'] });
      toast.success('Subscription updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update subscription');
    },
  });

  return {
    subscription,
    isLoading,
    currentTier: subscription?.tier || 'basic',
    upgradeTo: upgradeMutation.mutate,
    isUpgrading: upgradeMutation.isPending,
  };
};
