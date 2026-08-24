-- =============================================================================
-- Enable RLS on every table in `public` and attach policies.
--
-- Context that shapes these policies
-- ----------------------------------
-- The app reads and writes exclusively through Drizzle over DATABASE_URL, which
-- connects as the `postgres` role. That role carries BYPASSRLS, so none of this
-- changes application behaviour. What it does close is the Data API surface:
-- until now every table granted SELECT/INSERT/UPDATE/DELETE/TRUNCATE to `anon`
-- and `authenticated` with RLS off, which meant anyone holding the public
-- NEXT_PUBLIC_SUPABASE_ANON_KEY could read or destroy the entire database
-- through /rest/v1/ - including api_keys.key_hash, webhooks.secret,
-- integrations.credentials and every user's email.
--
-- Write posture
-- -------------
-- Rows produced by the server-side scan/audit pipeline (scans, scan_issues,
-- aeo_scans, project_pages, dead_links, keyword_opportunities,
-- competitor_keyword_gaps, uptime_logs) and the log tables (audit_logs,
-- developer_logs) get SELECT policies only. They are written by the server,
-- which bypasses RLS; a client that could INSERT into them could forge scan
-- results or audit trail entries. No policy for a command means that command is
-- denied - that is deliberate here, not an omission.
--
-- Note on `TO authenticated`: it authenticates but does not authorize, so every
-- policy below pairs it with an ownership predicate. Note also that `auth.role()`
-- is deliberately unused - it is deprecated and passes for anonymous sign-ins.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Enable RLS everywhere in `public`.
-- audit_logs already had RLS on but zero policies (linter 0008); it gets one below.
-- -----------------------------------------------------------------------------
alter table public.aeo_scans               enable row level security;
alter table public.api_keys                enable row level security;
alter table public.audit_logs              enable row level security;
alter table public.automations             enable row level security;
alter table public.blogs                   enable row level security;
alter table public.competitor_keyword_gaps enable row level security;
alter table public.competitors             enable row level security;
alter table public.dead_links              enable row level security;
alter table public.developer_logs          enable row level security;
alter table public.feature_flags           enable row level security;
alter table public.integrations            enable row level security;
alter table public.keyword_opportunities   enable row level security;
alter table public.organization_members    enable row level security;
alter table public.organizations           enable row level security;
alter table public.project_pages           enable row level security;
alter table public.projects                enable row level security;
alter table public.scan_issues             enable row level security;
alter table public.scans                   enable row level security;
alter table public.uptime_logs             enable row level security;
alter table public.users                   enable row level security;
alter table public.webhooks                enable row level security;


-- =============================================================================
-- Identity
-- =============================================================================

-- A user sees and edits their own profile row, nothing else. The team roster is
-- rendered server-side, so no cross-user read is needed over the Data API.
-- Deliberately no INSERT policy: profile rows are created by the server in
-- src/app/dashboard/layout.tsx. Deliberately no DELETE policy: account deletion
-- must go through Supabase Auth, not a REST call.
drop policy if exists users_select_own on public.users;
create policy users_select_own
  on public.users for select
  to authenticated
  using ( (select auth.uid()) = id );

-- USING gates which row may be updated; WITH CHECK gates what it may become.
-- Without WITH CHECK a user could rewrite `id` and take over another row.
drop policy if exists users_update_own on public.users;
create policy users_update_own
  on public.users for update
  to authenticated
  using      ( (select auth.uid()) = id )
  with check ( (select auth.uid()) = id );


-- =============================================================================
-- Organizations
--
-- These policies read membership through private.*_org_ids(), which is
-- SECURITY DEFINER. That is what breaks the recursion a naive
-- "organization_members may be read by members of that organization" policy
-- would otherwise cause.
-- =============================================================================

drop policy if exists organizations_select_member on public.organizations;
create policy organizations_select_member
  on public.organizations for select
  to authenticated
  using ( id in (select private.current_org_ids()) );

drop policy if exists organizations_update_admin on public.organizations;
create policy organizations_update_admin
  on public.organizations for update
  to authenticated
  using      ( id in (select private.admin_org_ids()) )
  with check ( id in (select private.admin_org_ids()) );

-- Members see the roster of their own organizations.
drop policy if exists organization_members_select_member on public.organization_members;
create policy organization_members_select_member
  on public.organization_members for select
  to authenticated
  using ( organization_id in (select private.current_org_ids()) );

