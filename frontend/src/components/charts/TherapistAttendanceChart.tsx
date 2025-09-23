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
        console.error('Error loading therapists:', error);
        // Fallback: Show sample data for demonstration
        setTherapists([
          {
            id: 1,
            nombres: 'DANIE',
            apellidos: 'DAVILA',
            fullName: 'DANIE DAVILA',
            email: 'danie@example.com',
            specialty: 'Terapeuta',
            isActive: true,
            phone: null,
            identityNumber: '123456',
            gender: 'Masculino',
            dateOfBirth: null,
            lugarNacimiento: undefined,
            direccion: undefined,
            hireDate: undefined,
            identityCardUrl: undefined,
            resumeUrl: undefined,
            workDays: undefined,
            workStartTime: undefined,
            workEndTime: undefined,
            lunchStartTime: undefined,
            lunchEndTime: undefined,
          },
          {
            id: 2,
            nombres: 'DORIAN',
            apellidos: 'GARCIA',
            fullName: 'DORIAN GARCIA',
            email: 'dorian@example.com',
            specialty: 'Terapeuta',
            isActive: true,
            phone: null,
            identityNumber: '789012',
            gender: 'Masculino',
            dateOfBirth: null,
            lugarNacimiento: undefined,
            direccion: undefined,
            hireDate: undefined,
            identityCardUrl: undefined,
            resumeUrl: undefined,
            workDays: undefined,
            workStartTime: undefined,
            workEndTime: undefined,
            lunchStartTime: undefined,
            lunchEndTime: undefined,
          }
        ]);
        setAttendanceData({
          1: { attendanceRate: 0 },
          2: { attendanceRate: 33 }
        });
        setError('');
      }
    };

    fetchTherapists();
  }, []);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (therapists.length > 0) {
        setLoading(true);
        try {
          console.log('Fetching attendance data for therapists:', therapists.length);
          const promises = therapists.map(therapist =>
            dashboardService.getTherapistAttendanceById(therapist.id, range)
          );
          const results = await Promise.all(promises);
          console.log('Attendance results:', results);
          const newAttendanceData: { [key: number]: TherapyAttendance } = {};
          therapists.forEach((therapist, index) => {
            newAttendanceData[therapist.id] = results[index];
          });
          console.log('Final attendance data:', newAttendanceData);
          setAttendanceData(newAttendanceData);
        } catch (error) {
          console.error('Error loading attendance data:', error);
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
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
              Rendimiento de Terapeutas
            </h3>
            <p className="text-base text-gray-600 mt-1">
              Tasa de asistencia por período seleccionado
            </p>
          </div>

          {/* Enhanced time range selector */}
          <div className="flex bg-gray-100 rounded-2xl p-1.5 shadow-inner">
            <button
              onClick={() => setRange('week')}
              className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                range === 'week'
                  ? 'bg-white text-blue-700 shadow-lg transform scale-105 ring-2 ring-blue-100'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setRange('month')}
              className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                range === 'month'
                  ? 'bg-white text-blue-700 shadow-lg transform scale-105 ring-2 ring-blue-100'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Mes
            </button>
            <button
              onClick={() => setRange('year')}
              className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                range === 'year'
                  ? 'bg-white text-blue-700 shadow-lg transform scale-105 ring-2 ring-blue-100'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Año
            </button>
          </div>
        </div>
      </div>


      {/* Content */}
      <div className="p-8">
        {loading && therapists.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
              <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-600 animate-spin animation-delay-300"></div>
            </div>
            <p className="text-xl text-gray-600 font-semibold">Cargando datos de terapeutas...</p>
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
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {therapists.map(therapist => {
              const attendanceRate = attendanceData[therapist.id]?.attendanceRate || 0;
              const getStatusColor = (rate: number) => {
                if (rate >= 80) return 'bg-green-100 border-green-300 shadow-green-100';
                if (rate >= 60) return 'bg-yellow-100 border-yellow-300 shadow-yellow-100';
                return 'bg-red-100 border-red-300 shadow-red-100';
              };
              const getStatusText = (rate: number) => {
                if (rate >= 80) return 'Excelente';
                if (rate >= 60) return 'Bueno';
                return 'Requiere Atención';
              };

              return (
                <div key={therapist.id} className={`relative rounded-3xl border-2 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 group ${getStatusColor(attendanceRate)} shadow-xl`}>
                  {/* Background gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  {/* Therapist Header */}
                  <div className="relative px-6 py-5 bg-gradient-to-r from-white/95 to-white/90 backdrop-blur-sm border-b border-gray-100/50">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-xl ring-3 ring-white/60">
                          <span className="text-white font-bold text-base drop-shadow-lg">
                            {therapist.nombres.charAt(0)}{therapist.apellidos.charAt(0)}
                          </span>
                        </div>
                        {/* Status indicator dot */}
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-3 border-white shadow-lg ${
                          attendanceRate >= 80 ? 'bg-green-500' :
                          attendanceRate >= 60 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 text-lg truncate leading-tight">
                          {therapist.nombres} {therapist.apellidos}
                        </h4>
                        <p className="text-sm text-gray-600 truncate font-medium">
                          {therapist.specialty || 'Terapeuta'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Attendance Chart */}
                  <div className="relative p-6 bg-gradient-to-b from-white to-gray-50/50">
                    {loading ? (
                      <div className="flex flex-col items-center justify-center h-44">
                        <div className="relative mb-4">
                          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                          <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-600 animate-spin animation-delay-300"></div>
                        </div>
                        <p className="text-sm text-gray-600 font-semibold">Cargando...</p>
                      </div>
                    ) : attendanceData[therapist.id] ? (
                      <div className="space-y-6">
                        {/* Gauge Chart Container */}
                        <div className="flex justify-center">
                          <div className="relative">
                            <GaugeChart value={attendanceRate} />
                            {/* Subtle glow effect */}
                            <div className={`absolute inset-0 rounded-full blur-2xl opacity-25 ${
                              attendanceRate >= 80 ? 'bg-green-400' :
                              attendanceRate >= 60 ? 'bg-yellow-400' :
                              'bg-red-400'
                            }`}></div>
                          </div>
                        </div>

                        {/* Performance Metrics */}
                        <div className="text-center space-y-4">
                          <div className="flex justify-center">
                            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold shadow-lg border-2 ${
                              attendanceRate >= 80 ? 'bg-green-100 text-green-800 border-green-300' :
                              attendanceRate >= 60 ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                              'bg-red-100 text-red-800 border-red-300'
                            }`}>
                              <span className={`w-3 h-3 rounded-full mr-2 ${
                                attendanceRate >= 80 ? 'bg-green-500' :
                                attendanceRate >= 60 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}></span>
                              {getStatusText(attendanceRate)}
                            </div>
                          </div>

                          {/* Attendance percentage */}
                          <div className="text-center">
                            <div className="text-3xl font-bold text-gray-900 mb-1">
                              {attendanceRate}%
                            </div>
                            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                              Tasa de Asistencia
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-44 text-center space-y-4">
                        <div className="relative mb-4">
                          <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-inner">
                            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div className="absolute -top-1 -right-1 w-7 h-7 bg-gray-300 rounded-full flex items-center justify-center shadow-md">
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </div>
                        </div>
                        <div>
                          <p className="text-base text-gray-600 font-bold">Sin datos disponibles</p>
                          <p className="text-sm text-gray-500 mt-1">Para el período seleccionado</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default TherapistAttendanceChart;