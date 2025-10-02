-- Add critical missing triggers and functions for ACP

-- Trigger to update job bids count
CREATE OR REPLACE FUNCTION public.update_job_bids_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.acp_jobs
    SET bids_count = bids_count + 1
    WHERE id = NEW.job_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.acp_jobs
    SET bids_count = GREATEST(0, bids_count - 1)
    WHERE id = OLD.job_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER update_job_bids_count_trigger
  AFTER INSERT OR DELETE ON public.acp_job_bids
  FOR EACH ROW
  EXECUTE FUNCTION public.update_job_bids_count();

-- Trigger to update service rating from reviews
CREATE OR REPLACE FUNCTION public.update_service_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  avg_rating numeric;
BEGIN
  IF NEW.service_id IS NOT NULL THEN
    SELECT AVG(rating) INTO avg_rating
    FROM public.acp_reviews
    WHERE service_id = NEW.service_id;
    
    UPDATE public.acp_services
    SET rating = COALESCE(avg_rating, 0)
    WHERE id = NEW.service_id;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_service_rating_trigger
  AFTER INSERT OR UPDATE ON public.acp_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_service_rating();

-- Enhanced validation for ACP service creation
CREATE OR REPLACE FUNCTION public.validate_acp_service(
  title_param text,
  description_param text,
  price_param numeric,
  category_param text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  errors text[] := '{}';
  sanitized_title jsonb;
  sanitized_desc jsonb;
BEGIN
  -- Validate and sanitize title
  IF title_param IS NULL OR trim(title_param) = '' THEN
    errors := array_append(errors, 'Service title is required');
  ELSIF length(title_param) < 5 THEN
    errors := array_append(errors, 'Service title must be at least 5 characters');
  ELSIF length(title_param) > 100 THEN
    errors := array_append(errors, 'Service title must be less than 100 characters');
  ELSE
    sanitized_title := public.validate_and_sanitize_input(title_param, 100, false, true);
    IF NOT (sanitized_title->>'valid')::boolean THEN
      errors := array_append(errors, 'Service title contains invalid characters');
    END IF;
  END IF;
  
  -- Validate and sanitize description
  IF description_param IS NULL OR trim(description_param) = '' THEN
    errors := array_append(errors, 'Service description is required');
  ELSIF length(description_param) < 20 THEN
    errors := array_append(errors, 'Service description must be at least 20 characters');
  ELSIF length(description_param) > 2000 THEN
    errors := array_append(errors, 'Service description must be less than 2000 characters');
  ELSE
    sanitized_desc := public.validate_and_sanitize_input(description_param, 2000, false, true);
    IF NOT (sanitized_desc->>'valid')::boolean THEN
      errors := array_append(errors, 'Service description contains invalid characters');
    END IF;
  END IF;
  
  -- Validate price
  IF price_param IS NULL OR price_param <= 0 THEN
    errors := array_append(errors, 'Price must be greater than 0');
  ELSIF price_param > 1000000 THEN
    errors := array_append(errors, 'Price cannot exceed $1,000,000');
  END IF;
  
  -- Validate category
  IF category_param IS NULL OR trim(category_param) = '' THEN
    errors := array_append(errors, 'Category is required');
  END IF;
  
  RETURN jsonb_build_object(
    'valid', array_length(errors, 1) IS NULL,
    'errors', errors,
    'sanitized_title', COALESCE(sanitized_title->>'sanitized', title_param),
    'sanitized_description', COALESCE(sanitized_desc->>'sanitized', description_param)
  );
END;
$$;

-- Function to validate job creation
CREATE OR REPLACE FUNCTION public.validate_acp_job(
  title_param text,
  description_param text,
  budget_param numeric
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  errors text[] := '{}';
  sanitized_title jsonb;
  sanitized_desc jsonb;
BEGIN
  -- Validate and sanitize title
  IF title_param IS NULL OR trim(title_param) = '' THEN
    errors := array_append(errors, 'Job title is required');
  ELSIF length(title_param) < 5 THEN
    errors := array_append(errors, 'Job title must be at least 5 characters');
  ELSIF length(title_param) > 150 THEN
    errors := array_append(errors, 'Job title must be less than 150 characters');
  ELSE
    sanitized_title := public.validate_and_sanitize_input(title_param, 150, false, true);
    IF NOT (sanitized_title->>'valid')::boolean THEN
      errors := array_append(errors, 'Job title contains invalid characters');
    END IF;
  END IF;
  
  -- Validate and sanitize description
  IF description_param IS NULL OR trim(description_param) = '' THEN
    errors := array_append(errors, 'Job description is required');
  ELSIF length(description_param) < 20 THEN
    errors := array_append(errors, 'Job description must be at least 20 characters');
  ELSIF length(description_param) > 5000 THEN
    errors := array_append(errors, 'Job description must be less than 5000 characters');
  ELSE
    sanitized_desc := public.validate_and_sanitize_input(description_param, 5000, false, true);
    IF NOT (sanitized_desc->>'valid')::boolean THEN
      errors := array_append(errors, 'Job description contains invalid characters');
    END IF;
  END IF;
  
  -- Validate budget
  IF budget_param IS NULL OR budget_param <= 0 THEN
    errors := array_append(errors, 'Budget must be greater than 0');
  ELSIF budget_param > 10000000 THEN
    errors := array_append(errors, 'Budget cannot exceed $10,000,000');
  END IF;
  
  RETURN jsonb_build_object(
    'valid', array_length(errors, 1) IS NULL,
    'errors', errors,
    'sanitized_title', COALESCE(sanitized_title->>'sanitized', title_param),
    'sanitized_description', COALESCE(sanitized_desc->>'sanitized', description_param)
  );
END;
$$;

-- Add audit logging for ACP transactions
CREATE OR REPLACE FUNCTION public.audit_acp_transaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.log_sensitive_data_access(
    'acp_transactions',
    TG_OP,
    NEW.id,
    jsonb_build_object(
      'transaction_type', NEW.transaction_type,
      'amount', NEW.amount,
      'from_user', NEW.from_user_id,
      'to_user', NEW.to_user_id,
      'status', NEW.status
    )
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER audit_acp_transaction_trigger
  AFTER INSERT OR UPDATE ON public.acp_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_acp_transaction();

-- Add rate limiting check for ACP operations
CREATE OR REPLACE FUNCTION public.check_acp_rate_limit(
  user_id_param uuid,
  operation_type text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  operation_count integer;
  max_operations integer;
BEGIN
  -- Set limits based on operation type
  CASE operation_type
    WHEN 'create_service' THEN max_operations := 10;  -- 10 services per day
    WHEN 'create_job' THEN max_operations := 20;      -- 20 jobs per day
    WHEN 'create_transaction' THEN max_operations := 50; -- 50 transactions per day
    WHEN 'create_bid' THEN max_operations := 30;      -- 30 bids per day
    ELSE max_operations := 100;
  END CASE;
  
  -- Count operations in last 24 hours
  SELECT COUNT(*) INTO operation_count
  FROM public.security_audit_log
  WHERE user_id = user_id_param
  AND action ILIKE '%' || operation_type || '%'
  AND created_at > now() - INTERVAL '24 hours';
  
  IF operation_count >= max_operations THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'rate_limit_exceeded',
      'limit', max_operations,
      'current', operation_count,
      'retry_after_seconds', 86400
    );
  END IF;
  
  RETURN jsonb_build_object(
    'allowed', true,
    'remaining', max_operations - operation_count
  );
END;
$$;

COMMENT ON FUNCTION public.check_acp_rate_limit(uuid, text) IS 'Rate limiting for ACP operations';

-- Add realtime support for ACP tables
ALTER TABLE public.acp_services REPLICA IDENTITY FULL;
ALTER TABLE public.acp_jobs REPLICA IDENTITY FULL;
ALTER TABLE public.acp_transactions REPLICA IDENTITY FULL;
ALTER TABLE public.acp_job_bids REPLICA IDENTITY FULL;