-- Enable realtime for all portfolio and notification tables
ALTER TABLE public.user_holdings REPLICA IDENTITY FULL;
ALTER TABLE public.transactions REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.competitions REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE user_holdings;
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE competitions;