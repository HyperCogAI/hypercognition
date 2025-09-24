-- Create tables for demo and showcase components

-- Tutorial progress tracking
CREATE TABLE IF NOT EXISTS public.tutorial_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tutorial_id TEXT NOT NULL,
  step_id TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, tutorial_id, step_id)
);

-- Tutorial definitions (for dynamic tutorial system)
CREATE TABLE IF NOT EXISTS public.tutorials (
  id TEXT NOT NULL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  duration TEXT,
  icon TEXT,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User showcase preferences and interactions
CREATE TABLE IF NOT EXISTS public.showcase_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  component_type TEXT NOT NULL,
  interaction_type TEXT NOT NULL,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Logo generation history
CREATE TABLE IF NOT EXISTS public.logo_generation_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  agent_name TEXT NOT NULL,
  agent_symbol TEXT NOT NULL,
  style TEXT NOT NULL,
  prompt_used TEXT,
  image_url TEXT,
  generation_time_ms INTEGER,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tutorial_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.showcase_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logo_generation_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tutorial_progress
CREATE POLICY "Users can manage their own tutorial progress" 
ON public.tutorial_progress 
FOR ALL 
USING (auth.uid() = user_id);

-- RLS Policies for tutorials
CREATE POLICY "Tutorials are viewable by everyone" 
ON public.tutorials 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage tutorials" 
ON public.tutorials 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM admin_users 
  WHERE admin_users.user_id = auth.uid() 
  AND admin_users.is_active = true
));

-- RLS Policies for showcase_interactions
CREATE POLICY "Users can create showcase interactions" 
ON public.showcase_interactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view their own showcase interactions" 
ON public.showcase_interactions 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

-- RLS Policies for logo_generation_history
CREATE POLICY "Users can view their own logo generation history" 
ON public.logo_generation_history 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create logo generation records" 
ON public.logo_generation_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Add triggers for updated_at
CREATE TRIGGER update_tutorial_progress_updated_at
  BEFORE UPDATE ON public.tutorial_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tutorials_updated_at
  BEFORE UPDATE ON public.tutorials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default tutorial data
INSERT INTO public.tutorials (id, title, description, category, difficulty, duration, icon, steps) VALUES
('trading-basics', 'Trading Basics', 'Learn the fundamentals of cryptocurrency trading', 'Getting Started', 'beginner', '10 min', 'TrendingUp', 
 '[
   {
     "id": "step-1",
     "title": "Understanding Market Data",
     "description": "Learn to read price charts and market indicators",
     "content": "Market data shows you the current price, volume, and price movements of trading pairs. The price chart displays how the asset has performed over time.",
     "action": "Click on any price chart to explore",
     "targetSelector": ".price-chart",
     "position": "bottom"
   },
   {
     "id": "step-2", 
     "title": "Order Types",
     "description": "Understand different order types available",
     "content": "Market orders execute immediately at current price. Limit orders execute only when price reaches your specified level. Stop orders help manage risk.",
     "action": "Navigate to the trading panel",
     "targetSelector": ".trading-panel",
     "position": "left"
   },
   {
     "id": "step-3",
     "title": "Risk Management", 
     "description": "Learn to set stop-loss and take-profit levels",
     "content": "Always set stop-loss orders to limit potential losses. Take-profit orders help secure gains automatically.",
     "action": "Try setting a stop-loss order",
     "targetSelector": ".stop-loss-input",
     "position": "top"
   }
 ]'::jsonb),
('ai-agents', 'AI Trading Agents', 'Discover how to use and configure AI trading agents', 'AI Features', 'intermediate', '15 min', 'Bot',
 '[
   {
     "id": "agent-1",
     "title": "Browse Agent Marketplace",
     "description": "Explore available AI trading agents", 
     "content": "Each AI agent has unique strategies, risk profiles, and performance metrics. Compare agents before selection.",
     "action": "Visit the Agent Marketplace",
     "targetSelector": ".agent-marketplace",
     "position": "bottom"
   },
   {
     "id": "agent-2",
     "title": "Agent Configuration",
     "description": "Learn to configure agent parameters",
     "content": "Set risk tolerance, position size, and trading frequency to match your preferences.",
     "action": "Configure an agent", 
     "targetSelector": ".agent-config",
     "position": "right"
   }
 ]'::jsonb),
('portfolio-management', 'Portfolio Management', 'Master portfolio tracking and optimization', 'Advanced', 'advanced', '20 min', 'BarChart3',
 '[
   {
     "id": "portfolio-1",
     "title": "Portfolio Dashboard",
     "description": "Understanding your portfolio metrics",
     "content": "Track total value, P&L, asset allocation, and performance over time.",
     "action": "Explore portfolio dashboard",
     "targetSelector": ".portfolio-dashboard", 
     "position": "top"
   }
 ]'::jsonb)
ON CONFLICT (id) DO NOTHING;