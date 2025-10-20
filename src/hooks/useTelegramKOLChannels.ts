import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface TelegramChannel {
  id: string;
  watchlist_id: string;
  channel_username: string;
  channel_id: string;
  channel_title: string;
  channel_type: string;
  is_user_member: boolean;
  last_message_id: number;
  last_checked_at: string;
  priority: string;
  added_at: string;
}

export function useTelegramKOLChannels(watchlistId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: channels, isLoading } = useQuery({
    queryKey: ['telegram-kol-channels', watchlistId],
    queryFn: async () => {
      let query = supabase
        .from('telegram_kol_channels')
        .select('*')
        .order('added_at', { ascending: false });

      if (watchlistId) {
        query = query.eq('watchlist_id', watchlistId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as TelegramChannel[];
    },
    enabled: !!watchlistId,
  });

  const addChannel = useMutation({
    mutationFn: async ({ channelUsername, watchlistId }: { 
      channelUsername: string; 
      watchlistId: string; 
    }) => {
      const { data, error } = await supabase.functions.invoke('telegram-add-channel', {
        body: { channelUsername, watchlistId }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['telegram-kol-channels'] });
      toast({
        title: data.channel.isUserMember ? "Channel added" : "Join channel first",
        description: data.channel.message,
        variant: data.channel.isUserMember ? "default" : "destructive",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add channel",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeChannel = useMutation({
    mutationFn: async (channelId: string) => {
      const { error } = await supabase
        .from('telegram_kol_channels')
        .delete()
        .eq('id', channelId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['telegram-kol-channels'] });
      toast({
        title: "Channel removed",
        description: "The channel has been removed from your watchlist",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to remove channel",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const syncChannel = useMutation({
    mutationFn: async (watchlistId?: string) => {
      const { data, error } = await supabase.functions.invoke('telegram-user-scraper', {
        body: { watchlistId }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['telegram-kol-channels'] });
      queryClient.invalidateQueries({ queryKey: ['telegram-kol-signals'] });
      toast({
        title: "Sync complete",
        description: `Created ${data.signalsCreated} new signals`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Sync failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    channels: channels || [],
    isLoading,
    addChannel: addChannel.mutate,
    removeChannel: removeChannel.mutate,
    syncChannel: syncChannel.mutate,
    isUpdating: addChannel.isPending || removeChannel.isPending || syncChannel.isPending,
  };
}
