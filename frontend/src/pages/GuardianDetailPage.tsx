// frontend/src/pages/GuardianDetailPage.tsx

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import guardianService, { type GuardianProfile } from '../services/guardianService';
import reportService, { type ReportDetail, AcquisitionLevel } from '../services/reportService';
import Label from '../components/ui/Label';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { FaUserEdit, FaBaby, FaChartBar, FaFilePdf } from 'react-icons/fa';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Mapeo de niveles de adquisición a una puntuación numérica para las gráficas
const levelToScore: Record<AcquisitionLevel, number> = {
    [AcquisitionLevel.CONSEGUIDO]: 5,
    [AcquisitionLevel.CON_AYUDA_ORAL]: 4,
    [AcquisitionLevel.CON_AYUDA_GESTUAL]: 3,
    [AcquisitionLevel.CON_AYUDA_FISICA]: 2,
    [AcquisitionLevel.NO_CONSEGUIDO]: 1,
    [AcquisitionLevel.NO_TRABAJADO]: 0,
};

interface ChartData {
    area: string;
    score: number;
}

function GuardianDetailPage() {
    const [guardian, setGuardian] = useState<GuardianProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [selectedReportId, setSelectedReportId] = useState<string>('');
    const [reportDetails, setReportDetails] = useState<ReportDetail | null>(null);
    const [reportLoading, setReportLoading] = useState(false);
    const [reportError, setReportError] = useState('');
    const [chartData, setChartData] = useState<ChartData[]>([]);

    const { id } = useParams<{ id: string }>();

    useEffect(() => {
        if (id) {
            setLoading(true);
            guardianService.getGuardianById(Number(id))
                .then(setGuardian)
                .catch(() => setError('No se pudo cargar el perfil del guardián.'))
                .finally(() => setLoading(false));
        }
    }, [id]);

    useEffect(() => {
        if (selectedReportId) {
            setReportLoading(true);
            setReportDetails(null);
            setReportError('');
            reportService.getReportById(Number(selectedReportId))
                .then(details => {
                    setReportDetails(details);
                    const dataForCharts = details.template.sections.map(section => {
                        const sectionItems = section.items;
                        const answeredItems = details.itemAnswers.filter(ans => 
                            sectionItems.some(item => item.id === ans.itemId)
                        );
                        
                        const totalScore = answeredItems.reduce((sum, ans) => sum + (levelToScore[ans.level] || 0), 0);
                        const averageScore = answeredItems.length > 0 ? totalScore / answeredItems.length : 0;

                        return {
                            area: section.title,
                            score: parseFloat(averageScore.toFixed(2)),
                        };
                    });
                    setChartData(dataForCharts);
                })
                .catch(() => setReportError('No se pudieron cargar los detalles del informe.'))
                .finally(() => setReportLoading(false));
        }
    }, [selectedReportId]);

    if (loading) return <div className="text-center p-8">Cargando perfil...</div>;
    if (error) return <p className="text-red-500 bg-red-100 p-4 rounded-md">{error}</p>;
    if (!guardian) return <p>No se encontró el guardián.</p>;

    const studentName = `${guardian.student.nombres} ${guardian.student.apellidos}`;
    const reportOptions = guardian.student.reports.map(report => ({
        value: String(report.id),
        label: `${report.template.title} - ${new Date(report.reportDate).toLocaleDateString()}`
    }));

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800">
                Perfil de {guardian.nombres} y Progreso de {studentName}
            </h1>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-3 mb-4"><FaUserEdit /> Datos del Guardián</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><Label>Nombres</Label><Input value={guardian.nombres} readOnly /></div>
                    <div><Label>Apellidos</Label><Input value={guardian.apellidos} readOnly /></div>
                    <div><Label>DNI</Label><Input value={guardian.numeroIdentidad} readOnly /></div>
                    <div><Label>Teléfono</Label><Input value={guardian.telefono} readOnly /></div>
                    <div><Label>Parentesco</Label><Input value={guardian.parentesco.replace('_', ' ')} readOnly /></div>
                    <div className="md:col-span-2"><Label>Dirección de Emergencia</Label><Input value={guardian.direccionEmergencia || 'No especificada'} readOnly /></div>
                </div>
                <div className="text-right mt-6">
                    <Link to={`/guardians/edit/${guardian.id}`} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                        Editar Guardián
                    </Link>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-3 mb-4"><FaBaby /> Información del Estudiante Asociado</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-600">
                    <p><strong>Nombre:</strong> {studentName}</p>
                    <p><strong>Fecha de Nacimiento:</strong> {new Date(guardian.student.dateOfBirth).toLocaleDateString()}</p>
                    <p><strong>Terapeuta:</strong> {guardian.student.therapist ? `${guardian.student.therapist.nombres} ${guardian.student.therapist.apellidos}` : 'No asignado'}</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-3 mb-4"><FaChartBar /> Historial y Portal de Progreso</h2>
                <div>
                    <Label>Seleccione un Periodo de Evaluación:</Label>
                    <Select
                        instanceId="report-select"
                        options={reportOptions}
                        value={reportOptions.find(o => o.value === selectedReportId) || null}
                        onChange={(option) => setSelectedReportId(option?.value || '')}
                        placeholder="-- Ver informes de progreso --"
                        noOptionsMessage={() => "No hay informes para este estudiante"}
                    />
                </div>

                {reportLoading && <div className="text-center p-8">Cargando informe...</div>}
                {reportError && <p className="text-red-500 bg-red-100 p-4 rounded-md mt-4">{reportError}</p>}
                
                {reportDetails && !reportLoading && (
                    <div className="mt-6 border-t pt-6 space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-lg font-bold text-center mb-4">Radar de Desarrollo por Área</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                                            <PolarGrid />
                                            <PolarAngleAxis dataKey="area" />
                                            <PolarRadiusAxis angle={30} domain={[0, 5]} />
                                            <Radar name="Puntuación" dataKey="score" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                                            <Tooltip />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-center mb-4">Puntuación por Área</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={chartData} layout="vertical">
                                            <XAxis type="number" domain={[0, 5]} />
                                            <YAxis type="category" dataKey="area" width={120} />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="score" fill="#82ca9d" name="Puntuación Promedio" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold">Detalles del Informe</h3>
                                <div className="p-4 bg-gray-50 rounded-md">
                                    <p><strong>Asistencia General:</strong> {reportDetails.attendance || 'No registrada'}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-md">
                                    <p className="font-bold">Resumen del Terapeuta:</p>
                                    <p className="mt-1 text-gray-700 whitespace-pre-wrap">{reportDetails.summary || 'No hay resumen.'}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-md">
                                    <p className="font-bold">Recomendaciones:</p>
                                    <p className="mt-1 text-gray-700 whitespace-pre-wrap">{reportDetails.recommendations || 'No hay recomendaciones.'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="text-center mt-8">
                             <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 mx-auto">
                                <FaFilePdf /> Descargar Informe en PDF (Próximamente)
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default GuardianDetailPage;