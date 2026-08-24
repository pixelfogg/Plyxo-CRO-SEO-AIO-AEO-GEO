-- Manual migration: fix columns that were incorrectly declared as `serial`.
--
-- statusCode / responseTime / citationScore were auto-incrementing sequences,
-- which is wrong for a value column. Convert them to plain integer and drop the
-- backing sequences. Run this directly against the database (psql / Supabase
-- SQL editor). It is idempotent and safe on existing data.
--
-- NOTE: the drizzle migration snapshot in this repo is out of sync with the live
-- database (schema was applied via `push`), so `drizzle-kit generate` produces a
-- spurious full-create diff. This targeted script avoids that. Re-baseline the
-- drizzle snapshots separately when convenient.

-- dead_links.status_code
ALTER TABLE "dead_links" ALTER COLUMN "status_code" DROP DEFAULT;
ALTER TABLE "dead_links" ALTER COLUMN "status_code" TYPE integer USING "status_code"::integer;
DROP SEQUENCE IF EXISTS "dead_links_status_code_seq";

-- uptime_logs.response_time
ALTER TABLE "uptime_logs" ALTER COLUMN "response_time" DROP DEFAULT;
ALTER TABLE "uptime_logs" ALTER COLUMN "response_time" TYPE integer USING "response_time"::integer;
DROP SEQUENCE IF EXISTS "uptime_logs_response_time_seq";

-- aeo_scans.citation_score
ALTER TABLE "aeo_scans" ALTER COLUMN "citation_score" DROP DEFAULT;
ALTER TABLE "aeo_scans" ALTER COLUMN "citation_score" TYPE integer USING "citation_score"::integer;
DROP SEQUENCE IF EXISTS "aeo_scans_citation_score_seq";
