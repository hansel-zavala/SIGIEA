
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface BarChartProps {
  data: any[];
  barKeys: { key: string; name: string; color?: string }[];
  xAxisKey: string;
}

// Professional, modern color palette with gradients
const PROFESSIONAL_COLORS = [
  { primary: '#3B82F6', gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)' }, // Blue
  { primary: '#10B981', gradient: 'linear-gradient(135deg, #10B981 0%, #047857 100%)' }, // Emerald
  { primary: '#F59E0B', gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' }, // Amber
  { primary: '#EF4444', gradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)' }, // Red
  { primary: '#8B5CF6', gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' }, // Violet
  { primary: '#06B6D4', gradient: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)' }, // Cyan
  { primary: '#84CC16', gradient: 'linear-gradient(135deg, #84CC16 0%, #65A30D 100%)' }, // Lime
  { primary: '#F97316', gradient: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)' }, // Orange
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-xl border border-gray-100 min-w-[220px] backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
          <p className="font-bold text-gray-900 text-lg">{label}</p>
        </div>
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-3 p-2 rounded-lg bg-gray-50">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full shadow-sm"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-gray-700 font-medium">{entry.name}:</span>
              </div>
              <span className="font-bold text-gray-900 text-lg">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const BarChart: React.FC<BarChartProps> = ({ data, barKeys, xAxisKey }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart
        data={data}
        margin={{ top: 30, right: 40, left: 20, bottom: 20 }}
      >
        <defs>
          {PROFESSIONAL_COLORS.map((color, index) => (
            <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color.primary} stopOpacity={0.8} />
              <stop offset="100%" stopColor={color.primary} stopOpacity={0.3} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#F3F4F6"
          strokeOpacity={0.8}
          vertical={false}
        />
        <XAxis
          dataKey={xAxisKey}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 13, fill: '#374151', fontWeight: 500 }}
          dy={12}
          interval={0}
          angle={xAxisKey === 'therapist' ? -45 : 0}
          textAnchor={xAxisKey === 'therapist' ? 'end' : 'middle'}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 13, fill: '#374151', fontWeight: 500 }}
          dx={-8}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{
            paddingTop: '25px',
            fontSize: '14px',
            fontWeight: 500
          }}
          iconType="rect"
          iconSize={16}
        />
        {barKeys.map((item, index) => (
          <Bar
            key={item.key}
            dataKey={item.key}
            name={item.name}
            fill={item.color || PROFESSIONAL_COLORS[index % PROFESSIONAL_COLORS.length].primary}
            radius={[6, 6, 0, 0]}
            maxBarSize={70}
            animationBegin={index * 200}
            animationDuration={800}
          >
            {data.map((_, dataIndex) => (
              <Cell
                key={`cell-${dataIndex}`}
                fill={`url(#gradient-${index % PROFESSIONAL_COLORS.length})`}
                stroke={PROFESSIONAL_COLORS[index % PROFESSIONAL_COLORS.length].primary}
                strokeWidth={1}
              />
            ))}
          </Bar>
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

export default BarChart;