-- Only owners/admins change the roster - and only within orgs they administer,
-- so an admin of org A cannot add themselves to org B.
drop policy if exists organization_members_insert_admin on public.organization_members;
create policy organization_members_insert_admin
  on public.organization_members for insert
  to authenticated
  with check ( organization_id in (select private.admin_org_ids()) );

drop policy if exists organization_members_update_admin on public.organization_members;
create policy organization_members_update_admin
  on public.organization_members for update
  to authenticated
  using      ( organization_id in (select private.admin_org_ids()) )
  with check ( organization_id in (select private.admin_org_ids()) );

drop policy if exists organization_members_delete_admin on public.organization_members;
create policy organization_members_delete_admin
  on public.organization_members for delete
  to authenticated
  using ( organization_id in (select private.admin_org_ids()) );


-- =============================================================================
-- Projects
-- =============================================================================

drop policy if exists projects_select_accessible on public.projects;
create policy projects_select_accessible
  on public.projects for select
  to authenticated
  using ( id in (select private.readable_project_ids()) );

-- A new project must be stamped with the creator's own id, and may only be
-- filed under an organization the creator actually belongs to.
drop policy if exists projects_insert_own on public.projects;
create policy projects_insert_own
  on public.projects for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and ( organization_id is null
          or organization_id in (select private.current_org_ids()) )
  );

-- WITH CHECK stops a manager from re-parenting a project to a user or an
-- organization outside their control.
drop policy if exists projects_update_manageable on public.projects;
create policy projects_update_manageable
  on public.projects for update
  to authenticated
  using ( id in (select private.manageable_project_ids()) )
  with check (
    ( user_id = (select auth.uid())
      or organization_id in (select private.admin_org_ids()) )
    and ( organization_id is null
          or organization_id in (select private.current_org_ids()) )
  );

drop policy if exists projects_delete_manageable on public.projects;
create policy projects_delete_manageable
  on public.projects for delete
  to authenticated
  using ( id in (select private.manageable_project_ids()) );


-- =============================================================================
-- Project-scoped pipeline output - read-only for clients
-- =============================================================================

drop policy if exists scans_select_accessible on public.scans;
create policy scans_select_accessible
  on public.scans for select
  to authenticated
  using ( project_id in (select private.readable_project_ids()) );

-- Two hops from projects; readable_scan_ids() resolves it in one InitPlan
-- instead of forcing a nested RLS check against public.scans per row.
drop policy if exists scan_issues_select_accessible on public.scan_issues;
create policy scan_issues_select_accessible
  on public.scan_issues for select
  to authenticated
  using ( scan_id in (select private.readable_scan_ids()) );

drop policy if exists aeo_scans_select_accessible on public.aeo_scans;
create policy aeo_scans_select_accessible
  on public.aeo_scans for select
  to authenticated
  using ( project_id in (select private.readable_project_ids()) );

drop policy if exists project_pages_select_accessible on public.project_pages;
create policy project_pages_select_accessible
  on public.project_pages for select
  to authenticated
  using ( project_id in (select private.readable_project_ids()) );

drop policy if exists dead_links_select_accessible on public.dead_links;
create policy dead_links_select_accessible
  on public.dead_links for select
  to authenticated
  using ( project_id in (select private.readable_project_ids()) );

drop policy if exists keyword_opportunities_select_accessible on public.keyword_opportunities;
create policy keyword_opportunities_select_accessible
  on public.keyword_opportunities for select
  to authenticated
  using ( project_id in (select private.readable_project_ids()) );

drop policy if exists competitor_keyword_gaps_select_accessible on public.competitor_keyword_gaps;
create policy competitor_keyword_gaps_select_accessible
  on public.competitor_keyword_gaps for select
  to authenticated
  using ( project_id in (select private.readable_project_ids()) );

drop policy if exists uptime_logs_select_accessible on public.uptime_logs;
create policy uptime_logs_select_accessible
  on public.uptime_logs for select
  to authenticated
  using ( project_id in (select private.readable_project_ids()) );


-- =============================================================================
-- Competitors - user-curated, so clients may manage them
-- =============================================================================

drop policy if exists competitors_select_accessible on public.competitors;
create policy competitors_select_accessible
  on public.competitors for select
  to authenticated
  using ( project_id in (select private.readable_project_ids()) );

