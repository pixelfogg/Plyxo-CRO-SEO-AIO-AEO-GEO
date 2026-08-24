import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/db'
import { users, organizationMembers, organizations, subscriptions, subscriptionPlans } from '@/db/schema'
import { eq, desc, inArray, asc } from 'drizzle-orm'
import { WorkspaceClientLayout } from './WorkspaceClientLayout'
import { isSuperadmin } from '@/lib/auth'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const result = await getDashboardData();
  
  if (!result || !('user' in result)) {
    return result as ReactNode; // Error UI
  }
  
  const { user, userIsSuperadmin, userOrganizations, currentOrg, userInitial, subscription } = result;

  return (
    <WorkspaceClientLayout
      email={user.email || 'user@plyxocro'}
      userInitial={userInitial}
      isSuperadmin={userIsSuperadmin}
      organizations={userOrganizations}
      currentOrg={currentOrg}
      subscription={subscription}
    >
      {children}
    </WorkspaceClientLayout>
  )
}

async function getDashboardData() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      redirect('/login')
    }

    let dbUser = await db.query.users.findFirst({
      where: eq(users.id, user.id)
    });
    
    if (!dbUser && process.env.NEXT_PUBLIC_IS_CLOUD_EDITION === 'false') {
      const [newUser] = await db.insert(users).values({
        id: user.id,
        email: user.email!
      }).returning();
      dbUser = newUser;
    }
    
    const userIsSuperadmin = isSuperadmin(dbUser?.role, user.email);

    let userOrganizations: { id: string, name: string, slug: string }[] = [];
    let currentOrg: { id: string, name: string, slug: string } | null = null;

    let userOrgs = await db.select({
      id: organizations.id,
      name: organizations.name,
      slug: organizations.slug,
    })
    .from(organizationMembers)
    .innerJoin(organizations, eq(organizationMembers.organizationId, organizations.id))
    .where(eq(organizationMembers.userId, user.id));

    if (userOrgs.length === 0 && process.env.NEXT_PUBLIC_IS_CLOUD_EDITION === 'false') {
      // Auto-provision default workspace in Community Edition
      let existingOrg = await db.query.organizations.findFirst({
        where: eq(organizations.slug, 'default-workspace'),
      });
      if (!existingOrg) {
        const [newOrg] = await db.insert(organizations).values({
          name: 'Default Workspace',
          slug: 'default-workspace',
        }).returning();
        existingOrg = newOrg;
      }
      await db.insert(organizationMembers).values({
        organizationId: existingOrg.id,
        userId: user.id,
        role: 'admin',
      }).onConflictDoNothing();

      userOrgs = [{ id: existingOrg.id, name: existingOrg.name, slug: existingOrg.slug }];
    }

    if (userOrgs.length === 0 && !userIsSuperadmin && process.env.NEXT_PUBLIC_IS_CLOUD_EDITION !== 'false') {
      redirect('/onboarding');
    }
    
    userOrganizations = userOrgs;
    
    // Determine current organization (from cookie or default to first)
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const orgIdCookie = cookieStore.get('current_org_id')?.value;
    
    if (orgIdCookie) {
      const found = userOrgs.find(org => org.id === orgIdCookie);
      currentOrg = found || (userOrgs.length > 0 ? userOrgs[0] : null);
    } else if (userOrgs.length > 0) {
      currentOrg = userOrgs[0];
    }

    let subscription: {
      plan: string;
      planName: string;
      status: string;
      currentPeriodEnd: string | null;
      isTopTier: boolean;
      nextPlanName?: string;
    } | null = null;

    if (process.env.NEXT_PUBLIC_IS_CLOUD_EDITION !== 'true') {
      subscription = {
        plan: 'community',
        planName: 'Community Edition',
        status: 'active',
        currentPeriodEnd: null,
        isTopTier: true,
      };
    } else {
      // Fetch all active subscription tiers from database (sorted by price ascending)
      const allActivePlans = await db.query.subscriptionPlans.findMany({
        where: eq(subscriptionPlans.isActive, true),
        orderBy: (p, { asc }) => [asc(p.price)],
      });

      const highestPlan = allActivePlans.length > 0 ? allActivePlans[allActivePlans.length - 1] : null;

      let sub = null;
      if (currentOrg) {
        sub = await db.query.subscriptions.findFirst({
          where: eq(subscriptions.organizationId, currentOrg.id),
        });
      }

      if (!sub && userOrgs.length > 0) {
        const orgIds = userOrgs.map(o => o.id);
        sub = await db.query.subscriptions.findFirst({
          where: inArray(subscriptions.organizationId, orgIds),
          orderBy: (s, { desc }) => [desc(s.updatedAt)],
        });
      }

      if (sub) {
      // Find matching plan accurately
      let planRow = sub.planId 
        ? allActivePlans.find(p => p.id === sub.planId) 
        : null;
      
      // Match by token quota if available
      if (!planRow && sub.tokensAllowed) {
        planRow = allActivePlans.find(p => {
          const f = (p.features as any) || {};
          return f.tokensAllowed === sub.tokensAllowed || f.maxTokens === sub.tokensAllowed;
        }) || null;
      }

      // Match by Pro keyword
      if (!planRow && (sub.plan === 'pro' || sub.gatewaySubscriptionId || sub.status === 'active')) {
        planRow = allActivePlans.find(p => p.price > 0 && p.name.toLowerCase().includes('pro')) 
          || allActivePlans.find(p => p.price > 0) 
          || null;
      }

      if (!planRow && sub.plan === 'free') {
        planRow = allActivePlans.find(p => p.price === 0) || null;
      }

      const isPaid = sub.plan === 'pro' || (planRow ? planRow.price > 0 : false) || !!sub.gatewaySubscriptionId || sub.status === 'active';
      const resolvedPlan = isPaid ? 'pro' : 'free';
      const planName = planRow?.name || (isPaid ? 'Pro' : 'Free Tier');
      const planPrice = planRow ? planRow.price : (isPaid ? 20 : 0);

      // Check if user is on the top tier (strictly highest price in available tiers)
      const isTop = isPaid && (highestPlan ? planPrice >= highestPlan.price : false);

      // Find the next higher tier if not top tier
      const nextPlan = isPaid && !isTop
        ? allActivePlans.find(p => p.price > planPrice)
        : (!isPaid ? allActivePlans.find(p => p.price > 0) : null);

      subscription = {
        plan: resolvedPlan,
        planName: planName,
        status: isPaid ? 'active' : sub.status,
        currentPeriodEnd: sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toISOString() : null,
        isTopTier: isTop,
        nextPlanName: nextPlan ? nextPlan.name : undefined,
      };
    } else if (userIsSuperadmin) {
      subscription = {
        plan: 'pro',
        planName: 'Enterprise Superadmin',
        status: 'active',
        currentPeriodEnd: null,
        isTopTier: true,
      };
    } else {
      const defaultFree = allActivePlans.find(p => p.price === 0);
      const nextPlan = allActivePlans.find(p => p.price > 0);
      subscription = {
        plan: 'free',
        planName: defaultFree?.name || 'Free Tier',
        status: 'trial',
        currentPeriodEnd: null,
        isTopTier: false,
        nextPlanName: nextPlan?.name || 'Pro Plan',
      };
    }
    }

    const rawName = (user.user_metadata?.full_name as string) || (user.user_metadata?.name as string) || dbUser?.email || user.email || 'U';
    const cleanPrefix = rawName.includes('@') ? rawName.split('@')[0] : rawName;
    const nameWords = cleanPrefix.replace(/[._-]/g, ' ').trim().split(/\s+/).filter(Boolean);
    const userInitial = nameWords.length >= 2 
      ? (nameWords[0].charAt(0) + nameWords[1].charAt(0)).toUpperCase() 
      : cleanPrefix.substring(0, 2).toUpperCase();

    return { user, dbUser, userIsSuperadmin, userOrganizations, currentOrg, userInitial, subscription };
  } catch (error: any) {
    if (
      error?.message === 'NEXT_REDIRECT' || 
      error?.digest?.startsWith('NEXT_REDIRECT') || 
      error?.digest === 'DYNAMIC_SERVER_USAGE' ||
      error?.message?.includes('Dynamic server usage')
    ) {
      throw error;
    }
    console.error('Dashboard layout error:', error)
    const showDetails = process.env.NODE_ENV !== 'production'
    return (
      <div className="p-8 text-red-500 bg-red-50 dark:bg-red-950/20 min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
        <p className="mb-2">We couldn&apos;t load your dashboard. Please try again.</p>
        {showDetails && (
          <pre className="whitespace-pre-wrap text-xs opacity-70">{error?.stack || error?.message || String(error)}</pre>
        )}
      </div>
    )
  }
}
