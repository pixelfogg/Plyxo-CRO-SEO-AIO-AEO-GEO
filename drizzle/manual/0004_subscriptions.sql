-- Manual migration: Stripe billing subscriptions.
-- Run directly against the database (psql / Supabase SQL editor). Idempotent.

CREATE TABLE IF NOT EXISTS "subscriptions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id"),
  "plan" text DEFAULT 'free' NOT NULL,
  "status" text DEFAULT 'inactive' NOT NULL,
  "stripe_customer_id" text,
  "stripe_subscription_id" text,
  "current_period_end" timestamp,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now(),
  CONSTRAINT "subscriptions_organization_id_unique" UNIQUE("organization_id")
);