drop policy if exists competitors_insert_manageable on public.competitors;
create policy competitors_insert_manageable
  on public.competitors for insert
  to authenticated
  with check ( project_id in (select private.manageable_project_ids()) );

-- WITH CHECK repeats the predicate so a row cannot be moved to another project.
drop policy if exists competitors_update_manageable on public.competitors;
create policy competitors_update_manageable
  on public.competitors for update
  to authenticated
  using      ( project_id in (select private.manageable_project_ids()) )
  with check ( project_id in (select private.manageable_project_ids()) );

drop policy if exists competitors_delete_manageable on public.competitors;
create policy competitors_delete_manageable
  on public.competitors for delete
  to authenticated
  using ( project_id in (select private.manageable_project_ids()) );


-- =============================================================================
-- Automations - organization-scoped, admin-managed
-- =============================================================================

drop policy if exists automations_select_member on public.automations;
create policy automations_select_member
  on public.automations for select
  to authenticated
  using ( organization_id in (select private.current_org_ids()) );

drop policy if exists automations_insert_admin on public.automations;
create policy automations_insert_admin
  on public.automations for insert
  to authenticated
  with check ( organization_id in (select private.admin_org_ids()) );

drop policy if exists automations_update_admin on public.automations;
create policy automations_update_admin
  on public.automations for update
  to authenticated
  using      ( organization_id in (select private.admin_org_ids()) )
  with check ( organization_id in (select private.admin_org_ids()) );

drop policy if exists automations_delete_admin on public.automations;
create policy automations_delete_admin
  on public.automations for delete
  to authenticated
  using ( organization_id in (select private.admin_org_ids()) );


-- =============================================================================
-- Audit and operational logs - readable by org owners/admins, never client-writable
--
-- Restricted to admins rather than all members because these rows carry actor
-- emails and IP addresses. An append-only trail is worthless if the audited
-- party can INSERT, UPDATE or DELETE it, so only SELECT is granted.
-- =============================================================================

drop policy if exists audit_logs_select_admin on public.audit_logs;
create policy audit_logs_select_admin
  on public.audit_logs for select
  to authenticated
  using ( org_id in (select private.admin_org_ids()) );

drop policy if exists developer_logs_select_admin on public.developer_logs;
create policy developer_logs_select_admin
  on public.developer_logs for select
  to authenticated
  using ( org_id in (select private.admin_org_ids()) );


-- =============================================================================
-- Feature flags - readable by signed-in users, writable only by the server
-- =============================================================================

drop policy if exists feature_flags_select_authenticated on public.feature_flags;
create policy feature_flags_select_authenticated
  on public.feature_flags for select
  to authenticated
  using ( true );


-- =============================================================================
-- Blogs - the one genuinely public-facing table
-- =============================================================================

-- Anonymous visitors see published posts only. Drafts stay invisible.
drop policy if exists blogs_select_published on public.blogs;
create policy blogs_select_published
  on public.blogs for select
  to anon, authenticated
  using ( published_at is not null
          and published_at <= (now() at time zone 'utc') );

-- Authors additionally see their own drafts.
drop policy if exists blogs_select_own on public.blogs;
create policy blogs_select_own
  on public.blogs for select
  to authenticated
  using ( author_id = (select auth.uid()) );

drop policy if exists blogs_insert_own on public.blogs;
create policy blogs_insert_own
  on public.blogs for insert
  to authenticated
  with check ( author_id = (select auth.uid()) );

drop policy if exists blogs_update_own on public.blogs;
create policy blogs_update_own
  on public.blogs for update
  to authenticated
  using      ( author_id = (select auth.uid()) )
  with check ( author_id = (select auth.uid()) );

drop policy if exists blogs_delete_own on public.blogs;
create policy blogs_delete_own
  on public.blogs for delete
  to authenticated
  using ( author_id = (select auth.uid()) );


-- =============================================================================
-- Secret-bearing tables: api_keys (key_hash), webhooks (secret),
-- integrations (credentials).
--
-- RLS is enabled with no policies at all, so the Data API returns nothing for
-- any role. The server reaches them as `postgres`, which bypasses RLS. Their
-- grants are also revoked outright in the next migration - defence in depth, so
-- a future permissive policy added by mistake still cannot expose them.
-- =============================================================================
