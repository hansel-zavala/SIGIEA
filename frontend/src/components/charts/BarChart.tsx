
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BarChartProps {
  data: any[];
  barKeys: { key: string; name: string; color?: string }[];
  xAxisKey: string;
}

const BarChart: React.FC<BarChartProps> = ({ data, barKeys, xAxisKey }) => {
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xAxisKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        {barKeys.map((item, index) => (
          <Bar key={item.key} dataKey={item.key} name={item.name} fill={item.color || colors[index % colors.length]} />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

export default BarChart;
