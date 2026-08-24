const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres.qiqowjctcfjavwhbyqvj:Seema%407050011118@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres' });
pool.query("UPDATE auth.users SET email_confirmed_at = now() WHERE email = 'admin@cro-tool.com' RETURNING id, email_confirmed_at").then(res => { 
  console.log("Updated:", res.rows); 
  process.exit(0);
}).catch(err => { 
  console.error("Error:", err); 
  process.exit(1);
});
