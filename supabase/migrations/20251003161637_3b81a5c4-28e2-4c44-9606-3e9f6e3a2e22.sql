-- Delete all mock/sample agents (those without a creator_id)
-- These are agents that were inserted via migrations for testing/demo purposes
DELETE FROM public.agents WHERE creator_id IS NULL;

-- Log the cleanup
DO $$
BEGIN
  RAISE NOTICE 'Cleaned up mock agents from the database';
END $$;