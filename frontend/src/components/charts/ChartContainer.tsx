import React from 'react';

interface Trend {
  metric: string;
  current: string;
  trend: string;
  prediction: string;
  confidence: string;
}

interface ChartContainerProps {
  title: string;
  trends?: Trend[];
  children: React.ReactNode;
}

const ChartContainer: React.FC<ChartContainerProps> = ({ title, trends, children }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {trends && trends.length > 0 && (
          <div className="text-sm text-gray-500">
            {trends[0].current}
          </div>
        )}
      </div>
      <div className="h-64">
        {children}
      </div>
    </div>
  );
};

export default ChartContainer;