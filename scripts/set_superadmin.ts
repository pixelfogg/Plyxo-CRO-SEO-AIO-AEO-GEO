import { config } from 'dotenv';
config({ path: '.env.local' });
import { db } from '../src/db';
import { users } from '../src/db/schema';

async function main() {
  await db.update(users).set({ role: 'superadmin' });
  console.log('Successfully set all users to superadmin.');
  process.exit(0);
}

main().catch(console.error);
