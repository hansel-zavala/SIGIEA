// frontend/src/pages/AddStudentPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import studentService from '../services/studentService';

function AddStudentPage() {
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [supportLevel, setSupportLevel] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Hook para la redirección

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      const studentData = { fullName, dateOfBirth, diagnosis, supportLevel };
      await studentService.createStudent(studentData);
      // Si la creación es exitosa, redirigimos a la lista de estudiantes
      navigate('/students');
    } catch (err) {
      setError('No se pudo crear el estudiante. Verifique los datos.');
    }
  };

  return (
    <div>
      <h2>Añadir Nuevo Estudiante</h2>
      <form onSubmit={handleSubmit}>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div>
          <label>Nombre Completo:</label>
          <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>
        <div>
          <label>Fecha de Nacimiento:</label>
          <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} required />
        </div>
        <div>
          <label>Diagnóstico:</label>
          <input type="text" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />
        </div>
        <div>
          <label>Nivel de Apoyo:</label>
          <input type="text" value={supportLevel} onChange={(e) => setSupportLevel(e.target.value)} />
        </div>
        <button type="submit">Guardar Estudiante</button>
      </form>
    </div>
  );
}
export default AddStudentPage;