// frontend/src/components/ui/StatCard.tsx
import React from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: 'pink' | 'blue' | 'green' | 'purple';
  growth?: number | null;
}

function StatCard({ title, value, icon, color, growth }: StatCardProps) {
  const colorConfig = {
    pink: { bg: 'bg-rose-50', text: 'text-rose-600', icon: 'text-rose-400', accent: 'bg-rose-100' },
    blue: { bg: 'bg-sky-50', text: 'text-sky-600', icon: 'text-sky-400', accent: 'bg-sky-100' },
    green: { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: 'text-emerald-400', accent: 'bg-emerald-100' },
    purple: { bg: 'bg-violet-50', text: 'text-violet-600', icon: 'text-violet-400', accent: 'bg-violet-100' },
  };

  const c = colorConfig[color];

  const growthText =
    growth !== null && growth !== undefined
      ? growth >= 0
        ? `+${growth}%`
        : `${growth}%`
      : null;

  return (
    <div className={`relative overflow-hidden rounded-2xl ${c.bg} p-6 transition-shadow hover:shadow-md ring-1 ring-black/5`}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500 tracking-wide">{title}</p>
          <p className={`text-3xl font-bold ${c.text}`}>{value}</p>
          {growthText ? (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${(growth ?? 0) >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                }`}
            >
              {growthText}
            </span>
          ) : (
            <span className="text-xs opacity-0 select-none">—</span>
          )}
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${c.accent} ${c.icon}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default StatCard;
