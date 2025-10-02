-- Create rate limiting function for trading signals
CREATE OR REPLACE FUNCTION public.check_signal_rate_limit(user_id_param UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  signal_count INTEGER;
  max_signals INTEGER := 10;
BEGIN
  -- Count signals created by user in last 24 hours
  SELECT COUNT(*) INTO signal_count
  FROM public.trading_signals
  WHERE user_id = user_id_param
  AND created_at > now() - INTERVAL '24 hours';
  
  IF signal_count >= max_signals THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'daily_limit_exceeded',
      'limit', max_signals,
      'current', signal_count,
      'remaining', 0
    );
  END IF;
  
  RETURN jsonb_build_object(
    'allowed', true,
    'remaining', max_signals - signal_count,
    'limit', max_signals,
    'current', signal_count
  );
END;
$$;

-- Create validation function for trading signals
CREATE OR REPLACE FUNCTION public.validate_trading_signal(
  signal_type_param TEXT,
  confidence_param NUMERIC,
  entry_price_param NUMERIC,
  target_price_param NUMERIC DEFAULT NULL,
  stop_loss_param NUMERIC DEFAULT NULL,
  reasoning_param TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  errors TEXT[] := '{}';
  sanitized_reasoning TEXT;
  sanitization_result JSONB;
BEGIN
  -- Validate signal type
  IF signal_type_param NOT IN ('buy', 'sell', 'hold') THEN
    errors := array_append(errors, 'Invalid signal type. Must be buy, sell, or hold');
  END IF;
  
  -- Validate confidence
  IF confidence_param IS NULL OR confidence_param < 0 OR confidence_param > 100 THEN
    errors := array_append(errors, 'Confidence must be between 0 and 100');
  END IF;
  
  -- Validate entry price
  IF entry_price_param IS NULL OR entry_price_param <= 0 THEN
    errors := array_append(errors, 'Entry price must be greater than 0');
  END IF;
  
  -- Validate target price if provided
  IF target_price_param IS NOT NULL AND target_price_param <= 0 THEN
    errors := array_append(errors, 'Target price must be greater than 0');
  END IF;
  
  -- Validate stop loss if provided
  IF stop_loss_param IS NOT NULL AND stop_loss_param <= 0 THEN
    errors := array_append(errors, 'Stop loss must be greater than 0');
  END IF;
  
  -- Validate price relationships for buy signals
  IF signal_type_param = 'buy' THEN
    IF target_price_param IS NOT NULL AND target_price_param <= entry_price_param THEN
      errors := array_append(errors, 'For buy signals, target price must be higher than entry price');
    END IF;
    IF stop_loss_param IS NOT NULL AND stop_loss_param >= entry_price_param THEN
      errors := array_append(errors, 'For buy signals, stop loss must be lower than entry price');
    END IF;
  END IF;
  
  -- Validate price relationships for sell signals
  IF signal_type_param = 'sell' THEN
    IF target_price_param IS NOT NULL AND target_price_param >= entry_price_param THEN
      errors := array_append(errors, 'For sell signals, target price must be lower than entry price');
    END IF;
    IF stop_loss_param IS NOT NULL AND stop_loss_param <= entry_price_param THEN
      errors := array_append(errors, 'For sell signals, stop loss must be higher than entry price');
    END IF;
  END IF;
  
  -- Validate reasoning
  IF reasoning_param IS NULL OR trim(reasoning_param) = '' THEN
    errors := array_append(errors, 'Reasoning is required');
  ELSIF length(reasoning_param) < 20 THEN
    errors := array_append(errors, 'Reasoning must be at least 20 characters');
  ELSIF length(reasoning_param) > 2000 THEN
    errors := array_append(errors, 'Reasoning must be less than 2000 characters');
  ELSE
    -- Sanitize reasoning using existing function
    sanitization_result := public.validate_and_sanitize_input(reasoning_param, 2000, false, true);
    IF NOT (sanitization_result->>'valid')::boolean THEN
      errors := array_append(errors, 'Reasoning contains invalid characters or patterns');
    END IF;
    sanitized_reasoning := sanitization_result->>'sanitized';
  END IF;
  
  RETURN jsonb_build_object(
    'valid', array_length(errors, 1) IS NULL,
    'errors', errors,
    'sanitized_reasoning', COALESCE(sanitized_reasoning, reasoning_param)
  );
END;
$$;