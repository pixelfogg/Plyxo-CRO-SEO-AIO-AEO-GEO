import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const isCommunity = process.env.NEXT_PUBLIC_IS_CLOUD_EDITION !== 'true';
const defaultCommunityDb = process.env.COMMUNITY_DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:5432/plyxo_community';

const connectionString = isCommunity 
  ? (process.env.DATABASE_URL || defaultCommunityDb) 
  : (process.env.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:54322/postgres');
const isRemoteSupabase = !isCommunity && (connectionString?.includes('supabase.co') || connectionString?.includes('pooler.supabase.com'));

// Cache the database connection in development to prevent connection leaks on HMR
const globalForDb = globalThis as unknown as {
  conn: Pool | undefined;
};

const client = globalForDb.conn ?? new Pool({
  connectionString,
  ssl: isRemoteSupabase ? { rejectUnauthorized: false } : undefined,
  max: 10,
  idleTimeoutMillis: 30000,
});

if (process.env.NODE_ENV !== 'production') {
  globalForDb.conn = client;
}

export const db = drizzle(client, { schema });
