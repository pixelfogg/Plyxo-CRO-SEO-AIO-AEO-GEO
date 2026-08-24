import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/db';
import { users, organizations, projects, scans } from '@/db/schema';
import { count } from 'drizzle-orm';
import { Users, Building, Globe, Activity, TrendingUp } from 'lucide-react';

export default async function SuperadminOverviewPage() {
  const [
    usersCount,
    orgsCount,
    projectsCount,
    scansCount
  ] = await Promise.all([
    db.select({ value: count() }).from(users),
    db.select({ value: count() }).from(organizations),
    db.select({ value: count() }).from(projects),
    db.select({ value: count() }).from(scans),
  ]);

  const metrics = [
    { title: 'Total Users', value: usersCount[0].value, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { title: 'Organizations', value: orgsCount[0].value, icon: Building, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
    { title: 'Tracked Projects', value: projectsCount[0].value, icon: Globe, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
    { title: 'Total Scans Processed', value: scansCount[0].value, icon: Activity, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Platform Overview</h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Global metrics and health status of the SaaS.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m, i) => (
          <Card key={i} className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{m.title}</CardTitle>
              <div className={`${m.bg} ${m.color} p-2 rounded-md`}>
                <m.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{m.value}</div>
              <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-green-500 font-medium">+12%</span> from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Platform-wide events happening right now.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-zinc-500">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <p>New user signed up (demo@example.com)</p>
                <span className="ml-auto">2m ago</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-zinc-500">
                <div className="h-2 w-2 rounded-full bg-indigo-500" />
                <p>Scan completed for Project A</p>
                <span className="ml-auto">5m ago</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-zinc-500">
                <div className="h-2 w-2 rounded-full bg-orange-500" />
                <p>Payment received ($49.00)</p>
                <span className="ml-auto">1h ago</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Uptime and service health.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Database (PostgreSQL)</span>
                <span className="text-sm text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Healthy</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Background Workers</span>
                <span className="text-sm text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Healthy</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">AI Service (Gemini API)</span>
                <span className="text-sm text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Healthy</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Authentication</span>
                <span className="text-sm text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Healthy</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
