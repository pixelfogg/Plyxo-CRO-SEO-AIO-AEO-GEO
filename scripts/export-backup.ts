import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function exportFullBackup() {
  console.log('[Backup] Connecting to Supabase PostgreSQL...');
  const client = await pool.connect();

  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const sqlFilePath = path.join(backupDir, `supabase_full_dump_${timestamp}.sql`);
    const jsonFilePath = path.join(backupDir, `supabase_full_data_${timestamp}.json`);

    let sqlOutput = `-- ==================================================================\n`;
    sqlOutput += `-- SUPABASE POSTGRESQL DATABASE FULL DUMP & BACKUP\n`;
    sqlOutput += `-- Generated At: ${new Date().toISOString()}\n`;
    sqlOutput += `-- Database: ${process.env.DATABASE_URL?.split('@')[1] || 'Supabase'}\n`;
    sqlOutput += `-- ==================================================================\n\n`;
    sqlOutput += `SET statement_timeout = 0;\n`;
    sqlOutput += `SET lock_timeout = 0;\n`;
    sqlOutput += `SET client_encoding = 'UTF8';\n`;
    sqlOutput += `SET standard_conforming_strings = on;\n`;
    sqlOutput += `SET check_function_bodies = false;\n`;
    sqlOutput += `SET client_min_messages = warning;\n`;
    sqlOutput += `SET row_security = off;\n\n`;
    sqlOutput += `BEGIN;\n\n`;

    // 1. Fetch all public enums / custom types
    console.log('[Backup] Fetching Enums and Custom Types...');
    const enumsRes = await client.query(`
      SELECT t.typname AS enum_name, string_agg(quote_literal(e.enumlabel), ', ' ORDER BY e.enumsortorder) AS enum_values
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      JOIN pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public'
      GROUP BY t.typname;
    `);

    if (enumsRes.rows.length > 0) {
      sqlOutput += `-- ------------------------------------------------------------------\n`;
      sqlOutput += `-- 1. CUSTOM ENUMS & TYPES\n`;
      sqlOutput += `-- ------------------------------------------------------------------\n\n`;
      for (const row of enumsRes.rows) {
        sqlOutput += `DO $$ BEGIN\n`;
        sqlOutput += `  CREATE TYPE public."${row.enum_name}" AS ENUM (${row.enum_values});\n`;
        sqlOutput += `EXCEPTION\n`;
        sqlOutput += `  WHEN duplicate_object THEN null;\n`;
        sqlOutput += `END $$;\n\n`;
      }
    }

    // 2. Fetch all public tables in topological / dependency order
    console.log('[Backup] Fetching Table Schemas...');
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    const tableNames: string[] = tablesRes.rows.map(r => r.table_name);
    console.log(`[Backup] Found ${tableNames.length} tables:`, tableNames.join(', '));

    const jsonData: Record<string, any[]> = {};

    sqlOutput += `-- ------------------------------------------------------------------\n`;
    sqlOutput += `-- 2. TABLE DEFINITIONS & CONSTRAINTS\n`;
    sqlOutput += `-- ------------------------------------------------------------------\n\n`;

    for (const table of tableNames) {
      // Get column definitions
      const colsRes = await client.query(`
        SELECT 
          column_name, 
          data_type, 
          udt_name,
          is_nullable, 
          column_default,
          character_maximum_length
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position;
      `, [table]);

      sqlOutput += `CREATE TABLE IF NOT EXISTS public."${table}" (\n`;
      const colDefs = colsRes.rows.map(col => {
        let typeStr = col.udt_name;
        if (col.data_type === 'character varying') {
          typeStr = col.character_maximum_length ? `varchar(${col.character_maximum_length})` : 'varchar';
        } else if (col.data_type === 'USER-DEFINED') {
          typeStr = `public."${col.udt_name}"`;
        } else if (col.data_type === 'ARRAY') {
          typeStr = `${col.udt_name.replace(/^_/, '')}[]`;
        }

        let def = `  "${col.column_name}" ${typeStr}`;
        if (col.column_default) {
          def += ` DEFAULT ${col.column_default}`;
        }
        if (col.is_nullable === 'NO') {
          def += ` NOT NULL`;
        }
        return def;
      });

      // Primary Key
      const pkRes = await client.query(`
        SELECT kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        WHERE tc.constraint_type = 'PRIMARY KEY'
          AND tc.table_schema = 'public'
          AND tc.table_name = $1
        ORDER BY kcu.ordinal_position;
      `, [table]);

      if (pkRes.rows.length > 0) {
        const pkCols = pkRes.rows.map(r => `"${r.column_name}"`).join(', ');
        colDefs.push(`  CONSTRAINT "${table}_pkey" PRIMARY KEY (${pkCols})`);
      }

      sqlOutput += colDefs.join(',\n');
      sqlOutput += `\n);\n\n`;
    }

    // 3. Export Data for all tables
    sqlOutput += `-- ------------------------------------------------------------------\n`;
    sqlOutput += `-- 3. TABLE DATA DUMPS (INSERTS)\n`;
    sqlOutput += `-- ------------------------------------------------------------------\n\n`;

    for (const table of tableNames) {
      console.log(`[Backup] Exporting data from table: ${table}...`);
      const dataRes = await client.query(`SELECT * FROM public."${table}"`);
      const rows = dataRes.rows;
      jsonData[table] = rows;

      if (rows.length > 0) {
        sqlOutput += `-- Data for Name: ${table}; Type: TABLE DATA; Rows: ${rows.length}\n`;
        const columns = Object.keys(rows[0]);
        const colList = columns.map(c => `"${c}"`).join(', ');

        for (const row of rows) {
          const valList = columns.map(col => {
            const val = row[col];
            if (val === null || val === undefined) return 'NULL';
            if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
            if (typeof val === 'number') return String(val);
            if (val instanceof Date) return `'${val.toISOString()}'::timestamp with time zone`;
            if (typeof val === 'object') {
              const str = JSON.stringify(val).replace(/'/g, "''");
              return `'${str}'::jsonb`;
            }
            // String / text escaping
            const strVal = String(val).replace(/'/g, "''");
            return `'${strVal}'`;
          }).join(', ');

          sqlOutput += `INSERT INTO public."${table}" (${colList}) VALUES (${valList}) ON CONFLICT DO NOTHING;\n`;
        }
        sqlOutput += `\n`;
      }
    }

    // 4. Fetch Indexes
    console.log('[Backup] Fetching Indexes...');
    const indexesRes = await client.query(`
      SELECT indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND indexname NOT LIKE '%_pkey';
    `);

    if (indexesRes.rows.length > 0) {
      sqlOutput += `-- ------------------------------------------------------------------\n`;
      sqlOutput += `-- 4. INDEXES & CONSTRAINTS\n`;
      sqlOutput += `-- ------------------------------------------------------------------\n\n`;
      for (const row of indexesRes.rows) {
        sqlOutput += `${row.indexdef};\n`;
      }
      sqlOutput += `\n`;
    }

    sqlOutput += `COMMIT;\n\n`;
    sqlOutput += `-- Backup completed successfully at ${new Date().toISOString()}\n`;

    fs.writeFileSync(sqlFilePath, sqlOutput, 'utf-8');
    fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2), 'utf-8');

    // Also write a convenient latest alias
    const latestSqlPath = path.join(backupDir, 'supabase_backup_latest.sql');
    const latestJsonPath = path.join(backupDir, 'supabase_backup_latest.json');
    fs.writeFileSync(latestSqlPath, sqlOutput, 'utf-8');
    fs.writeFileSync(latestJsonPath, JSON.stringify(jsonData, null, 2), 'utf-8');

    console.log(`\n======================================================`);
    console.log(`[Backup Success] Full database dump completed!`);
    console.log(`- SQL Dump: ${sqlFilePath} (${(fs.statSync(sqlFilePath).size / 1024).toFixed(2)} KB)`);
    console.log(`- JSON Data: ${jsonFilePath} (${(fs.statSync(jsonFilePath).size / 1024).toFixed(2)} KB)`);
    console.log(`- Latest SQL: ${latestSqlPath}`);
    console.log(`- Latest JSON: ${latestJsonPath}`);
    console.log(`======================================================\n`);

  } finally {
    client.release();
    await pool.end();
  }
}

exportFullBackup().catch((err) => {
  console.error('[Backup Error]:', err);
  process.exit(1);
});
