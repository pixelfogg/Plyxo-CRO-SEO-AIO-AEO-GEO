import { NextResponse } from 'next/server';
import { db } from '@/db';
import { projects } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { validateApiKey, resolveTargetProject, AuthResult } from '@/lib/api-auth';
import { assertProjectAllowed } from '@/lib/billing/quota';

export async function GET(request: Request) {
  try {
    const authResult = await validateApiKey(request, 'read:projects');
    if ('error' in authResult) return authResult.error;

    const auth = authResult as AuthResult;
    const url = new URL(request.url);
    const requestedProjectId = url.searchParams.get('projectId');

    const projectResolution = await resolveTargetProject(auth, requestedProjectId, false);
    if ('error' in projectResolution) return projectResolution.error;

    let availableProjects: any[] = [];

    if (projectResolution.targetProjectId) {
      // Resolved to a specific project (either project-scoped key, or account-level key with filter)
      const targetProject = await db.query.projects.findFirst({
        where: eq(projects.id, projectResolution.targetProjectId)
      });
      if (targetProject) availableProjects = [targetProject];
    } else if (auth.isGlobal && auth.organization) {
      // Account-level key returning all projects
      availableProjects = await db.query.projects.findMany({
        where: eq(projects.organizationId, auth.organization.id),
        orderBy: [desc(projects.createdAt)]
      });
    } else {
      return NextResponse.json({ error: 'No projects accessible with this key' }, { status: 403 });
    }

    // Format the response for external consumption
    const formattedProjects = availableProjects.map(p => ({
      id: p.id,
      name: p.name,
      websiteUrl: p.websiteUrl,
      industry: p.industry,
      targetAudience: p.targetAudience,
      businessType: p.businessType,
      conversionGoal: p.conversionGoal,
      brandColors: p.brandColors,
      isUp: p.isUp,
      lastPingedAt: p.lastPingedAt,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt
    }));

    return NextResponse.json({
      success: true,
      data: formattedProjects,
      count: formattedProjects.length
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authResult = await validateApiKey(request, 'write:projects');
    if ('error' in authResult) return authResult.error;

    const { isGlobal, organization } = authResult as AuthResult;
    
    if (!isGlobal || !organization) {
      return NextResponse.json({ error: 'Creating projects requires an Account-level key.' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    if (!body.name || !body.websiteUrl) {
      return NextResponse.json({ error: 'Missing required fields: name, websiteUrl' }, { status: 400 });
    }

    // SSRF Ingestion Check
    const { assertUrlAllowed } = await import('@/lib/security');
    const safeWebsiteUrl = await assertUrlAllowed(body.websiteUrl);

    // Enforce project quota check as per organization subscription
    await assertProjectAllowed(organization.id);

    const [newProject] = await db.insert(projects).values({
      organizationId: organization.id,
      name: body.name,
      websiteUrl: safeWebsiteUrl,
      industry: body.industry || null,
    }).returning();

    return NextResponse.json({
      success: true,
      message: 'Project created successfully',
      data: newProject
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
