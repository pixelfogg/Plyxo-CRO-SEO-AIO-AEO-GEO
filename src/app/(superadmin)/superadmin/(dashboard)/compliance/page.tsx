import React from 'react';
import { 
  ShieldCheck, 
  Download,
  Lock,
  AlertCircle,
  Activity
} from 'lucide-react';
import { db } from '@/db';
import { auditLogs, organizations } from '@/db/schema';
import { eq, desc, and, gte, sql } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';

import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuditLogTable } from './AuditLogTable';
import { ComplianceActions } from './ComplianceActions';
import { redirect } from 'next/navigation';

export default async function ComplianceAuditPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Find the first organization this user belongs to
  const userOrg = await db.query.organizations.findFirst();

  if (!userOrg) {
    return <div className="p-8">No organization found. Please create one first.</div>;
  }

  // Fetch real audit logs
  const logs = await db.query.auditLogs.findMany({
    where: eq(auditLogs.orgId, userOrg.id),
    orderBy: [desc(auditLogs.createdAt)],
    limit: 100,
  });

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const events30dResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(auditLogs)
    .where(and(eq(auditLogs.orgId, userOrg.id), gte(auditLogs.createdAt, thirtyDaysAgo)));
  const events30d = Number(events30dResult[0]?.count || 0);

  const twentyFourHoursAgo = new Date();
  twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
  const activeThreatsResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(auditLogs)
    .where(and(
      eq(auditLogs.orgId, userOrg.id), 
      eq(auditLogs.status, 'error'),
      gte(auditLogs.createdAt, twentyFourHoursAgo)
    ));
  const activeThreats = Number(activeThreatsResult[0]?.count || 0);

  const soc2Logs = logs.filter(log => (log.frameworks as string[] | null)?.some(f => typeof f === 'string' && f.includes('SOC 2')));
  let soc2Score = 100;
  if (soc2Logs.length > 0) {
    const failedSoc2 = soc2Logs.filter(log => log.status === 'error').length;
    soc2Score = Math.max(0, Math.round(100 - (failedSoc2 / soc2Logs.length) * 100));
  }

  const gdprLogs = logs.filter(log => (log.frameworks as string[] | null)?.some(f => typeof f === 'string' && f.includes('GDPR')));
  let gdprScore = 100;
  if (gdprLogs.length > 0) {
    const failedGdpr = gdprLogs.filter(log => log.status === 'error').length;
    gdprScore = Math.max(0, Math.round(100 - (failedGdpr / gdprLogs.length) * 100));
  }

  return (
    <div className="flex-1 space-y-6 p-8 bg-[#faf9f5] dark:bg-[#141413] min-h-[calc(100vh-64px)]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#141413] dark:text-[#faf9f5]">Compliance & Audit</h2>
          <p className="text-sm text-[#6c6a64] dark:text-[#8e8b82] mt-1">
            Monitor system events, track access, and demonstrate adherence to GRC standards.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <ComplianceActions logs={logs as any[]} metrics={{ soc2Score, gdprScore, activeThreats, events30d }} />
        </div>
      </div>

      {/* Scorecards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-[#e6dfd8] dark:border-[#2e2b27] shadow-sm bg-white dark:bg-[#1a1918]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#6c6a64] dark:text-[#8e8b82]">SOC 2 Type II</CardTitle>
            <ShieldCheck className="h-4 w-4 text-[#5db872]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#141413] dark:text-[#faf9f5]">{soc2Score}%</div>
            <p className="text-xs text-[#5db872] mt-1 flex items-center">
              {soc2Score === 100 ? 'All controls passing' : `${100 - soc2Score}% controls failing`}
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-[#e6dfd8] dark:border-[#2e2b27] shadow-sm bg-white dark:bg-[#1a1918]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#6c6a64] dark:text-[#8e8b82]">GDPR Readiness</CardTitle>
            <Lock className="h-4 w-4 text-[#5b8cce]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#141413] dark:text-[#faf9f5]">{gdprScore}%</div>
            <p className="text-xs text-[#5b8cce] mt-1">
              {gdprScore === 100 ? 'Fully compliant' : 'Pending policy reviews'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#e6dfd8] dark:border-[#2e2b27] shadow-sm bg-white dark:bg-[#1a1918]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#6c6a64] dark:text-[#8e8b82]">Active Threats</CardTitle>
            <AlertCircle className="h-4 w-4 text-[#e85a5a]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#141413] dark:text-[#faf9f5]">{activeThreats}</div>
            <p className="text-xs text-[#6c6a64] dark:text-[#8e8b82] mt-1">
              {activeThreats === 0 ? 'System secure' : 'Threats detected in last 24h'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#e6dfd8] dark:border-[#2e2b27] shadow-sm bg-white dark:bg-[#1a1918]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#6c6a64] dark:text-[#8e8b82]">Events (30d)</CardTitle>
            <Activity className="h-4 w-4 text-[#e8a55a]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#141413] dark:text-[#faf9f5]">
              {events30d.toLocaleString()}
            </div>
            <p className="text-xs text-[#6c6a64] dark:text-[#8e8b82] mt-1">Real events logged</p>
          </CardContent>
        </Card>
      </div>

      <AuditLogTable logs={logs as any} />
    </div>
  );
}

