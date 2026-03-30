import { useState } from "react";

export function useCopy() {
  const [copied, setCopied] = useState<Record<string, boolean>>({});

  const copy = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => setCopied((prev) => ({ ...prev, [key]: false })), 2000);
  };

  return { copied, copy };
}
