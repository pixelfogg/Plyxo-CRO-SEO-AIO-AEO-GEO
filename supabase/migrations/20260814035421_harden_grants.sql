-- =============================================================================
-- Grant hardening. RLS filters rows; it does not replace privileges.
--
-- Two gaps that enabling RLS on its own would leave open:
--
--   1. TRUNCATE is not row-filtered. Postgres checks the TRUNCATE privilege and
--      then wipes the table - RLS policies are never consulted. `anon` and
--      `authenticated` currently hold TRUNCATE on all 21 public tables, so RLS
--      alone would still leave every table destroyable.
--
--   2. REFERENCES lets a role create a foreign key against a table, which can
--      be used to probe for the existence of values it cannot SELECT.
--
-- Beyond closing those, this migration applies least privilege: a role should
-- not hold a privilege it has no policy to exercise.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- anon: the only thing an unauthenticated visitor may touch is published blog
-- posts. Strip everything, then hand back exactly that.
-- -----------------------------------------------------------------------------
revoke all on all tables in schema public from anon;
grant select on table public.blogs to anon;

-- -----------------------------------------------------------------------------
-- authenticated: remove the privileges no policy exercises.
-- -----------------------------------------------------------------------------
revoke truncate, references, trigger on all tables in schema public from authenticated;

-- Secret-bearing tables are server-only. RLS with zero policies already denies
-- them; revoking the grants means a permissive policy added later by mistake
-- still cannot expose key_hash, webhook secrets or integration credentials.
revoke all on table public.api_keys     from authenticated;
revoke all on table public.webhooks     from authenticated;
revoke all on table public.integrations from authenticated;

-- Pipeline output and log tables are written by the server only. These have
-- SELECT policies and no write policies; revoking the write grants makes that
-- intent explicit at the privilege layer too.
revoke insert, update, delete on table public.scans                   from authenticated;
revoke insert, update, delete on table public.scan_issues             from authenticated;
revoke insert, update, delete on table public.aeo_scans               from authenticated;
revoke insert, update, delete on table public.project_pages           from authenticated;
revoke insert, update, delete on table public.dead_links              from authenticated;
revoke insert, update, delete on table public.keyword_opportunities   from authenticated;
revoke insert, update, delete on table public.competitor_keyword_gaps from authenticated;
revoke insert, update, delete on table public.uptime_logs             from authenticated;
revoke insert, update, delete on table public.developer_logs          from authenticated;
revoke insert, update, delete on table public.feature_flags           from authenticated;

-- The audit trail must be append-only from the client's perspective - in fact
-- not even append. Only the server writes it.
revoke insert, update, delete on table public.audit_logs from authenticated;

-- Profile rows are created by the server and deleted through Supabase Auth.
revoke insert, delete on table public.users from authenticated;

-- Organizations are provisioned server-side.
revoke insert, delete on table public.organizations from authenticated;

-- -----------------------------------------------------------------------------
-- Stop the next table from inheriting the same over-broad grants.
-- Supabase's default privileges hand ALL on new tables to anon/authenticated;
-- TRUNCATE/REFERENCES/TRIGGER are never appropriate for either.
-- -----------------------------------------------------------------------------
alter default privileges for role postgres in schema public
  revoke truncate, references, trigger on tables from anon, authenticated;

-- -----------------------------------------------------------------------------
-- Fix linter 0028/0029: public.rls_auto_enable() is a SECURITY DEFINER function
-- sitting in the PostgREST-exposed schema, which makes it a callable
-- /rest/v1/rpc/rls_auto_enable endpoint for anon and authenticated.
--
-- It is the handler for the `ensure_rls` event trigger, which auto-enables RLS
-- on newly created public tables - a genuinely useful safety net, so it is kept.
-- Moving it to `private` takes it off the API surface; the event trigger
-- references it by OID and follows the move.
-- -----------------------------------------------------------------------------
alter function public.rls_auto_enable() set schema private;
revoke all on function private.rls_auto_enable() from public, anon, authenticated;
