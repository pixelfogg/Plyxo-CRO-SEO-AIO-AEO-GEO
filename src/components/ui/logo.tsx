import { cn } from '@/lib/utils';

export function PlyxoLogo({ className, forceDark }: { className?: string, forceDark?: boolean }) {
  if (forceDark) {
    return (
      <div className={cn("flex items-end gap-1.5", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/plyxo-logo-dark.svg" alt="Plyxo" className="block h-full w-auto object-contain" />
        <span className="font-sans text-[11px] font-light tracking-[1.5px] text-zinc-500 uppercase translate-y-[2px]">CRO-SEO</span>
      </div>
    );
  }
  return (
    <div className={cn("flex items-end gap-1.5", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/plyxo-logo-dark.svg" alt="Plyxo" className="block dark:hidden print:block h-full w-auto object-contain" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/plyxo-logo-light.svg" alt="Plyxo" className="hidden dark:block print:hidden h-full w-auto object-contain" />
      <span className="font-sans text-[11px] font-light tracking-[1.5px] text-zinc-500 dark:text-zinc-400 uppercase translate-y-[2px]">CRO-SEO</span>
    </div>
  );
}
