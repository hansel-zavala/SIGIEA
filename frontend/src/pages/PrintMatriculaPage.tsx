// frontend/src/pages/PrintMatriculaPage.tsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import studentService from '../services/studentService';
import logo from '../assets/apo-autis-logo.png';

// Componente para un campo de información con línea punteada
const InfoField = ({ label, value }: { label: string; value: any }) => (
    <div className="flex items-end border-b border-dotted border-gray-400 pb-1">
        <span className="font-semibold text-gray-600 mr-2">{label}:</span>
        <span className="flex-grow text-gray-800 font-medium">{value || '________________'}</span>
    </div>
);

// Componente para una opción de checkbox (marcado o no)
const CheckboxDisplay = ({ label, checked }: { label: string; checked: boolean }) => (
    <div className="flex items-center">
        <div className="w-5 h-5 border border-black mr-2 flex items-center justify-center">
            {checked && <span className="text-xl">X</span>}
        </div>
        <span>{label}</span>
    </div>
);


function PrintMatriculaPage() {
    const { id } = useParams<{ id: string }>();
    const [student, setStudent] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            studentService.getStudentById(parseInt(id))
                .then(data => {
                    setStudent(data);
                    setLoading(false);
                })
                .catch(console.error);
        }
    }, [id]);

    useEffect(() => {
        if (!loading && student) {
            window.print();
        }
    }, [loading, student]);

    if (loading) {
        return <div className="p-10 text-center">Cargando datos para impresión...</div>;
    }
    
    if (!student) {
        return <div className="p-10 text-center text-red-500">No se encontró al estudiante.</div>;
    }

    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('es-HN', { year: 'numeric', month: 'long', day: 'numeric' });
    const father = student.guardians?.find((g: any) => g.parentesco === 'Padre');
    const mother = student.guardians?.find((g: any) => g.parentesco === 'Madre');

    return (
        <div className="p-10 bg-white font-serif text-sm">
            {/* ✅ 2. Encabezado con logo y títulos */}
            <header className="flex justify-between items-center mb-6">
                <img src={logo} alt="Logo APO-AUTIS" className="h-24" />
                <div className="text-center">
                    <h1 className="text-xl font-bold">ASOCIACION HONDUREÑA DE APOYO AL AUTISTA</h1>
                    <h2 className="text-lg font-bold">APO-AUTIS</h2>
                    <p className="text-md">CENTRO DE ATENCIÓN</p>
                </div>
                <div className="border-2 border-black p-2 text-center">
                    <h3 className="font-bold">MATRICULA {new Date(student.anoIngreso).getFullYear()}</h3>
                </div>
            </header>

            <main className="space-y-5">
                {/* --- Datos Generales --- */}
                <InfoField label="Nombre del Alumno(a)" value={student.fullName} />
                <div className="grid grid-cols-2 gap-x-8">
                    <InfoField label="Lugar y fecha de nacimiento" value={`${student.lugarNacimiento}, ${formatDate(student.dateOfBirth)}`} />
                    <InfoField label="Dirección" value={student.direccion} />
                </div>
                 <div className="grid grid-cols-2 gap-x-8">
                    <InfoField label="Institución de procedencia" value={student.institucionProcedencia} />
                    <InfoField label="Año de ingreso a APO-AUTIS" value={new Date(student.anoIngreso).getFullYear()} />
                </div>

                {/* --- Jornada --- */}
                <div className="flex items-center space-x-8">
                    <span className="font-semibold text-gray-600">Jornada:</span>
                    <CheckboxDisplay label="Matutina" checked={student.jornada === 'Matutina'} />
                    <CheckboxDisplay label="Vespertina" checked={student.jornada === 'Vespertina'} />
                </div>

                {/* --- Tipos de Atención --- */}
                <div className="pt-2">
                    <h3 className="font-bold text-center mb-2 underline">TIPOS DE ATENCIÓN</h3>
                    <div className="grid grid-cols-3 gap-x-8 gap-y-2">
                        <CheckboxDisplay label="Atención Grupal" checked={student.atencionGrupal} />
                        <CheckboxDisplay label="Atención Individual" checked={student.atencionIndividual} />
                        <CheckboxDisplay label="Inclusión Escolar" checked={student.inclusionEscolar} />
                        <CheckboxDisplay label="Atención pre-vocacional" checked={student.atencionPrevocacional} />
                        <CheckboxDisplay label="Atención a Distancia" checked={student.atencionDistancia} />
                        <InfoField label="Instituto donde está incluido" value={student.institutoIncluido} />
                        <CheckboxDisplay label="Terapia a domicilio" checked={student.terapiaDomicilio} />
                        <CheckboxDisplay label="Atención vocacional" checked={student.atencionVocacional} />
                        <CheckboxDisplay label="Educación Física y Deportes" checked={student.educacionFisica} />
                    </div>
                </div>

                 {/* --- Datos de los Padres --- */}
                <div className="pt-2 space-y-3">
                     <InfoField label="Nombre del padre" value={father?.fullName} />
                     <InfoField label="Dirección y Teléfono (Emergencia)" value={`${father?.direccionEmergencia || student.direccion} / ${father?.telefono}`} />
                     <InfoField label="Nombre de la madre" value={mother?.fullName} />
                     <InfoField label="Dirección y Teléfono (Emergencia)" value={`${mother?.direccionEmergencia || student.direccion} / ${mother?.telefono}`} />
                </div>

                 {/* --- Información Médica --- */}
                <div className="pt-2 space-y-3">
                    <div className="flex items-center space-x-4">
                        <span className="font-semibold">Usa medicamentos:</span>
                        <CheckboxDisplay label="SI" checked={student.medicamentos.length > 0} />
                        <CheckboxDisplay label="NO" checked={student.medicamentos.length === 0} />
                        <InfoField label="Cuáles" value={student.medicamentos.map((m: any) => m.nombre).join(', ')} />
                    </div>
                     <div className="flex items-center space-x-4">
                        <span className="font-semibold">Es alérgico:</span>
                        <CheckboxDisplay label="SI" checked={student.alergias.length > 0} />
                        <CheckboxDisplay label="NO" checked={student.alergias.length === 0} />
                        <InfoField label="A cuáles" value={student.alergias.map((a: any) => a.nombre).join(', ')} />
                    </div>
                </div>
            </main>

            <footer className="mt-16 pt-10 text-center space-y-16">
                 <div>
                    <p className="text-sm">La Ceiba, Atlántida {formatDate(new Date().toISOString())}</p>
                </div>
                <div className="grid grid-cols-2 gap-x-20">
                    <div className="border-t border-black pt-2">
                        <p className="font-semibold">Padre de familia</p>
                    </div>
                     <div className="border-t border-black pt-2">
                        <p className="font-semibold">Entrevistador</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default PrintMatriculaPage;