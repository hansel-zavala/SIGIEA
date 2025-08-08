// frontend/src/pages/StudentDetailPage.tsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import studentService from '../services/studentService';

function StudentDetailPage() {
  const [student, setStudent] = useState<any>(null); // Usamos 'any' por simplicidad aquí
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (id) {
      const fetchStudent = async () => {
        try {
          const data = await studentService.getStudentById(parseInt(id, 10));
          setStudent(data);
        } catch (err) {
          setError('No se pudo cargar la información del estudiante.');
        } finally {
          setLoading(false);
        }
      };
      fetchStudent();
    }
  }, [id]);

  if (loading) return <p>Cargando perfil del estudiante...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!student) return <p>No se encontró al estudiante.</p>;

  return (
    <div>
      <h2>Perfil de: {student.fullName}</h2>
      <p><strong>Diagnóstico:</strong> {student.diagnosis}</p>
      <p><strong>Nivel de Apoyo:</strong> {student.supportLevel}</p>

      <hr />

      <h3>Planes Terapéuticos Asignados</h3>
      {student.therapyPlans.length > 0 ? (
        <table border={1} style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Terapia</th>
              <th>Día</th>
              <th>Hora</th>
            </tr>
          </thead>
          <tbody>
            {student.therapyPlans.map((plan: any) => (
              <tr key={plan.id}>
                <td>{plan.therapyTitle}</td>
                <td>{plan.dayOfWeek}</td>
                <td>{plan.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Este estudiante no tiene planes terapéuticos asignados.</p>
      )}
    </div>
  );
}

export default StudentDetailPage;