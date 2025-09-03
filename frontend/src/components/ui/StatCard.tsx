// frontend/src/components/ui/StatCard.tsx
import React from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: 'pink' | 'blue' | 'green' | 'purple';
  growth?: number | null; // Nuevo prop para el crecimiento
}

function StatCard({ title, value, icon, color, growth }: StatCardProps) {
  const gradientClasses = {
    pink: 'from-[#ffc0cb] to-[#ff8a9a]',
    blue: 'from-[#89cff0] to-[#4682b4]',
    green: 'from-[#98fb98] to-[#3cb371]',
    purple: 'from-[#e6e6fa] to-[#d8bfd8]',
  };

  const growthText = growth !== null && growth !== undefined ? (growth >= 0 ? `Incrementado en ${growth}%` : `Disminuido en ${Math.abs(growth)}%`) : null;

  return (
    <div className={`relative overflow-hidden text-white rounded-2xl shadow-lg p-6 bg-gradient-to-br ${gradientClasses[color]}`}>
      {/* Círculos decorativos */}
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/20 rounded-full"></div>
      <div className="absolute -bottom-16 -right-2 w-32 h-32 bg-white/10 rounded-full"></div>

      <div className="relative z-10">
        <div className="flex justify-between items-start">
          <span className="text-sm font-medium uppercase tracking-wider">{title}</span>
          <span className="text-white/80">{icon}</span>
        </div>
        <p className="text-4xl font-bold mt-2">{value}</p>
        {growthText && (
          <p className="text-xs mt-4 opacity-90">{growthText}</p>
        )}
      </div>
    </div>
  );
}
export default StatCard;