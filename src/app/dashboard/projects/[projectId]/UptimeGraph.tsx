"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { pingProject } from './actions'; // We will create this action

interface UptimeLog {
  id: string;
  status: string;
  responseTime: number | null;
  createdAt: Date | null;
}

export function UptimeGraph({ logs, projectId, isUp, lastPingedAt }: { logs: UptimeLog[], projectId: string, isUp: boolean | null, lastPingedAt: Date | null }) {
  const router = useRouter();
  const [isPinging, setIsPinging] = useState(false);

  // Default to an empty array of 30 if no logs exist, to show empty state
  const displayLogs = logs.length > 0 ? logs : Array(30).fill(null);
  
  const upCount = logs.filter(l => l.status === 'up').length;
  const uptimePercentage = logs.length > 0 ? ((upCount / logs.length) * 100).toFixed(1) : '100.0';

  const handlePing = async () => {
    setIsPinging(true);
    try {
      await pingProject(projectId);
      toast.success("Ping successful!");
      router.refresh();
    } catch (error) {
      toast.error("Failed to ping website");
    } finally {
      setIsPinging(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5 text-zinc-500" /> 
            Uptime Monitoring
          </CardTitle>
          <CardDescription>
            {logs.length > 0 ? 'Last 30 checks' : 'No history yet. Run a ping check.'}
          </CardDescription>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Current Status</p>
            <div className={`flex items-center gap-1.5 font-semibold ${isUp !== false ? 'text-emerald-500' : 'text-red-500'}`}>
              <span className={`relative flex h-2.5 w-2.5`}>
                {isUp !== false && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isUp !== false ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
              </span>
              {isUp !== false ? 'Operational' : 'Down'}
            </div>
          </div>
          <Button onClick={handlePing} disabled={isPinging} variant="outline" size="sm">
            {isPinging ? 'Pinging...' : 'Ping Now'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex items-end justify-between gap-1 h-16 mt-4">
            {displayLogs.slice(-30).map((log, i) => {
              if (!log) {
                return <div key={`empty-${i}`} className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-sm h-full opacity-50" />;
              }
              const isUp = log.status === 'up';
              return (
                <div 
                  key={log.id} 
                  title={`${isUp ? 'Operational' : 'Down'} - ${log.responseTime}ms\n${log.createdAt?.toLocaleString()}`}
                  className={`flex-1 rounded-sm transition-all hover:opacity-80 cursor-help ${isUp ? 'bg-emerald-500' : 'bg-red-500'}`}
                  style={{ height: isUp ? '100%' : '30%' }}
                  suppressHydrationWarning
                />
              );
            })}
          </div>
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>30 checks ago</span>
            <span className="font-medium">{uptimePercentage}% uptime</span>
            <span>Today</span>
          </div>
          {lastPingedAt && (
             <div className="text-xs text-zinc-400 text-center" suppressHydrationWarning>
                Last checked: {new Date(lastPingedAt).toLocaleString()}
             </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
