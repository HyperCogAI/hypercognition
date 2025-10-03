-- Create agent_comparisons table to track user comparisons
CREATE TABLE public.agent_comparisons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  agent_1_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  agent_2_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  comparison_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, agent_1_id, agent_2_id)
);

-- Enable Row Level Security
ALTER TABLE public.agent_comparisons ENABLE ROW LEVEL SECURITY;

-- Create policies for agent comparisons
CREATE POLICY "Users can view their own comparisons"
  ON public.agent_comparisons
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own comparisons"
  ON public.agent_comparisons
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comparisons"
  ON public.agent_comparisons
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for better query performance
CREATE INDEX idx_agent_comparisons_user_id ON public.agent_comparisons(user_id);
CREATE INDEX idx_agent_comparisons_agents ON public.agent_comparisons(agent_1_id, agent_2_id);

-- Create function to get agent comparison with historical data
CREATE OR REPLACE FUNCTION public.get_agent_comparison_data(
  p_agent_1_id UUID,
  p_agent_2_id UUID
)
RETURNS JSONB
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'agent_1', (
      SELECT jsonb_build_object(
        'id', a.id,
        'name', a.name,
        'symbol', a.symbol,
        'price', a.price,
        'change_24h', a.change_24h,
        'market_cap', a.market_cap,
        'volume_24h', a.volume_24h,
        'avatar_url', a.avatar_url,
        'category', a.category,
        'created_at', a.created_at
      )
      FROM public.agents a
      WHERE a.id = p_agent_1_id
    ),
    'agent_2', (
      SELECT jsonb_build_object(
        'id', a.id,
        'name', a.name,
        'symbol', a.symbol,
        'price', a.price,
        'change_24h', a.change_24h,
        'market_cap', a.market_cap,
        'volume_24h', a.volume_24h,
        'avatar_url', a.avatar_url,
        'category', a.category,
        'created_at', a.created_at
      )
      FROM public.agents a
      WHERE a.id = p_agent_2_id
    ),
    'comparison_metrics', jsonb_build_object(
      'market_cap_diff_percentage', (
        SELECT CASE 
          WHEN a2.market_cap > 0 THEN 
            ((a1.market_cap - a2.market_cap) / a2.market_cap * 100)
          ELSE 0
        END
        FROM public.agents a1, public.agents a2
        WHERE a1.id = p_agent_1_id AND a2.id = p_agent_2_id
      ),
      'volume_diff_percentage', (
        SELECT CASE 
          WHEN a2.volume_24h > 0 THEN 
            ((a1.volume_24h - a2.volume_24h) / a2.volume_24h * 100)
          ELSE 0
        END
        FROM public.agents a1, public.agents a2
        WHERE a1.id = p_agent_1_id AND a2.id = p_agent_2_id
      ),
      'price_diff_percentage', (
        SELECT CASE 
          WHEN a2.price > 0 THEN 
            ((a1.price - a2.price) / a2.price * 100)
          ELSE 0
        END
        FROM public.agents a1, public.agents a2
        WHERE a1.id = p_agent_1_id AND a2.id = p_agent_2_id
      )
    )
  );
$$;