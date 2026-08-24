import { useState, useCallback } from 'react';

export function useCopyToClipboard(): [string | null, (text: string) => void] {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copy = useCallback((text: string) => {
    if (!navigator?.clipboard) {
      console.warn('Clipboard not supported');
      return;
    }

    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2000);
    });
  }, []);

  return [copiedText, copy];
}
