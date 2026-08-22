import React from 'react';

interface StatBadgeProps {
  type: 'school' | 'class';
  value: string;
}

export function StatBadge({ type, value }: StatBadgeProps) {
  let badgeStyle = "bg-supabase-border/50 text-supabase-muted border-supabase-border";

  if (type === 'school') {
    switch (value.toLowerCase()) {
      case 'hirosaki':
        badgeStyle = "bg-amber-500/10 text-amber-400 border-amber-500/30";
        break;
      case 'haruna':
        badgeStyle = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
        break;
      case 'ookasa':
        badgeStyle = "bg-cyan-500/10 text-cyan-400 border-cyan-500/30";
        break;
      default:
        badgeStyle = "bg-slate-500/10 text-slate-400 border-slate-500/30";
    }
  } else {
    switch (value.toLowerCase()) {
      case 'ninja sword':
        badgeStyle = "bg-rose-500/10 text-rose-400 border-rose-500/30";
        break;
      case 'ninja fan':
        badgeStyle = "bg-purple-500/10 text-purple-400 border-purple-500/30";
        break;
      case 'ninja kunai':
        badgeStyle = "bg-sky-500/10 text-sky-400 border-sky-500/30";
        break;
      case 'ninja blow':
      case 'ninja dart':
        badgeStyle = "bg-orange-500/10 text-orange-400 border-orange-500/30";
        break;
      default:
        badgeStyle = "bg-slate-500/10 text-slate-400 border-slate-500/30";
    }
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeStyle}`}>
      {value}
    </span>
  );
}
