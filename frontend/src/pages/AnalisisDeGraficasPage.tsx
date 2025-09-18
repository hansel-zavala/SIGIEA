import { useState, useEffect } from 'react';
import dashboardService, {
  type TherapyAttendance,
  type StudentAgeDistribution,
  type DiagnosisDistribution,
  type TherapistWorkload,
  type FrequentTherapies,
  type SessionComparison,
} from '../services/dashboardService.js';
import ChartContainer from '../components/charts/ChartContainer.js';
import GaugeChart from '../components/charts/GaugeChart.js';
import BarChart from '../components/charts/BarChart.js';
import TherapistAttendanceChart from '../components/charts/TherapistAttendanceChart.js';

function AnalisisDeGraficasPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [therapyAttendance, setTherapyAttendance] = useState<TherapyAttendance | null>(null);
  const [studentAgeDistribution, setStudentAgeDistribution] = useState<StudentAgeDistribution[]>([]);
  const [diagnosisDistribution, setDiagnosisDistribution] = useState<DiagnosisDistribution[]>([]);
  const [therapistWorkload, setTherapistWorkload] = useState<TherapistWorkload[]>([]);
  const [frequentTherapies, setFrequentTherapies] = useState<FrequentTherapies[]>([]);
  const [sessionComparison, setSessionComparison] = useState<SessionComparison[]>([]);

  useEffect(() => {
    const loadChartData = () => {
      setLoading(true);
      Promise.all([
        dashboardService.getTherapyAttendance(),
        dashboardService.getStudentAgeDistribution(),
        dashboardService.getDiagnosisDistribution(),
        dashboardService.getTherapistWorkload(),
        dashboardService.getMostFrequentTherapies(),
        dashboardService.getSessionComparison(),
      ]).then(([therapyAttendanceData, studentAgeDistributionData, diagnosisDistributionData, therapistWorkloadData, frequentTherapiesData, sessionComparisonData]) => {
        setTherapyAttendance(therapyAttendanceData);
        setStudentAgeDistribution(studentAgeDistributionData);
        setDiagnosisDistribution(diagnosisDistributionData);
        setTherapistWorkload(therapistWorkloadData);
        setFrequentTherapies(frequentTherapiesData);
        setSessionComparison(sessionComparisonData);
      }).catch(() => {
        setError('No se pudo cargar la información de los gráficos.');
      }).finally(() => {
        setLoading(false);
      });
    };

    loadChartData();
  }, []);

  return (
    <div className="space-y-8">
        <h1 className="text-2xl font-semibold">Análisis de Gráficas</h1>
      {loading ? (
        <p>Cargando...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          <section aria-label='Pulso del Centro' className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6'>
            {therapyAttendance && (
              <ChartContainer title='Tasa de Asistencia a Terapias (Últimos 7 días)'>
                <GaugeChart value={therapyAttendance.attendanceRate} />
              </ChartContainer>
            )}
          </section>

          <section aria-label='Nuestros Estudiantes' className='grid grid-cols-1 xl:grid-cols-2 gap-8'>
            <ChartContainer title='Distribución de Estudiantes por Edad'>
              <BarChart data={studentAgeDistribution} barKeys={[{ key: 'count', name: 'Cantidad' }]} xAxisKey='age' />
            </ChartContainer>
            <ChartContainer title='Distribución por Diagnóstico'>
              <BarChart data={diagnosisDistribution} barKeys={[{ key: 'count', name: 'Cantidad' }]} xAxisKey='diagnosis' />
            </ChartContainer>
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
            <ChartContainer title='Comparativa de Sesiones: Planificadas vs. Realizadas'>
              <BarChart data={sessionComparison} barKeys={[{ key: 'planned', name: 'Planificadas' }, { key: 'completed', name: 'Realizadas' }]} xAxisKey='month' />
            </ChartContainer>
          </section>

          <TherapistAttendanceChart />
        </>
      )}
    </div>
  );
}

export default AnalisisDeGraficasPage;