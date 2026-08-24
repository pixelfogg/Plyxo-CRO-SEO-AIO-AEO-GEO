# Database security model

## The one thing to understand first

The app never touches the Supabase Data API for data. Every read and write goes
through Drizzle over `DATABASE_URL`, which connects as the **`postgres` role**,
and that role has **`BYPASSRLS`**. `@supabase/supabase-js` is used only for Auth
(`signInWithPassword`, `signUp`, OAuth, `getUser`).

Two consequences follow, and both matter:

1. **RLS cannot break the app.** No policy in `supabase/migrations/` affects any
   query the app issues, because the app's role bypasses RLS entirely.
2. **RLS does not protect the app from itself.** A missing `where user_id = ...`
   in a server action is still a data leak. RLS here defends the *Data API*
   surface — anything reachable with the public `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   Server-side authorization is still your job.

If you ever point Drizzle at a non-`BYPASSRLS` role, re-read the policies first:
they are written for `anon`/`authenticated`, not for a server role, and the app
would immediately see zero rows.

## Access model

`public.users.id == auth.uid()` — profile rows are created with the Supabase Auth
user id in `src/app/dashboard/layout.tsx`.

A user reaches a project two ways:

- **Direct ownership** — `projects.user_id = auth.uid()`
- **Organization membership** — `projects.organization_id` is one of the user's
  orgs via `organization_members`

Everything project-scoped inherits from that. `scan_issues` is two hops out
(`scan_issues → scans → projects`) and resolves through its own helper.

## Helper functions (`private` schema)

`private.current_org_ids()`, `admin_org_ids()`, `readable_project_ids()`,
`manageable_project_ids()`, `readable_scan_ids()` — all `stable`,
`security definer`, `set search_path = ''`.

Three deliberate choices:

- **They live in `private`, not `public`.** PostgREST exposes `public`, so a
  `SECURITY DEFINER` function there becomes a callable `/rest/v1/rpc/` endpoint
  for `anon` (database linter 0028/0029).
- **`authenticated` still holds `USAGE` on `private` and `EXECUTE` on each.**
  Postgres checks `EXECUTE` on functions referenced inside an RLS policy against
  the *querying* role — without the grant every policy fails with
  `permission denied for function`. Granting `USAGE` on `private` does not
  expose it to the Data API.
- **They return `setof uuid` rather than taking the row's id.** A policy written
  as `project_id in (select private.readable_project_ids())` is uncorrelated, so
  Postgres runs it once per statement as an InitPlan and hashes the result.
  A per-row form like `private.can_read(project_id)` re-executes for every row.

`SECURITY DEFINER` is what breaks the recursion — the policy on
`organization_members` cannot itself query `organization_members`.

## Write posture

| Category | Tables | Client access |
|---|---|---|
| Owned by the user | `projects`, `competitors`, `organizations`, `organization_members`, `automations`, `blogs`, `users` | read + scoped write |
| Pipeline output | `scans`, `scan_issues`, `aeo_scans`, `project_pages`, `dead_links`, `keyword_opportunities`, `competitor_keyword_gaps`, `uptime_logs` | read only |
| Logs | `audit_logs`, `developer_logs` | read only, org owners/admins |
| Flags | `feature_flags` | read only |
| Secrets | `api_keys`, `webhooks`, `integrations` | none |

Pipeline and log tables are written by the server only. A client that could
`INSERT` into them could forge scan results or audit-trail entries — an
append-only trail is worthless if the audited party can write to it.

**Absence of a policy for a command means that command is denied.** That is the
design throughout, not an oversight.

## Grants are part of the model, not an afterthought

RLS filters rows; it does not replace privileges. Two gaps RLS alone leaves open:

- **`TRUNCATE` is never row-filtered.** Postgres checks the `TRUNCATE` privilege
  and wipes the table without consulting a single policy. Before this work,
  `anon` held `TRUNCATE` on all 21 public tables.
- **`REFERENCES`** lets a role build a foreign key against a table to probe for
  values it cannot `SELECT`.

So: `anon` is stripped to `SELECT` on `blogs` and nothing else; `authenticated`
loses `TRUNCATE`/`REFERENCES`/`TRIGGER` everywhere, all access to the three
secret tables, and write access to pipeline/log tables. `ALTER DEFAULT
PRIVILEGES` stops the next table created by `postgres` from inheriting the same
over-broad grants.

## Safety net

The `ensure_rls` event trigger auto-enables RLS on any new table in `public`.
Its handler was moved from `public` to `private` (it was an RPC-callable
`SECURITY DEFINER` function); the trigger references it by OID and followed.

**A new table gets RLS but no policies — which denies everyone.** Write its
policies in the same migration that creates it.

## Verifying a change

```bash
# after any schema or policy change
```

Run the linter via the Supabase MCP `get_advisors` tool (security and
performance), or `supabase db advisors` on CLI v2.81.3+.

To test a policy by hand, impersonate a role in SQL:

```sql
set local role authenticated;
set local request.jwt.claims = '{"sub":"<user-uuid>","role":"authenticated"}';
select count(*) from public.projects;
```

## Known open item

**Leaked password protection is disabled.** It is an Auth dashboard setting, not
SQL — enable it under Authentication → Providers → Email in the Supabase
dashboard to check new passwords against HaveIBeenPwned.
