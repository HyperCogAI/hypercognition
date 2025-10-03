-- Add missing foreign key relationship for trading_signals to trader_profiles

ALTER TABLE trading_signals 
ADD CONSTRAINT trading_signals_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES trader_profiles(user_id) 
ON DELETE CASCADE;