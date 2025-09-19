// frontend/src/pages/FillReportPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import studentService from '../services/studentService';
import reportTemplateService, { type ReportTemplate } from '../services/reportTemplateService';
import reportService, { type ReportAnswer } from '../services/reportService';
import Label from '../components/ui/Label';
import Select from '../components/ui/Select';
import { FaUserGraduate } from 'react-icons/fa';
import DynamicReportForm from '../components/reports/DynamicReportForm';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

function FillReportPage() {
    const { studentId, reportId: routeReportId } = useParams<{ studentId?: string, reportId?: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showToast } = useToast();

    const [student, setStudent] = useState<any>(null);
    const [templates, setTemplates] = useState<ReportTemplate[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
    const [reportId, setReportId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);

    const [initialAnswers, setInitialAnswers] = useState<{ itemId: number; level?: any; value?: any }[]>([]);
    const [disabledTemplateIds, setDisabledTemplateIds] = useState<number[]>([]);

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
                    const [studentData, templatesData, reportsData] = await Promise.all([
                        studentService.getStudentById(parseInt(studentId)),
                        reportTemplateService.getPublishedTemplates(),
                        reportService.getReportsByStudent(parseInt(studentId)),
                    ]);
                    setStudent(studentData);
                    setTemplates(templatesData);
                    // Deshabilitar plantillas con reporte YA creado por el terapeuta actual
                    const mine = (reportsData || []).filter((r: any) => r.therapist?.id === user?.id);
                    const ids = mine.map((r: any) => r.templateId);
                    setDisabledTemplateIds(ids);
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
        if (!template) return;
        try {
            // Verifica si ya existe un reporte propio para esta plantilla
            const check = await reportService.getExistingReport(parseInt(studentId), template.id);
            if (check.exists) {
                showToast({
                  message: 'Ya existe un reporte con esta plantilla para este estudiante. Edítalo desde su perfil.',
                  type: 'info',
                  duration: 8000,
                });
                return;
            }

            // Si no existe, crea el reporte normalmente
            const newReport = await reportService.createReport(parseInt(studentId), template.id);
            if ((newReport as any).alreadyExists) {
                showToast({
                  message: 'Ya existe un reporte con esta plantilla para este estudiante. Edítalo desde su perfil.',
                  type: 'info',
                  duration: 8000,
                });
                return;
            }
            setReportId(newReport.id);
            setSelectedTemplate(template);
        } catch (err) {
            setError("No se pudo iniciar un nuevo reporte.");
        }
    };
    
    const handleSubmitAnswers = async (answers: ReportAnswer[]) => {
        if (!reportId) return;
        try {
            await reportService.submitReportAnswers(reportId, answers);
            const message = isEditMode ? 'Reporte actualizado correctamente.' : 'Reporte generado correctamente.';
            showToast({ message });
            navigate(`/students/${studentId || student?.id}`);
        } catch (err) {
            setError('No se pudieron guardar las respuestas del reporte.');
        }
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
                    {disabledTemplateIds.length > 0 && (
                      <p className="text-xs text-gray-500 mt-2">Si la plantilla ya tiene un reporte creado por ti, aparecerá un aviso y deberás editarlo desde el perfil del estudiante.</p>
                    )}
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
