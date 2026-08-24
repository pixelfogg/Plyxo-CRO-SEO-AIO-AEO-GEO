const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres.qiqowjctcfjavwhbyqvj:Seema%407050011118@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres' });
pool.query(`
  INSERT INTO public.users (id, email, name, role) 
  VALUES ('1028f005-d4b1-4b65-8b76-8e7b8660bc44', 'admin@cro-tool.com', 'Admin', 'superadmin')
  ON CONFLICT (id) DO UPDATE SET role = 'superadmin'
  RETURNING *
`).then(res => { 
  console.log("Inserted:", res.rows); 
  process.exit(0);
}).catch(err => { 
  console.error("Error:", err); 
  process.exit(1);
});
