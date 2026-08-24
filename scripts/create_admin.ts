import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase.auth.signUp({
    email: 'sameer.hassan06@gmail.com',
    password: 'SuperAdminPassword123!',
  });

  if (error) {
    console.error('Error creating user:', error.message);
  } else {
    console.log('User created successfully:', data.user?.email);
    console.log('ID:', data.user?.email);
    console.log('Password: SuperAdminPassword123!');
  }
}

main();
