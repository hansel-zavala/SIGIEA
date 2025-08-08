// frontend/src/pages/EditStudentPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import studentService from '../services/studentService';

function EditStudentPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    diagnosis: '',
    supportLevel: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // Hook para leer el ':id' de la URL

  useEffect(() => {
    // Cargar los datos del estudiante cuando la página carga
    const fetchStudentData = async () => {
      if (id) {
        try {
          const student = await studentService.getStudentById(parseInt(id, 10));
          // Formateamos la fecha para el input type="date"
          const formattedDate = new Date(student.dateOfBirth).toISOString().split('T')[0];
          setFormData({
            fullName: student.fullName,
            dateOfBirth: formattedDate,
            diagnosis: student.diagnosis || '',
            supportLevel: student.supportLevel || '',
          });
        } catch (err) {
          setError('No se pudieron cargar los datos del estudiante.');
        }
      }
    };
    fetchStudentData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (id) {
      try {
        await studentService.updateStudent(parseInt(id, 10), formData);
        navigate('/students'); // Redirigir a la lista
      } catch (err) {
        setError('No se pudo actualizar el estudiante.');
      }
    }
  };

  return (
    <div>
      <h2>Editar Estudiante</h2>
      <form onSubmit={handleSubmit}>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div>
          <label>Nombre Completo:</label>
          <input name="fullName" type="text" value={formData.fullName} onChange={handleChange} required />
        </div>
        <div>
          <label>Fecha de Nacimiento:</label>
          <input name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} required />
        </div>
        <div>
          <label>Diagnóstico:</label>
          <input name="diagnosis" type="text" value={formData.diagnosis} onChange={handleChange} />
        </div>
        <div>
          <label>Nivel de Apoyo:</label>
          <input name="supportLevel" type="text" value={formData.supportLevel} onChange={handleChange} />
        </div>
        <button type="submit">Guardar Cambios</button>
      </form>
    </div>
  );
}
export default EditStudentPage;