import { db } from '../src/db';
import { scans, scanIssues } from '../src/db/schema';
import { eq, desc } from 'drizzle-orm';

async function test() {
  const s = await db.query.scans.findMany({
    where: eq(scans.projectId, 'b30cc102-9cc4-4001-a734-7b9c0593d588'),
    orderBy: [desc(scans.createdAt)],
    limit: 2,
    with: { issues: true }
  });
  
  for (const scan of s) {
     console.log('--- SCAN', scan.id, '---');
     console.log('Status:', scan.status);
     console.log('Scores:', scan.scores);
     console.log('Issues count:', scan.issues?.length);
     console.log('First issue:', scan.issues?.[0]);
  }
  process.exit(0);
}
test().catch(console.error);
