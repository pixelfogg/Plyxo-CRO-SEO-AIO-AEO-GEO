-- =============================================================================
-- Merge the two SELECT policies on public.blogs into one per role.
--
-- Multiple permissive policies for the same role and command are OR'd together,
-- but Postgres evaluates every one of them on every row rather than
-- short-circuiting - the cost is paid per row, per policy (linter 0006).
-- Splitting by role instead of stacking policies on the same role gives the
-- same access with a single predicate evaluation.
--
-- Access is unchanged:
--   anon          -> published posts only
--   authenticated -> published posts, plus their own drafts
-- =============================================================================

drop policy if exists blogs_select_published on public.blogs;
drop policy if exists blogs_select_own       on public.blogs;

create policy blogs_select_published_anon
  on public.blogs for select
  to anon
  using ( published_at is not null
          and published_at <= (now() at time zone 'utc') );

create policy blogs_select_published_or_own
  on public.blogs for select
  to authenticated
  using (
    ( published_at is not null
      and published_at <= (now() at time zone 'utc') )
    or author_id = (select auth.uid())
  );
