import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MunicipalityChartProps {
  data: { municipality: string; count: number }[];
}

const MunicipalityChart: React.FC<MunicipalityChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart data={data} margin={{
        top: 5,
        right: 30,
        left: 20,
        bottom: 5,
      }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="municipality" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="count" fill="#8884d8" name="Alumnos" />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

export default MunicipalityChart;