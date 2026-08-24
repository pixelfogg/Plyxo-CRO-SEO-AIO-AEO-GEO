import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function enableRLS() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is missing in .env.local');
    process.exit(1);
  }

  const pool = new Pool({ connectionString });
  
  try {
    const res = await pool.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public';
    `);
    
    for (const row of res.rows) {
      const table = row.tablename;
      console.log(`Enabling RLS on ${table}...`);
      await pool.query(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY;`);
    }
    
    console.log('Successfully enabled RLS on all public tables.');
  } catch (err) {
    console.error('Error enabling RLS:', err);
  } finally {
    await pool.end();
  }
}

enableRLS();
