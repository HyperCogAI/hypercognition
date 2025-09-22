-- Add the realtime-session function to the config
-- This enables the CORS headers for the realtime session endpoint

-- Enable realtime for any tables we might need for the AI assistant
ALTER TABLE market_tickers REPLICA IDENTITY FULL;
ALTER TABLE market_trades REPLICA IDENTITY FULL;
ALTER TABLE order_book REPLICA IDENTITY FULL;

-- Enable the publication for realtime
ALTER PUBLICATION supabase_realtime ADD TABLE market_tickers;
ALTER PUBLICATION supabase_realtime ADD TABLE market_trades;
ALTER PUBLICATION supabase_realtime ADD TABLE order_book;