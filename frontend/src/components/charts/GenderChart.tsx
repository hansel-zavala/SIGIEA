import React from 'react';

interface GenderChartProps {
  maleCount: number;
  femaleCount: number;
  total: number;
}

const GenderChart: React.FC<GenderChartProps> = ({ maleCount, femaleCount, total }) => {
  const malePercentage = total > 0 ? (maleCount / total) * 100 : 0;
  const femalePercentage = total > 0 ? (femaleCount / total) * 100 : 0;

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="w-32 h-32 relative">
        <svg viewBox="0 0 120 120" className="w-full h-full">
          {/* Male slice */}
          <circle
            cx="60"
            cy="60"
            r="40"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="20"
            strokeDasharray={`${malePercentage * 2.51} 251`}
            transform="rotate(-90 60 60)"
          />
          {/* Female slice */}
          <circle
            cx="60"
            cy="60"
            r="40"
            fill="none"
            stroke="#ec4899"
            strokeWidth="20"
            strokeDasharray={`${femalePercentage * 2.51} 251`}
            strokeDashoffset={-malePercentage * 2.51}
            transform="rotate(-90 60 60)"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-gray-900">{total}</span>
        </div>
      </div>
      <div className="flex space-x-4 mt-4">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
          <span className="text-sm text-gray-600">Masculino: {malePercentage.toFixed(1)}%</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-pink-500 rounded-full mr-2"></div>
          <span className="text-sm text-gray-600">Femenino: {femalePercentage.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
};

export default GenderChart;