import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import { eq } from 'drizzle-orm';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("1. Signing up new superadmin (admin@cro-tool.com)...");
  
  const email = 'admin@cro-tool.com';
  const password = 'SuperAdminPassword123!';

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error('Error creating user (might already exist):', error.message);
  } else {
    console.log('User created in Auth successfully:', data.user?.email);
  }

  // Wait a moment for webhook to sync auth user to public.users (if any), 
  // or just directly update if it's there.
  await new Promise((resolve) => setTimeout(resolve, 2000));

  console.log("2. Promoting new superadmin in DB...");
  const { db } = await import('../src/db');
  const { users } = await import('../src/db/schema');
  await db.update(users)
    .set({ role: 'superadmin' })
    .where(eq(users.email, email));

  console.log("3. Demoting sameer.hassan06@gmail.com in DB to 'user'...");
  await db.update(users)
    .set({ role: 'user' })
    .where(eq(users.email, 'sameer.hassan06@gmail.com'));

  console.log("Done! Use email: admin@cro-tool.local | password: SuperAdminPassword123!");
  process.exit(0);
}

main();
