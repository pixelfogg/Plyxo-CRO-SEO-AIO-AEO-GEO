-- Manual migration: automation run history for the automations execution engine.
-- Run directly against the database (psql / Supabase SQL editor). Idempotent.

CREATE TABLE IF NOT EXISTS "automation_runs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "automation_id" uuid NOT NULL REFERENCES "automations"("id"),
  "status" text NOT NULL,
  "trigger" text NOT NULL,
  "detail" text,
  "created_at" timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "automation_runs_automation_id_idx" ON "automation_runs" ("automation_id");
CREATE INDEX IF NOT EXISTS "automation_runs_created_at_idx" ON "automation_runs" ("created_at");
