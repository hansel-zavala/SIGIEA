// frontend/src/components/ui/Badge.tsx
import React from 'react';

type BadgeColor = 'success' | 'warning' | 'error' | 'info';

interface BadgeProps {
  color: BadgeColor;
  children: React.ReactNode;
}

function Badge({ color, children }: BadgeProps) {
  const colorClasses = {
    success: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    error: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-black-400',
  };

  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full ${colorClasses[color]}`}
    >
      {children}
    </span>
  );
}

export default Badge;