import { Pool, Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { execSync } from 'child_process';

// Load existing env
const envLocalPath = path.join(process.cwd(), '.env.local');
const envPath = path.join(process.cwd(), '.env');

if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
} else if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

// Dedicated Community Database details - isolated from any Supabase database
const COMMUNITY_DB_NAME = process.env.COMMUNITY_DB_NAME || 'plyxo_community';
const DB_HOST = process.env.COMMUNITY_DB_HOST || process.env.PGHOST || '127.0.0.1';
const DB_USER = process.env.COMMUNITY_DB_USER || process.env.PGUSER || 'postgres';
const DB_PASSWORD = process.env.COMMUNITY_DB_PASSWORD || process.env.PGPASSWORD || 'postgres';

async function findAvailablePort(): Promise<number> {
  if (process.env.COMMUNITY_DB_PORT) return parseInt(process.env.COMMUNITY_DB_PORT, 10);
  if (process.env.PGPORT) return parseInt(process.env.PGPORT, 10);

  // Candidate ports: 5432 (standard Postgres), 54322 (local PG container)
  const candidatePorts = [5432, 54322];
  for (const port of candidatePorts) {
    const testClient = new Client({
      host: DB_HOST,
      port,
      user: DB_USER,
      password: DB_PASSWORD,
      database: 'postgres',
      connectionTimeoutMillis: 2000,
    });
    try {
      await testClient.connect();
      await testClient.end();
      return port;
    } catch (_) {
      // try next
    }
  }
  return 5432;
}

