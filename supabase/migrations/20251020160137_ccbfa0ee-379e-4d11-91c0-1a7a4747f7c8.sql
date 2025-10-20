-- Create signal_ticker_analysis table to store KOL influence analysis
CREATE TABLE IF NOT EXISTS public.signal_ticker_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id UUID NOT NULL REFERENCES public.twitter_kol_signals(id) ON DELETE CASCADE,
  ticker TEXT NOT NULL,
  analysis_timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  kols_mentioning JSONB DEFAULT '[]'::jsonb,
  total_kols_count INTEGER DEFAULT 0,
  total_influence_score NUMERIC DEFAULT 0,
  average_influence_score NUMERIC DEFAULT 0,
  confidence_multiplier NUMERIC DEFAULT 1.0,
  final_confidence_score NUMERIC DEFAULT 0,
  top_tier_kols INTEGER DEFAULT 0,
  mid_tier_kols INTEGER DEFAULT 0,
  emerging_kols INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add columns to twitter_kol_signals table
ALTER TABLE public.twitter_kol_signals
ADD COLUMN IF NOT EXISTS enhanced_confidence_score NUMERIC,
ADD COLUMN IF NOT EXISTS ticker_analysis_id UUID REFERENCES public.signal_ticker_analysis(id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_signal_ticker_analysis_signal_id ON public.signal_ticker_analysis(signal_id);
CREATE INDEX IF NOT EXISTS idx_signal_ticker_analysis_ticker ON public.signal_ticker_analysis(ticker);
CREATE INDEX IF NOT EXISTS idx_signal_ticker_analysis_timestamp ON public.signal_ticker_analysis(analysis_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_twitter_kol_signals_enhanced_confidence ON public.twitter_kol_signals(enhanced_confidence_score DESC) WHERE enhanced_confidence_score IS NOT NULL;

-- Enable RLS
ALTER TABLE public.signal_ticker_analysis ENABLE ROW LEVEL SECURITY;

-- RLS Policies for signal_ticker_analysis
CREATE POLICY "Users can view their own signal analyses"
  ON public.signal_ticker_analysis
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.twitter_kol_signals
      WHERE id = signal_ticker_analysis.signal_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own signal analyses"
  ON public.signal_ticker_analysis
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.twitter_kol_signals
      WHERE id = signal_ticker_analysis.signal_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own signal analyses"
  ON public.signal_ticker_analysis
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.twitter_kol_signals
      WHERE id = signal_ticker_analysis.signal_id
      AND user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_signal_ticker_analysis_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_signal_ticker_analysis_updated_at
  BEFORE UPDATE ON public.signal_ticker_analysis
  FOR EACH ROW
  EXECUTE FUNCTION public.update_signal_ticker_analysis_timestamp();