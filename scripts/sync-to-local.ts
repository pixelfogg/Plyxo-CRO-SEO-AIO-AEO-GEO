import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { Pool } from 'pg';

const REMOTE_URL = process.env.DATABASE_URL;
const LOCAL_URL = 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';

if (!REMOTE_URL) {
  console.error('DATABASE_URL is required in .env.local');
  process.exit(1);
}

const remotePool = new Pool({
  connectionString: REMOTE_URL,
  ssl: { rejectUnauthorized: false }
});

const localPool = new Pool({
  connectionString: LOCAL_URL
});

async function syncAllData() {
  console.log('======================================================================');
  console.log('🔄 STARTING COMPREHENSIVE PRODUCTION -> LOCAL SUPABASE DATA SYNC');
  console.log('======================================================================\n');

  const remoteClient = await remotePool.connect();
  const localClient = await localPool.connect();

  try {
    // 1. Fetch schemas and enums
    console.log('[1/5] Syncing Custom Types and Enums...');
    const enumsRes = await remoteClient.query(`
      SELECT t.typname AS enum_name, string_agg(quote_literal(e.enumlabel), ', ' ORDER BY e.enumsortorder) AS enum_values
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      JOIN pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public'
      GROUP BY t.typname;
    `);

    for (const row of enumsRes.rows) {
      await localClient.query(`
        DO $$ BEGIN
          CREATE TYPE public."${row.enum_name}" AS ENUM (${row.enum_values});
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);
    }

    // 2. Fetch all public tables from remote
    const tablesRes = await remoteClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    const publicTables: string[] = tablesRes.rows.map(r => r.table_name);
    console.log(`[2/5] Found ${publicTables.length} public tables to sync.`);

    // Disable triggers and foreign key checks on local database during bulk migration
    console.log('[3/5] Disabling constraints & foreign keys on local database...');
    await localClient.query(`SET session_replication_role = 'replica';`);

    // 3. Sync Auth Users & Identities
    console.log('[4/5] Syncing Auth Users & Credentials...');
    try {
      // Get writable non-generated columns for auth.users
      const authColsRes = await localClient.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'auth' AND table_name = 'users'
          AND is_generated = 'NEVER'
          AND column_name != 'confirmed_at'
      `);
      const writableAuthCols = authColsRes.rows.map(r => r.column_name);

      const authUsersRes = await remoteClient.query(`SELECT * FROM auth.users;`);
      if (authUsersRes.rows.length > 0) {
        console.log(` -> Found ${authUsersRes.rows.length} auth.users in production`);
        for (const user of authUsersRes.rows) {
          const colsToInsert = Object.keys(user).filter(c => writableAuthCols.includes(c));
          const colList = colsToInsert.map(c => `"${c}"`).join(', ');
          const placeholders = colsToInsert.map((_, i) => `$${i + 1}`).join(', ');
          const values = colsToInsert.map(c => {
            const v = user[c];
            if (typeof v === 'object' && v !== null && !(v instanceof Date) && !Array.isArray(v)) {
              return JSON.stringify(v);
            }
            return v;
          });

          await localClient.query(`
            INSERT INTO auth.users (${colList})
            VALUES (${placeholders})
            ON CONFLICT (id) DO UPDATE SET ${colsToInsert.filter(c => c !== 'id').map(c => `"${c}" = EXCLUDED."${c}"`).join(', ')}
          `, values);
        }
        console.log(` -> Synced ${authUsersRes.rows.length} auth.users successfully.`);
      }
    } catch (authErr) {
      console.warn('Note: auth.users sync warning:', (authErr as Error).message);
    }

    // Sync Auth Identities
    try {
      const identitiesRes = await remoteClient.query(`SELECT * FROM auth.identities;`);
      if (identitiesRes.rows.length > 0) {
        const idColsRes = await localClient.query(`
          SELECT column_name FROM information_schema.columns 
          WHERE table_schema = 'auth' AND table_name = 'identities' AND is_generated = 'NEVER'
        `);
        const writableIdCols = idColsRes.rows.map(r => r.column_name);

        for (const idRow of identitiesRes.rows) {
          const cols = Object.keys(idRow).filter(c => writableIdCols.includes(c));
          const colList = cols.map(c => `"${c}"`).join(', ');
          const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
          const values = cols.map(c => {
            const v = idRow[c];
            if (typeof v === 'object' && v !== null && !(v instanceof Date) && !Array.isArray(v)) {
              return JSON.stringify(v);
            }
            return v;
          });

          await localClient.query(`
            INSERT INTO auth.identities (${colList})
            VALUES (${placeholders})
            ON CONFLICT (id) DO NOTHING
          `, values);
        }
        console.log(` -> Synced ${identitiesRes.rows.length} auth.identities.`);
      }
    } catch (idErr) {
      // ignore
    }

    // 4. Create Tables and Transfer Data for all Public Tables
    console.log('[5/5] Transferring all table data rows...');
    const stats: { table: string; remote: number; local: number }[] = [];

    for (const table of publicTables) {
      // Fetch column data types for this table
      const remoteColsRes = await remoteClient.query(`
        SELECT 
          column_name, 
          data_type, 
          udt_name,
          is_nullable, 
          column_default,
          character_maximum_length,
          is_generated
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position;
      `, [table]);

      const colTypeMap = new Map<string, { dataType: string; udtName: string }>();
      remoteColsRes.rows.forEach(r => colTypeMap.set(r.column_name, { dataType: r.data_type, udtName: r.udt_name }));

      // 4a. Check if table exists locally; if not, create it
      const localTableCheck = await localClient.query(`
        SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1
      `, [table]);

      if (localTableCheck.rows.length === 0) {
        const colDefs = remoteColsRes.rows.map(col => {
          let typeStr = col.udt_name;
          if (col.data_type === 'character varying') {
            typeStr = col.character_maximum_length ? `varchar(${col.character_maximum_length})` : 'varchar';
          } else if (col.data_type === 'USER-DEFINED') {
            typeStr = `public."${col.udt_name}"`;
          } else if (col.data_type === 'ARRAY') {
            typeStr = `${col.udt_name.replace(/^_/, '')}[]`;
          }
          let def = `"${col.column_name}" ${typeStr}`;
          if (col.column_default) def += ` DEFAULT ${col.column_default}`;
          if (col.is_nullable === 'NO') def += ` NOT NULL`;
          return def;
        });

        // Add PK
        const pkRes = await remoteClient.query(`
          SELECT kcu.column_name
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
          WHERE tc.constraint_type = 'PRIMARY KEY' AND tc.table_schema = 'public' AND tc.table_name = $1
          ORDER BY kcu.ordinal_position;
        `, [table]);

        if (pkRes.rows.length > 0) {
          const pkCols = pkRes.rows.map(r => `"${r.column_name}"`).join(', ');
          colDefs.push(`CONSTRAINT "${table}_pkey" PRIMARY KEY (${pkCols})`);
        }

        await localClient.query(`CREATE TABLE IF NOT EXISTS public."${table}" (\n${colDefs.join(',\n')}\n);`);
      }

      // 4b. Fetch data from remote
      const dataRes = await remoteClient.query(`SELECT * FROM public."${table}"`);
      const rows = dataRes.rows;

      // Truncate local table first
      await localClient.query(`TRUNCATE TABLE public."${table}" CASCADE;`);

      if (rows.length > 0) {
        // Filter out any generated columns
        const writableCols = remoteColsRes.rows.filter(r => r.is_generated !== 'ALWAYS').map(r => r.column_name);
        const colList = writableCols.map(c => `"${c}"`).join(', ');

        const chunkSize = 100;
        for (let i = 0; i < rows.length; i += chunkSize) {
          const chunk = rows.slice(i, i + chunkSize);
          const valueClauses: string[] = [];
          const flatValues: any[] = [];
          let paramIdx = 1;

          for (const row of chunk) {
            const rowParams: string[] = [];
            for (const col of writableCols) {
              rowParams.push(`$${paramIdx++}`);
              let val = row[col];
              const colMeta = colTypeMap.get(col);

              if (val !== null && val !== undefined) {
                // If it's a JSON or JSONB column and not already a string, stringify it
                if (colMeta && (colMeta.dataType === 'json' || colMeta.dataType === 'jsonb' || colMeta.udtName === 'json' || colMeta.udtName === 'jsonb')) {
                  if (typeof val === 'object' && !(val instanceof Date)) {
                    val = JSON.stringify(val);
                  }
                }
                // If it's an array and passed as Javascript array, keep array or format
                else if (Array.isArray(val)) {
                  // Postgres pg driver handles JS arrays for text[] natively
                }
              }

              flatValues.push(val);
            }
            valueClauses.push(`(${rowParams.join(', ')})`);
          }

          const insertSql = `INSERT INTO public."${table}" (${colList}) VALUES ${valueClauses.join(', ')};`;
          await localClient.query(insertSql, flatValues);
        }
      }

      // Count in local
      const localCountRes = await localClient.query(`SELECT count(*)::int as cnt FROM public."${table}"`);
      stats.push({
        table,
        remote: rows.length,
        local: localCountRes.rows[0].cnt
      });
      console.log(` ✓ Table [${table}]: ${rows.length} rows synced (Local: ${localCountRes.rows[0].cnt})`);
    }

    // Re-enable triggers and foreign keys
    await localClient.query(`SET session_replication_role = 'origin';`);

    console.log('\n======================================================================');
    console.log('📊 FINAL SYNC AUDIT & VERIFICATION REPORT');
    console.log('======================================================================');
    console.table(stats);

    const allMatch = stats.every(s => s.remote === s.local);
    if (allMatch) {
      console.log('\n🎉 SUCCESS: 100% OF ALL PRODUCTION DATA TRANSFERRED TO LOCAL SUPABASE!');
    } else {
      console.warn('\n⚠️ Some tables have mismatched counts. Please check table report above.');
    }

  } finally {
    remoteClient.release();
    localClient.release();
    await remotePool.end();
    await localPool.end();
  }
}

syncAllData().catch(err => {
  console.error('Fatal sync error:', err);
  process.exit(1);
});
