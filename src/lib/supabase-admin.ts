import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://authdb.plyxo.org';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3ODgyMzg1NjcsImV4cCI6MTg5MzQ1NjAwMCwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlzcyI6InN1cGFiYXNlIn0.M_UH-c1Q_TCROG6I2R9PKQJi5QZDNVLkMyOWnAJ1tGU';

export const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function fetchRemoteProjects() {
  try {
    const { data, error } = await supabaseAdmin
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      websiteUrl: p.website_url,
      industry: p.industry,
      organizationId: p.organization_id,
      userId: p.user_id,
      isUp: p.is_up ?? true,
      brandColors: p.brand_colors,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }));
  } catch (err) {
    console.error('[fetchRemoteProjects Error]:', err);
    return [];
  }
}

export async function fetchRemoteProject(projectId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .limit(1);

    if (error) throw error;
    if (!data || data.length === 0) return null;
    const p = data[0];
    return {
      id: p.id,
      name: p.name,
      websiteUrl: p.website_url,
      industry: p.industry,
      organizationId: p.organization_id,
      userId: p.user_id,
      isUp: p.is_up ?? true,
      brandColors: p.brand_colors,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    };
  } catch (err) {
    console.error('[fetchRemoteProject Error]:', err);
    return null;
  }
}

export async function fetchRemoteScans(projectId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('scans')
      .select('id, status, project_id, scores, started_at, completed_at, created_at')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return (data || []).map((s: any) => ({
      id: s.id,
      status: s.status,
      projectId: s.project_id,
      scores: s.scores,
      startedAt: s.started_at,
      completedAt: s.completed_at,
      createdAt: s.created_at,
    }));
  } catch (err) {
    console.error('[fetchRemoteScans Error]:', err);
    return [];
  }
}

export async function fetchRemotePages(projectId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('project_pages')
      .select('*')
      .eq('project_id', projectId)
      .order('discovered_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    return (data || []).map((p: any) => ({
      id: p.id,
      projectId: p.project_id,
      url: p.url,
      path: p.path,
      statusCode: p.status_code,
      metaTitle: p.meta_title,
      metaDescription: p.meta_description,
      loadTime: p.load_time,
      discoveredAt: p.discovered_at,
    }));
  } catch (err) {
    console.error('[fetchRemotePages Error]:', err);
    return [];
  }
}

export async function fetchRemoteUptimeLogs(projectId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('uptime_logs')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) throw error;
    return (data || []).map((l: any) => ({
      id: l.id,
      projectId: l.project_id,
      status: l.status,
      responseTime: l.response_time,
      createdAt: l.created_at,
    }));
  } catch (err) {
    console.error('[fetchRemoteUptimeLogs Error]:', err);
    return [];
  }
}

export async function fetchRemoteOrganizations() {
  try {
    const { data, error } = await supabaseAdmin
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('[fetchRemoteOrganizations Error]:', err);
    return [];
  }
}

export async function fetchRemoteOrganizationMembers() {
  try {
    const { data, error } = await supabaseAdmin
      .from('organization_members')
      .select('*');

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('[fetchRemoteOrganizationMembers Error]:', err);
    return [];
  }
}

export async function fetchRemoteSubscription(orgId?: string) {
  try {
    let query = supabaseAdmin.from('subscriptions').select('*');
    if (orgId) {
      query = query.eq('organization_id', orgId);
    }
    const { data, error } = await query.limit(1);
    if (error) throw error;
    return data?.[0] || null;
  } catch (err) {
    console.error('[fetchRemoteSubscription Error]:', err);
    return null;
  }
}

export async function fetchRemoteSubscriptionPlans() {
  try {
    const { data, error } = await supabaseAdmin
      .from('subscription_plans')
      .select('*')
      .order('price', { ascending: true });

    if (error) throw error;
    return (data || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      currency: p.currency,
      interval: p.interval,
      dodoProductId: p.dodo_product_id,
      stripeProductId: p.stripe_product_id,
      isActive: p.is_active,
      features: p.features,
      createdAt: p.created_at ? new Date(p.created_at).toISOString() : null,
      updatedAt: p.updated_at ? new Date(p.updated_at).toISOString() : null,
    }));
  } catch (err) {
    console.error('[fetchRemoteSubscriptionPlans Error]:', err);
    return [];
  }
}

export async function fetchRemoteAuditLogs(orgIds?: string[], limit: number = 20, offset: number = 0) {
  try {
    let query = supabaseAdmin
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (orgIds && orgIds.length > 0) {
      query = query.in('org_id', orgIds);
    }

    const { data, count: totalCount, error } = await query;
    if (error) throw error;

    return {
      logs: (data || []).map((l: any) => ({
        id: l.id,
        orgId: l.org_id,
        userId: l.user_id,
        userEmail: l.user_email,
        action: l.action,
        details: l.details,
        status: l.status,
        metadata: l.metadata,
        ipAddress: l.ip_address,
        createdAt: l.created_at ? new Date(l.created_at).toISOString() : null,
      })),
      totalCount: totalCount || 0,
    };
  } catch (err) {
    console.error('[fetchRemoteAuditLogs Error]:', err);
    return { logs: [], totalCount: 0 };
  }
}


