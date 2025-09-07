// frontend/src/pages/FillReportPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import studentService from '../services/studentService';
import reportTemplateService, { type ReportTemplate } from '../services/reportTemplateService';
import reportService from '../services/reportService';
import Label from '../components/ui/Label';
import Select from '../components/ui/Select';
import Input from '../components/ui/Input';
import { FaUserGraduate } from 'react-icons/fa';

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

    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [textFields, setTextFields] = useState({
        summary: '',
        therapyActivities: '',
        conclusions: '',
        recommendations: '',
        attendance: '',
    });

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
                    setTextFields({
                        summary: reportData.summary || '',
                        therapyActivities: reportData.therapyActivities || '',
                        conclusions: reportData.conclusions || '',
                        recommendations: reportData.recommendations || '',
                        attendance: reportData.attendance || '',
                    });
                    const loadedAnswers = reportData.itemAnswers.reduce((acc: any, ans: any) => {
                        acc[ans.itemId] = ans.level;
                        return acc;
                    }, {});
                    setAnswers(loadedAnswers);
                } else if (studentId) { // MODO CREACIÓN
                    const [studentData, templatesData] = await Promise.all([
                        studentService.getStudentById(parseInt(studentId)),
                        reportTemplateService.getAllTemplates(),
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
    
    const handleAnswerChange = (itemId: number, value: string | null) => {
        setAnswers(prev => ({ ...prev, [itemId]: value || '' }));
    };

    const handleTextFieldChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setTextFields(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reportId) return;

        const submissionData = {
            ...textFields,
            answers: Object.entries(answers).map(([itemId, level]) => ({
                itemId: parseInt(itemId),
                level,
            })),
        };
        
        try {
            await reportService.submitReportAnswers(reportId, submissionData);
            alert('Reporte guardado con éxito');
            navigate(`/students/${studentId || student?.id}`);
        } catch (err) {
            setError('Error al guardar el reporte.');
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
                </div>
            ) : selectedTemplate && (
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-8">
                    <h3 className="text-xl font-bold text-center">{selectedTemplate.title}</h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm border p-4 rounded-lg">
                        <p><strong>Estudiante:</strong> {student.fullName}</p>
                        <p><strong>Fecha Nacimiento:</strong> {new Date(student.dateOfBirth).toLocaleDateString()}</p>
                        <p><strong>Padre/Madre:</strong> {student.guardians?.[0]?.fullName || 'N/A'}</p>
                        <p><strong>Fecha Reporte:</strong> {new Date().toLocaleDateString()}</p>
                    </div>

                    <div className="prose max-w-none">
                        <p className="text-justify whitespace-pre-wrap">{selectedTemplate.description}</p>
                    </div>

                    {selectedTemplate.sections.map(section => (
                        <div key={section.id} className="border-t pt-4">
                            <h4 className="text-lg font-semibold text-violet-700 mb-3">{section.title}</h4>
                            <div className="space-y-4">
                                {section.items.map(item => (
                                    <div key={item.id} className="grid grid-cols-3 gap-4 items-center">
                                        <p className="col-span-2">{item.description}</p>
                                        <Select
                                            instanceId={`item-${item.id}-select`}
                                            options={acquisitionLevelOptions}
                                            value={acquisitionLevelOptions.find(opt => opt.value === answers[item.id]) || null}
                                            onChange={(option) => handleAnswerChange(item.id, option?.value || '')}
                                            placeholder="Grado de adquisición..."
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    <div className="space-y-4 border-t pt-6">
                        <Label>Resumen de actividades desarrolladas en la terapia:</Label>
                        <textarea name="therapyActivities" value={textFields.therapyActivities} onChange={handleTextFieldChange} rows={5} className="block w-full rounded-md border-gray-300 shadow-sm p-2" />
                        
                        <Label>Conclusiones:</Label>
                        <textarea name="conclusions" value={textFields.conclusions} onChange={handleTextFieldChange} rows={5} className="block w-full rounded-md border-gray-300 shadow-sm p-2" />
                        
                        <Label>Recomendaciones:</Label>
                        <textarea name="recommendations" value={textFields.recommendations} onChange={handleTextFieldChange} rows={5} className="block w-full rounded-md border-gray-300 shadow-sm p-2" />
                        
                        <Label>Asistencia (Ej: 90% de asistencia durante el semestre):</Label>
                        <Input name="attendance" value={textFields.attendance} onChange={handleTextFieldChange} />
                    </div>

                    <div className="text-right">
                        <button type="submit" className="py-3 px-8 text-white font-bold rounded-lg bg-gradient-to-r from-violet-400 to-purple-500 hover:from-violet-500 hover:to-purple-600">
                            Finalizar y Guardar Reporte
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

export default FillReportPage;