-- =============================================================================
-- Make the deny on the secret-bearing tables explicit.
--
-- api_keys, webhooks and integrations already deny every client: RLS is on and
-- they have no policies, and their grants are revoked. But "RLS enabled, no
-- policies" is indistinguishable at a glance from "someone enabled RLS and
-- forgot to write the policies" - which is exactly what the database linter
-- flags it as (0008_rls_enabled_no_policy).
--
-- These policies change no behaviour. They record the intent in the schema so
-- the next person to read it knows the absence of access is the design, and
-- they keep the linter output clean so a genuinely missing policy stands out.
-- =============================================================================

drop policy if exists api_keys_no_client_access on public.api_keys;
create policy api_keys_no_client_access
  on public.api_keys for all
  to anon, authenticated
  using ( false )
  with check ( false );

drop policy if exists webhooks_no_client_access on public.webhooks;
create policy webhooks_no_client_access
  on public.webhooks for all
  to anon, authenticated
  using ( false )
  with check ( false );

drop policy if exists integrations_no_client_access on public.integrations;
create policy integrations_no_client_access
  on public.integrations for all
  to anon, authenticated
  using ( false )
  with check ( false );

comment on policy api_keys_no_client_access on public.api_keys is
  'Server-only table (key_hash). Reached exclusively by the app''s postgres role, which bypasses RLS.';
comment on policy webhooks_no_client_access on public.webhooks is
  'Server-only table (secret). Reached exclusively by the app''s postgres role, which bypasses RLS.';
comment on policy integrations_no_client_access on public.integrations is
  'Server-only table (credentials). Reached exclusively by the app''s postgres role, which bypasses RLS.';
