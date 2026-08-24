import { NextResponse } from 'next/server';
import { db } from '@/db';
import { apiKeys, projects, organizations, organizationMembers } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';
import type { InferSelectModel } from 'drizzle-orm';

type Project = InferSelectModel<typeof projects>;
type Organization = InferSelectModel<typeof organizations>;
type ApiKey = InferSelectModel<typeof apiKeys>;

export interface AuthResult {
  apiKey?: ApiKey;
  user?: any;
  project: Project | null;
  organization: Organization | null;
  isGlobal: boolean;
}

export async function validateApiKey(request: Request, requiredScope?: string) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { error: NextResponse.json({ error: 'Missing or invalid Authorization header' }, { status: 401 }) };
    }

    const token = authHeader.split(' ')[1];
    
    // Handle Supabase OAuth or Session JWT Tokens
    if (!token.startsWith('Plyxo-')) {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) {
        return { error: NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 }) };
      }

      return {
        user,
        project: null,
        organization: null,
        isGlobal: true
      };
    }

    // Handle standard API Keys
    const keyHash = crypto.createHash('sha256').update(token).digest('hex');

    const [apiKey] = await db.select().from(apiKeys).where(eq(apiKeys.keyHash, keyHash)).limit(1);

    if (!apiKey) {
      return { error: NextResponse.json({ error: 'Invalid API Key' }, { status: 401 }) };
    }

    if (apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date()) {
      return { error: NextResponse.json({ error: 'API Key has expired' }, { status: 401 }) };
    }

    const allowedIps = Array.isArray(apiKey.allowedIps) ? (apiKey.allowedIps as string[]) : null;
    if (allowedIps && allowedIps.length > 0) {
      const forwardedFor = request.headers.get('x-forwarded-for') || '';
      const callerIp = forwardedFor.split(',')[0].trim() || request.headers.get('x-real-ip') || '';
      if (!callerIp || !allowedIps.includes(callerIp)) {
        return { error: NextResponse.json({ error: 'Request IP not allowed for this API Key' }, { status: 403 }) };
      }
    }

    const scopes = Array.isArray(apiKey.scopes) ? (apiKey.scopes as string[]) : [];
    if (requiredScope && !scopes.includes(requiredScope)) {
      return { error: NextResponse.json({ error: `API Key missing required scope: ${requiredScope}` }, { status: 403 }) };
    }

    // Update last used asynchronously (don't await to block the request)
    db.update(apiKeys).set({ lastUsedAt: new Date() }).where(eq(apiKeys.id, apiKey.id)).execute().catch(console.error);

    // If it's a project-scoped key, fetch the project
    let project = null;
    if (apiKey.projectId) {
      project = await db.query.projects.findFirst({
        where: eq(projects.id, apiKey.projectId)
      });
    }

    // Fetch the organization
    let organization = null;
    if (apiKey.organizationId) {
      organization = await db.query.organizations.findFirst({
        where: eq(organizations.id, apiKey.organizationId)
      });
    } else if (project?.organizationId) {
      organization = await db.query.organizations.findFirst({
        where: eq(organizations.id, project.organizationId)
      });
    }

    return { 
      apiKey, 
      project: project || null,
      organization: organization || null,
      isGlobal: !apiKey.projectId
    };
  } catch (error: any) {
    console.error('API Auth Error:', error);
    return { error: NextResponse.json({ error: 'Internal Server Error during authentication' }, { status: 500 }) };
  }
}

export async function resolveTargetProject(
  auth: AuthResult,
  requestedProjectId: string | null | undefined,
  requireProjectId: false
): Promise<{ error: NextResponse } | { targetProjectId: string | null }>;

export async function resolveTargetProject(
  auth: AuthResult,
  requestedProjectId?: string | null,
  requireProjectId?: true
): Promise<{ error: NextResponse } | { targetProjectId: string }>;

export async function resolveTargetProject(
  auth: AuthResult,
  requestedProjectId?: string | null,
  requireProjectId: boolean = true
): Promise<{ error: NextResponse } | { targetProjectId: string | null }> {
  // If the key is project-scoped, ignore requestedProjectId and return the key's project
  if (!auth.isGlobal) {
    if (!auth.project) {
      return { error: NextResponse.json({ error: 'Project not found for this API Key' }, { status: 404 }) };
    }
    return { targetProjectId: auth.project.id };
  }

  // If it's a global key, the requester might need to provide a projectId
  if (!requestedProjectId) {
    if (requireProjectId) {
      return { error: NextResponse.json({ error: 'projectId is required for Account-level API keys' }, { status: 400 }) };
    }
    return { targetProjectId: null }; // Indicates global scope without specific project filter
  }

  // Fetch the project
  const targetProject = await db.query.projects.findFirst({
    where: eq(projects.id, requestedProjectId)
  });

  if (!targetProject) {
    return { error: NextResponse.json({ error: 'Project not found' }, { status: 404 }) };
  }

  // Verify permissions based on token type
  if (auth.user) {
    if (targetProject.organizationId) {
      const membership = await db.query.organizationMembers.findFirst({
        where: and(
          eq(organizationMembers.userId, auth.user.id),
          eq(organizationMembers.organizationId, targetProject.organizationId)
        )
      });
      if (!membership) {
        return { error: NextResponse.json({ error: 'Permission denied to access this project' }, { status: 403 }) };
      }
    } else if (targetProject.userId !== auth.user.id) {
      return { error: NextResponse.json({ error: 'Permission denied to access this project' }, { status: 403 }) };
    }
  } else {
    // API Key logic
    if (targetProject.organizationId !== auth.organization?.id) {
      return { error: NextResponse.json({ error: 'Project not found or you do not have permission to access it' }, { status: 404 }) };
    }
  }

  return { targetProjectId: requestedProjectId };
}
