// frontend/src/pages/StudentsPage.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import studentService from '../services/studentService';

// Definimos un tipo para el estudiante para tener mejor autocompletado
interface Student {
  id: number;
  fullName: string;
  diagnosis: string | null;
  supportLevel: string | null;
}

function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Este efecto se ejecuta una vez, cuando la página carga
    const fetchStudents = async () => {
      try {
        const data = await studentService.getAllStudents();
        setStudents(data);
      } catch (err) {
        setError('No se pudo cargar la lista de estudiantes.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []); // El array vacío asegura que se ejecute solo una vez

  // ✅ NUEVA FUNCIÓN PARA MANEJAR LA ELIMINACIÓN
  const handleDelete = async (studentId: number) => {
    // Pedimos confirmación al usuario para evitar borrados accidentales
    if (window.confirm('¿Estás seguro de que quieres eliminar a este estudiante?')) {
      try {
        await studentService.deleteStudent(studentId);
        // Si la eliminación es exitosa, actualizamos la lista en el frontend
        // filtrando para quitar al estudiante eliminado.
        setStudents(students.filter(student => student.id !== studentId));
      } catch (err) {
        setError('No se pudo eliminar el estudiante.');
      }
    }
  };


  if (loading) return <p>Cargando estudiantes...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h2>Lista de Estudiantes</h2>
      {/* ✅ AÑADIMOS EL BOTÓN/ENLACE AQUÍ */}
      <Link to="/students/new">
        <button>Añadir Nuevo Estudiante</button>
      </Link>
      <br /><br />
      <table border={1} style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre Completo</th>
            <th>Diagnóstico</th>
            <th>Nivel de Apoyo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td>{student.id}</td>
              <td>{student.fullName}</td>
              <td>{student.diagnosis}</td>
              <td>{student.supportLevel}</td>
              <td>
    {/* ✅ AÑADIMOS EL BOTÓN/ENLACE AQUÍ */}
    <Link to={`/students/edit/${student.id}`}>
        <button style={{ marginRight: '5px' }}>Editar</button>
    </Link>
    <button onClick={() => handleDelete(student.id)}>Eliminar</button>
</td>
              
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default StudentsPage;