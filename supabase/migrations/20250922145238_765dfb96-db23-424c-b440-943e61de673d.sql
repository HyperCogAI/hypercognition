-- Create tables for AI Trading Assistant functionality

-- Table to store AI assistant conversation logs
CREATE TABLE IF NOT EXISTS public.ai_assistant_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  response TEXT NOT NULL,
  context TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_assistant_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for AI assistant logs
CREATE POLICY "Users can view their own AI assistant logs" 
ON public.ai_assistant_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI assistant logs" 
ON public.ai_assistant_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Table to store user portfolios (if not exists)
CREATE TABLE IF NOT EXISTS public.portfolios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL,
  amount DECIMAL(20, 8) NOT NULL DEFAULT 0,
  purchase_price DECIMAL(20, 8),
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for portfolios
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;

-- Create policies for portfolios
CREATE POLICY "Users can view their own portfolio" 
ON public.portfolios 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own portfolio" 
ON public.portfolios 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_ai_assistant_logs_user_id ON public.ai_assistant_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_assistant_logs_created_at ON public.ai_assistant_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON public.portfolios(user_id);

-- Create trigger for automatic timestamp updates on portfolios
CREATE OR REPLACE FUNCTION public.update_portfolio_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_portfolios_updated_at
  BEFORE UPDATE ON public.portfolios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_portfolio_updated_at();