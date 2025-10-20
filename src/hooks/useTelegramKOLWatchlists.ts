import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface TelegramWatchlist {
  id: string;
  user_id: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useTelegramKOLWatchlists() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: watchlists, isLoading } = useQuery({
    queryKey: ['telegram-kol-watchlists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('telegram_kol_watchlists')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TelegramWatchlist[];
    },
  });

  const createWatchlist = useMutation({
    mutationFn: async (watchlist: { name: string; description?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('telegram_kol_watchlists')
        .insert({
          user_id: user.id,
          name: watchlist.name,
          description: watchlist.description,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['telegram-kol-watchlists'] });
      toast({
        title: "Watchlist created",
        description: "Your new Telegram watchlist has been created",
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
    mutationFn: async ({ id, updates }: { 
      id: string; 
      updates: Partial<TelegramWatchlist> 
    }) => {
      const { error } = await supabase
        .from('telegram_kol_watchlists')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['telegram-kol-watchlists'] });
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
        .from('telegram_kol_watchlists')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['telegram-kol-watchlists'] });
      toast({
        title: "Watchlist deleted",
        description: "The watchlist has been removed",
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
    watchlists: watchlists || [],
    isLoading,
    createWatchlist: createWatchlist.mutate,
    updateWatchlist: updateWatchlist.mutate,
    deleteWatchlist: deleteWatchlist.mutate,
    isUpdating: createWatchlist.isPending || updateWatchlist.isPending || deleteWatchlist.isPending,
  };
}
