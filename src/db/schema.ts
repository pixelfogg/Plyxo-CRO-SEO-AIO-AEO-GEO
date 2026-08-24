import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  jsonb,
  uuid,
  integer,
  real,
  index,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(), // Maps to Supabase auth.users id
  email: text("email").notNull().unique(),
  name: text("name"),
  avatarUrl: text("avatar_url"),
  role: text("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const organizationMembers = pgTable("organization_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").references(() => organizations.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  role: text("role").default("member").notNull(), // admin, member
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  orgIdx: index("org_members_org_idx").on(table.organizationId),
  userIdx: index("org_members_user_idx").on(table.userId),
}));

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").references(() => organizations.id),
  userId: uuid("user_id").references(() => users.id), // For personal projects (Community Edition)
  name: text("name").notNull(),
  websiteUrl: text("website_url").notNull(),
  industry: text("industry"),
  brandColors: jsonb("brand_colors"),
  targetAudience: text("target_audience"),
  businessType: text("business_type"),
  conversionGoal: text("conversion_goal"),
  isUp: boolean("is_up").default(true),
  lastPingedAt: timestamp("last_pinged_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const projectPages = pgTable("project_pages", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").references(() => projects.id).notNull(),
  url: text("url").notNull(),
  title: text("title"),
  status: text("status").default("pending").notNull(), // pending, scanned
  contentAnalysis: jsonb("content_analysis"), // Stores SEO, Grammar, Spelling analysis results
  discoveredAt: timestamp("discovered_at").defaultNow(),
}, (table) => ({
  projectIdx: index("project_pages_project_idx").on(table.projectId),
}));

export const keywordOpportunities = pgTable("keyword_opportunities", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").references(() => projects.id).notNull(),
  keyword: text("keyword").notNull(),
  volume: integer("volume"),
  intent: text("intent"), // informational, commercial, transactional, navigational
  kd: integer("kd"),
  cpc: real("cpc"),
  position: integer("position"),
  url: text("url"),
  trend: text("trend").default("flat"), // up, down, flat
  createdAt: timestamp("created_at").defaultNow(),
});

