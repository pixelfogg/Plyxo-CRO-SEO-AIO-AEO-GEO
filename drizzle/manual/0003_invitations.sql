-- Manual migration: team invitations (SMTP email invite flow).
-- Run directly against the database (psql / Supabase SQL editor). Idempotent.

CREATE TABLE IF NOT EXISTS "invitations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id"),
  "email" text NOT NULL,
  "role" text DEFAULT 'member' NOT NULL,
  "token" text NOT NULL,
  "status" text DEFAULT 'pending' NOT NULL,
  "invited_by" uuid REFERENCES "users"("id"),
  "created_at" timestamp DEFAULT now(),
  "expires_at" timestamp,
  CONSTRAINT "invitations_token_unique" UNIQUE("token")
);

CREATE INDEX IF NOT EXISTS "invitations_org_id_idx" ON "invitations" ("organization_id");
CREATE INDEX IF NOT EXISTS "invitations_email_idx" ON "invitations" ("email");
