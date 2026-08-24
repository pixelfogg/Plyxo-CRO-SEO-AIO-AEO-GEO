'use client';

import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Activity, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface RunScanButtonProps {
  action: (payload: FormData) => void;
  hasActiveScan?: boolean;
}

function SubmitButton({ hasActiveScan }: { hasActiveScan?: boolean }) {
  const { pending } = useFormStatus();
  const isBusy = pending || hasActiveScan;

  return (
    <Button 
      type="submit" 
      disabled={isBusy} 
      className={`flex items-center gap-2 h-9 min-w-[155px] font-medium transition-all ${
        isBusy 
          ? 'bg-[#efe9de] text-[#8e8b82] dark:bg-[#252320] dark:text-[#8e8b82] cursor-not-allowed' 
          : 'bg-[#cc785c] hover:bg-[#b8664b] text-white shadow-xs'
      }`}
      onClick={() => {
        if (!isBusy) {
          toast.info('Starting Background AI Analysis...', {
            description: 'The scan will continue processing even if you refresh or switch pages.',
          });
        }
      }}
    >
      {isBusy ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-[#cc785c]" />
          <span>Analyzing...</span>
        </>
      ) : (
        <>
          <Activity className="h-4 w-4" />
          <span>Run New Scan</span>
        </>
      )}
    </Button>
  );
}

export function RunScanButton({ action, hasActiveScan }: RunScanButtonProps) {
  return (
    <form action={action}>
      <SubmitButton hasActiveScan={hasActiveScan} />
    </form>
  );
}
