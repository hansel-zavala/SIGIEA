// frontend/src/pages/EditStudentPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import studentService from '../services/studentService';
import Label from '../components/ui/Label';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';

function EditStudentPage() {
  // Estado para manejar todos los campos del formulario
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    lugarNacimiento: '',
    direccion: '',
    genero: 'Masculino',
    zona: 'Urbano',
    jornada: 'Matutina',
    // Añadimos aquí todos los demás campos...
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // useEffect para cargar los datos del estudiante al abrir la página
  useEffect(() => {
    if (id) {
      studentService.getStudentById(parseInt(id, 10))
        .then(student => {
          // Formateamos la fecha para el input
          const formattedDate = new Date(student.dateOfBirth).toISOString().split('T')[0];
          // Llenamos el estado del formulario con los datos del estudiante
          setFormData({
            ...student,
            dateOfBirth: formattedDate,
          });
        })
        .catch(() => setError('No se pudieron cargar los datos del estudiante.'));
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
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
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Editar Ficha de Matrícula</h2>
      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="border-b pb-6">
          <h3 className="text-xl font-semibold text-gray-700">Datos del Alumno</h3>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="fullName">Nombre Completo</Label>
              <Input id="fullName" name="fullName" type="text" value={formData.fullName} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="dateOfBirth">Fecha de Nacimiento</Label>
              <Input id="dateOfBirth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="lugarNacimiento">Lugar de Nacimiento</Label>
              <Input id="lugarNacimiento" name="lugarNacimiento" type="text" value={formData.lugarNacimiento} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="direccion">Dirección</Label>
              <Input id="direccion" name="direccion" type="text" value={formData.direccion} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="genero">Género</Label>
              <Select id="genero" name="genero" value={formData.genero} onChange={handleChange}
                options={[{ value: 'Masculino', label: 'Masculino' }, { value: 'Femenino', label: 'Femenino' }]}
              />
            </div>
             <div>
              <Label htmlFor="zona">Zona</Label>
              <Select id="zona" name="zona" value={formData.zona} onChange={handleChange}
                options={[{ value: 'Urbano', label: 'Urbano' }, { value: 'Rural', label: 'Rural' }]}
              />
            </div>
            <div>
              <Label htmlFor="jornada">Jornada</Label>
              <Select id="jornada" name="jornada" value={formData.jornada} onChange={handleChange}
                options={[{ value: 'Matutina', label: 'Matutina' }, { value: 'Vespertina', label: 'Vespertina' }]}
              />
            </div>
          </div>
        </div>
        {/* Aquí podríamos añadir en el futuro la gestión de guardianes y otros campos */}
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