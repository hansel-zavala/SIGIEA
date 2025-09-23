import { useState, useEffect } from 'react';
import dashboardService from '../../services/dashboardService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Area, AreaChart } from 'recharts';

interface ParentStatusData {
  activeCount: number;
  inactiveCount: number;
  total: number;
  relationshipDistribution: Array<{ relationship: string; count: number }>;
  monthlyRegistrations: Array<{ month: string; count: number }>;
  participationMetrics: {
    guardiansWithActiveStudents: number;
    participationRate: number;
  };
  systemMetrics?: {
    totalStudents: number;
    totalSessions: number;
    sessionCompletionRate: number;
    familiesWithMultipleChildren: number;
    recentActivity: {
      guardians: number;
      sessions: number;
    };
  };
}

function ParentStatusChart() {
  const [parentData, setParentData] = useState<ParentStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');
  const [viewType, setViewType] = useState<'status' | 'relationship' | 'trends'>('status');

  useEffect(() => {
    const fetchParentData = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getParentStatusDistribution();
        setParentData(data as ParentStatusData);
        setError(''); // Clear any previous errors
      } catch (error: any) {
        console.error('Error loading parent status data:', error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          // For demo purposes, show mock data when not authenticated
          console.log('Mostrando datos de demostración - Inicia sesión para ver datos reales');
          setParentData({
            activeCount: 8,
            inactiveCount: 2,
            total: 10,
            relationshipDistribution: [
              { relationship: 'Padre', count: 4 },
              { relationship: 'Madre', count: 3 },
              { relationship: 'Tutor_Legal', count: 1 },
              { relationship: 'Otro', count: 0 }
            ],
            monthlyRegistrations: [
              { month: 'Ene', count: 2 },
              { month: 'Feb', count: 1 },
              { month: 'Mar', count: 3 },
              { month: 'Abr', count: 1 },
              { month: 'May', count: 2 },
              { month: 'Jun', count: 0 },
              { month: 'Jul', count: 1 },
              { month: 'Ago', count: 0 },
              { month: 'Sep', count: 0 },
              { month: 'Oct', count: 0 },
              { month: 'Nov', count: 0 },
              { month: 'Dic', count: 0 }
            ],
            participationMetrics: {
              guardiansWithActiveStudents: 0,
              participationRate: 0
            }
          });
          setError('Datos de demostración - Inicia sesión para ver información real.');
        } else if (error.response?.status === 500) {
          setError('Error del servidor. Inténtalo de nuevo más tarde.');
        } else {
          setError('No se pudieron cargar los datos de estado de padres.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchParentData();
  }, []);

  // Enhanced professional colors for parent status chart
  const STATUS_COLORS = [
    {
      primary: '#10B981',
      gradient: 'linear-gradient(135deg, #10B981 0%, #059669 50%, #047857 100%)',
      light: '#D1FAE5',
      name: 'Activos',
      icon: '👨‍👩‍👧‍👦'
    }, // Green - Active
    {
      primary: '#EF4444',
      gradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 50%, #B91C1C 100%)',
      light: '#FEE2E2',
      name: 'Inactivos',
      icon: '😴'
    }, // Red - Inactive
  ];

  const generateAnalysis = (data: ParentStatusData) => {
    const insights: string[] = [];
    const recommendations: string[] = [];

    const activePercentage = ((data.activeCount / data.total) * 100).toFixed(1);
    const inactivePercentage = ((data.inactiveCount / data.total) * 100).toFixed(1);

    // Basic status insights
    insights.push(`👨‍👩‍👧‍👦 Padres activos: ${data.activeCount} (${activePercentage}%)`);
    insights.push(`😴 Padres inactivos: ${data.inactiveCount} (${inactivePercentage}%)`);
    insights.push(`📊 Total de padres registrados: ${data.total}`);
    insights.push(`🎯 Tasa de participación familiar: ${data.participationMetrics.participationRate}%`);

    // System-wide metrics if available
    if (data.systemMetrics) {
      insights.push(`👶 Estudiantes activos en el sistema: ${data.systemMetrics.totalStudents}`);
      insights.push(`🏥 Sesiones de terapia totales: ${data.systemMetrics.totalSessions}`);
      insights.push(`✅ Tasa de finalización de sesiones: ${data.systemMetrics.sessionCompletionRate.toFixed(1)}%`);
      insights.push(`👨‍👩‍👧‍👦 Familias con múltiples hijos: ${data.systemMetrics.familiesWithMultipleChildren}`);
      insights.push(`📅 Actividad reciente (30 días): ${data.systemMetrics.recentActivity.guardians} padres, ${data.systemMetrics.recentActivity.sessions} sesiones`);
    }

    // Relationship distribution insights
    const relationshipInsights = data.relationshipDistribution.map(rel => {
      const percentage = ((rel.count / data.activeCount) * 100).toFixed(1);
      const emoji = rel.relationship === 'Padre' ? '👨' : rel.relationship === 'Madre' ? '👩' : rel.relationship === 'Tutor_Legal' ? '👔' : '👤';
      return `${emoji} ${rel.relationship}: ${rel.count} (${percentage}%)`;
    });
    insights.push(`🏠 Distribución por parentesco: ${relationshipInsights.join(', ')}`);

    // Monthly registration trends
    const totalNewRegistrations = data.monthlyRegistrations.reduce((sum, month) => sum + month.count, 0);
    const avgMonthlyRegistrations = totalNewRegistrations / 12;
    const recentMonths = data.monthlyRegistrations.slice(-3);
    const recentTrend = recentMonths.reduce((sum, month) => sum + month.count, 0) / 3;
    insights.push(`📈 Promedio de registros mensuales: ${avgMonthlyRegistrations.toFixed(1)} padres`);
    insights.push(`📊 Tendencia reciente (3 meses): ${recentTrend.toFixed(1)} padres/mes`);

    // Advanced analysis and recommendations
    if (parseFloat(activePercentage) < 70) {
      insights.push('⚠️ ALERTA: Porcentaje de padres activos por debajo del 70%');
      recommendations.push('🚀 Implementar campañas de reactivación para padres inactivos');
      recommendations.push('💬 Mejorar comunicación y engagement con las familias');
      recommendations.push('📞 Crear programa de seguimiento personalizado con llamadas');
      recommendations.push('📧 Enviar recordatorios automáticos vía email/SMS');
    }

    if (data.inactiveCount > data.activeCount) {
      insights.push('🚨 CRÍTICO: Más padres inactivos que activos');
      recommendations.push('🔍 Revisar procesos de onboarding y retención de padres');
      recommendations.push('📋 Evaluar factores que causan la inactividad (encuestas)');
      recommendations.push('⏰ Implementar sistema de recordatorios automáticos');
      recommendations.push('🎯 Crear programa de re-engagement personalizado');
    }

    if (data.participationMetrics.participationRate < 80) {
      insights.push('⚠️ CONCERNO: Baja tasa de participación en estudiantes activos');
      recommendations.push('🤝 Fortalecer la colaboración familia-terapeuta');
      recommendations.push('👨‍👩‍👧‍👦 Desarrollar programas de involucramiento familiar');
      recommendations.push('📱 Crear app móvil para comunicación familia-centro');
      recommendations.push('🎓 Implementar talleres para padres sobre TEA');
    }

    // Relationship balance analysis
    const fatherCount = data.relationshipDistribution.find(r => r.relationship === 'Padre')?.count || 0;
    const motherCount = data.relationshipDistribution.find(r => r.relationship === 'Madre')?.count || 0;
    const tutorCount = data.relationshipDistribution.find(r => r.relationship === 'Tutor_Legal')?.count || 0;

    const totalParents = fatherCount + motherCount;
    const fatherPercentage = totalParents > 0 ? ((fatherCount / totalParents) * 100).toFixed(1) : '0';
    const motherPercentage = totalParents > 0 ? ((motherCount / totalParents) * 100).toFixed(1) : '0';

    insights.push(`⚖️ Balance parental: ${fatherPercentage}% padres vs ${motherPercentage}% madres`);

    if (Math.abs(fatherCount - motherCount) > Math.max(fatherCount, motherCount) * 0.3) {
      const dominant = fatherCount > motherCount ? 'padres' : 'madres';
      insights.push(`⚠️ Desbalance significativo: Mayor participación de ${dominant}`);
      recommendations.push(`🎯 Promover mayor involucramiento del progenitor menos representado (${dominant === 'padres' ? 'madres' : 'padres'})`);
      recommendations.push('📊 Realizar estudios sobre factores que afectan la participación parental');
    }

    if (tutorCount > (fatherCount + motherCount) * 0.3) {
      insights.push('⚠️ Alta proporción de tutores legales');
      recommendations.push('🔍 Evaluar situaciones familiares y ofrecer apoyo adicional');
      recommendations.push('📞 Crear programa de acompañamiento para tutores legales');
      recommendations.push('🤝 Facilitar comunicación entre tutores y familias biológicas');
    }

    // System performance insights
    if (data.systemMetrics) {
      const studentToGuardianRatio = data.systemMetrics.totalStudents > 0 ? (data.activeCount / data.systemMetrics.totalStudents).toFixed(2) : '0';
      insights.push(`📊 Ratio estudiante/padre: ${studentToGuardianRatio} (ideal: 1.0-2.0)`);

      if (data.systemMetrics.sessionCompletionRate < 70) {
        insights.push('⚠️ Baja tasa de finalización de sesiones de terapia');
        recommendations.push('🔧 Revisar protocolos de terapia y engagement');
        recommendations.push('📋 Implementar sistema de seguimiento de asistencia');
        recommendations.push('🎯 Desarrollar estrategias para mejorar la adherencia');
      }

      if (data.systemMetrics.familiesWithMultipleChildren > 0) {
        const multiChildPercentage = ((data.systemMetrics.familiesWithMultipleChildren / data.activeCount) * 100).toFixed(1);
        insights.push(`👨‍👩‍👧‍👦 Familias con múltiples hijos: ${multiChildPercentage}% del total`);
        recommendations.push('🎓 Crear programas especializados para familias con múltiples hijos con TEA');
        recommendations.push('💰 Ofrecer descuentos por hermanos');
      }
    }

    // Growth and trend analysis
    const growthRate = totalNewRegistrations > 0 ? ((data.monthlyRegistrations[data.monthlyRegistrations.length - 1]?.count || 0) / avgMonthlyRegistrations) * 100 : 0;
    if (growthRate > 120) {
      insights.push('📈 CRECIMIENTO: Aumento significativo en registros recientes');
      recommendations.push('⚡ Preparar recursos adicionales para el crecimiento');
      recommendations.push('👥 Contratar más personal terapéutico');
    } else if (growthRate < 80) {
      insights.push('📉 ESTANCAMIENTO: Disminución en registros recientes');
      recommendations.push('📢 Intensificar campañas de marketing y concienciación');
      recommendations.push('🔍 Investigar causas de la disminución');
    }

    return { insights, recommendations };
  };

  const analysis = parentData ? generateAnalysis(parentData) : { insights: [], recommendations: [] };

  // Status chart data
  const statusChartData = parentData ? [
    { name: 'Activos', value: parentData.activeCount, status: 'active' },
    { name: 'Inactivos', value: parentData.inactiveCount, status: 'inactive' }
  ] : [];

  // Relationship chart data
  const relationshipChartData = parentData ? parentData.relationshipDistribution.map(rel => ({
    name: rel.relationship.replace('_', ' ').replace('Tutor Legal', 'Tutor'),
    value: rel.count,
    relationship: rel.relationship
  })) : [];

  // Trends chart data
  const trendsChartData = parentData ? parentData.monthlyRegistrations : [];

  // Function to render the appropriate chart
  const renderChart = () => {
    if (viewType === 'status' && chartType === 'pie') {
      return (
        <PieChart>
          <defs>
            {STATUS_COLORS.map((color, index) => (
              <radialGradient key={`pieGradient-${index}`} id={`pieGradient-${index}`}>
                <stop offset="0%" stopColor={color.primary} stopOpacity={0.95} />
                <stop offset="50%" stopColor={color.primary} stopOpacity={0.8} />
                <stop offset="100%" stopColor={color.primary} stopOpacity={0.6} />
              </radialGradient>
            ))}
          </defs>
          <Pie
            data={statusChartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }: any) => {
              const percentage = (percent * 100).toFixed(0);
              const icon = STATUS_COLORS.find(c => c.name === name)?.icon;
              return `${icon} ${percentage}%`;
            }}
            outerRadius={120}
            innerRadius={55}
            fill="#8884d8"
            dataKey="value"
            animationBegin={600}
            animationDuration={1500}
            animationEasing="ease-out"
          >
            {statusChartData.map((_entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={`url(#pieGradient-${index % STATUS_COLORS.length})`}
                stroke={STATUS_COLORS[index % STATUS_COLORS.length].primary}
                strokeWidth={3}
                style={{
                  filter: 'drop-shadow(0 6px 12px rgba(0, 0, 0, 0.15))'
                }}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      );
    }

    if (viewType === 'status' && chartType === 'bar') {
      return (
        <BarChart data={statusChartData} margin={{ top: 40, right: 50, left: 30, bottom: 30 }}>
          <defs>
            {STATUS_COLORS.map((color, index) => (
              <linearGradient key={`barGradient-${index}`} id={`barGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color.primary} stopOpacity={0.9} />
                <stop offset="50%" stopColor={color.primary} stopOpacity={0.7} />
                <stop offset="100%" stopColor={color.primary} stopOpacity={0.4} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#E5E7EB"
            strokeOpacity={0.6}
            vertical={false}
          />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 14, fill: '#374151', fontWeight: 600 }}
            dy={12}
            interval={0}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 14, fill: '#374151', fontWeight: 600 }}
            dx={-10}
            label={{
              value: 'Número de Padres',
              angle: -90,
              position: 'insideLeft',
              style: { textAnchor: 'middle', fontSize: '13px', fill: '#6B7280', fontWeight: 500 }
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{
              paddingTop: '25px',
              fontSize: '15px',
              fontWeight: 600,
              color: '#374151'
            }}
            iconType="rect"
            iconSize={18}
          />
          <Bar
            dataKey="value"
            name="Cantidad de Padres"
            radius={[8, 8, 0, 0]}
            maxBarSize={120}
            animationBegin={400}
            animationDuration={1200}
            animationEasing="ease-out"
          >
            {statusChartData.map((_entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={`url(#barGradient-${index % STATUS_COLORS.length})`}
                stroke={STATUS_COLORS[index % STATUS_COLORS.length].primary}
                strokeWidth={2}
                style={{
                  filter: 'drop-shadow(0 6px 16px rgba(0, 0, 0, 0.2))'
                }}
              />
            ))}
          </Bar>
        </BarChart>
      );
    }

    if (viewType === 'relationship') {
      return (
        <BarChart data={relationshipChartData} margin={{ top: 40, right: 50, left: 30, bottom: 30 }}>
          <defs>
            <linearGradient id="relationshipGradient1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.9} />
              <stop offset="50%" stopColor="#8B5CF6" stopOpacity={0.7} />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.4} />
            </linearGradient>
            <linearGradient id="relationshipGradient2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EC4899" stopOpacity={0.9} />
              <stop offset="50%" stopColor="#EC4899" stopOpacity={0.7} />
              <stop offset="100%" stopColor="#EC4899" stopOpacity={0.4} />
            </linearGradient>
            <linearGradient id="relationshipGradient3" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.9} />
              <stop offset="50%" stopColor="#F59E0B" stopOpacity={0.7} />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.4} />
            </linearGradient>
            <linearGradient id="relationshipGradient4" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6B7280" stopOpacity={0.9} />
              <stop offset="50%" stopColor="#6B7280" stopOpacity={0.7} />
              <stop offset="100%" stopColor="#6B7280" stopOpacity={0.4} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#E5E7EB"
            strokeOpacity={0.6}
            vertical={false}
          />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#374151', fontWeight: 600 }}
            dy={12}
            interval={0}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 14, fill: '#374151', fontWeight: 600 }}
            dx={-10}
          />
          <Tooltip
            formatter={(value: any) => [value, 'Cantidad']}
            labelStyle={{ color: '#374151', fontWeight: 600 }}
          />
          <Bar
            dataKey="value"
            name="Cantidad de Padres"
            radius={[8, 8, 0, 0]}
            maxBarSize={100}
            animationBegin={400}
            animationDuration={1200}
            animationEasing="ease-out"
          >
            {relationshipChartData.map((_entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={`url(#relationshipGradient${(index % 4) + 1})`}
                stroke={`#${['8B5CF6', 'EC4899', 'F59E0B', '6B7280'][index % 4]}`}
                strokeWidth={2}
                style={{
                  filter: 'drop-shadow(0 6px 16px rgba(0, 0, 0, 0.2))'
                }}
              />
            ))}
          </Bar>
        </BarChart>
      );
    }

    if (viewType === 'trends') {
      return (
        <AreaChart data={trendsChartData} margin={{ top: 40, right: 50, left: 30, bottom: 30 }}>
          <defs>
            <linearGradient id="trendsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.8} />
              <stop offset="50%" stopColor="#3B82F6" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#E5E7EB"
            strokeOpacity={0.6}
            vertical={false}
          />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#374151', fontWeight: 600 }}
            dy={12}
            interval={0}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 14, fill: '#374151', fontWeight: 600 }}
            dx={-10}
          />
          <Tooltip
            formatter={(value: any) => [value, 'Nuevos Padres']}
            labelStyle={{ color: '#374151', fontWeight: 600 }}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#3B82F6"
            strokeWidth={3}
            fill="url(#trendsGradient)"
            animationBegin={400}
            animationDuration={1200}
            animationEasing="ease-out"
          />
        </AreaChart>
      );
    }

    // Default fallback chart
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <p>Selecciona una vista para ver los datos</p>
        </div>
      </div>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const total = parentData?.total || 0;
      const percentage = ((data.value / total) * 100).toFixed(1);
      const isActive = data.name === 'Activos';
      const color = isActive ? STATUS_COLORS[0] : STATUS_COLORS[1];

      return (
        <div className="bg-white p-5 rounded-2xl shadow-2xl border border-gray-200 min-w-[280px] backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-2xl">{isActive ? '👨‍👩‍👧‍👦' : '😴'}</div>
            <div>
              <p className="font-bold text-gray-900 text-xl">{data.name}</p>
              <p className="text-sm text-gray-500">Estado de participación</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Cantidad:</span>
              <span className="font-bold text-2xl" style={{ color: color.primary }}>{data.value}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Porcentaje:</span>
              <span className="font-bold text-lg" style={{ color: color.primary }}>{percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${percentage}%`,
                  background: color.gradient
                }}
              ></div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 italic">
              {isActive ? 'Padres participando activamente en el programa' : 'Padres sin actividad reciente'}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600"></div>
            <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-blue-600 animate-spin animation-delay-300"></div>
          </div>
          <p className="text-xl text-gray-600 font-semibold">Cargando distribución de padres...</p>
          <p className="text-sm text-gray-500 mt-2">Analizando estado de participación</p>
        </div>
      ) : error && !error.includes('demostración') ? (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center max-w-lg mx-auto">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h4 className="text-xl font-semibold text-red-900 mb-3">
            {error.includes('iniciar sesión') ? 'Autenticación requerida' : 'Error al cargar datos'}
          </h4>
          <p className="text-red-700 text-base mb-4">{error}</p>
          {error.includes('iniciar sesión') && (
            <button
              onClick={() => window.location.href = '/login'}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Ir al Login
            </button>
          )}
        </div>
      ) : error && error.includes('demostración') ? (
        <div className="bg-blue-50 border border-blue-200 rounded-3xl p-8 text-center max-w-lg mx-auto">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h4 className="text-xl font-semibold text-blue-900 mb-3">Datos de Demostración</h4>
          <p className="text-blue-700 text-base mb-4">{error}</p>
          <div className="text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
            Inicia sesión para ver datos reales de tu institución
          </div>
        </div>
      ) : parentData && (
        (viewType === 'status' && statusChartData.length > 0) ||
        (viewType === 'relationship' && relationshipChartData.length > 0) ||
        (viewType === 'trends' && trendsChartData.length > 0)
      ) ? (
        <div className="space-y-8">
          {/* Header Section with Key Metrics */}
          <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-3xl p-8 border border-gray-200/50 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="text-4xl mb-2">👨‍👩‍👧‍👦</div>
                <div className="text-2xl font-bold text-green-600 mb-1">{parentData.activeCount}</div>
                <div className="text-sm font-semibold text-green-700 mb-1">Padres Activos</div>
                <div className="text-xs text-green-600 bg-green-50 px-3 py-1 rounded-full inline-block font-medium">
                  {((parentData.activeCount / parentData.total) * 100).toFixed(1)}% del total
                </div>
              </div>

              <div className="text-center bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="text-4xl mb-2">📈</div>
                <div className="text-2xl font-bold text-blue-600 mb-1">{parentData.participationMetrics.participationRate}%</div>
                <div className="text-sm font-semibold text-blue-700 mb-1">Participación</div>
                <div className="text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block font-medium">
                  Padres con estudiantes activos
                </div>
              </div>

              <div className="text-center bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="text-4xl mb-2">👪</div>
                <div className="text-2xl font-bold text-purple-600 mb-1">{parentData.relationshipDistribution.length}</div>
                <div className="text-sm font-semibold text-purple-700 mb-1">Tipos de Parentesco</div>
                <div className="text-xs text-purple-600 bg-purple-50 px-3 py-1 rounded-full inline-block font-medium">
                  Relaciones identificadas
                </div>
              </div>

              <div className="text-center bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="text-4xl mb-2">📊</div>
                <div className="text-2xl font-bold text-gray-600 mb-1">{parentData.total}</div>
                <div className="text-sm font-semibold text-gray-700 mb-1">Total Padres</div>
                <div className="text-xs text-gray-600 bg-gray-50 px-3 py-1 rounded-full inline-block font-medium">
                  100% registrados
                </div>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Chart Header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Visualización de Datos</h3>
                  <p className="text-sm text-gray-600">
                    {viewType === 'status' && 'Distribución por estado de participación'}
                    {viewType === 'relationship' && 'Distribución por tipo de parentesco'}
                    {viewType === 'trends' && 'Tendencias de registro mensual'}
                  </p>
                </div>

                {/* View and Chart Type Selectors */}
                <div className="flex gap-3">
                  {/* View Type Selector */}
                  <div className="flex bg-white rounded-xl p-1 shadow-sm border border-gray-200">
                    <button
                      onClick={() => setViewType('status')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                        viewType === 'status'
                          ? 'bg-blue-50 text-blue-700 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <span className="text-base">📊</span>
                      Estado
                    </button>
                    <button
                      onClick={() => setViewType('relationship')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                        viewType === 'relationship'
                          ? 'bg-blue-50 text-blue-700 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <span className="text-base">👪</span>
                      Parentesco
                    </button>
                    <button
                      onClick={() => setViewType('trends')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                        viewType === 'trends'
                          ? 'bg-blue-50 text-blue-700 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <span className="text-base">📈</span>
                      Tendencias
                    </button>
                  </div>

                  {/* Chart Type Selector (only for status view) */}
                  {viewType === 'status' && (
                    <div className="flex bg-white rounded-xl p-1 shadow-sm border border-gray-200">
                      <button
                        onClick={() => setChartType('pie')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                          chartType === 'pie'
                            ? 'bg-blue-50 text-blue-700 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <span className="text-base">🥧</span>
                        Circular
                      </button>
                      <button
                        onClick={() => setChartType('bar')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                          chartType === 'bar'
                            ? 'bg-blue-50 text-blue-700 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <span className="text-base">📊</span>
                        Barras
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Chart Content */}
            <div className="p-8 bg-gradient-to-br from-gray-50 to-white">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
                <div className="h-[450px] mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    {renderChart()}
                  </ResponsiveContainer>
                </div>

                {/* Chart Legend/Info */}
                <div className="grid grid-cols-2 gap-6 pt-4 border-t-2 border-gray-100">
                  <div className="text-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="w-4 h-4 bg-green-500 rounded-full shadow-sm"></div>
                      <span className="text-base font-bold text-green-700">Padres Activos</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600 mb-1">{parentData.activeCount}</div>
                    <div className="text-xs text-green-600 font-medium">padres registrados</div>
                  </div>
                  <div className="text-center bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-4 border border-red-200">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="w-4 h-4 bg-red-500 rounded-full shadow-sm"></div>
                      <span className="text-base font-bold text-red-700">Padres Inactivos</span>
                    </div>
                    <div className="text-2xl font-bold text-red-600 mb-1">{parentData.inactiveCount}</div>
                    <div className="text-xs text-red-600 font-medium">padres registrados</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Analysis Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Key Insights */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-xl">📈</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-green-800">Análisis Clave</h4>
                    <p className="text-sm text-green-600">Métricas principales</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {analysis.insights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-green-50/50 rounded-xl border border-green-100/50">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-bold text-green-700">{index + 1}</span>
                    </div>
                    <p className="text-sm text-gray-700 font-medium leading-relaxed">{insight}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-xl">💡</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-blue-800">Recomendaciones</h4>
                    <p className="text-sm text-blue-600">Acciones sugeridas</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {analysis.recommendations.length > 0 ? (
                  analysis.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100/50">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-sm font-bold text-blue-700">💡</span>
                      </div>
                      <p className="text-sm text-gray-700 font-medium leading-relaxed">{rec}</p>
                    </div>
                  ))
                ) : (
                  <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100/50">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-lg">🎉</span>
                    </div>
                    <p className="text-sm text-gray-700 font-medium">¡Excelente! La participación de padres se mantiene en niveles óptimos.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-4xl">📊</span>
          </div>
          <h4 className="text-xl font-semibold text-gray-900 mb-3">No hay datos disponibles</h4>
          <p className="text-gray-600 max-w-md mx-auto">No se encontraron datos de estado de padres en el sistema. Los datos aparecerán una vez que se registren padres en la plataforma.</p>
        </div>
      )}
    </div>
  );
}

export default ParentStatusChart;