export const rankingSuggestions = pgTable("ranking_suggestions", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").references(() => projects.id).notNull(),
  title: text("title").notNull(),
  area: text("area").notNull(),
  priority: text("priority").notNull(),
  impact: text("impact").notNull(),
  recommendation: text("recommendation").notNull(),
  example: text("example"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const rankingSuggestionsRelations = relations(rankingSuggestions, ({ one }) => ({
  project: one(projects, {
    fields: [rankingSuggestions.projectId],
    references: [projects.id],
  }),
}));

export const competitors = pgTable("competitors", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").references(() => projects.id).notNull(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  da: integer("da"),
  trafficShare: integer("traffic_share"),
  overlap: integer("overlap"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const competitorKeywordGaps = pgTable("competitor_keyword_gaps", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").references(() => projects.id).notNull(),
  competitorId: uuid("competitor_id").references(() => competitors.id).notNull(),
  keyword: text("keyword").notNull(),
  volume: integer("volume"),
  intent: text("intent"),
  kd: integer("kd"),
  myPosition: integer("my_position"),
  compTopPosition: integer("comp_top_position"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const deadLinks = pgTable("dead_links", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").references(() => projects.id).notNull(),
  foundOnUrl: text("found_on_url").notNull(),
  targetUrl: text("target_url").notNull(),
  statusCode: integer("status_code"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const scans = pgTable("scans", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").references(() => projects.id).notNull(),
  pageUrl: text("page_url"), // URL of the specific page scanned, defaults to project root if null
  status: text("status").default("pending").notNull(), // pending, running, completed, failed
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  scores: jsonb("scores"), // { seo: 90, performance: 80, accessibility: 95, cro: 85 }
  coreWebVitals: jsonb("core_web_vitals"), // { lcp: 2.5, cls: 0.1, inp: 200, score: 90 }
  screenshotBase64: text("screenshot_base64"), // Base64 JPEG
  tokensConsumed: integer("tokens_consumed").default(0),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  projectIdx: index("scans_project_idx").on(table.projectId),
}));

export const scanIssues = pgTable("scan_issues", {
  id: uuid("id").primaryKey().defaultRandom(),
  scanId: uuid("scan_id").references(() => scans.id).notNull(),
  category: text("category").notNull(), // seo, performance, visual, copywriting, accessibility, aeo
  title: text("title").notNull(),
  description: text("description").notNull(),
  priority: text("priority").notNull(), // low, medium, high, critical
  severity: text("severity").notNull(),
  businessImpact: text("business_impact"),
  difficulty: text("difficulty"),
  expectedConversionGain: text("expected_conversion_gain"),
  implementationSteps: jsonb("implementation_steps"),
  aiGeneratedExample: text("ai_generated_example"),
  boundingBox: jsonb("bounding_box"), // [ymin, xmin, ymax, xmax] normalized 0-1000
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  scanIdx: index("scan_issues_scan_idx").on(table.scanId),
}));

export const featureFlags = pgTable("feature_flags", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  isEnabled: boolean("is_enabled").default(false),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const projectsRelations = relations(projects, ({ many }) => ({
  scans: many(scans),
  pages: many(projectPages),
  uptimeLogs: many(uptimeLogs),
  deadLinks: many(deadLinks),
  aeoScans: many(aeoScans),
  keywordOpportunities: many(keywordOpportunities),
  competitors: many(competitors),
  competitorKeywordGaps: many(competitorKeywordGaps),
  rankingSuggestions: many(rankingSuggestions),
}));

export const competitorsRelations = relations(competitors, ({ one, many }) => ({
  project: one(projects, {
    fields: [competitors.projectId],
    references: [projects.id],
  }),
  keywordGaps: many(competitorKeywordGaps),
}));

export const competitorKeywordGapsRelations = relations(competitorKeywordGaps, ({ one }) => ({
  project: one(projects, {
    fields: [competitorKeywordGaps.projectId],
    references: [projects.id],
  }),
  competitor: one(competitors, {
    fields: [competitorKeywordGaps.competitorId],
    references: [competitors.id],
  }),
}));

export const scansRelations = relations(scans, ({ one, many }) => ({
  project: one(projects, {
    fields: [scans.projectId],
    references: [projects.id],
  }),
  issues: many(scanIssues),
}));

export const scanIssuesRelations = relations(scanIssues, ({ one }) => ({
  scan: one(scans, {
    fields: [scanIssues.scanId],
    references: [scans.id],
  }),
}));

export const blogs = pgTable("blogs", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  authorId: uuid("author_id").references(() => users.id),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const uptimeLogs = pgTable("uptime_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").references(() => projects.id).notNull(),
  status: text("status").notNull(), // 'up', 'down'
  responseTime: integer("response_time"), // ms
  createdAt: timestamp("created_at").defaultNow(),
});

export const uptimeLogsRelations = relations(uptimeLogs, ({ one }) => ({
  project: one(projects, {
    fields: [uptimeLogs.projectId],
    references: [projects.id],
  }),
}));

export const integrations = pgTable("integrations", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").references(() => organizations.id).notNull(),
  provider: text("provider").notNull(), // 'slack', 'ga4', 'jira', 'mixpanel'
  credentials: jsonb("credentials"), // OAuth tokens or API keys
  status: text("status").default("active").notNull(), // 'active', 'disconnected', 'error'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const automations = pgTable("automations", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").references(() => organizations.id).notNull(),
  integrationId: uuid("integration_id").references(() => integrations.id), // Can be null if it's an internal automation
  name: text("name").notNull(),
  trigger: text("trigger").notNull(), // e.g. 'Test Reaches 95% Significance'
  action: text("action").notNull(), // e.g. 'Send Message to #marketing-updates'
  status: text("status").default("active").notNull(), // 'active', 'paused'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const automationRuns = pgTable("automation_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  automationId: uuid("automation_id").references(() => automations.id).notNull(),
  status: text("status").notNull(), // 'success', 'failed', 'skipped'
  trigger: text("trigger").notNull(), // the event that fired the run, e.g. 'scan.completed'
  detail: text("detail"), // human-readable result / error / skip reason
  createdAt: timestamp("created_at").defaultNow(),
});

export const automationRunsRelations = relations(automationRuns, ({ one }) => ({
  automation: one(automations, {
    fields: [automationRuns.automationId],
    references: [automations.id],
  }),
}));

export const organizationsRelations = relations(organizations, ({ many }) => ({
  members: many(organizationMembers),
  projects: many(projects),
  integrations: many(integrations),
  automations: many(automations),
}));

export const integrationsRelations = relations(integrations, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [integrations.organizationId],
    references: [organizations.id],
  }),
  automations: many(automations),
}));

export const automationsRelations = relations(automations, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [automations.organizationId],
    references: [organizations.id],
  }),
  integration: one(integrations, {
    fields: [automations.integrationId],
    references: [integrations.id],
  }),
  runs: many(automationRuns),
}));

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").references(() => organizations.id).notNull().unique(),
  planId: uuid("plan_id"), // Will add reference later manually or use relations
  plan: text("plan").default("free").notNull(), // 'free', 'pro' (legacy)
  status: text("status").default("inactive").notNull(), // 'active', 'trialing', 'past_due', 'canceled', 'inactive'
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  gatewayCustomerId: text("gateway_customer_id"), 
  gatewaySubscriptionId: text("gateway_subscription_id"),
  activeGateway: text("active_gateway"), // 'stripe', 'dodo', etc
  currentPeriodEnd: timestamp("current_period_end"),
  tokensAllowed: integer("tokens_allowed"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  organization: one(organizations, {
    fields: [subscriptions.organizationId],
    references: [organizations.id],
  }),
}));

