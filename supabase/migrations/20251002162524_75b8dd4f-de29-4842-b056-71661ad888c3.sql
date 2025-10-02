-- Add missing sentiment_label column to market_sentiment table
ALTER TABLE market_sentiment 
ADD COLUMN IF NOT EXISTS sentiment_label TEXT;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_market_sentiment_timestamp 
ON market_sentiment(timestamp DESC);