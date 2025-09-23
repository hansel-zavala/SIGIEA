import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { FaMale, FaFemale } from 'react-icons/fa';
import dashboardService from '../../services/dashboardService';

// Professional color palette
const GENDER_COLORS = ['#2563EB', '#BE219FFF']; // Professional blue for male, Slate for female

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const total = payload.reduce((acc: number, p: any) => acc + p.value, 0);
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 min-w-[180px]">
        <p className="font-semibold text-gray-900 mb-2">{data.name}</p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Cantidad:</span>
            <span className="font-semibold text-gray-900">{data.value}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Porcentaje:</span>
            <span className="font-semibold text-gray-900">{((data.value / total) * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

function GenderDistributionChart() {
    const [maleCount, setMaleCount] = useState(0);
    const [femaleCount, setFemaleCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchGenderData = async () => {
            try {
                setLoading(true);
                const data = await dashboardService.getGenderDistribution();
                setMaleCount(data.maleCount);
                setFemaleCount(data.femaleCount);
            } catch (err) {
                console.error("Error fetching gender distribution data:", err);
                setError('Failed to load gender distribution data.');
            } finally {
                setLoading(false);
            }
        };

        fetchGenderData();
    }, []);

    const total = maleCount + femaleCount;

    const data = [
      { name: 'Masculino', value: maleCount },
      { name: 'Femenino', value: femaleCount },
    ];

    const malePercentage = total > 0 ? ((maleCount / total) * 100).toFixed(1) : '0.0';
    const femalePercentage = total > 0 ? ((femaleCount / total) * 100).toFixed(1) : '0.0';


    if (loading) {
        return (
          <div className="flex items-center justify-center h-full">
            <p>Loading...</p>
          </div>
        );
    }

    if (error) {
        return (
          <div className="flex items-center justify-center h-full text-red-500">
            <p>{error}</p>
          </div>
        );
    }


  return (
    <div className="h-full w-full flex flex-col items-center justify-center">
      {/* Clean pie chart */}
      <div className="mb-8 w-full bg-white p-4 rounded-xl shadow-md border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-800 mb-2 text-center">Distribución por Género</h3>
        <div className="text-center mb-4">
          <div className="text-2xl font-bold text-gray-900">
            {total.toLocaleString('es-HN')} Estudiantes
          </div>
        </div>
        <ResponsiveContainer width="100%" height={420}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={140}
              paddingAngle={2}
              dataKey="value"
              stroke="#ffffff"
              strokeWidth={3}
              animationBegin={0}
              animationDuration={800}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={GENDER_COLORS[index % GENDER_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Gender breakdown - clean and professional */}
      <div className="w-full max-w-xs">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer">
            <div className="flex items-center justify-center mb-2">
              <FaMale className="text-blue-600 mr-2" />
              <span className="text-sm font-semibold text-gray-900">Masculino</span>
            </div>
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {maleCount}
            </div>
            <div className="text-sm text-gray-600">
              {malePercentage}%
            </div>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer">
            <div className="flex items-center justify-center mb-2">
              <FaFemale className="text-pink-600 mr-2" />
              <span className="text-sm font-semibold text-gray-900">Femenino</span>
            </div>
            <div className="text-2xl font-bold text-pink-600 mb-1">
              {femaleCount}
            </div>
            <div className="text-sm text-gray-600">
              {femalePercentage}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GenderDistributionChart;