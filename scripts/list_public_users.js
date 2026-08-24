const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres.qiqowjctcfjavwhbyqvj:Seema%407050011118@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres' });
pool.query('SELECT id, email, role FROM users').then(res => { 
  console.log("Users:", res.rows); 
  process.exit(0);
}).catch(err => { 
  console.error("Error:", err); 
  process.exit(1);
});
