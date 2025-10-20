import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TwitterKOLAccount } from "./useTwitterKOLWatchlists";

export function useTwitterKOLAccounts(watchlistId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: accounts, isLoading, error } = useQuery({
    queryKey: ['twitter-kol-accounts', watchlistId],
    queryFn: async () => {
      let query = supabase
        .from('twitter_kol_accounts')
        .select('*')
        .order('added_at', { ascending: false });

      if (watchlistId) {
        query = query.eq('watchlist_id', watchlistId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as TwitterKOLAccount[];
    },
    enabled: !!watchlistId,
  });

  const addAccount = useMutation({
    mutationFn: async (account: { watchlist_id: string; twitter_username: string; priority: 'high' | 'medium' | 'low' }) => {
      const { data, error } = await supabase
        .from('twitter_kol_accounts')
        .insert([account])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['twitter-kol-accounts'] });
      toast({
        title: "KOL added",
        description: "Twitter KOL account has been added to your watchlist.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add KOL",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateAccount = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<TwitterKOLAccount> }) => {
      const { data, error } = await supabase
        .from('twitter_kol_accounts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['twitter-kol-accounts'] });
      toast({
        title: "KOL updated",
        description: "KOL account has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update KOL",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeAccount = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('twitter_kol_accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['twitter-kol-accounts'] });
      toast({
        title: "KOL removed",
        description: "KOL account has been removed from your watchlist.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to remove KOL",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    accounts,
    isLoading,
    error,
    addAccount: addAccount.mutate,
    updateAccount: updateAccount.mutate,
    removeAccount: removeAccount.mutate,
    isAdding: addAccount.isPending,
    isUpdating: updateAccount.isPending,
    isRemoving: removeAccount.isPending,
  };
}
