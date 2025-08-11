// frontend/src/pages/EditStudentPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import studentService from '../services/studentService';

// ✅ Importamos nuestros nuevos componentes
import Label from '../components/ui/Label';
import Input from '../components/ui/Input';

function EditStudentPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    diagnosis: '',
    supportLevel: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (id) {
      studentService.getStudentById(parseInt(id, 10))
        .then(student => {
          const formattedDate = new Date(student.dateOfBirth).toISOString().split('T')[0];
          setFormData({
            fullName: student.fullName,
            dateOfBirth: formattedDate,
            diagnosis: student.diagnosis || '',
            supportLevel: student.supportLevel || '',
          });
        })
        .catch(() => setError('No se pudieron cargar los datos del estudiante.'));
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Editar Estudiante</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-500">{error}</p>}

        {/* ✅ Usamos nuestros nuevos componentes */}
        <div>
          <Label htmlFor="fullName">Nombre Completo:</Label>
          <Input name="fullName" id="fullName" type="text" value={formData.fullName} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="dateOfBirth">Fecha de Nacimiento:</Label>
          <Input name="dateOfBirth" id="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="diagnosis">Diagnóstico:</Label>
          <Input name="diagnosis" id="diagnosis" type="text" value={formData.diagnosis} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="supportLevel">Nivel de Apoyo:</Label>
          <Input name="supportLevel" id="supportLevel" type="text" value={formData.supportLevel} onChange={handleChange} />
        </div>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Guardar Cambios
        </button>
      </form>
    </div>
  );
}
export default EditStudentPage;