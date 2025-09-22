-- Create comprehensive notification and alert system

-- Table for price alerts
CREATE TABLE IF NOT EXISTS public.price_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL,
  agent_symbol TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('price_above', 'price_below', 'percent_change', 'volume_spike')),
  target_value DECIMAL(20, 8) NOT NULL,
  current_value DECIMAL(20, 8),
  is_active BOOLEAN DEFAULT true,
  is_triggered BOOLEAN DEFAULT false,
  triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for notification preferences
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  price_alerts_enabled BOOLEAN DEFAULT true,
  portfolio_updates_enabled BOOLEAN DEFAULT true,
  market_news_enabled BOOLEAN DEFAULT true,
  social_updates_enabled BOOLEAN DEFAULT true,
  email_notifications_enabled BOOLEAN DEFAULT false,
  push_notifications_enabled BOOLEAN DEFAULT true,
  min_price_change_percent DECIMAL(5,2) DEFAULT 5.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enhanced notifications table with more fields
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent'));
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS action_url TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE;

-- Table for market events and news
CREATE TABLE IF NOT EXISTS public.market_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL CHECK (event_type IN ('price_movement', 'volume_spike', 'new_listing', 'market_news', 'system_update')),
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT DEFAULT 'normal' CHECK (severity IN ('low', 'normal', 'high', 'critical')),
  affected_agents TEXT[], -- Array of agent symbols
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on all tables
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_events ENABLE ROW LEVEL SECURITY;

-- Policies for price_alerts
CREATE POLICY "Users can manage their own price alerts" 
ON public.price_alerts 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policies for notification_preferences
CREATE POLICY "Users can manage their own notification preferences" 
ON public.notification_preferences 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policies for market_events (public read)
CREATE POLICY "Market events are viewable by everyone" 
ON public.market_events 
FOR SELECT 
USING (is_active = true);

-- Only admins can manage market events
CREATE POLICY "Only admins can manage market events" 
ON public.market_events 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM admin_users 
  WHERE user_id = auth.uid() AND is_active = true
))
WITH CHECK (EXISTS (
  SELECT 1 FROM admin_users 
  WHERE user_id = auth.uid() AND is_active = true
));

-- Update existing notifications policies to be more specific
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;

CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can create notifications for users" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true); -- Allow system to create notifications

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_price_alerts_user_id ON public.price_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_agent_id ON public.price_alerts(agent_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_active ON public.price_alerts(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_read ON public.notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_category ON public.notifications(category);
CREATE INDEX IF NOT EXISTS idx_market_events_active ON public.market_events(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_market_events_type ON public.market_events(event_type);

-- Function to trigger price alerts
CREATE OR REPLACE FUNCTION public.check_price_alerts()
RETURNS TRIGGER AS $$
DECLARE
    alert_record RECORD;
    notification_title TEXT;
    notification_message TEXT;
BEGIN
    -- Check all active price alerts for this agent
    FOR alert_record IN 
        SELECT * FROM public.price_alerts 
        WHERE agent_id = NEW.id 
        AND is_active = true 
        AND is_triggered = false
    LOOP
        -- Check if alert condition is met
        IF (alert_record.alert_type = 'price_above' AND NEW.price >= alert_record.target_value) OR
           (alert_record.alert_type = 'price_below' AND NEW.price <= alert_record.target_value) OR
           (alert_record.alert_type = 'percent_change' AND ABS(NEW.change_24h) >= alert_record.target_value) THEN
           
            -- Mark alert as triggered
            UPDATE public.price_alerts 
            SET is_triggered = true, 
                triggered_at = now(),
                current_value = NEW.price
            WHERE id = alert_record.id;
            
            -- Create notification
            notification_title := 'Price Alert Triggered';
            notification_message := alert_record.agent_name || ' (' || alert_record.agent_symbol || ') has ' ||
                CASE 
                    WHEN alert_record.alert_type = 'price_above' THEN 'risen above $' || alert_record.target_value
                    WHEN alert_record.alert_type = 'price_below' THEN 'dropped below $' || alert_record.target_value
                    WHEN alert_record.alert_type = 'percent_change' THEN 'changed by ' || NEW.change_24h || '%'
                END || '. Current price: $' || NEW.price;
            
            INSERT INTO public.notifications (
                user_id, type, category, priority, title, message, 
                action_url, data, created_at
            ) VALUES (
                alert_record.user_id, 
                'price_alert', 
                'trading', 
                'high',
                notification_title,
                notification_message,
                '/agent/' || alert_record.agent_id,
                jsonb_build_object(
                    'alert_id', alert_record.id,
                    'agent_id', alert_record.agent_id,
                    'agent_symbol', alert_record.agent_symbol,
                    'old_price', alert_record.current_value,
                    'new_price', NEW.price,
                    'alert_type', alert_record.alert_type,
                    'target_value', alert_record.target_value
                ),
                now()
            );
        END IF;
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for price alert checking
DROP TRIGGER IF EXISTS trigger_check_price_alerts ON public.agents;
CREATE TRIGGER trigger_check_price_alerts
    AFTER UPDATE OF price ON public.agents
    FOR EACH ROW
    EXECUTE FUNCTION public.check_price_alerts();

-- Create triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.update_notification_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_price_alerts_updated_at
    BEFORE UPDATE ON public.price_alerts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_notification_timestamp();

CREATE TRIGGER update_notification_preferences_updated_at
    BEFORE UPDATE ON public.notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.update_notification_timestamp();

-- Enable realtime for notifications
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.price_alerts REPLICA IDENTITY FULL;
ALTER TABLE public.market_events REPLICA IDENTITY FULL;