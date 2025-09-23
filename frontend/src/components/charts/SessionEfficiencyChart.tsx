import { useState } from 'react';
import type { SessionComparison } from '../../services/dashboardService';
import ChartContainer from './ChartContainer';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, ComposedChart } from 'recharts';

interface SessionEfficiencyChartProps {
  data: SessionComparison[];
}

function SessionEfficiencyChart({ data }: SessionEfficiencyChartProps) {
  const [chartType, setChartType] = useState<'efficiency' | 'comparison' | 'trends'>('efficiency');

  // Calculate efficiency metrics
  const processedData = data.map(item => ({
    ...item,
    completionRate: item.planned > 0 ? ((item.completed / item.planned) * 100) : 0,
    absenceRate: item.planned > 0 ? ((item.absent / item.planned) * 100) : 0,
    cancellationRate: item.planned > 0 ? ((item.cancelled / item.planned) * 100) : 0,
    efficiency: item.planned > 0 ? ((item.completed / item.planned) * 100) : 0
  }));

  const generateInsights = () => {
    const insights: string[] = [];
    const recommendations: string[] = [];

    if (processedData.length === 0) return { insights, recommendations };

    const avgCompletion = processedData.reduce((sum, d) => sum + d.completionRate, 0) / processedData.length;
    const avgAbsence = processedData.reduce((sum, d) => sum + d.absenceRate, 0) / processedData.length;

    insights.push(`Tasa promedio de finalización: ${avgCompletion.toFixed(1)}%`);
    insights.push(`Tasa promedio de ausencias: ${avgAbsence.toFixed(1)}%`);

    if (avgCompletion < 75) {
      recommendations.push('Implementar recordatorios automáticos para mejorar asistencia');
      recommendations.push('Desarrollar programa de motivación para estudiantes');
    }

    if (avgAbsence > 20) {
      recommendations.push('Revisar horarios de sesiones para mejor conveniencia');
      recommendations.push('Implementar sistema de reagendamiento flexible');
    }

    const recentTrend = processedData.slice(-3);
    const improving = recentTrend.every((item, index) =>
      index === 0 || item.completionRate >= recentTrend[index - 1].completionRate
    );

    if (improving && recentTrend.length >= 2) {
      insights.push('Tendencia positiva en la eficiencia de sesiones recientes');
    }

    return { insights, recommendations };
  };

  const analysis = generateInsights();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-xl shadow-xl border border-gray-100 min-w-[250px]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-6 bg-gradient-to-b from-green-500 to-blue-600 rounded-full"></div>
            <p className="font-bold text-gray-900 text-lg">{label}</p>
          </div>
          <div className="space-y-2">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-3 p-2 rounded-lg bg-gray-50">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-gray-700 font-medium">{entry.name}:</span>
                </div>
                <span className="font-bold text-gray-900 text-lg">{entry.value.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    switch (chartType) {
      case 'efficiency':
        return (
          <ComposedChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="completionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#10B981" stopOpacity={0.3} />
              </linearGradient>
              <linearGradient id="absenceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EF4444" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#EF4444" stopOpacity={0.3} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" strokeOpacity={0.8} vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 13, fill: '#374151', fontWeight: 500 }}
              dy={12}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 13, fill: '#374151', fontWeight: 500 }}
              dx={-8}
              domain={[0, 100]}
              label={{ value: 'Porcentaje (%)', angle: -90, position: 'insideLeft' }}
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
            <Bar
              dataKey="completionRate"
              name="Finalización"
              fill="url(#completionGradient)"
              radius={[4, 4, 0, 0]}
              animationBegin={300}
              animationDuration={1000}
            />
            <Line
              type="monotone"
              dataKey="absenceRate"
              name="Ausencias"
              stroke="#EF4444"
              strokeWidth={3}
              dot={{ fill: '#EF4444', strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8, stroke: '#EF4444', strokeWidth: 2, fill: '#FFFFFF' }}
              animationBegin={800}
              animationDuration={1200}
            />
          </ComposedChart>
        );

      case 'comparison':
        return (
          <BarChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="plannedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.3} />
              </linearGradient>
              <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#10B981" stopOpacity={0.3} />
              </linearGradient>
              <linearGradient id="absentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.3} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" strokeOpacity={0.8} vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 13, fill: '#374151', fontWeight: 500 }}
              dy={12}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 13, fill: '#374151', fontWeight: 500 }}
              dx={-8}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                fontSize: '14px'
              }}
              formatter={(value: number) => [`${value} sesiones`, '']}
            />
            <Legend
              wrapperStyle={{
                paddingTop: '25px',
                fontSize: '14px',
                fontWeight: 500
              }}
              iconType="rect"
              iconSize={16}
            />
            <Bar
              dataKey="planned"
              name="Planificadas"
              fill="url(#plannedGradient)"
              radius={[2, 2, 0, 0]}
              animationBegin={200}
              animationDuration={800}
            />
            <Bar
              dataKey="completed"
              name="Completadas"
              fill="url(#completedGradient)"
              radius={[2, 2, 0, 0]}
              animationBegin={400}
              animationDuration={800}
            />
            <Bar
              dataKey="absent"
              name="Ausentes"
              fill="url(#absentGradient)"
              radius={[2, 2, 0, 0]}
              animationBegin={600}
              animationDuration={800}
            />
          </BarChart>
        );

      case 'trends':
        return (
          <LineChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="efficiencyGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.8} />
                <stop offset="50%" stopColor="#3B82F6" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.8} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" strokeOpacity={0.8} vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 13, fill: '#374151', fontWeight: 500 }}
              dy={12}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 13, fill: '#374151', fontWeight: 500 }}
              dx={-8}
              domain={[0, 100]}
              label={{ value: 'Eficiencia (%)', angle: -90, position: 'insideLeft' }}
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
            <Line
              type="monotone"
              dataKey="completionRate"
              name="Tasa de Finalización"
              stroke="url(#efficiencyGradient)"
              strokeWidth={4}
              dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8, stroke: '#10B981', strokeWidth: 2, fill: '#FFFFFF' }}
              animationBegin={400}
              animationDuration={1500}
            />
            <Line
              type="monotone"
              dataKey="absenceRate"
              name="Tasa de Ausencias"
              stroke="#EF4444"
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={{ fill: '#EF4444', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, stroke: '#EF4444', strokeWidth: 2, fill: '#FFFFFF' }}
              animationBegin={800}
              animationDuration={1500}
            />
          </LineChart>
        );

      default:
        return (
          <BarChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="completionRate" fill="#10B981" />
          </BarChart>
        );
    }
  };

  return (
    <ChartContainer title='Eficiencia de Sesiones'>
      <div className="space-y-6">
        {/* Chart Type Selector */}
        <div className="flex bg-gray-100 rounded-xl p-1 w-fit mx-auto">
          <button
            onClick={() => setChartType('efficiency')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              chartType === 'efficiency'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Eficiencia
          </button>
          <button
            onClick={() => setChartType('comparison')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              chartType === 'comparison'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Comparativa
          </button>
          <button
            onClick={() => setChartType('trends')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              chartType === 'trends'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Tendencias
          </button>
        </div>

        {/* Chart */}
        <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6 border border-green-100">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
            <h4 className="text-sm font-semibold text-green-800 mb-2">Métricas de Eficiencia</h4>
            <div className="space-y-2">
              {analysis.insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-xs text-gray-700">{insight}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">Recomendaciones</h4>
            <div className="space-y-2">
              {analysis.recommendations.length > 0 ? (
                analysis.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-xs text-gray-700">{rec}</p>
                  </div>
                ))
              ) : (
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-xs text-gray-700">Los indicadores de eficiencia son óptimos.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ChartContainer>
  );
}

export default SessionEfficiencyChart;