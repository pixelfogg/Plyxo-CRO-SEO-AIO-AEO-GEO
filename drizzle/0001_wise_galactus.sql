CREATE TABLE "aeo_scans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"url" text NOT NULL,
	"target_query" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"citation_score" integer,
	"entities" jsonb,
	"recommendations" jsonb,
	"simulated_answer" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid,
	"project_id" uuid,
	"name" text NOT NULL,
	"key_hash" text NOT NULL,
	"scopes" jsonb DEFAULT '["read:audits","read:projects"]'::jsonb,
	"allowed_ips" jsonb,
	"expires_at" timestamp,
	"last_used_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "api_keys_key_hash_unique" UNIQUE("key_hash")
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"actor_id" uuid,
	"actor_email" text NOT NULL,
	"action" text NOT NULL,
	"resource" text NOT NULL,
	"ip_address" text,
	"status" text NOT NULL,
	"frameworks" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "automation_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"automation_id" uuid NOT NULL,
	"status" text NOT NULL,
	"trigger" text NOT NULL,
	"detail" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "automations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"integration_id" uuid,
	"name" text NOT NULL,
	"trigger" text NOT NULL,
	"action" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "blogs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"content" text NOT NULL,
	"author_id" uuid,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "blogs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "competitor_keyword_gaps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"competitor_id" uuid NOT NULL,
	"keyword" text NOT NULL,
	"volume" integer,
	"intent" text,
	"kd" integer,
	"my_position" integer,
	"comp_top_position" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "competitors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"da" integer,
	"traffic_share" integer,
	"overlap" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "dead_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"found_on_url" text NOT NULL,
	"target_url" text NOT NULL,
	"status_code" integer,
	"error_message" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "developer_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"project_id" uuid,
	"type" text NOT NULL,
	"action" text NOT NULL,
	"status" text NOT NULL,
	"status_code" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "integrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"credentials" jsonb,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"email" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"token" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"invited_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"expires_at" timestamp,
	CONSTRAINT "invitations_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "keyword_opportunities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"keyword" text NOT NULL,
	"volume" integer,
	"intent" text,
	"kd" integer,
	"cpc" real,
	"position" integer,
	"url" text,
	"trend" text DEFAULT 'flat',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "project_pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"url" text NOT NULL,
	"title" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"content_analysis" jsonb,
	"discovered_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"plan" text DEFAULT 'free' NOT NULL,
	"status" text DEFAULT 'inactive' NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"current_period_end" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "subscriptions_organization_id_unique" UNIQUE("organization_id")
);
--> statement-breakpoint
CREATE TABLE "uptime_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"status" text NOT NULL,
	"response_time" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "webhooks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"secret" text,
	"events" jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "is_up" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "last_pinged_at" timestamp;--> statement-breakpoint
ALTER TABLE "scan_issues" ADD COLUMN "bounding_box" jsonb;--> statement-breakpoint
ALTER TABLE "scans" ADD COLUMN "page_url" text;--> statement-breakpoint
ALTER TABLE "scans" ADD COLUMN "core_web_vitals" jsonb;--> statement-breakpoint
ALTER TABLE "scans" ADD COLUMN "screenshot_base64" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" text DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE "aeo_scans" ADD CONSTRAINT "aeo_scans_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_runs" ADD CONSTRAINT "automation_runs_automation_id_automations_id_fk" FOREIGN KEY ("automation_id") REFERENCES "public"."automations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automations" ADD CONSTRAINT "automations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automations" ADD CONSTRAINT "automations_integration_id_integrations_id_fk" FOREIGN KEY ("integration_id") REFERENCES "public"."integrations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blogs" ADD CONSTRAINT "blogs_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competitor_keyword_gaps" ADD CONSTRAINT "competitor_keyword_gaps_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competitor_keyword_gaps" ADD CONSTRAINT "competitor_keyword_gaps_competitor_id_competitors_id_fk" FOREIGN KEY ("competitor_id") REFERENCES "public"."competitors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competitors" ADD CONSTRAINT "competitors_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dead_links" ADD CONSTRAINT "dead_links_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "developer_logs" ADD CONSTRAINT "developer_logs_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "developer_logs" ADD CONSTRAINT "developer_logs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integrations" ADD CONSTRAINT "integrations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "keyword_opportunities" ADD CONSTRAINT "keyword_opportunities_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_pages" ADD CONSTRAINT "project_pages_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "uptime_logs" ADD CONSTRAINT "uptime_logs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhooks" ADD CONSTRAINT "webhooks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "aeo_scans_project_idx" ON "aeo_scans" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "api_keys_project_idx" ON "api_keys" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "developer_logs_project_idx" ON "developer_logs" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_pages_project_idx" ON "project_pages" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "webhooks_project_idx" ON "webhooks" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "org_members_org_idx" ON "organization_members" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "org_members_user_idx" ON "organization_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "scan_issues_scan_idx" ON "scan_issues" USING btree ("scan_id");--> statement-breakpoint
CREATE INDEX "scans_project_idx" ON "scans" USING btree ("project_id");