// frontend/src/pages/EditStudentPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import studentService from '../services/studentService';
import therapistService, { type TherapistProfile } from '../services/therapistService.js';
import uploadService from '../services/uploadService';
import Label from '../components/ui/Label';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { FaExternalLinkAlt, FaTrash } from 'react-icons/fa';

// Estado inicial vacío para todos los campos de la matrícula
type StudentFormData = {
    fullName: string; dateOfBirth: string; lugarNacimiento: string; direccion: string; institucionProcedencia: string;
    recibioEvaluacion: boolean; institutoIncluido: string; anoIngreso: string;
    zona: 'Urbano' | 'Rural'; jornada: 'Matutina' | 'Vespertina';
    genero: 'Masculino' | 'Femenino';
    therapistId?: number | string;
    atencionGrupal: boolean; atencionIndividual: boolean; atencionPrevocacional: boolean; atencionDistancia: boolean;
    terapiaDomicilio: boolean; atencionVocacional: boolean; inclusionEscolar: boolean; educacionFisica: boolean;
    usaMedicamentos: boolean; cualesMedicamentos: string; esAlergico: boolean; cualesAlergias: string;
    partidaNacimientoUrl?: string;
    resultadoEvaluacionUrl?: string;
};

const tiposDeAtencion: { id: keyof StudentFormData; label: string }[] = [
    { id: 'atencionGrupal', label: 'Atención Grupal' },
    { id: 'atencionIndividual', label: 'Atención Individual' },
    { id: 'atencionPrevocacional', label: 'Atención Prevocacional' },
    { id: 'atencionDistancia', label: 'Atención a Distancia' },
    { id: 'terapiaDomicilio', label: 'Terapia a Domicilio' },
    { id: 'atencionVocacional', label: 'Atención Vocacional' },
    { id: 'inclusionEscolar', label: 'Inclusión Escolar' },
    { id: 'educacionFisica', label: 'Educación Física' },
];

