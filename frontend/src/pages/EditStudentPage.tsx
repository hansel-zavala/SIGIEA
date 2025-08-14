// frontend/src/pages/EditStudentPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import studentService from '../services/studentService';
import Label from '../components/ui/Label';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';

// Estado inicial vacío para todos los campos de la matrícula
const initialState = {
    fullName: '', dateOfBirth: '', lugarNacimiento: '', direccion: '', institucionProcedencia: '',
    recibioEvaluacion: false, institutoIncluido: '', anoIngreso: '',
    zona: 'Urbano' as 'Urbano' | 'Rural', jornada: 'Matutina' as 'Matutina' | 'Vespertina',
    genero: 'Masculino' as 'Masculino' | 'Femenino',
    atencionGrupal: false, atencionIndividual: false, atencionPrevocacional: false, atencionDistancia: false,
    terapiaDomicilio: false, atencionVocacional: false, inclusionEscolar: false, educacionFisica: false,
    usaMedicamentos: false, cualesMedicamentos: '', esAlergico: false, cualesAlergias: '',
};

function EditStudentPage() {
  const [formData, setFormData] = useState(initialState);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Carga los datos del estudiante cuando la página se abre
  useEffect(() => {
    if (id) {
      studentService.getStudentById(parseInt(id, 10))
        .then(student => {
          // Preparamos los datos para que coincidan con el formulario
          const formattedStudent = {
            ...initialState, // Asegura que todos los campos existan
            ...student,
            dateOfBirth: new Date(student.dateOfBirth).toISOString().split('T')[0],
            anoIngreso: new Date(student.anoIngreso).toISOString().split('T')[0],
          };
          setFormData(formattedStudent);
        })
        .catch(() => setError('No se pudieron cargar los datos del estudiante.'));
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
        await studentService.updateStudent(parseInt(id, 10), formData);
        navigate('/students');
      } catch (err) {
        setError('No se pudo actualizar el estudiante.');
      }
    }
  };

  return (
    <div className="max-w-8xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Editar Ficha del Estudiante</h2>
      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-lg shadow-md">

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