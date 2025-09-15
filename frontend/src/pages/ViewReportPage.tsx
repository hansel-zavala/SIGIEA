// frontend/src/pages/ViewReportPage.tsx
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import reportService from '../services/reportService';
import logo from '../assets/apo-autis-logo.png';
import { FaPrint } from 'react-icons/fa';

const formatLevel = (level: string) => {
  if (!level) return 'No evaluado';
  return level.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
};

const calculateAge = (birthDate: string) => {
  const birthday = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birthday.getFullYear();
  const m = today.getMonth() - birthday.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthday.getDate())) age--;
  return age;
};

function ViewReportPage() {
  const { reportId } = useParams<{ reportId: string }>();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reportId) {
      reportService
        .getReportById(parseInt(reportId))
        .then(setReport)
        .catch(() => setError('No se pudo cargar el reporte. Verifique que exista e intente de nuevo.'))
        .finally(() => setLoading(false));
    }
  }, [reportId]);

  if (loading) return <div className="p-10 text-center">Cargando reporte...</div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;
  if (!report) return <div className="p-10 text-center text-gray-500">No se encontró el reporte.</div>;

  const answersMap = new Map(report.itemAnswers.map((a: any) => [a.itemId, a.level ?? a.valueJson]));
  const guardiansList = (report.student.guardians || [])
    .map((g: any) => g.fullName || `${g.nombres || ''} ${g.apellidos || ''}`.trim())
    .filter(Boolean)
    .join(', ');
  const assignedTherapist = report.student?.therapist
    ? `${report.student.therapist.nombres} ${report.student.therapist.apellidos}`
    : report.therapist?.name || '';

  return (
    <>
      <div className="bg-gray-100 p-4 print:hidden flex justify-center">
        <button
          onClick={() => window.print()}
          className="py-2 px-6 text-white font-bold rounded-lg bg-blue-600 hover:bg-blue-700 flex items-center gap-2 shadow-md transition-transform hover:scale-105"
        >
          <FaPrint /> Imprimir Reporte
        </button>
      </div>
      <div ref={pageRef} className="p-8 bg-white font-sans text-sm print:shadow-none print:p-2 max-w-4xl mx-auto">
        <header className="grid grid-cols-3 items-center mb-6 pb-4 border-b">
          <img src={logo} alt="Logo APO-AUTIS" className="h-20 w-auto" />
          <div className="text-center">
            <h1 className="text-xl font-bold">Informe semestral de actividades</h1>
            <h2 className="text-sm font-semibold">Asociación Hondureña de Apoyo al Autista, APO AUTIS</h2>
          </div>
          <div></div>
        </header>

        <main className="space-y-6">
          <section>
            <div className="inline-block font-bold border border-gray-700 px-2 py-1 mb-2">I. Datos Generales:</div>
            <table className="w-full border-collapse text-sm">
              <tbody>
                <tr>
                  <th className="border border-gray-700 bg-gray-100 text-left p-2 w-1/3">Nombre del niño/a:</th>
                  <td className="border border-gray-700 p-2">{report.student.fullName}</td>
                </tr>
                <tr>
                  <th className="border border-gray-700 bg-gray-100 text-left p-2">Fecha de nacimiento:</th>
                  <td className="border border-gray-700 p-2">{new Date(report.student.dateOfBirth).toLocaleDateString('es-HN')}</td>
                </tr>
                <tr>
                  <th className="border border-gray-700 bg-gray-100 text-left p-2">Edad cronológica:</th>
                  <td className="border border-gray-700 p-2">{calculateAge(report.student.dateOfBirth)} años</td>
                </tr>
                <tr>
                  <th className="border border-gray-700 bg-gray-100 text-left p-2">Nombre de los padres o encargados:</th>
                  <td className="border border-gray-700 p-2">{guardiansList || 'N/A'}</td>
                </tr>
                <tr>
                  <th className="border border-gray-700 bg-gray-100 text-left p-2">Fecha de entrega informe:</th>
                  <td className="border border-gray-700 p-2">{new Date(report.reportDate).toLocaleDateString('es-HN')}</td>
                </tr>
                <tr>
                  <th className="border border-gray-700 bg-gray-100 text-left p-2">Asistencia:</th>
                  <td className="border border-gray-700 p-2">N/A</td>
                </tr>
                <tr>
                  <th className="border border-gray-700 bg-gray-100 text-left p-2">Nombre del terapeuta:</th>
                  <td className="border border-gray-700 p-2">{assignedTherapist}</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section>
            <h3 className="text-base font-bold">Observaciones Generales</h3>
            <p className="mt-1 text-justify text-sm whitespace-pre-wrap">{report.template.description}</p>
          </section>

          {report.template.sections.map((section: any) => (
            <section key={section.id}>
              <div className="inline-block font-bold border border-gray-700 px-2 py-1 mb-2 uppercase">{section.title}</div>
              <table className="w-full border-collapse border border-gray-700 text-sm">
                <thead>
                  <tr>
                    <th className="border border-gray-700 p-2 text-left bg-gray-100">Descripción de la actividad desarrollada</th>
                    <th className="border border-gray-700 p-2 text-left bg-gray-100 w-1/3">Grado de adquisición</th>
                  </tr>
                </thead>
                <tbody>
                  {section.items.map((item: any) => (
                    <tr key={item.id}>
                      <td className="border border-gray-700 p-2">{item.label}</td>
                      <td className="border border-gray-700 p-2 font-semibold">{formatLevel(answersMap.get(item.id) as string)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ))}

          <section className="space-y-4 pt-4">
            <h3 className="text-base font-bold underline">CONCLUSIONES</h3>
            <p className="text-sm whitespace-pre-wrap border p-2 rounded">{report.conclusions || 'No especificado.'}</p>

            <h3 className="text-base font-bold underline">RECOMENDACIONES</h3>
            <p className="text-sm whitespace-pre-wrap border p-2 rounded">{report.recommendations || 'No especificado.'}</p>
          </section>
        </main>
        <footer className="mt-20 text-center text-sm">
          <div className="grid grid-cols-2 gap-x-20">
            <div className="border-t border-black pt-2">
              <p className="font-semibold">{(report.student.guardians || [])[0]?.fullName || 'Padre de familia'}</p>
            </div>
            <div className="border-t border-black pt-2">
              <p className="font-semibold">{assignedTherapist}</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

export default ViewReportPage;
