
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

interface GaugeChartProps {
  value: number;
}

const COLORS = ['#0088FE', '#E0E0E0'];

const GaugeChart: React.FC<GaugeChartProps> = ({ value }) => {
  const data = [
    { name: 'Asistencia', value },
    { name: 'Ausencia', value: 100 - value },
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          startAngle={90}
          endAngle={-270}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Legend content={() => <div className="text-center text-2xl font-bold">{`${value}%`}</div>} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default GaugeChart;
