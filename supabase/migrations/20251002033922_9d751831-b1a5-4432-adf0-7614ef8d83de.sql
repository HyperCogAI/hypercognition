-- Add critical production security enhancements for agent creation

-- Add unique constraint on agent symbol (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS agents_symbol_unique_idx ON public.agents (UPPER(symbol));

-- Add foreign key constraint for creator_id
ALTER TABLE public.agents 
  DROP CONSTRAINT IF EXISTS agents_creator_id_fkey;

ALTER TABLE public.agents 
  ADD CONSTRAINT agents_creator_id_fkey 
  FOREIGN KEY (creator_id) 
  REFERENCES auth.users(id) 
  ON DELETE SET NULL;

-- Enhanced validation function with comprehensive sanitization
CREATE OR REPLACE FUNCTION public.validate_agent_creation_enhanced(
  agent_name text,
  agent_symbol text,
  agent_description text,
  agent_category text,
  avatar_url_param text DEFAULT NULL,
  features_param text[] DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  errors text[] := '{}';
  sanitized_name jsonb;
  sanitized_desc jsonb;
  valid_features text[] := ARRAY[
    'Automated Trading', 'Risk Management', 'Multi-Chain', 'Real-time Analytics',
    'Social Integration', 'AI Learning', 'Custom Strategies', 'Portfolio Management',
    'Market Making', 'Arbitrage', 'Yield Farming', 'Governance'
  ];
  feature text;
BEGIN
  -- Validate and sanitize name
  IF agent_name IS NULL OR trim(agent_name) = '' THEN
    errors := array_append(errors, 'Agent name is required');
  ELSIF length(agent_name) < 3 THEN
    errors := array_append(errors, 'Agent name must be at least 3 characters');
  ELSIF length(agent_name) > 50 THEN
    errors := array_append(errors, 'Agent name must be less than 50 characters');
  ELSE
    -- Use comprehensive sanitization
    sanitized_name := public.validate_and_sanitize_input(agent_name, 50, false, true);
    IF NOT (sanitized_name->>'valid')::boolean THEN
      errors := array_append(errors, 'Agent name contains invalid characters or patterns');
    END IF;
  END IF;
  
  -- Validate symbol
  IF agent_symbol IS NULL OR trim(agent_symbol) = '' THEN
    errors := array_append(errors, 'Agent symbol is required');
  ELSIF length(agent_symbol) < 2 THEN
    errors := array_append(errors, 'Agent symbol must be at least 2 characters');
  ELSIF length(agent_symbol) > 10 THEN
    errors := array_append(errors, 'Agent symbol must be less than 10 characters');
  ELSIF agent_symbol !~ '^[A-Z0-9]+$' THEN
    errors := array_append(errors, 'Agent symbol must contain only uppercase letters and numbers');
  END IF;
  
  -- Check if symbol already exists (case-insensitive)
  IF EXISTS (SELECT 1 FROM public.agents WHERE UPPER(symbol) = UPPER(agent_symbol)) THEN
    errors := array_append(errors, 'Agent symbol already exists. Please choose a different symbol.');
  END IF;
  
  -- Validate and sanitize description
  IF agent_description IS NULL OR trim(agent_description) = '' THEN
    errors := array_append(errors, 'Agent description is required');
  ELSIF length(agent_description) < 20 THEN
    errors := array_append(errors, 'Agent description must be at least 20 characters');
  ELSIF length(agent_description) > 500 THEN
    errors := array_append(errors, 'Agent description must be less than 500 characters');
  ELSE
    -- Sanitize description
    sanitized_desc := public.validate_and_sanitize_input(agent_description, 500, false, true);
    IF NOT (sanitized_desc->>'valid')::boolean THEN
      errors := array_append(errors, 'Agent description contains invalid characters or patterns');
    END IF;
  END IF;
  
  -- Validate category
  IF agent_category IS NULL OR trim(agent_category) = '' THEN
    errors := array_append(errors, 'Agent category is required');
  END IF;
  
  -- Validate avatar URL if provided
  IF avatar_url_param IS NOT NULL AND trim(avatar_url_param) != '' THEN
    -- Check for valid URL format
    IF NOT avatar_url_param ~* '^https?://[^\s/$.?#].[^\s]*\.(jpg|jpeg|png|gif|webp)(\?.*)?$' THEN
      errors := array_append(errors, 'Avatar URL must be a valid image URL (jpg, jpeg, png, gif, or webp)');
    END IF;
    
    -- Check for suspicious patterns in URL
    IF avatar_url_param ~* '(javascript:|data:|vbscript:|on\w+\s*=)' THEN
      errors := array_append(errors, 'Avatar URL contains invalid patterns');
    END IF;
  END IF;
  
  -- Validate features
  IF features_param IS NULL OR array_length(features_param, 1) IS NULL THEN
    errors := array_append(errors, 'At least one feature must be selected');
  ELSE
    -- Validate each feature against whitelist
    FOREACH feature IN ARRAY features_param
    LOOP
      IF NOT feature = ANY(valid_features) THEN
        errors := array_append(errors, 'Invalid feature selected: ' || feature);
      END IF;
    END LOOP;
  END IF;
  
  RETURN jsonb_build_object(
    'valid', array_length(errors, 1) IS NULL,
    'errors', errors,
    'sanitized_name', COALESCE(sanitized_name->>'sanitized', agent_name),
    'sanitized_description', COALESCE(sanitized_desc->>'sanitized', agent_description)
  );
END;
$$;

-- Create URL validation function
CREATE OR REPLACE FUNCTION public.validate_url(url_param text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check for null or empty
  IF url_param IS NULL OR trim(url_param) = '' THEN
    RETURN jsonb_build_object('valid', false, 'error', 'URL cannot be empty');
  END IF;
  
  -- Check for valid HTTP/HTTPS URL
  IF NOT url_param ~* '^https?://[^\s/$.?#].[^\s]*$' THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Invalid URL format');
  END IF;
  
  -- Check for XSS patterns
  IF url_param ~* '(javascript:|data:|vbscript:|on\w+\s*=|<script)' THEN
    RETURN jsonb_build_object('valid', false, 'error', 'URL contains potentially dangerous patterns');
  END IF;
  
  RETURN jsonb_build_object('valid', true);
END;
$$;

-- Add index for faster creator lookups
CREATE INDEX IF NOT EXISTS agents_creator_id_created_at_idx 
  ON public.agents (creator_id, created_at DESC);

-- Add index for symbol lookups (case-insensitive)
CREATE INDEX IF NOT EXISTS agents_symbol_upper_idx 
  ON public.agents (UPPER(symbol));

-- Add comprehensive audit logging trigger for agent creation
CREATE OR REPLACE FUNCTION public.audit_agent_creation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log agent creation
  PERFORM public.log_sensitive_data_access(
    'agents',
    'CREATE',
    NEW.id,
    jsonb_build_object(
      'agent_name', NEW.name,
      'agent_symbol', NEW.symbol,
      'creator_id', NEW.creator_id,
      'category', NEW.category,
      'initial_supply', NEW.initial_supply,
      'initial_price', NEW.initial_price,
      'chain', NEW.chain
    )
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for audit logging
DROP TRIGGER IF EXISTS audit_agent_creation_trigger ON public.agents;
CREATE TRIGGER audit_agent_creation_trigger
  AFTER INSERT ON public.agents
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_agent_creation();