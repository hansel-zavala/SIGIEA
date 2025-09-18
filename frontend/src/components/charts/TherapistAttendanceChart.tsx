import { useState, useEffect } from 'react';
import dashboardService, { type TherapyAttendance } from '../../services/dashboardService';
import therapistService, { type TherapistProfile } from '../../services/therapistService';
import GaugeChart from './GaugeChart';
import ChartContainer from './ChartContainer';

function TherapistAttendanceChart() {
  const [therapists, setTherapists] = useState<TherapistProfile[]>([]);
  const [attendanceData, setAttendanceData] = useState<{ [key: number]: TherapyAttendance }>({});
  const [range, setRange] = useState('week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        // Fetch all active therapists
        const therapistsData = await therapistService.getAllTherapists('', 1, 1000, 'active');
        setTherapists(therapistsData.data);
      } catch (error) {
        setError('No se pudieron cargar los terapeutas.');
      }
    };

    fetchTherapists();
  }, []);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (therapists.length > 0) {
        setLoading(true);
        try {
          const promises = therapists.map(therapist =>
            dashboardService.getTherapistAttendanceById(therapist.id, range)
          );
          const results = await Promise.all(promises);
          const newAttendanceData: { [key: number]: TherapyAttendance } = {};
          therapists.forEach((therapist, index) => {
            newAttendanceData[therapist.id] = results[index];
          });
          setAttendanceData(newAttendanceData);
        } catch (error) {
          setError('No se pudo cargar la asistencia de los terapeutas.');
        } finally {
          setLoading(false);
        }
      }
    };

    if (therapists.length > 0) {
        fetchAttendanceData();
    }
  }, [therapists, range]);

  return (
    <section aria-label="Asistencia de Terapeutas">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Asistencia de Terapeutas</h2>
        <div className="flex gap-2">
          <button onClick={() => setRange('week')} className={`px-3 py-1 rounded-md text-sm ${range === 'week' ? 'bg-violet-600 text-white' : 'bg-gray-200'}`}>Semana</button>
          <button onClick={() => setRange('month')} className={`px-3 py-1 rounded-md text-sm ${range === 'month' ? 'bg-violet-600 text-white' : 'bg-gray-200'}`}>Mes</button>
          <button onClick={() => setRange('year')} className={`px-3 py-1 rounded-md text-sm ${range === 'year' ? 'bg-violet-600 text-white' : 'bg-gray-200'}`}>Año</button>
        </div>
      </div>
      {loading && therapists.length === 0 ? (
        <p>Cargando terapeutas...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {therapists.map(therapist => (
            <ChartContainer key={therapist.id} title={`${therapist.nombres} ${therapist.apellidos}`}>
              {loading ? <p>Cargando...</p> : attendanceData[therapist.id] ? (
                <GaugeChart value={attendanceData[therapist.id].attendanceRate} />
              ) : (
                <p>No hay datos</p>
              )}
            </ChartContainer>
          ))}
        </div>
      )}
    </section>
  );
}

export default TherapistAttendanceChart;