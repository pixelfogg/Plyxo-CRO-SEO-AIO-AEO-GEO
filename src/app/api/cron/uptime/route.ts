import { NextResponse } from 'next/server'
import { db } from '@/db'
import { projects } from '@/db/schema'
import { isNotNull, and } from 'drizzle-orm'
import { performUptimeCheck } from '@/lib/uptime'

// Set max duration for Vercel functions if needed (e.g., to allow long running cron)
export const maxDuration = 300; // 5 minutes

export async function GET(request: Request) {
  // 1. Verify authorization
  const authHeader = request.headers.get('authorization');
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // 2. Fetch all projects with a websiteUrl
    const allProjects = await db.query.projects.findMany({
      where: isNotNull(projects.websiteUrl),
      columns: {
        id: true,
        websiteUrl: true,
        organizationId: true,
      }
    });

    if (allProjects.length === 0) {
      return NextResponse.json({ success: true, checked: 0, message: "No projects to check" });
    }

    // 3. Ping each project concurrently using Promise.allSettled
    // We don't want a failure in one to crash the others.
    const results = await Promise.allSettled(
      allProjects.map(project => 
        performUptimeCheck(project.id, project.websiteUrl!, project.organizationId)
      )
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.length - successful;

    return NextResponse.json({ 
      success: true, 
      checked: allProjects.length,
      successful,
      failed
    });

  } catch (error: any) {
    console.error("Uptime Cron Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
