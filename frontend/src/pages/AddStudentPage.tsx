// frontend/src/pages/AddStudentPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import studentService from '../services/studentService';

// ✅ PASO 1: Importamos nuestros nuevos componentes reutilizables
import Label from '../components/ui/Label';
import Input from '../components/ui/Input';

function AddStudentPage() {
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [supportLevel, setSupportLevel] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      const studentData = { fullName, dateOfBirth, diagnosis, supportLevel };
      await studentService.createStudent(studentData);
      navigate('/students');
    } catch (err) {
      setError('No se pudo crear el estudiante. Verifique los datos.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Añadir Nuevo Estudiante</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-500">{error}</p>}

        {/* ✅ PASO 2: Usamos nuestros nuevos componentes */}
        <div>
          <Label htmlFor="fullName">Nombre Completo:</Label>
          <Input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="dateOfBirth">Fecha de Nacimiento:</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="diagnosis">Diagnóstico:</Label>
          <Input
            id="diagnosis"
            type="text"
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="supportLevel">Nivel de Apoyo:</Label>
          <Input
            id="supportLevel"
            type="text"
            value={supportLevel}
            onChange={(e) => setSupportLevel(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Guardar Estudiante
        </button>
      </form>
    </div>
  );
}
export default AddStudentPage;