import React from 'react';

interface GaugeChartProps {
  value: number;
}

const GaugeChart: React.FC<GaugeChartProps> = ({ value }) => {
  const percentage = Math.min(Math.max(value, 0), 100);
  const angle = (percentage / 100) * 180 - 90; // -90 to 90 degrees

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="relative w-32 h-16">
        <svg viewBox="0 0 120 60" className="w-full h-full">
          {/* Background arc */}
          <path
            d="M 10 50 A 50 50 0 0 1 110 50"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          {/* Value arc */}
          <path
            d={`M 10 50 A 50 50 0 0 1 ${10 + 100 * (percentage / 100)} ${50 - 50 * Math.sin((percentage / 100) * Math.PI)}`}
            fill="none"
            stroke={percentage > 75 ? '#10b981' : percentage > 50 ? '#f59e0b' : '#ef4444'}
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Needle */}
          <line
            x1="60"
            y1="50"
            x2={60 + 40 * Math.cos(angle * Math.PI / 180)}
            y2={50 + 40 * Math.sin(angle * Math.PI / 180)}
            stroke="#374151"
            strokeWidth="2"
          />
        </svg>
        <div className="absolute inset-0 flex items-end justify-center">
          <span className="text-2xl font-bold text-gray-900">{percentage}%</span>
        </div>
      </div>
      <div className="text-sm text-gray-600 mt-2">Asistencia</div>
    </div>
  );
};

export default GaugeChart;