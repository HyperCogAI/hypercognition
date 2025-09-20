-- Enable realtime for price updates
ALTER TABLE public.price_history REPLICA IDENTITY FULL;
ALTER TABLE public.transactions REPLICA IDENTITY FULL;
ALTER TABLE public.user_holdings REPLICA IDENTITY FULL;

-- Add price_history to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.price_history;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_holdings;

-- Create notifications table for real-time alerts
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add notifications to realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;