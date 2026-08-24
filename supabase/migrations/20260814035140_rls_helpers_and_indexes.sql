-- =============================================================================
-- RLS foundation: private helper schema, tenancy helper functions, and the
-- indexes those helpers (and the app's own joins) depend on.
--
-- Access model
-- ------------
--   public.users.id == auth.uid()   (set from the Supabase Auth user id on first
--                                    dashboard load - see src/app/dashboard/layout.tsx)
--
--   A user can reach a project two ways:
--     1. direct ownership        projects.user_id = auth.uid()
--     2. organization membership projects.organization_id IN (user's orgs)
--
-- Why the helpers live in `private` and not `public`
-- --------------------------------------------------
--   PostgREST only exposes `public` (+ graphql_public). A SECURITY DEFINER
--   function in `public` becomes a callable /rest/v1/rpc/ endpoint for anon and
--   authenticated (database linter 0028/0029). Putting them in `private` keeps
--   them off the API surface.
--
--   They still need to be callable *by the policy evaluator*: Postgres checks
--   EXECUTE on functions referenced in an RLS policy against the querying role,
--   so `authenticated` needs USAGE on the schema and EXECUTE on each helper.
--   Granting USAGE on `private` does NOT expose it to the Data API.
--
-- Why they return `setof uuid` instead of taking a row value
-- ---------------------------------------------------------
--   A policy written as `project_id IN (SELECT private.readable_project_ids())`
--   has no correlation to the row being checked, so Postgres evaluates it once
--   per statement as an InitPlan and hashes the result. A per-row helper call
--   like `private.can_read(project_id)` re-executes for every row scanned.
-- =============================================================================

create schema if not exists private;

revoke all on schema private from public;
grant usage on schema private to authenticated;

-- -----------------------------------------------------------------------------
-- Helper functions
--
-- All are SECURITY DEFINER so they read organization_members / projects without
-- re-entering RLS (which would recurse: the policy on organization_members
-- cannot itself query organization_members). All pin search_path to '' and
-- fully qualify every identifier, so they cannot be hijacked by a caller's
-- search_path.
-- -----------------------------------------------------------------------------

-- Organizations the calling user belongs to, in any role.
create or replace function private.current_org_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select m.organization_id
  from public.organization_members m
  where m.user_id = (select auth.uid())
$$;

-- Organizations the calling user administers.
create or replace function private.admin_org_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select m.organization_id
  from public.organization_members m
  where m.user_id = (select auth.uid())
    and m.role in ('owner', 'admin')
$$;

-- Projects the calling user may read.
create or replace function private.readable_project_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select p.id
  from public.projects p
  where p.user_id = (select auth.uid())
     or p.organization_id in (select private.current_org_ids())
$$;

-- Projects the calling user may modify: direct owner, or org owner/admin.
create or replace function private.manageable_project_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select p.id
  from public.projects p
  where p.user_id = (select auth.uid())
     or p.organization_id in (select private.admin_org_ids())
$$;

-- Scans belonging to readable projects. Used by scan_issues, which is two hops
-- from projects; resolving it here avoids nested RLS evaluation on public.scans.
create or replace function private.readable_scan_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select s.id
  from public.scans s
  where s.project_id in (select private.readable_project_ids())
$$;

-- Postgres grants EXECUTE to PUBLIC on every new function. Strip that, then
-- hand EXECUTE back only to `authenticated` - anon has no policy that needs
-- these, so it must not be able to call them.
revoke all on function private.current_org_ids()        from public, anon, authenticated;
revoke all on function private.admin_org_ids()          from public, anon, authenticated;
revoke all on function private.readable_project_ids()   from public, anon, authenticated;
revoke all on function private.manageable_project_ids() from public, anon, authenticated;
revoke all on function private.readable_scan_ids()      from public, anon, authenticated;

grant execute on function private.current_org_ids()        to authenticated;
grant execute on function private.admin_org_ids()          to authenticated;
grant execute on function private.readable_project_ids()   to authenticated;
grant execute on function private.manageable_project_ids() to authenticated;
grant execute on function private.readable_scan_ids()      to authenticated;

-- -----------------------------------------------------------------------------
-- Indexes on every column an RLS policy filters on.
--
-- The schema had no index on any foreign key. Without these, each policy check
-- degrades to a sequential scan of the parent table, which is the single most
-- common cause of "RLS made my queries slow". These also serve the app's own
-- Drizzle joins.
-- -----------------------------------------------------------------------------

create index if not exists projects_user_id_idx                  on public.projects (user_id);
create index if not exists projects_organization_id_idx          on public.projects (organization_id);

create index if not exists organization_members_user_id_idx      on public.organization_members (user_id);
create index if not exists organization_members_org_id_idx       on public.organization_members (organization_id);
-- A user should appear at most once per organization; the ambiguity would make
-- admin_org_ids() return duplicates and makes membership state hard to reason about.
create unique index if not exists organization_members_org_user_uniq
  on public.organization_members (organization_id, user_id);

create index if not exists scans_project_id_idx                  on public.scans (project_id);
create index if not exists scan_issues_scan_id_idx               on public.scan_issues (scan_id);
create index if not exists aeo_scans_project_id_idx              on public.aeo_scans (project_id);
create index if not exists project_pages_project_id_idx          on public.project_pages (project_id);
create index if not exists dead_links_project_id_idx             on public.dead_links (project_id);
create index if not exists keyword_opportunities_project_id_idx  on public.keyword_opportunities (project_id);
create index if not exists competitors_project_id_idx            on public.competitors (project_id);
create index if not exists competitor_keyword_gaps_project_id_idx on public.competitor_keyword_gaps (project_id);
create index if not exists competitor_keyword_gaps_competitor_id_idx on public.competitor_keyword_gaps (competitor_id);
create index if not exists uptime_logs_project_id_idx            on public.uptime_logs (project_id);
create index if not exists api_keys_project_id_idx               on public.api_keys (project_id);
create index if not exists webhooks_project_id_idx               on public.webhooks (project_id);
create index if not exists developer_logs_org_id_idx             on public.developer_logs (org_id);
create index if not exists developer_logs_project_id_idx         on public.developer_logs (project_id);
create index if not exists audit_logs_org_id_idx                 on public.audit_logs (org_id);
create index if not exists audit_logs_actor_id_idx               on public.audit_logs (actor_id);
create index if not exists automations_organization_id_idx       on public.automations (organization_id);
create index if not exists automations_integration_id_idx        on public.automations (integration_id);
create index if not exists integrations_organization_id_idx      on public.integrations (organization_id);
create index if not exists blogs_author_id_idx                   on public.blogs (author_id);