export const invitations = pgTable("invitations", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").references(() => organizations.id).notNull(),
  email: text("email").notNull(),
  role: text("role").default("member").notNull(),
  token: text("token").notNull().unique(),
  status: text("status").default("pending").notNull(), // pending, accepted, revoked
  invitedBy: uuid("invited_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

export const invitationsRelations = relations(invitations, ({ one }) => ({
  organization: one(organizations, {
    fields: [invitations.organizationId],
    references: [organizations.id],
  }),
}));

export const aeoScans = pgTable("aeo_scans", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").references(() => projects.id).notNull(),
  url: text("url").notNull(),
  targetQuery: text("target_query").notNull(),
  status: text("status").default("pending").notNull(), // pending, running, completed, failed
  citationScore: integer("citation_score"),
  entities: jsonb("entities"), // Array of extracted entities
  recommendations: jsonb("recommendations"), // Array of recommendations
  simulatedAnswer: text("simulated_answer"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  projectIdx: index("aeo_scans_project_idx").on(table.projectId),
}));

export const aeoScansRelations = relations(aeoScans, ({ one }) => ({
  project: one(projects, {
    fields: [aeoScans.projectId],
    references: [projects.id],
  }),
}));

export const apiKeys = pgTable("api_keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").references(() => organizations.id), // For Account-level keys, or to just track org
  projectId: uuid("project_id").references(() => projects.id), // Null means it's an Account-level key
  name: text("name").notNull(),
  keyHash: text("key_hash").notNull().unique(), // We store a hash of the key for security
  scopes: jsonb("scopes").default(["read:audits", "read:projects"]), // e.g. ["read:audits", "write:audits", "trigger:scan"]
  allowedIps: jsonb("allowed_ips"), // Array of IP strings
  expiresAt: timestamp("expires_at"),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  projectIdx: index("api_keys_project_idx").on(table.projectId),
}));

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  project: one(projects, {
    fields: [apiKeys.projectId],
    references: [projects.id],
  }),
  organization: one(organizations, {
    fields: [apiKeys.organizationId],
    references: [organizations.id],
  }),
}));

export const webhooks = pgTable("webhooks", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").references(() => projects.id).notNull(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  secret: text("secret"), // Optional secret to sign payloads
  events: jsonb("events"), // e.g. ["scan.completed"]
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  projectIdx: index("webhooks_project_idx").on(table.projectId),
}));

export const webhooksRelations = relations(webhooks, ({ one }) => ({
  project: one(projects, {
    fields: [webhooks.projectId],
    references: [projects.id],
  }),
}));

export const developerLogs = pgTable("developer_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").references(() => organizations.id).notNull(),
  projectId: uuid("project_id").references(() => projects.id),
  type: text("type").notNull(), // "api" or "webhook"
  action: text("action").notNull(),
  status: text("status").notNull(), // "success" or "error"
  statusCode: integer("status_code"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  projectIdx: index("developer_logs_project_idx").on(table.projectId),
}));

export const developerLogsRelations = relations(developerLogs, ({ one }) => ({
  organization: one(organizations, {
    fields: [developerLogs.orgId],
    references: [organizations.id],
  }),
  project: one(projects, {
    fields: [developerLogs.projectId],
    references: [projects.id],
  }),
}));

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").references(() => organizations.id).notNull(),
  actorId: uuid("actor_id").references(() => users.id),
  actorEmail: text("actor_email").notNull(),
  action: text("action").notNull(),
  resource: text("resource").notNull(),
  ipAddress: text("ip_address"),
  status: text("status").notNull(), // 'success' or 'error'
  frameworks: jsonb("frameworks"), // Array of tags e.g. ["SOC 2: CC6.1"]
  createdAt: timestamp("created_at").defaultNow(),
});

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  organization: one(organizations, {
    fields: [auditLogs.orgId],
    references: [organizations.id],
  }),
  actor: one(users, {
    fields: [auditLogs.actorId],
    references: [users.id],
  }),
}));

export const paymentGateways = pgTable("payment_gateways", {
  id: uuid("id").primaryKey().defaultRandom(),
  provider: text("provider").notNull().unique(), // 'stripe', 'dodo', 'razorpay'
  apiKey: text("api_key"),
  secretKey: text("secret_key"),
  webhookSecret: text("webhook_secret"),
  isDefault: boolean("is_default").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const subscriptionPlans = pgTable("subscription_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  price: real("price").notNull(),
  currency: text("currency").default("USD").notNull(),
  interval: text("interval").default("month").notNull(), // 'month', 'year'
  features: jsonb("features"),
  stripeProductId: text("stripe_product_id"),
  dodoProductId: text("dodo_product_id"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const coupons = pgTable("coupons", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  discountAmount: real("discount_amount").notNull(),
  discountType: text("discount_type").default("percentage").notNull(), // 'percentage', 'fixed'
  maxRedemptions: integer("max_redemptions"),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});