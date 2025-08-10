// frontend/src/pages/EditPlanPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import therapyPlanService from '../services/therapyPlanService';

function EditPlanPage() {
  const [formData, setFormData] = useState({ dayOfWeek: 'Lunes', time: '', therapyTitle: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { studentId, planId } = useParams();

  useEffect(() => {
    const fetchPlan = async () => {
      if (studentId && planId) {
        try {
          const plan = await therapyPlanService.getPlanById(Number(studentId), Number(planId));
          setFormData({ dayOfWeek: plan.dayOfWeek, time: plan.time, therapyTitle: plan.therapyTitle });
        } catch (err) {
          setError('No se pudieron cargar los datos del plan.');
        }
      }
    };
    fetchPlan();
  }, [studentId, planId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (studentId && planId) {
      try {
        await therapyPlanService.updatePlan(Number(studentId), Number(planId), formData);
        navigate(`/students/${studentId}`); // Volver a la página de detalles del estudiante
      } catch (err) {
        setError('No se pudo actualizar el plan.');
      }
    }
  };

  return (
    <div>
      <h2>Editar Plan Terapéutico</h2>
      <form onSubmit={handleSubmit}>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div>
          <label>Título de la Terapia:</label>
          <input name="therapyTitle" type="text" value={formData.therapyTitle} onChange={handleChange} required />
        </div>
        <div>
          <label>Día de la Semana:</label>
          <select name="dayOfWeek" value={formData.dayOfWeek} onChange={handleChange}>
            <option value="Lunes">Lunes</option>
            <option value="Martes">Martes</option>
            <option value="Miércoles">Miércoles</option>
            <option value="Jueves">Jueves</option>
            <option value="Viernes">Viernes</option>
          </select>
        </div>
        <div>
          <label>Hora:</label>
          <input name="time" type="time" value={formData.time} onChange={handleChange} required />
        </div>
        <button type="submit">Guardar Cambios</button>
      </form>
    </div>
  );
}
export default EditPlanPage;