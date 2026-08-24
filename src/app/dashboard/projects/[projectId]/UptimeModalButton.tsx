'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Activity } from 'lucide-react';
import { UptimeGraph } from './UptimeGraph';

interface UptimeModalButtonProps {
  logs: any[];
  projectId: string;
  isUp: boolean | null;
  lastPingedAt: Date | null;
}

export function UptimeModalButton({ logs, projectId, isUp, lastPingedAt }: UptimeModalButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" className="flex items-center gap-2 h-9 border-zinc-200 dark:border-zinc-800" />}>
        <Activity className="h-4 w-4" /> View Uptime Monitor
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-w-4xl p-6">
        <DialogHeader>
          <DialogTitle>Uptime Monitor</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <UptimeGraph 
            logs={logs} 
            projectId={projectId} 
            isUp={isUp} 
            lastPingedAt={lastPingedAt} 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
