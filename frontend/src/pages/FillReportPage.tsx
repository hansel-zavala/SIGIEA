// frontend/src/pages/FillReportPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import studentService from '../services/studentService';
import reportTemplateService, { type ReportTemplate } from '../services/reportTemplateService';
import reportService, { type ReportAnswer } from '../services/reportService';
import Label from '../components/ui/Label';
import Select from '../components/ui/Select';
import Input from '../components/ui/Input';
import { FaUserGraduate } from 'react-icons/fa';
import DynamicReportForm from '../components/reports/DynamicReportForm';

const acquisitionLevelOptions = [
    { value: 'CONSEGUIDO', label: 'Conseguido' },
    { value: 'CON_AYUDA_ORAL', label: 'Con Ayuda Oral' },
    { value: 'CON_AYUDA_GESTUAL', label: 'Con Ayuda Gestual' },
    { value: 'CON_AYUDA_FISICA', label: 'Con Ayuda Física' },
    { value: 'NO_CONSEGUIDO', label: 'No Conseguido' },
    { value: 'NO_TRABAJADO', label: 'No Trabajado' },
];

function FillReportPage() {
    const { studentId, reportId: routeReportId } = useParams<{ studentId?: string, reportId?: string }>();
    const navigate = useNavigate();

    const [student, setStudent] = useState<any>(null);
    const [templates, setTemplates] = useState<ReportTemplate[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
    const [reportId, setReportId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);

    const [initialAnswers, setInitialAnswers] = useState<{ itemId: number; level?: any; value?: any }[]>([]);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                if (routeReportId) {
                    setIsEditMode(true);
                    const reportData = await reportService.getReportById(parseInt(routeReportId));
                    setStudent(reportData.student);
                    setSelectedTemplate(reportData.template);
                    setReportId(reportData.id);
                    const loaded = (reportData.itemAnswers || []).map((ans: any) => ({
                        itemId: ans.itemId,
                        level: ans.level ?? null,
                        value: ans.valueJson ?? undefined,
                    }));
                    setInitialAnswers(loaded);
                } else if (studentId) { // MODO CREACIÓN
                    const [studentData, templatesData] = await Promise.all([
                        studentService.getStudentById(parseInt(studentId)),
                        reportTemplateService.getPublishedTemplates(),
                    ]);
                    setStudent(studentData);
                    setTemplates(templatesData);
                }
            } catch (err) {
                setError('No se pudieron cargar los datos necesarios.');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [studentId, routeReportId]);

    const handleTemplateSelect = async (templateId: string) => {
        if (!studentId) return;
        const template = templates.find(t => t.id === parseInt(templateId));
        if (template) {
            setSelectedTemplate(template);
            try {
                const newReport = await reportService.createReport(parseInt(studentId), template.id);
                setReportId(newReport.id);
            } catch (err) {
                setError("No se pudo iniciar un nuevo reporte.");
            }
        }
    };
    
    const handleSubmitAnswers = async (answers: ReportAnswer[]) => {
        if (!reportId) return;
        await reportService.submitReportAnswers(reportId, answers);
        alert('Reporte guardado con éxito');
        navigate(`/students/${studentId || student?.id}`);
    };

    if (loading) return <div>Cargando...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md flex items-center gap-4">
                <FaUserGraduate size={40} className="text-violet-500"/>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                        {isEditMode ? "Editando Reporte de:" : "Generando Reporte para:"} {student?.fullName}
                    </h2>
                    <p className="text-gray-500">Terapeuta: {student?.therapist?.fullName || 'No asignado'}</p>
                </div>
            </div>
            
            {!selectedTemplate && !isEditMode ? (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <Label>1. Selecciona una plantilla para el reporte</Label>
                    <Select
                        instanceId="template-select"
                        options={templates.map(t => ({ value: String(t.id), label: t.title }))}
                        onChange={(option) => handleTemplateSelect(option?.value || '')}
                        placeholder="Elige una plantilla..."
                    />
                </div>
            ) : selectedTemplate && (
                <div className="bg-white p-6 rounded-lg shadow-md space-y-8">
                    <h3 className="text-xl font-bold text-center">{selectedTemplate.title}</h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm border p-4 rounded-lg">
                        <p><strong>Estudiante:</strong> {student.fullName}</p>
                        <p><strong>Fecha Nacimiento:</strong> {new Date(student.dateOfBirth).toLocaleDateString()}</p>
                        <p className="md:col-span-2"><strong>Padres/Encargados:</strong> {(student.guardians || []).map((g:any)=> g.fullName || `${g.nombres||''} ${g.apellidos||''}`.trim()).filter(Boolean).join(', ') || 'N/A'}</p>
                        <p><strong>Fecha Reporte:</strong> {new Date().toLocaleDateString()}</p>
                        <p><strong>Terapeuta asignado:</strong> {student?.therapist ? `${student.therapist.nombres} ${student.therapist.apellidos}` : 'No asignado'}</p>
                    </div>

                    <div className="prose max-w-none">
                        <p className="text-justify whitespace-pre-wrap">{selectedTemplate.description}</p>
                    </div>
                    <DynamicReportForm template={selectedTemplate} initialAnswers={initialAnswers} onSubmit={handleSubmitAnswers} />
                </div>
            )}
        </div>
    );
}

export default FillReportPage;
