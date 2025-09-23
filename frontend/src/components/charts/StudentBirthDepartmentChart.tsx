import { useState, useEffect } from 'react';
import dashboardService, { type StudentBirthDepartment } from '../../services/dashboardService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import ChartContainer from './ChartContainer';

function StudentBirthDepartmentChart() {
  const [departmentData, setDepartmentData] = useState<StudentBirthDepartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chartType, setChartType] = useState<'pie' | 'table'>('pie');

  useEffect(() => {
    const fetchDepartmentData = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getStudentBirthDepartmentDistribution();
        setDepartmentData(data);
      } catch (error) {
        console.error('Error loading student birth department data:', error);
        setError('No se pudieron cargar los datos de distribución por departamento.');
      } finally {
        setLoading(false);
      }
    };

    fetchDepartmentData();
  }, []);

  // Colors for the charts
  const COLORS = [
    '#3b82f6', // blue
    '#ef4444', // red
    '#10b981', // emerald
    '#f59e0b', // amber
    '#8b5cf6', // violet
    '#06b6d4', // cyan
    '#84cc16', // lime
    '#f97316', // orange
    '#ec4899', // pink
    '#6b7280', // gray
    '#14b8a6', // teal
    '#a855f7', // purple
    '#eab308', // yellow
    '#dc2626', // red-600
    '#059669', // emerald-600
    '#7c3aed', // violet-600
    '#db2777', // pink-600
    '#0891b2', // cyan-600
    '#65a30d', // lime-600
  ];

  const generateAnalysis = (data: StudentBirthDepartment[]) => {
    const insights: string[] = [];
    const recommendations: string[] = [];

    if (data.length === 0) return { insights, recommendations };

    const totalStudents = data.reduce((sum, item) => sum + item.count, 0);
    const topDepartment = data[0];
    const topPercentage = ((topDepartment.count / totalStudents) * 100).toFixed(1);

    // Calculate concentration index
    const concentrationRatio = topDepartment.count / totalStudents;
    const isConcentrated = concentrationRatio > 0.3;

    insights.push(`Total de estudiantes: ${totalStudents}`);
    insights.push(`Departamento con más estudiantes: ${topDepartment.department} (${topPercentage}%)`);

    if (isConcentrated) {
      insights.push('Alta concentración en un departamento específico');
      recommendations.push('Considerar expansión de servicios a otros departamentos');
      recommendations.push('Evaluar factores de concentración geográfica');
    } else {
      insights.push('Distribución relativamente equilibrada entre departamentos');
    }

    // Check for departments with low representation
    const lowRepresentation = data.filter(item => (item.count / totalStudents) < 0.05);
    if (lowRepresentation.length > 0) {
      insights.push(`${lowRepresentation.length} departamento(s) con baja representación (<5%)`);
      recommendations.push('Desarrollar estrategias de alcance para departamentos subrepresentados');
    }

    // Geographic diversity insights
    const uniqueDepartments = data.length;
    if (uniqueDepartments >= 8) {
      insights.push('Buena cobertura geográfica nacional');
    } else if (uniqueDepartments >= 5) {
      insights.push('Cobertura geográfica moderada');
      recommendations.push('Expandir alcance a más departamentos');
    } else {
      insights.push('Cobertura geográfica limitada');
      recommendations.push('Priorizar expansión geográfica');
    }

    return { insights, recommendations };
  };

  const analysis = generateAnalysis(departmentData);

  return (
    <ChartContainer
      title="Distribución de Estudiantes por Departamento de Nacimiento"
      headerRight={
        <div className="flex bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setChartType('pie')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              chartType === 'pie'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Circular
          </button>
          <button
            onClick={() => setChartType('table')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              chartType === 'table'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Tabla
          </button>
        </div>
      }
      insights={analysis.insights}
      recommendations={analysis.recommendations}
      printContextNote={`Vista: ${chartType === 'pie' ? 'Circular' : 'Tabla'}`}
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
            <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-600 animate-spin animation-delay-300"></div>
          </div>
          <p className="text-xl text-gray-600 font-semibold">Cargando distribución geográfica...</p>
          <p className="text-sm text-gray-500 mt-2">Analizando datos de nacimiento</p>
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
      ) : departmentData.length > 0 ? (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
            {chartType === 'table' ? (
              <div className="overflow-x-auto">
                <table className="w-full bg-white rounded-lg overflow-hidden shadow-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Departamento
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Estudiantes
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Porcentaje
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Ranking
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {departmentData.map((dept, index) => {
                      const totalStudents = departmentData.reduce((sum, d) => sum + d.count, 0);
                      const percentage = ((dept.count / totalStudents) * 100).toFixed(1);
                      return (
                        <tr key={dept.department} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                            {dept.department}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">
                            {dept.count}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 text-right">
                            {percentage}%
                          </td>
                          <td className="px-4 py-3 text-sm text-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              index === 0 ? 'bg-yellow-100 text-yellow-800' :
                              index === 1 ? 'bg-gray-100 text-gray-800' :
                              index === 2 ? 'bg-orange-100 text-orange-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              #{index + 1}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        Total
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                        {departmentData.reduce((sum, dept) => sum + dept.count, 0)}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                        100.0%
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={departmentData.map(item => ({ ...item, name: item.department, value: item.count }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {departmentData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`${value} estudiantes`, 'Cantidad']}
                      contentStyle={{
                        backgroundColor: '#f9fafb',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Departamentos Representados</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {departmentData.map((dept, index) => (
                <div key={dept.department} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="text-xs text-gray-700 truncate">{dept.department}</span>
                  <span className="text-xs text-gray-500 ml-auto">({dept.count})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h4 className="text-xl font-semibold text-gray-900 mb-3">No hay datos disponibles</h4>
          <p className="text-gray-600">No se encontraron datos de distribución por departamento</p>
        </div>
      )}
    </ChartContainer>
  );
}

export default StudentBirthDepartmentChart;