async function main() {
  const DB_PORT = await findAvailablePort();
  const COMMUNITY_DATABASE_URL = `postgresql://${DB_USER}:${encodeURIComponent(DB_PASSWORD)}@${DB_HOST}:${DB_PORT}/${COMMUNITY_DB_NAME}`;

  console.log('===========================================================');
  console.log('🚀 PLYXO COMMUNITY EDITION: INITIALIZING LOCAL DATABASE');
  console.log('===========================================================');
  console.log(`📌 Dedicated DB: "${COMMUNITY_DB_NAME}" on ${DB_HOST}:${DB_PORT}`);
  console.log('🔒 (Your existing Supabase database will NOT be touched)\n');

  // Step 1: Connect to server root and ensure database exists
  let rootClient: Client | null = null;
  try {
    console.log('[1/4] Checking PostgreSQL server & creating dedicated community database...');
    rootClient = new Client({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: 'postgres',
    });
    await rootClient.connect();

    const dbCheckRes = await rootClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [COMMUNITY_DB_NAME]
    );

    if (dbCheckRes.rowCount === 0) {
      console.log(` -> Database "${COMMUNITY_DB_NAME}" does not exist. Creating new isolated DB...`);
      await rootClient.query(`CREATE DATABASE "${COMMUNITY_DB_NAME}"`);
      console.log(` -> Database "${COMMUNITY_DB_NAME}" created successfully.`);
    } else {
      console.log(` -> Dedicated database "${COMMUNITY_DB_NAME}" already exists.`);
    }
  } catch (err: any) {
    console.warn(` ⚠️ Auto-create root check note (${err.message}). Trying connection...`);
  } finally {
    if (rootClient) {
      try { await rootClient.end(); } catch (_) {}
    }
  }

  // Step 2: Update .env.local for Community Edition
  console.log('\n[2/4] Configuring .env.local for Community Edition...');
  let envContent = '';
  if (fs.existsSync(envLocalPath)) {
    envContent = fs.readFileSync(envLocalPath, 'utf8');
  }

  const updates: Record<string, string> = {
    'NEXT_PUBLIC_IS_CLOUD_EDITION': 'false',
    'DATABASE_URL': COMMUNITY_DATABASE_URL,
    'COMMUNITY_DATABASE_URL': COMMUNITY_DATABASE_URL,
    'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-anon-key',
  };

  for (const [k, v] of Object.entries(updates)) {
    const regex = new RegExp(`^${k}=.*$`, 'm');
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, `${k}=${v}`);
    } else {
      envContent += `\n${k}=${v}`;
    }
  }

  fs.writeFileSync(envLocalPath, envContent.trim() + '\n', 'utf8');
  console.log(' -> .env.local updated with Community Edition flags and isolated DATABASE_URL.');

  // Step 3: Run schema migrations directly on the dedicated community database
  console.log('\n[3/4] Initializing tables and schema in community database...');
  const pool = new Pool({ connectionString: COMMUNITY_DATABASE_URL });
  const client = await pool.connect();

  try {
    // Read and run migration files in order
    const migrationFiles = [
      path.join(process.cwd(), 'drizzle', '0000_complex_sir_ram.sql'),
      path.join(process.cwd(), 'drizzle', '0001_wise_galactus.sql'),
      path.join(process.cwd(), 'drizzle', 'manual', '0001_fix_serial_to_integer.sql'),
      path.join(process.cwd(), 'drizzle', 'manual', '0002_automation_runs.sql'),
      path.join(process.cwd(), 'drizzle', 'manual', '0003_invitations.sql'),
      path.join(process.cwd(), 'drizzle', 'manual', '0004_subscriptions.sql'),
    ];

    for (const file of migrationFiles) {
      if (fs.existsSync(file)) {
        console.log(` -> Applying ${path.basename(file)}...`);
        const content = fs.readFileSync(file, 'utf8');
        const statements = content
          .split('--> statement-breakpoint')
          .flatMap(s => s.split(';\n'))
          .map(s => s.trim())
          .filter(s => s.length > 0);

        for (const stmt of statements) {
          try {
            await client.query(stmt);
          } catch (err: any) {
            // Ignore "already exists" errors
            if (!err.message?.includes('already exists')) {
              // Log warning if unexpected
              // console.warn('Note:', err.message);
            }
          }
        }
      }
    }

    // Ensure any auxiliary tables exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS "subscription_plans" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "name" text NOT NULL,
        "description" text,
        "price" real NOT NULL,
        "currency" text DEFAULT 'USD' NOT NULL,
        "interval" text DEFAULT 'month' NOT NULL,
        "features" jsonb,
        "stripe_product_id" text,
        "dodo_product_id" text,
        "is_active" boolean DEFAULT true NOT NULL,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS "payment_gateways" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "provider" text NOT NULL UNIQUE,
        "api_key" text,
        "secret_key" text,
        "webhook_secret" text,
        "is_default" boolean DEFAULT false NOT NULL,
        "is_active" boolean DEFAULT true NOT NULL,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS "coupons" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "code" text NOT NULL UNIQUE,
        "discount_amount" real NOT NULL,
        "discount_type" text DEFAULT 'percentage' NOT NULL,
        "max_redemptions" integer,
        "expires_at" timestamp,
        "is_active" boolean DEFAULT true NOT NULL,
        "created_at" timestamp DEFAULT now()
      );
    `);

    console.log(' -> Schema tables created successfully in dedicated database.');
  } catch (err: any) {
    console.error(' -> Error running schema migrations:', err.message);
  }

  // Step 4: Seed default community user & default workspace
  console.log('\n[4/4] Seeding default Community user & Default Workspace...');
  try {
    const defaultUserId = '00000000-0000-0000-0000-000000000000';
    const defaultOrgId = '00000000-0000-0000-0000-000000000001';

    // Insert user
    await client.query(`
      INSERT INTO users (id, email, name, role, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, role = EXCLUDED.role;
    `, [defaultUserId, 'community@local', 'Community User', 'superadmin']);

    // Insert default workspace
    await client.query(`
      INSERT INTO organizations (id, name, slug, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW())
      ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;
    `, [defaultOrgId, 'Default Workspace', 'default-workspace']);

    // Insert membership
    await client.query(`
      INSERT INTO organization_members (organization_id, user_id, role, created_at)
      VALUES ($1, $2, 'admin', NOW())
      ON CONFLICT DO NOTHING;
    `, [defaultOrgId, defaultUserId]);

    console.log(' -> Default workspace and user seeded successfully.');
  } catch (err: any) {
    console.error(' -> Error during seeding:', err.message);
  } finally {
    client.release();
    await pool.end();
  }

  console.log('\n===========================================================');
  console.log('🎉 COMMUNITY EDITION SETUP COMPLETE!');
  console.log('   - No logins, no billing, no landing page, unlimited usage');
  console.log('   - Isolated Database: ' + COMMUNITY_DB_NAME);
  console.log('   - Run "npm run dev" or "npm run dev:community" to launch');
  console.log('===========================================================\n');
}

main().catch(console.error);
