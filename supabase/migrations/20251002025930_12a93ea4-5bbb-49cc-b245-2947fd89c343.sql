-- Add missing foreign keys to enable PostgREST relationships used in nested selects
-- This fixes loading errors in KYCManagement and ContentModeration caused by missing FK relations

begin;

-- 1) kyc_verifications.user_id -> profiles.user_id
do $$
begin
  if not exists (
    select 1 from pg_constraint 
    where conname = 'kyc_verifications_user_id_profiles_fkey'
  ) then
    alter table public.kyc_verifications
      add constraint kyc_verifications_user_id_profiles_fkey
      foreign key (user_id)
      references public.profiles(user_id)
      on delete cascade;
  end if;
end $$;

-- 2) agent_comments.user_id -> profiles.user_id
do $$
begin
  if not exists (
    select 1 from pg_constraint 
    where conname = 'agent_comments_user_id_profiles_fkey'
  ) then
    alter table public.agent_comments
      add constraint agent_comments_user_id_profiles_fkey
      foreign key (user_id)
      references public.profiles(user_id)
      on delete cascade;
  end if;
end $$;

-- 3) agent_comments.agent_id -> agents.id
do $$
begin
  if not exists (
    select 1 from pg_constraint 
    where conname = 'agent_comments_agent_id_agents_fkey'
  ) then
    alter table public.agent_comments
      add constraint agent_comments_agent_id_agents_fkey
      foreign key (agent_id)
      references public.agents(id)
      on delete cascade;
  end if;
end $$;

commit;