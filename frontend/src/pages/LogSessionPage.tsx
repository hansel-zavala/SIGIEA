// frontend/src/pages/LogSessionPage.tsx
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import sessionLogService from '../services/sessionLogService';

function LogSessionPage() {
  const { studentId, planId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    attendance: 'Presente' as 'Presente' | 'Ausente' | 'Justificado',
    notes: '',
    behavior: '',
    progress: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (studentId && planId) {
      try {
        const logData = { ...formData, therapyPlanId: parseInt(planId) };
        await sessionLogService.createLog(parseInt(studentId), logData);
        navigate(`/students/${studentId}`);
      } catch (err) {
        setError('No se pudo guardar el registro.');
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Registrar Nueva Sesión</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-500">{error}</p>}

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">Fecha:</label>
          <input id="date" name="date" type="date" value={formData.date} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
        </div>

        <div>
          <label htmlFor="attendance" className="block text-sm font-medium text-gray-700">Asistencia:</label>
          <select id="attendance" name="attendance" value={formData.attendance} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
            <option value="Presente">Presente</option>
            <option value="Ausente">Ausente</option>
            <option value="Justificado">Justificado</option>
          </select>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notas Clínicas:</label>
          <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} required rows={5} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
        </div>

        <div>
          <label htmlFor="behavior" className="block text-sm font-medium text-gray-700">Observaciones de Comportamiento:</label>
          <textarea id="behavior" name="behavior" value={formData.behavior} onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
        </div>

        <div>
          <label htmlFor="progress" className="block text-sm font-medium text-gray-700">Progreso:</label>
          <textarea id="progress" name="progress" value={formData.progress} onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
        </div>

        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Guardar Registro</button>
      </form>
    </div>
  );
}
export default LogSessionPage;