function EditStudentPage() {
  const [formData, setFormData] = useState<Partial<StudentFormData>>({});
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [therapists, setTherapists] = useState<TherapistProfile[]>([]);
  const [newPartidaFile, setNewPartidaFile] = useState<File | null>(null);
  const [newEvaluacionFile, setNewEvaluacionFile] = useState<File | null>(null);
  
  // Carga los datos del estudiante cuando la página se abre
  useEffect(() => {
    if (id) {
      studentService.getStudentById(parseInt(id, 10))
        .then(student => {
          const formattedStudent = {
            ...student,
            therapistId: student.therapistId || '',
            dateOfBirth: new Date(student.dateOfBirth).toISOString().split('T')[0],
            anoIngreso: new Date(student.anoIngreso).toISOString().split('T')[0],
          };
          setFormData(formattedStudent);
        })
        .catch(() => setError('No se pudieron cargar los datos.'));
        therapistService.getAllTherapists()
        .then(data => setTherapists(data))
        .catch(() => setError(prev => prev + ' No se pudo cargar la lista de terapeutas.'));
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (id) {
      try {
        const dataToUpdate = { ...formData };

        // ✅ LÓGICA DE SUBIDA DE ARCHIVOS
        if (newPartidaFile) {
          const res = await uploadService.uploadFile(newPartidaFile);
          dataToUpdate.partidaNacimientoUrl = res.filePath;
        }
        if (newEvaluacionFile) {
          const res = await uploadService.uploadFile(newEvaluacionFile);
          dataToUpdate.resultadoEvaluacionUrl = res.filePath;
        }

        await studentService.updateStudent(parseInt(id, 10), dataToUpdate);
        navigate('/students');
      } catch (err) {
        setError('No se pudo actualizar el estudiante.');
      }
    }
  };

  // ✅ NUEVA FUNCIÓN para manejar la eliminación de un enlace de archivo
  const handleFileDelete = (fieldName: 'partidaNacimientoUrl' | 'resultadoEvaluacionUrl') => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este archivo?')) {
      setFormData(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

  return (
    <div className="max-w-8xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Editar Ficha del Estudiante</h2>
      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-lg shadow-md">
        {error && <p className="text-red-500">{error}</p>}

        {/* --- SECCIÓN DATOS DEL ALUMNO --- */}
        <div className="border-b pb-6">
          <h3 className="text-xl font-semibold text-gray-700">Datos del Alumno</h3>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Aquí van todos los campos del formulario, igual que en MatriculaPage */}
            <div><Label htmlFor="fullName">Nombre Completo</Label><Input id="fullName" name="fullName" type="text" value={formData.fullName} onChange={handleChange} required /></div>
            <div><Label htmlFor="dateOfBirth">Fecha de Nacimiento</Label><Input id="dateOfBirth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} required /></div>
            <div><Label htmlFor="lugarNacimiento">Lugar de Nacimiento</Label><Input id="lugarNacimiento" name="lugarNacimiento" type="text" value={formData.lugarNacimiento} onChange={handleChange} /></div>
            <div><Label htmlFor="direccion">Dirección</Label><Input id="direccion" name="direccion" type="text" value={formData.direccion} onChange={handleChange} /></div>
            <div><Label htmlFor="genero">Género</Label><Select id="genero" name="genero" value={formData.genero} onChange={handleChange} options={[{ value: 'Masculino', label: 'Masculino' }, { value: 'Femenino', label: 'Femenino' }]}/></div>
            <div><Label htmlFor="zona">Zona</Label><Select id="zona" name="zona" value={formData.zona} onChange={handleChange} options={[{ value: 'Urbano', label: 'Urbano' }, { value: 'Rural', label: 'Rural' }]}/></div>
            <div><Label htmlFor="jornada">Jornada</Label><Select id="jornada" name="jornada" value={formData.jornada} onChange={handleChange} options={[{ value: 'Matutina', label: 'Matutina' }, { value: 'Vespertina', label: 'Vespertina' }]}/></div>
            <div><Label htmlFor="institucionProcedencia">Institución de Procedencia</Label><Input id="institucionProcedencia" name="institucionProcedencia" type="text" value={formData.institucionProcedencia} onChange={handleChange} /></div>
            <div>
              <Label>Partida de Nacimiento</Label>
              {formData.partidaNacimientoUrl ? (
                <div className="flex items-center gap-4 mt-1">
                  <a href={`http://localhost:3001${formData.partidaNacimientoUrl}`} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline flex items-center gap-2">
                    Ver Archivo Actual <FaExternalLinkAlt />
                  </a>
                  <button type="button" onClick={() => handleFileDelete('partidaNacimientoUrl')} title="Eliminar Archivo">
                    <FaTrash className="text-red-500 hover:text-red-700" />
                  </button>
                </div>
              ) : ( <p className="text-sm text-gray-500 mt-1">No hay archivo subido.</p> )}
              <Input type="file" onChange={(e) => setNewPartidaFile(e.target.files ? e.target.files[0] : null)} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
              
            </div>
            <div>
              <Label>Resultado de Evaluación</Label>
              {formData.resultadoEvaluacionUrl ? (
                <div className="flex items-center gap-4 mt-1">
                  <a href={`http://localhost:3001${formData.resultadoEvaluacionUrl}`} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline flex items-center gap-2">
                    Ver Archivo Actual <FaExternalLinkAlt />
                  </a>
                  <button type="button" onClick={() => handleFileDelete('resultadoEvaluacionUrl')} title="Eliminar Archivo">
                    <FaTrash className="text-red-500 hover:text-red-700" />
                  </button>
                </div>
              ) : ( <p className="text-sm text-gray-500 mt-1">No hay archivo subido.</p> )}
              <Input type="file" onChange={(e) => setNewEvaluacionFile(e.target.files ? e.target.files[0] : null)} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            </div>
          </div>
        </div>

        <div className="border-b pb-6">
          <h3 className="text-xl font-semibold text-gray-700">Tipos de Atención</h3>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {tiposDeAtencion.map(atencion => (
              <div key={atencion.id} className="flex items-center">
                <input 
                  id={atencion.id} 
                  name={atencion.id} 
                  type="checkbox" 
                  // El 'as any' es un pequeño truco para que TypeScript nos deje acceder a la propiedad dinámicamente
                  checked={!!formData[atencion.id]}  
                  onChange={handleChange} 
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" 
                />
                <Label htmlFor={atencion.id} className="ml-2">{atencion.label}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* --- SECCIÓN INFORMACIÓN MÉDICA --- */}
        <div className="border-b pb-6">
          <h3 className="text-xl font-semibold text-gray-700">Información Médica</h3>
          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-2"><input id="usaMedicamentos" name="usaMedicamentos" type="checkbox" checked={formData.usaMedicamentos} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" /><Label htmlFor="usaMedicamentos">¿Usa Medicamentos?</Label></div>
            {formData.usaMedicamentos && (<div><Label htmlFor="cualesMedicamentos">¿Cuáles?</Label><Input id="cualesMedicamentos" name="cualesMedicamentos" type="text" value={formData.cualesMedicamentos} onChange={handleChange} /></div>)}
            <div className="flex items-center gap-2"><input id="esAlergico" name="esAlergico" type="checkbox" checked={formData.esAlergico} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" /><Label htmlFor="esAlergico">¿Es Alérgico?</Label></div>
            {formData.esAlergico && (<div><Label htmlFor="cualesAlergias">¿A qué es alérgico?</Label><Input id="cualesAlergias" name="cualesAlergias" type="text" value={formData.cualesAlergias} onChange={handleChange} /></div>)}
          </div>
        </div>

        <div className="border-b pb-6">
          <h3 className="text-xl font-semibold text-gray-700">Asignación de Terapeuta</h3>
          <div className="mt-4">
            <Label htmlFor="therapistId">Terapeuta Asignado</Label>
            <Select
              id="therapistId"
              name="therapistId"
              value={formData.therapistId}
              onChange={handleChange}
              placeholder="-- No asignado --"
              options={therapists.map(therapist => ({ 
                value: String(therapist.id), 
                label: therapist.fullName 
              }))}
            />
          </div>
        </div>

        <div className="pt-6 text-right">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg">
                Guardar Cambios
            </button>
        </div>
      </form>
    </div>
  );
}
export default EditStudentPage;