// frontend/src/pages/AssignPlanPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import studentService from '../services/studentService';
import leccionService from '../services/leccionService'; // ¡Importamos el nuevo servicio!

// Definimos un tipo para nuestras lecciones
interface Leccion {
  id: number;
  title: string;
}

function AssignPlanPage() {
  // Estado para la lista de lecciones disponibles
  const [lecciones, setLecciones] = useState<Leccion[]>([]);

  // Estados para los datos del formulario
  const [leccionId, setLeccionId] = useState(''); // ✅ CAMBIO: Guardamos el ID de la lección
  const [dayOfWeek, setDayOfWeek] = useState('Lunes');
  const [time, setTime] = useState('');

  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { id: studentId } = useParams<{ id: string }>();

  // ✅ NUEVO: Usamos useEffect para cargar las lecciones cuando la página se abre
  useEffect(() => {
    const fetchLecciones = async () => {
      try {
        const data = await leccionService.getAllLecciones();
        setLecciones(data);
      } catch (err) {
        setError('No se pudieron cargar las plantillas de lección.');
      }
    };
    fetchLecciones();
  }, []); // El array vacío asegura que se ejecute solo una vez

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!studentId || !leccionId) {
      setError("Debes seleccionar una lección.");
      return;
    }

    try {
      // ✅ CAMBIO: Enviamos el leccionId en lugar de un título de texto
      const planData = { dayOfWeek, time, leccionId: parseInt(leccionId) };
      await studentService.assignTherapyPlan(parseInt(studentId, 10), planData);
      navigate(`/students/${studentId}`); // Volvemos a la página de detalles del estudiante
    } catch (err) {
      setError('No se pudo asignar el plan.');
    }
  };

  return (
    <div>
      <h2>Asignar Plan Terapéutico</h2>
      <form onSubmit={handleSubmit}>
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {/* ✅ CAMBIO: Reemplazamos el input de texto por un select */}
        <div>
          <label>Lección:</label>
          <select value={leccionId} onChange={(e) => setLeccionId(e.target.value)} required>
            <option value="">-- Selecciona una lección --</option>
            {lecciones.map((leccion) => (
              <option key={leccion.id} value={leccion.id}>
                {leccion.title}
              </option>
            ))}
          </select>
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