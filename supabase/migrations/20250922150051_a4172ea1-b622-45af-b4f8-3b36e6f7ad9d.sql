-- Fix all functions to have proper search path
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;