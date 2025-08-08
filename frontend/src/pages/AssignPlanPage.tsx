// frontend/src/pages/AssignPlanPage.tsx
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import studentService from '../services/studentService';

function AssignPlanPage() {
  const [dayOfWeek, setDayOfWeek] = useState('Lunes');
  const [time, setTime] = useState('');
  const [therapyTitle, setTherapyTitle] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { id: studentId } = useParams<{ id: string }>(); // Obtenemos el ID del estudiante de la URL

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!studentId) {
      setError("No se pudo identificar al estudiante.");
      return;
    }

    try {
      const planData = { dayOfWeek, time, therapyTitle };
      await studentService.assignTherapyPlan(parseInt(studentId, 10), planData);
      // Si tiene éxito, volvemos a la lista de estudiantes
      navigate('/students');
    } catch (err) {
      setError('No se pudo asignar el plan.');
    }
  };

  return (
    <div>
      <h2>Asignar Plan Terapéutico</h2>
      <form onSubmit={handleSubmit}>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div>
          <label>Título de la Terapia:</label>
          <input type="text" value={therapyTitle} onChange={(e) => setTherapyTitle(e.target.value)} required />
        </div>
        <div>
          <label>Día de la Semana:</label>
          <select value={dayOfWeek} onChange={(e) => setDayOfWeek(e.target.value)}>
            <option value="Lunes">Lunes</option>
            <option value="Martes">Martes</option>
            <option value="Miércoles">Miércoles</option>
            <option value="Jueves">Jueves</option>
            <option value="Viernes">Viernes</option>
          </select>
        </div>
        <div>
          <label>Hora:</label>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
        </div>
        <button type="submit">Asignar Plan</button>
      </form>
    </div>
  );
}
export default AssignPlanPage;