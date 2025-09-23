import { useState, useEffect } from 'react';
import dashboardService, { type TherapistAttendanceTrend } from '../../services/dashboardService';
import ChartContainer from './ChartContainer';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

function TherapistAttendanceTrendsChart() {
  const [trendsData, setTrendsData] = useState<TherapistAttendanceTrend[]>([]);
  const [selectedTherapist, setSelectedTherapist] = useState<number | null>(null);
  const [timeRange, setTimeRange] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTrendsData = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getTherapistAttendanceTrends();
        setTrendsData(data);
        if (data.length > 0 && !selectedTherapist) {
          setSelectedTherapist(data[0].id);
        }
      } catch (error) {
        console.error('Error loading therapist attendance trends:', error);
        setError('No se pudieron cargar las tendencias de asistencia.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrendsData();
  }, []);

  const selectedTherapistData = trendsData.find(t => t.id === selectedTherapist);
  const chartData = selectedTherapistData ? selectedTherapistData[timeRange] : [];

  const generateAnalysis = (therapistData: TherapistAttendanceTrend, range: 'weekly' | 'monthly' | 'yearly') => {
    if (!therapistData) return { insights: [], recommendations: [] };

    const data = therapistData[range];
    const insights = [];
    const recommendations = [];

    // Calculate average attendance rate
    const avgRate = data.reduce((sum, item) => sum + item.attendanceRate, 0) / data.length;

    // Calculate trend (improving, declining, stable)
    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));

    const firstHalfAvg = firstHalf.reduce((sum, item) => sum + item.attendanceRate, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, item) => sum + item.attendanceRate, 0) / secondHalf.length;

    const trend = secondHalfAvg > firstHalfAvg + 5 ? 'improving' :
                 secondHalfAvg < firstHalfAvg - 5 ? 'declining' : 'stable';

    // Generate insights
    insights.push(`Tasa promedio de asistencia: ${avgRate.toFixed(1)}%`);
    insights.push(`Tendencia: ${trend === 'improving' ? 'Mejorando' : trend === 'declining' ? 'Disminuyendo' : 'Estable'}`);

    const lowAttendancePeriods = data.filter(item => item.attendanceRate < 70);
    if (lowAttendancePeriods.length > 0) {
      insights.push(`Períodos con baja asistencia: ${lowAttendancePeriods.length} de ${data.length}`);
    }

    // Generate recommendations
    if (avgRate < 75) {
      recommendations.push('Implementar sistema de recordatorios y seguimiento personalizado');
      recommendations.push('Revisar carga de trabajo y distribución de casos');
    }

    if (trend === 'declining') {
      recommendations.push('Investigar causas de la disminución en la asistencia');
      recommendations.push('Implementar medidas correctivas inmediatas');
    }

    if (lowAttendancePeriods.length > data.length * 0.3) {
      recommendations.push('Evaluar factores que afectan la asistencia regular');
    }

    return { insights, recommendations };
  };

  const analysis = selectedTherapistData ? generateAnalysis(selectedTherapistData, timeRange) : { insights: [], recommendations: [] };

  return (
    <div className="space-y-6">
      {/* Header with Therapist Selector */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                Tendencias de Asistencia por Terapeuta
              </h3>
              <p className="text-base text-gray-600 mt-1">
                Análisis histórico de asistencia por períodos
              </p>
            </div>

            {/* Therapist Selector */}
            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-gray-700">Seleccionar Terapeuta</label>
              <select
                value={selectedTherapist || ''}
                onChange={(e) => setSelectedTherapist(Number(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {trendsData.map(therapist => (
                  <option key={therapist.id} value={therapist.id}>
                    {therapist.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
          <div className="flex bg-white rounded-2xl p-1.5 shadow-inner w-fit">
            <button
              onClick={() => setTimeRange('weekly')}
              className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                timeRange === 'weekly'
                  ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Semanal
            </button>
            <button
              onClick={() => setTimeRange('monthly')}
              className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                timeRange === 'monthly'
                  ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setTimeRange('yearly')}
              className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                timeRange === 'yearly'
                  ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Anual
            </button>
          </div>
        </div>

        {/* Chart */}
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative mb-6">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
                <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-600 animate-spin animation-delay-300"></div>
              </div>
              <p className="text-xl text-gray-600 font-semibold">Cargando tendencias de asistencia...</p>
              <p className="text-sm text-gray-500 mt-2">Esto puede tomar unos momentos</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center max-w-lg mx-auto">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-red-900 mb-3">Error al cargar datos</h4>
              <p className="text-red-700 text-base">{error}</p>
            </div>
          ) : selectedTherapistData && chartData.length > 0 ? (
            <div className="space-y-6">
              {/* Line Chart */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Tendencia de Asistencia - {selectedTherapistData.name}
                </h4>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey={timeRange === 'weekly' ? 'week' : timeRange === 'monthly' ? 'month' : 'year'}
                        stroke="#6b7280"
                        fontSize={12}
                      />
                      <YAxis
                        domain={[0, 100]}
                        stroke="#6b7280"
                        fontSize={12}
                        label={{ value: 'Tasa de Asistencia (%)', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#f9fafb',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                        }}
                        formatter={(value: number, name: string) => [
                          `${value}%`,
                          'Tasa de Asistencia'
                        ]}
                        labelFormatter={(label) => `${timeRange === 'weekly' ? 'Semana' : timeRange === 'monthly' ? 'Mes' : 'Año'}: ${label}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="attendanceRate"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                        activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 2, fill: '#ffffff' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Analysis Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Insights */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-6 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
                    <h4 className="text-lg font-semibold text-green-800">Análisis de Tendencias</h4>
                  </div>
                  <div className="space-y-3">
                    {analysis.insights.map((insight, index) => (
                      <div key={index} className="flex items-start gap-3 bg-white p-3 rounded-lg shadow-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-gray-700">{insight}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-2xl border border-orange-100">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-6 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full"></div>
                    <h4 className="text-lg font-semibold text-orange-800">Recomendaciones</h4>
                  </div>
                  <div className="space-y-3">
                    {analysis.recommendations.length > 0 ? (
                      analysis.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start gap-3 bg-white p-3 rounded-lg shadow-sm">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-sm text-gray-700">{rec}</p>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-start gap-3 bg-white p-3 rounded-lg shadow-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-gray-700">El rendimiento es satisfactorio. Continuar con las prácticas actuales.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">No hay datos disponibles</h4>
              <p className="text-gray-600">Selecciona un terapeuta para ver sus tendencias de asistencia</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TherapistAttendanceTrendsChart;