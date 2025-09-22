import React from 'react';

interface BarKey {
  key: string;
  name: string;
}

interface BarChartProps<T> {
  data: T[];
  barKeys: BarKey[];
  xAxisKey: keyof T;
}

function BarChart<T extends Record<string, any>>({ data, barKeys, xAxisKey }: BarChartProps<T>) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-full text-gray-500">No data available</div>;
  }

  const maxValue = Math.max(
    ...data.flatMap(item => barKeys.map(barKey => Number(item[barKey.key]) || 0))
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex items-end space-x-2">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div className="w-full flex space-x-1">
              {barKeys.map((barKey, barIndex) => {
                const value = Number(item[barKey.key]) || 0;
                const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
                return (
                  <div
                    key={barKey.key}
                    className="flex-1 bg-blue-500 rounded-t"
                    style={{ height: `${height}%` }}
                    title={`${barKey.name}: ${value}`}
                  />
                );
              })}
            </div>
            <div className="text-xs text-gray-600 mt-2 transform -rotate-45 origin-top">
              {String(item[xAxisKey])}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center space-x-4 mt-4">
        {barKeys.map((barKey) => (
          <div key={barKey.key} className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded mr-1"></div>
            <span className="text-xs text-gray-600">{barKey.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BarChart;