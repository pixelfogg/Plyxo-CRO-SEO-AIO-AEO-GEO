'use client';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export function AutoPrint() {
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('download=true')) {
      setPrinting(true);
      // Wait for fonts and images to load before printing
      const timer = setTimeout(() => {
        window.print();
        setPrinting(false);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, []);

  if (!printing) return null;

  return (
    <div className="fixed top-4 right-4 bg-zinc-900 text-white px-4 py-2 rounded-md shadow-lg flex items-center gap-2 print:hidden z-50">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span className="text-sm font-medium">Preparing PDF...</span>
    </div>
  );
}
