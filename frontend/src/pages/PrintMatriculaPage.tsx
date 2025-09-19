// frontend/src/pages/PrintMatriculaPage.tsx
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import studentService from '../services/studentService';
import logo from '../assets/apo-autis-logo.png';

const InfoFieldCompact = ({ label, value, className = "" }: { label: string; value: any; className?: string }) => (
    <div className={`flex flex-col ${className}`}>
        <span className="font-semibold text-gray-700 text-xs">{label}:</span>
        <span className="text-gray-900 text-sm font-medium border-b border-gray-300 pb-0.5">{value || 'N/A'}</span>
    </div>
);

const CheckboxDisplayCompact = ({ label, checked }: { label: string; checked: boolean }) => (
    <div className="flex items-center text-xs">
        <div className="w-4 h-4 border border-black mr-1 flex items-center justify-center text-xs">
            {checked && <span className="font-bold">X</span>}
        </div>
        <span>{label}</span>
    </div>
);

function PrintMatriculaPage() {
    const { id } = useParams<{ id: string }>();
    const [student, setStudent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const pageRef = useRef<HTMLDivElement>(null);

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
        if (!loading && student && pageRef.current) {
            const images = Array.from(pageRef.current.getElementsByTagName('img'));
            const allImages = images.filter(img => !img.complete);
            
            if (allImages.length === 0) {
                window.print();
            } else {
                let loadedCount = 0;
                allImages.forEach(image => {
                    const handleLoad = () => {
                        loadedCount++;
                        if (loadedCount === allImages.length) {
                            window.print();
                        }
                    };
                    image.onload = handleLoad;
                    image.onerror = handleLoad; 
                });
            }
        }
    }, [loading, student]);

    if (loading) {
        return <div className="p-10 text-center">Cargando datos para impresión...</div>;
    }
    
    if (!student) {
        return <div className="p-10 text-center text-red-500">No se encontró al estudiante.</div>;
    }

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('es-HN', { year: 'numeric', month: '2-digit', day: '2-digit' });
    };

    const father = student.guardians?.find((g: any) => g.parentesco === 'Padre');
    const mother = student.guardians?.find((g: any) => g.parentesco === 'Madre');
    
    const today = new Date().toLocaleDateString('es-HN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    return (
        <div ref={pageRef} className="p-6 bg-white font-sans text-sm print:m-0 print:p-0">
            <header className="flex justify-between items-start mb-4  pb-2">
                <img src={logo} alt="Logo APO-AUTIS" className="h-20 w-auto object-contain" />
                <div className="text-center flex-grow mx-4">
                    <h1 className="text-lg font-bold">ASOCIACION HONDUREÑA DE APOYO AL AUTISTA</h1>
                    <h2 className="text-md font-bold text-gray-800">APO-AUTIS</h2>
                    <p className="text-sm">CENTRO DE ATENCIÓN</p>
                </div>
                <div className="border border-black p-1 text-center flex-shrink-0">
                    <h3 className="font-bold text-base">MATRICULA {new Date(student.anoIngreso).getFullYear()}</h3>
                </div>
            </header>

            <main className="space-y-4 text-gray-800">
                <section className="border border-gray-300 p-3 rounded">
                    <h3 className="text-base font-bold mb-2 underline">DATOS DEL ESTUDIANTE</h3>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                        <InfoFieldCompact label="Nombre Completo" value={student.fullName} />
                        <InfoFieldCompact label="Año de Ingreso a APO-AUTIS" value={new Date(student.anoIngreso).getFullYear()} />
                        <InfoFieldCompact label="Fecha de Nacimiento" value={formatDate(student.dateOfBirth)} />
                        <InfoFieldCompact label="Lugar de Nacimiento" value={student.lugarNacimiento} />
                        <InfoFieldCompact label="Dirección" value={student.direccion} className="col-span-2"/>
                        <InfoFieldCompact label="Género" value={student.genero} />
                        <InfoFieldCompact label="Tipo de Sangre" value={student.tipoSangre?.replace('_', ' ') || 'N/A'} />
                        <InfoFieldCompact label="Institución de Procedencia" value={student.institutoIncluido} />
                        <InfoFieldCompact label="Referencio Medica" value={student.referencioMedica} />
                        
                    </div>
                </section>

                <section className="border border-gray-300 p-3 rounded">
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center space-x-4">
                            <span className="font-semibold">Jornada:</span>
                            <CheckboxDisplayCompact label="Matutina" checked={student.jornada === 'Matutina'} />
                            <CheckboxDisplayCompact label="Vespertina" checked={student.jornada === 'Vespertina'} />
                        </div>
                        {/* <InfoFieldCompact label="Instituto Incluido" value={student.institutoIncluido} className="w-1/2"/> */}
                    </div>
                    
                    <h3 className="text-base font-bold mb-2 underline text-center mt-3">TIPOS DE ATENCIÓN</h3>
                    <div className="grid grid-cols-3 gap-x-4 gap-y-2">
                        <CheckboxDisplayCompact label="Atención Grupal" checked={student.atencionGrupal} />
                        <CheckboxDisplayCompact label="Atención Individual" checked={student.atencionIndividual} />
                        <CheckboxDisplayCompact label="Atención Pre-vocacional" checked={student.atencionPrevocacional} />
                        <CheckboxDisplayCompact label="Atención a Distancia" checked={student.atencionDistancia} />
                        <CheckboxDisplayCompact label="Terapia a Domicilio" checked={student.terapiaDomicilio} />
                        <CheckboxDisplayCompact label="Atención Vocacional" checked={student.atencionVocacional} />
                        <CheckboxDisplayCompact label="Inclusión Escolar" checked={student.inclusionEscolar} />
                        <CheckboxDisplayCompact label="Educación Física y Deportes" checked={student.educacionFisica} />
                    </div>
                </section>

                <section className="border border-gray-300 p-3 rounded">
                    <h3 className="text-base font-bold mb-2 underline">DATOS FAMILIARES</h3>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                        <InfoFieldCompact label="Nombre del Padre" value={father?.fullName} />
                        <InfoFieldCompact label="Teléfono Padre" value={father?.telefono} />
                        <InfoFieldCompact label="Nombre de la Madre" value={mother?.fullName} />
                        <InfoFieldCompact label="Teléfono Madre" value={mother?.telefono} />
                        {/* <InfoFieldCompact label="Teléfono de Emergencia" value={father?.telefonoEmergencia || mother?.telefonoEmergencia || 'N/A'} className="col-span-2"/> */}
                    </div>
                </section>

                <section className="border border-gray-300 p-3 rounded">
                    <h3 className="text-base font-bold mb-2 underline">INFORMACIÓN MÉDICA</h3>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                        <div className="flex items-center space-x-2 col-span-2">
                            <span className="font-semibold text-xs">Usa medicamentos:</span>
                            <CheckboxDisplayCompact label="SI" checked={student.medicamentos?.length > 0} />
                            <CheckboxDisplayCompact label="NO" checked={student.medicamentos?.length === 0} />
                            <InfoFieldCompact label="Cuáles" value={student.medicamentos?.map((m: any) => m.nombre).join(', ') || 'N/A'} className="flex-grow"/>
                        </div>
                        <div className="flex items-center space-x-2 col-span-2">
                            <span className="font-semibold text-xs">Es alérgico:</span>
                            <CheckboxDisplayCompact label="SI" checked={student.alergias?.length > 0} />
                            <CheckboxDisplayCompact label="NO" checked={student.alergias?.length === 0} />
                            <InfoFieldCompact label="A cuáles" value={student.alergias?.map((a: any) => a.nombre).join(', ') || 'N/A'} className="flex-grow"/>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="mt-8 text-center text-xs">
                <p>La Ceiba, Atlántida {today}</p>
                <div className="grid grid-cols-2 gap-x-20 mt-12">
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