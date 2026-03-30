import React from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  hint?: string;
}

export default function EmptyState({ title, description, hint }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center py-16 px-6">
      <div className="w-8 h-0.5 bg-brand-500/30 rounded-full mb-6" />
      <h3 className="text-sm font-semibold text-skin-secondary mb-1.5">{title}</h3>
      <p className="text-xs text-skin-muted text-center leading-relaxed max-w-[220px]">{description}</p>
      {hint && (
        <p className="text-2xs text-skin-faint mt-3 bg-elevated px-3 py-1 rounded-full">{hint}</p>
      )}
    </div>
  );
}
