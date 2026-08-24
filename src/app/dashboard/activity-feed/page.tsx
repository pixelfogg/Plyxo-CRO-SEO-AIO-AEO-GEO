import React from 'react';
import { db } from '@/db';
import { auditLogs, organizationMembers } from '@/db/schema';
import { eq, desc, count, inArray } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ActivityFeedTable } from './ActivityFeedTable';
import { getCurrentOrgId } from '@/lib/auth';

export default async function ActivityFeedPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const currentOrgId = await getCurrentOrgId(user.id).catch(() => null);

  // Fetch all org IDs the user has membership in
  const userMemberships = await db.query.organizationMembers.findMany({
    where: eq(organizationMembers.userId, user.id),
  });
  const userOrgIds = userMemberships.map((m) => m.organizationId);

  const targetOrgIds = currentOrgId ? [currentOrgId] : userOrgIds;

  if (targetOrgIds.length === 0) {
    return (
      <div className="p-8 text-[#6c6a64] dark:text-[#8e8b82]">
        No active organization found. Please create or join a workspace to view activity logs.
      </div>
    );
  }

  const params = await searchParams;
  const page = parseInt(params.page || '1') || 1;
  const limit = 20;
  const offset = (page - 1) * limit;

  // Get total count
  const [{ totalCount }] = await db
    .select({ totalCount: count() })
    .from(auditLogs)
    .where(inArray(auditLogs.orgId, targetOrgIds));

  const totalPages = Math.ceil(totalCount / limit);

  const logs = await db.query.auditLogs.findMany({
    where: inArray(auditLogs.orgId, targetOrgIds),
    orderBy: [desc(auditLogs.createdAt)],
    limit: limit,
    offset: offset,
  });

  return (
    <div className="flex-1 space-y-10 w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#e6dfd8] dark:border-[#2e2b27] pb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#141413] dark:text-[#faf9f5]">Activity Feed</h2>
          <p className="text-sm text-[#6c6a64] dark:text-[#8e8b82] mt-1">
            Track all tasks performed by team members and MCP agents across your workspace.
          </p>
        </div>
      </div>
      
      <div className="mt-6">
        <ActivityFeedTable logs={logs as any[]} currentPage={page} totalPages={totalPages} />
      </div>
    </div>
  );
}
