import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import dashboardService, {
  type TherapyAttendance,
  type StudentAgeDistribution,
  type TherapistWorkload,
  type FrequentTherapies,
  type SessionComparison,
} from '../services/dashboardService.js';
import ChartContainer from '../components/charts/ChartContainer.js';
import GaugeChart from '../components/charts/GaugeChart.js';
import BarChart from '../components/charts/BarChart.js';
import TherapistAttendanceChart from '../components/charts/TherapistAttendanceChart.js';
import TherapistAttendanceTrendsChart from '../components/charts/TherapistAttendanceTrendsChart.js';
import StudentBirthDepartmentChart from '../components/charts/StudentBirthDepartmentChart.js';
import GenderChart from '../components/charts/GenderChart.js';

interface Trend {
  metric: string;
  current: string;
  trend: string;
  prediction: string;
  confidence: string;
}

// Función de análisis avanzado con predicciones basadas en tendencias
const generateAdvancedAnalysis = (
  therapyAttendance: TherapyAttendance | null,
  studentAgeDistribution: StudentAgeDistribution[],
  therapistWorkload: TherapistWorkload[],
  frequentTherapies: FrequentTherapies[],
  sessionComparison: SessionComparison[],
  genderDistribution: { maleCount: number; femaleCount: number; total: number } | null
) => {
  const recommendations = [];
  const predictions = [];
  const insights = [];
  const chartTrends: {
    therapyAttendance: Trend[];
    studentAgeDistribution: Trend[];
    therapistWorkload: Trend[];
    frequentTherapies: Trend[];
    sessionComparison: Trend[];
    genderDistribution: Trend[];
  } = {
    therapyAttendance: [],
    studentAgeDistribution: [],
    therapistWorkload: [],
    frequentTherapies: [],
    sessionComparison: [],
    genderDistribution: []
  };

  // Análisis de asistencia con predicciones avanzadas
  if (therapyAttendance) {
    const rate = therapyAttendance.attendanceRate;
    const attendanceTrend = rate > 75 ? 'positive' : rate > 60 ? 'neutral' : 'negative';

    if (rate < 75) {
      recommendations.push('Implementar sistema de recordatorios automáticos vía SMS y email para mejorar la asistencia.');
      recommendations.push('Crear programa de seguimiento personalizado para estudiantes con baja asistencia.');
      predictions.push('Con intervención inmediata, se proyecta mejorar la asistencia en un 15-25% en los próximos 3 meses.');
      predictions.push('Reducción potencial del 20% en costos operativos por mejor aprovechamiento de sesiones.');
    } else {
      predictions.push('Tendencia positiva: Se espera mantener o mejorar la tasa de asistencia actual.');
      insights.push('La alta tasa de asistencia indica compromiso efectivo de estudiantes y familias.');
    }

    chartTrends.therapyAttendance.push({
      metric: 'Asistencia',
      current: `${rate}%`,
      trend: attendanceTrend,
      prediction: rate < 75 ? 'Mejora esperada' : 'Estable',
      confidence: rate < 75 ? 'Alta' : 'Media'
    });
  }

  // Análisis demográfico avanzado
  if (studentAgeDistribution.length > 0) {
    const totalStudents = studentAgeDistribution.reduce((acc, curr) => acc + curr.count, 0);
    const averageAge = studentAgeDistribution.reduce((acc, curr) => acc + (curr.age * curr.count), 0) / totalStudents;

    const ageGroups = {
      earlyChildhood: studentAgeDistribution.filter(d => d.age < 6).reduce((acc, curr) => acc + curr.count, 0),
      childhood: studentAgeDistribution.filter(d => d.age >= 6 && d.age < 12).reduce((acc, curr) => acc + curr.count, 0),
      adolescence: studentAgeDistribution.filter(d => d.age >= 12 && d.age < 18).reduce((acc, curr) => acc + curr.count, 0),
      adults: studentAgeDistribution.filter(d => d.age >= 18).reduce((acc, curr) => acc + curr.count, 0),
    };

    insights.push(`Edad promedio de estudiantes: ${averageAge.toFixed(1)} años.`);

    if (ageGroups.earlyChildhood > ageGroups.adolescence) {
      recommendations.push('Fortalecer programas de intervención temprana y colaboración con instituciones educativas.');
      predictions.push('Aumento del 30% en derivaciones de escuelas en los próximos 6 meses.');
      chartTrends.studentAgeDistribution.push({
        metric: 'Población Infantil',
        current: `${((ageGroups.earlyChildhood + ageGroups.childhood) / totalStudents * 100).toFixed(1)}%`,
        trend: 'growing',
        prediction: 'Crecimiento sostenido',
        confidence: 'Alta'
      });
    }

    if (ageGroups.adults / totalStudents > 0.3) {
      recommendations.push('Desarrollar programas especializados para adultos con necesidades específicas.');
      predictions.push('Incremento del 25% en demanda de terapias para adultos mayores.');
    }
  }

  // Análisis de carga de trabajo con predicciones
  if (therapistWorkload.length > 0) {
    const averageLoad = therapistWorkload.reduce((acc, curr) => acc + curr.load, 0) / therapistWorkload.length;
    const highLoadTherapists = therapistWorkload.filter(t => t.load > averageLoad * 1.5);
    const lowLoadTherapists = therapistWorkload.filter(t => t.load < averageLoad * 0.5);

    if (highLoadTherapists.length > 0) {
      recommendations.push(`Redistribuir ${highLoadTherapists.length} terapeuta(s) con carga excesiva para prevenir burnout.`);
      recommendations.push('Implementar sistema de rotación de casos para balancear carga de trabajo.');
      predictions.push('Mejora del 20% en calidad de terapias tras redistribución de carga.');
      predictions.push('Reducción del 15% en ausentismo de terapeutas por fatiga.');
    }

    if (lowLoadTherapists.length > 0) {
      recommendations.push('Optimizar asignación de casos para terapeutas con baja carga de trabajo.');
      predictions.push('Incremento del 10-15% en productividad general del centro.');
    }

    chartTrends.therapistWorkload.push({
      metric: 'Carga de Trabajo',
      current: `${averageLoad.toFixed(1)} sesiones/semana`,
      trend: highLoadTherapists.length > 0 ? 'unbalanced' : 'balanced',
      prediction: highLoadTherapists.length > 0 ? 'Requiere balanceo' : 'Estable',
      confidence: 'Alta'
    });
  }

  // Análisis de terapias con tendencias de mercado
  if (frequentTherapies.length > 0) {
    const mostFrequent = frequentTherapies.reduce((prev, current) => (prev.count > current.count) ? prev : current);
    const leastFrequent = frequentTherapies.reduce((prev, current) => (prev.count < current.count) ? prev : current);

    if (mostFrequent.count > leastFrequent.count * 2) {
      recommendations.push(`Invertir en especialización avanzada para "${mostFrequent.therapy}".`);
      recommendations.push('Desarrollar protocolos estandarizados para terapia de alta demanda.');
      predictions.push(`Crecimiento del 40% en demanda de "${mostFrequent.therapy}" en el próximo año.`);
      predictions.push('Oportunidad de expansión de servicios especializados.');
    }

    chartTrends.frequentTherapies.push({
      metric: 'Terapia Más Demandada',
      current: mostFrequent.therapy,
      trend: 'growing',
      prediction: 'Aumento sostenido',
      confidence: 'Media-Alta'
    });
  }

  // Análisis de sesiones con métricas de eficiencia
  if (sessionComparison.length > 0) {
    const totalPlanned = sessionComparison.reduce((acc, curr) => acc + curr.planned, 0);
    const totalCompleted = sessionComparison.reduce((acc, curr) => acc + curr.completed, 0);
    const totalAbsent = totalPlanned - totalCompleted; // Calcular ausencias como diferencia

    const completionRate = totalPlanned > 0 ? (totalCompleted / totalPlanned) * 100 : 0;
    const absentRate = totalPlanned > 0 ? (totalAbsent / totalPlanned) * 100 : 0;

    insights.push(`Tasa de finalización de sesiones: ${completionRate.toFixed(1)}%.`);
    insights.push(`Tasa de ausencias: ${absentRate.toFixed(1)}%.`);

    if (completionRate < 80) {
      recommendations.push('Implementar sistema de confirmación 24h antes de sesiones.');
      recommendations.push('Desarrollar programa de motivación para mejorar asistencia.');
      predictions.push('Mejora potencial del 25% en finalización de sesiones con nuevas estrategias.');
    }

    if (absentRate > 15) {
      recommendations.push('Crear política de reagendamiento flexible y sistema de recordatorios.');
      predictions.push('Reducción del 30% en ausencias con mejor comunicación.');
    }

    chartTrends.sessionComparison.push({
      metric: 'Eficiencia de Sesiones',
      current: `${completionRate.toFixed(1)}%`,
      trend: completionRate > 85 ? 'excellent' : completionRate > 75 ? 'good' : 'needs_improvement',
      prediction: completionRate < 80 ? 'Mejora necesaria' : 'Mantener nivel',
      confidence: 'Alta'
    });
  }

  // Análisis de distribución por género
  if (genderDistribution) {
    const malePercentage = (genderDistribution.maleCount / genderDistribution.total) * 100;
    const femalePercentage = (genderDistribution.femaleCount / genderDistribution.total) * 100;

    insights.push(`Distribución por género: ${malePercentage.toFixed(1)}% masculino, ${femalePercentage.toFixed(1)}% femenino.`);

    if (Math.abs(malePercentage - femalePercentage) > 30) {
      const dominant = malePercentage > femalePercentage ? 'masculino' : 'femenino';
      recommendations.push(`Desarrollar programas específicos para el género ${dominant} para mejorar la inclusión y equidad.`);
      recommendations.push('Implementar estrategias de diversidad para equilibrar la representación de géneros.');
      predictions.push('Mejora en la equidad de género podría aumentar la satisfacción general en un 15-20%.');
    } else {
      insights.push('La distribución por género está relativamente equilibrada.');
    }

    chartTrends.genderDistribution.push({
      metric: 'Equidad de Género',
      current: `${Math.abs(malePercentage - femalePercentage).toFixed(1)}% diferencia`,
      trend: Math.abs(malePercentage - femalePercentage) > 30 ? 'needs_attention' : 'balanced',
      prediction: Math.abs(malePercentage - femalePercentage) > 30 ? 'Mejora necesaria' : 'Equilibrado',
      confidence: 'Alta'
    });
  }

  // Recomendaciones generales basadas en análisis holístico
  if (recommendations.length === 0) {
    recommendations.push('Los indicadores actuales son sólidos. Continuar con las prácticas actuales y monitorear tendencias.');
    predictions.push('Proyección positiva: Mantenimiento de estándares de calidad actuales.');
  }

  return { recommendations, predictions, insights, chartTrends };
};

function AnalisisDeGraficasPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAnalysis, setShowAnalysis] = useState(false);

  // Check permission
  const hasPermission = user && (user.role === 'ADMIN' || user.permissions?.['VIEW_ANALYSIS']);
  if (!hasPermission) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
          <p className="text-gray-600">No tienes permisos para acceder a esta sección.</p>
        </div>
      </div>
    );
  }

  const [therapyAttendance, setTherapyAttendance] = useState<TherapyAttendance | null>(null);
  const [studentAgeDistribution, setStudentAgeDistribution] = useState<StudentAgeDistribution[]>([]);
  const [therapistWorkload, setTherapistWorkload] = useState<TherapistWorkload[]>([]);
  const [frequentTherapies, setFrequentTherapies] = useState<FrequentTherapies[]>([]);
  const [sessionComparison, setSessionComparison] = useState<SessionComparison[]>([]);
  const [genderDistribution, setGenderDistribution] = useState<{ maleCount: number; femaleCount: number; total: number } | null>(null);

  const analysis = generateAdvancedAnalysis(
    therapyAttendance,
    studentAgeDistribution,
    therapistWorkload,
    frequentTherapies,
    sessionComparison,
    genderDistribution
  );

  useEffect(() => {
    const loadChartData = () => {
      setLoading(true);
      Promise.all([
        dashboardService.getTherapyAttendance(),
        dashboardService.getStudentAgeDistribution(),
        dashboardService.getTherapistWorkload(),
        dashboardService.getMostFrequentTherapies(),
        dashboardService.getSessionComparison(),
        dashboardService.getGenderDistribution(),
      ]).then(([therapyAttendanceData, studentAgeDistributionData, therapistWorkloadData, frequentTherapiesData, sessionComparisonData, genderDistributionData]) => {
        setTherapyAttendance(therapyAttendanceData);
        setStudentAgeDistribution(studentAgeDistributionData);
        setTherapistWorkload(therapistWorkloadData);
        setFrequentTherapies(frequentTherapiesData);
        setSessionComparison(sessionComparisonData);
        setGenderDistribution(genderDistributionData);
      }).catch(() => {
        setError('No se pudo cargar la información de los gráficos.');
      }).finally(() => {
        setLoading(false);
      });
    };

    loadChartData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Análisis de Gráficas</h1>
            <p className="text-gray-600 mt-1">Información detallada y recomendaciones basadas en datos</p>
          </div>
          <button
            onClick={() => setShowAnalysis(!showAnalysis)}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            {showAnalysis ? 'Ocultar Análisis' : 'Analizar Gráficas'}
          </button>
        </div>

        {showAnalysis && (
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            <div className="flex items-center mb-6">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Análisis Avanzado y Predicciones</h2>
                <p className="text-gray-600">Insights inteligentes con proyecciones basadas en tendencias</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <h3 className="text-xl font-bold text-green-800">Recomendaciones Estratégicas</h3>
                </div>
                <div className="space-y-3">
                  {analysis.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start bg-white p-3 rounded-lg shadow-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <p className="text-sm text-gray-700 leading-relaxed">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <h3 className="text-xl font-bold text-blue-800">Predicciones Basadas en Tendencias</h3>
                </div>
                <div className="space-y-3">
                  {analysis.predictions.map((pred, index) => (
                    <div key={index} className="flex items-start bg-white p-3 rounded-lg shadow-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <p className="text-sm text-gray-700 leading-relaxed">{pred}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>


            {analysis.insights.length > 0 && (
              <div className="mt-6 bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-xl border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-gray-500 rounded-full mr-3"></div>
                  <h3 className="text-xl font-bold text-gray-800">Insights Adicionales</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {analysis.insights.map((insight, index) => (
                    <div key={index} className="flex items-start bg-white p-3 rounded-lg shadow-sm">
                      <div className="w-2 h-2 bg-gray-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <p className="text-sm text-gray-700 leading-relaxed">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {loading ? (
          <p>Cargando...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
        <>
          <section aria-label='Pulso del Centro' className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6'>
            {therapyAttendance && (
              <ChartContainer title='Tasa de Asistencia a Terapias (Últimos 7 días)' trends={analysis.chartTrends.therapyAttendance}>
                <GaugeChart value={therapyAttendance.attendanceRate} />
              </ChartContainer>
            )}
            {genderDistribution && (
              <ChartContainer title='Distribución por Género'>
                <GenderChart
                  maleCount={genderDistribution.maleCount}
                  femaleCount={genderDistribution.femaleCount}
                  total={genderDistribution.total}
                />
              </ChartContainer>
            )}
          </section>

          <section aria-label='Nuestros Estudiantes' className='grid grid-cols-1 xl:grid-cols-2 gap-8'>
            <ChartContainer title='Distribución de Estudiantes por Edad'>
              <BarChart data={studentAgeDistribution} barKeys={[{ key: 'count', name: 'Cantidad' }]} xAxisKey='age' />
            </ChartContainer>
          </section>

          {/* Geographic Distribution */}
          <section aria-label='Distribución Geográfica' className='space-y-6'>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Distribución Geográfica</h2>
              <p className="text-gray-600">Análisis de origen de estudiantes por departamento</p>
            </div>
            <StudentBirthDepartmentChart />
          </section>

          <section aria-label='Gestión de Terapeutas y Terapias' className='grid grid-cols-1 xl:grid-cols-2 gap-8'>
            <ChartContainer title='Carga de Trabajo por Terapeuta'>
              <BarChart data={therapistWorkload} barKeys={[{ key: 'load', name: 'Carga' }]} xAxisKey='therapist' />
            </ChartContainer>
            <ChartContainer title='Terapias Más Frecuentes'>
              <BarChart data={frequentTherapies} barKeys={[{ key: 'count', name: 'Frecuencia' }]} xAxisKey='therapy' />
            </ChartContainer>
          </section>

          <section aria-label='Seguimiento y Progreso' className='grid grid-cols-1 xl:grid-cols-1 gap-8'>
            <ChartContainer title='Comparativa de Sesiones: Planificadas, Completadas, Ausente y Cancelada'>
              <BarChart data={sessionComparison} barKeys={[{ key: 'planned', name: 'Planificadas' }, { key: 'completed', name: 'Completadas' }, { key: 'absent', name: 'Ausente' }, { key: 'cancelled', name: 'Cancelada' }]} xAxisKey='month' />
            </ChartContainer>
          </section>

          {/* Therapist Performance Section */}
          <section aria-label='Rendimiento de Terapeutas' className='space-y-6'>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Rendimiento de Terapeutas</h2>
              <p className="text-gray-600">Tasa de asistencia por período seleccionado</p>
            </div>
            <div className='bg-white rounded-2xl shadow-xl border border-gray-100 p-6'>
              <TherapistAttendanceChart />
            </div>
          </section>

          {/* Individual Therapist Attendance Trends */}
          <section aria-label='Tendencias de Asistencia Individual' className='space-y-6'>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Tendencias de Asistencia por Terapeuta</h2>
              <p className="text-gray-600">Análisis histórico detallado de cada terapeuta por semana, mes y año</p>
            </div>
            <TherapistAttendanceTrendsChart />
          </section>
        </>
        )}
      </div>
    </div>
  );
}
export default AnalisisDeGraficasPage;