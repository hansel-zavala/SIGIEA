import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface GaugeChartProps {
  value: number;
  height?: number;
}

// Modern color palette for gauge
const GAUGE_COLORS = ['#10B981', '#E5E7EB']; // Emerald for attendance, Gray for absence

const GaugeChart: React.FC<GaugeChartProps> = ({ value, height }) => {
  const percentage = Math.min(Math.max(value, 0), 100);
  const data = [
    { name: 'Asistencia', value: percentage },
    { name: 'Ausencia', value: 100 - percentage },
  ];

  // Determine color based on performance
  const getGaugeColor = (p: number) => {
    if (p >= 80) return '#10B981'; // Green for excellent
    if (p >= 60) return '#F59E0B'; // Yellow for good
    return '#fab4b4ff'; // Red for poor
  };

  const gaugeColor = getGaugeColor(percentage);

  // Sizing
  const H = height ?? 300; // default larger
  const innerRadius = Math.round(H * 0.32);
  const outerRadius = Math.round(H * 0.5);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center" style={{ minHeight: H }}>
      <ResponsiveContainer width="100%" height={H}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            startAngle={90}
            endAngle={-270}
            paddingAngle={1}
            dataKey="value"
            stroke="none"
            animationBegin={0}
            animationDuration={1000}
            animationEasing="ease-out"
          >
            <Cell fill={gaugeColor} />
            <Cell fill="#F3F4F6" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Center text with enhanced styling */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="font-black text-gray-900 mb-1 drop-shadow-sm" style={{ fontSize: Math.round(H * 0.16) }}>
            {percentage}
          </div>
          <div className="text-gray-600 font-bold uppercase tracking-wider" style={{ fontSize: Math.round(H * 0.06) }}>
            %
          </div>
        </div>
      </div>

      {/* Performance indicator with enhanced styling */}
      <div className="absolute left-1/2 transform -translate-x-1/2" style={{ bottom: Math.round(H * -0.06) }}>
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg border border-gray-100" style={{ fontSize: Math.round(H * 0.05) }}>
          <div
            className="rounded-full shadow-sm ring-2 ring-white"
            style={{ backgroundColor: gaugeColor, width: Math.round(H * 0.04), height: Math.round(H * 0.04) }}
          />
          <span className="text-gray-700 font-bold">
            {percentage >= 80 ? 'Excelente' : percentage >= 60 ? 'Bueno' : 'Requiere Atención'}
          </span>
        </div>
      </div>

      {/* Subtle background glow */}
      <div
        className="absolute inset-0 rounded-full blur-xl opacity-20 pointer-events-none"
        style={{ backgroundColor: gaugeColor }}
      ></div>
    </div>
  );
};

export default GaugeChart;