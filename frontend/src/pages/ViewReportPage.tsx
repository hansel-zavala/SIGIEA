// frontend/src/pages/ViewReportPage.tsx
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import reportService from '../services/reportService';
import logo from '../assets/apo-autis-logo.png';
import { FaPrint, FaFilePdf } from 'react-icons/fa';
import html2pdf from 'html2pdf.js'; // Importamos la librería para PDF

interface ReportData {
    id: number;
    student: { 
        nombres: string;
        apellidos: string;
        dateOfBirth: string; 
        guardians: { 
            nombres: string;
            apellidos: string;
            telefono: string;
        }[];
        therapist: {
            nombres: string;
            apellidos: string;
        } | null;
    };
    therapist: { name: string };
    template: {
        title: string;
        description: string;
        sections: {
            id: number;
            title: string;
            type: 'ITEMS' | 'TEXT';
            items: { id: number; description: string }[];
        }[];
    };
    reportDate: string;
    itemAnswers: { itemId: number; level: string }[];
    textAnswers: { sectionId: number; content: string }[];
}


const formatLevel = (level: string) => {
    if (!level) return 'No evaluado';
    return level.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

const calculateAge = (birthDate: string) => {
    const birthday = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birthday.getFullYear();
    const m = today.getMonth() - birthday.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthday.getDate())) {
        age--;
    }
    return age;
};

function ViewReportPage() {
    const { reportId } = useParams<{ reportId: string }>();
    const [report, setReport] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const pageRef = useRef<HTMLDivElement>(null); // Referencia al contenido del reporte

    useEffect(() => {
        if (reportId) {
            reportService.getReportById(parseInt(reportId))
                .then(setReport)
                .catch(() => {
                    setError('No se pudo cargar el reporte. Verifique que exista e intente de nuevo.');
                })
                .finally(() => setLoading(false));
        }
    }, [reportId]);
    
    if (loading) return <div className="p-10 text-center">Cargando reporte...</div>;
    if (error) return <div className="p-10 text-center text-red-500">{error}</div>;
    if (!report) return <div className="p-10 text-center text-gray-500">No se encontró el reporte.</div>;

    const answersMap = new Map(
        report.itemAnswers?.map(a => [a.itemId, a.level]) || []
    );
    const textAnswersMap = new Map(
        report.textAnswers?.map(a => [a.sectionId, a.content]) || []
    );

    const assignedTherapist = report.student.therapist;
    const therapistName = assignedTherapist 
        ? `${assignedTherapist.nombres} ${assignedTherapist.apellidos}` 
        : 'No Asignado';

    // Función para generar PDF
    const generatePdf = () => {
        if (pageRef.current) {
            const element = pageRef.current;
            const opt = {
                margin:       0.5,
                filename:     `Reporte_${report.student.nombres}_${report.student.apellidos}_${new Date(report.reportDate).toLocaleDateString('es-HN')}.pdf`,
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2 },
                jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
            };
            html2pdf().set(opt).from(element).save();
        }
    };


    return (
        <>
            <div className="bg-gray-100 p-4 print:hidden flex justify-center gap-4">
                <button
                    onClick={() => window.print()}
                    className="py-2 px-6 text-white font-bold rounded-lg bg-blue-600 hover:bg-blue-700 flex items-center gap-2 shadow-md transition-transform hover:scale-105"
                >
                    <FaPrint /> Imprimir Reporte
                </button>
                <button
                    onClick={generatePdf}
                    className="py-2 px-6 text-white font-bold rounded-lg bg-green-600 hover:bg-green-700 flex items-center gap-2 shadow-md transition-transform hover:scale-105"
                >
                    <FaFilePdf /> Generar PDF
                </button>
            </div>
            {/* El contenido del reporte para imprimir/descargar */}
            <div ref={pageRef} className="p-8 bg-white font-sans text-sm print:shadow-none print:p-2 max-w-4xl mx-auto report-container">
                <header className="flex justify-between items-center mb-6 pb-4 border-b">
                    <img src={logo} alt="Logo APO-AUTIS" className="h-24 w-auto" />
                    <div className="text-center">
                        <h1 className="text-xl font-bold">{report.template.title}</h1>
                        <h2 className="text-lg font-semibold">Centro de Atención APO AUTIS</h2>
                    </div>
                    <div className="w-24"></div>
                </header>

                <main className="space-y-6">
                    <section className="border border-gray-400 p-3">
                        <h3 className="text-base font-bold mb-2">Datos Generales:</h3>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                            <p><strong>Nombre del niño/a:</strong> {`${report.student.nombres} ${report.student.apellidos}`}</p>
                            <p><strong>Fecha de nacimiento:</strong> {new Date(report.student.dateOfBirth).toLocaleDateString('es-HN')}</p>
                            <p><strong>Edad cronológica:</strong> {calculateAge(report.student.dateOfBirth)} años</p>
                            <p><strong>Nombre de los padres:</strong> {report.student.guardians?.[0] ? `${report.student.guardians[0].nombres} ${report.student.guardians[0].apellidos}` : 'N/A'}</p>
                            <p><strong>Teléfono de los padres:</strong> {report.student.guardians?.[0]?.telefono || 'N/A'}</p>
                            <p><strong>Fecha de entrega informe:</strong> {new Date(report.reportDate).toLocaleDateString('es-HN')}</p>
                            <p className="col-span-2"><strong>Nombre del terapeuta:</strong> {therapistName}</p>
                        </div>
                    </section>

                    {report.template.description && (
                        <section>
                            <h3 className="text-base font-bold">Observaciones Generales</h3>
                            <p className="mt-1 text-justify text-sm whitespace-pre-wrap">{report.template.description}</p>
                        </section>
                    )}
                    
                    {report.template.sections.map((section) => (
                        <section key={section.id}>
                            <h3 className="text-base font-bold mb-2 underline uppercase">{section.title}</h3>
                            {section.type === 'ITEMS' ? (
                                <table className="w-full border-collapse border border-gray-400 text-sm">
                                    <thead>
                                        <tr>
                                            <th className="border border-gray-300 p-2 text-left bg-gray-100">Descripción de la actividad desarrollada</th>
                                            <th className="border border-gray-300 p-2 text-left bg-gray-100 w-1/4">Grado de adquisición</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {section.items.map((item) => (
                                            <tr key={item.id}>
                                                <td className="border border-gray-300 p-2">{item.description}</td>
                                                <td className="border border-gray-300 p-2 font-semibold">{formatLevel(answersMap.get(item.id) as string)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="mt-1 text-justify text-sm whitespace-pre-wrap border p-2 rounded">
                                    {textAnswersMap.get(section.id) || 'No se proporcionó contenido.'}
                                </p>
                            )}
                        </section>
                    ))}
                </main>
                 <footer className="mt-20 text-center text-sm">
                    <div className="grid grid-cols-2 gap-x-20">
                        <div className="border-t border-black pt-2">
                            <p className="font-semibold">{report.student.guardians?.[0] ? `${report.student.guardians[0].nombres} ${report.student.guardians[0].apellidos}` : 'Padre de familia'}</p>
                        </div>
                        <div className="border-t border-black pt-2">
                            <p className="font-semibold">{therapistName}</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}

export default ViewReportPage;