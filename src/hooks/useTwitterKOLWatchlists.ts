import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface TwitterKOLWatchlist {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  access_mode: 'personal_api' | 'platform_shared';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TwitterKOLAccount {
  id: string;
  watchlist_id: string;
  twitter_username: string;
  twitter_user_id?: string;
  priority: 'high' | 'medium' | 'low';
  last_checked_at?: string;
  added_at: string;
}

export function useTwitterKOLWatchlists() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: watchlists, isLoading, error } = useQuery({
    queryKey: ['twitter-kol-watchlists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('twitter_kol_watchlists')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TwitterKOLWatchlist[];
    },
  });

  const createWatchlist = useMutation({
    mutationFn: async (watchlist: { name: string; description?: string; access_mode: 'personal_api' | 'platform_shared' }) => {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('twitter_kol_watchlists')
        .insert([{ ...watchlist, user_id: user.data.user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['twitter-kol-watchlists'] });
      toast({
        title: "Watchlist created",
        description: "Your new KOL watchlist has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create watchlist",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateWatchlist = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<TwitterKOLWatchlist> }) => {
      const { data, error } = await supabase
        .from('twitter_kol_watchlists')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['twitter-kol-watchlists'] });
      toast({
        title: "Watchlist updated",
        description: "Your watchlist has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update watchlist",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteWatchlist = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('twitter_kol_watchlists')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['twitter-kol-watchlists'] });
      toast({
        title: "Watchlist deleted",
        description: "Your watchlist has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete watchlist",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    watchlists,
    isLoading,
    error,
    createWatchlist: createWatchlist.mutate,
    updateWatchlist: updateWatchlist.mutate,
    deleteWatchlist: deleteWatchlist.mutate,
    isCreating: createWatchlist.isPending,
    isUpdating: updateWatchlist.isPending,
    isDeleting: deleteWatchlist.isPending,
  };
}
