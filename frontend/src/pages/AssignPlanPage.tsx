// frontend/src/pages/AssignPlanPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import studentService from '../services/studentService';
import leccionService from '../services/leccionService';
import Label from '../components/ui/Label';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';

interface Leccion {
  id: number;
  title: string;
}

function AssignPlanPage() {
  const [lecciones, setLecciones] = useState<Leccion[]>([]);
  const [leccionId, setLeccionId] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('Lunes');
  const [time, setTime] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { id: studentId } = useParams<{ id: string }>();

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
  }, []);

  const handleSelectChange = (name: string, value: string | null) => {
    if (name === 'leccionId') {
      setLeccionId(value || '');
    } else if (name === 'dayOfWeek') {
      setDayOfWeek(value || 'Lunes');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!studentId || !leccionId) {
      setError("Debes seleccionar una lección.");
      return;
    }
    try {
      const planData = { dayOfWeek, time, leccionId: parseInt(leccionId) };
      await studentService.assignTherapyPlan(parseInt(studentId, 10), planData);
      navigate(`/students/${studentId}`);
    } catch (err) {
      setError('No se pudo asignar el plan.');
    }
  };
  
  const leccionOptions = lecciones.map(leccion => ({ value: String(leccion.id), label: leccion.title }));
  const dayOptions = [
      { value: 'Lunes', label: 'Lunes' },
      { value: 'Martes', label: 'Martes' },
      { value: 'Miércoles', label: 'Miércoles' },
      { value: 'Jueves', label: 'Jueves' },
      { value: 'Viernes', label: 'Viernes' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 h-full">
      <div className="max-w-8xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Asignar Plan Terapéutico</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-500">{error}</p>}

          <div>
            <Label htmlFor="leccionId">Lección:</Label>
            <Select
              instanceId="leccion-select"
              inputId="leccionId"
              value={leccionOptions.find(o => o.value === leccionId) || null}
              onChange={(option) => handleSelectChange('leccionId', option?.value || null)}
              required
              placeholder="-- Selecciona una lección --"
              options={leccionOptions}
            />
          </div>

          <div>
            <Label htmlFor="dayOfWeek">Día de la Semana:</Label>
            <Select
              instanceId="day-select"
              inputId="dayOfWeek"
              value={dayOptions.find(o => o.value === dayOfWeek) || null}
              onChange={(option) => handleSelectChange('dayOfWeek', option?.value || null)}
              options={dayOptions}
            />
          </div>

          <div>
            <Label htmlFor="time">Hora:</Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Asignar Plan
          </button>
        </form>
      </div>
    </div>
  );
}
export default AssignPlanPage;