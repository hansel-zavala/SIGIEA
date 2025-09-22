const baseClasses = 'inline-flex items-center justify-center rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1';

export const actionButtonStyles = {
  edit: `${baseClasses} border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 focus:ring-blue-200`,
  delete: `${baseClasses} border-red-200 bg-red-50 text-red-600 hover:bg-red-100 focus:ring-red-200`,
  reactivate: `${baseClasses} border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 focus:ring-emerald-200`,
  schedule: `${baseClasses} border-yellow-200 bg-yellow-50 text-yellow-600 hover:bg-yellow-100 focus:ring-yellow-200`,
  edit2: `${baseClasses} border-violet-200 bg-violet-50 text-violet-600 hover:bg-violet-100 focus:ring-violet-200`,
  save: `${baseClasses} border-green-200 bg-green-50 text-green-600 hover:bg-green-100 focus:ring-green-200`,

};

export type ActionButtonVariant = keyof typeof actionButtonStyles;
