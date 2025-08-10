// frontend/src/pages/LeccionesPage.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import leccionService from '../services/leccionService';

// Definimos un tipo para la lección
interface Leccion {
  id: number;
  title: string;
  objective: string;
  category: string | null;
}

function LeccionesPage() {
  const [lecciones, setLecciones] = useState<Leccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLecciones = async () => {
      try {
        const data = await leccionService.getAllLecciones();
        setLecciones(data);
      } catch (err) {
        setError('No se pudo cargar la lista de lecciones.');
      } finally {
        setLoading(false);
      }
    };

    fetchLecciones();
  }, []);

  const handleDelete = async (leccionId: number) => {
        if (window.confirm('¿Seguro que quieres desactivar esta lección?')) {
            try {
                await leccionService.deleteLeccion(leccionId);
                setLecciones(lecciones.filter(l => l.id !== leccionId));
            } catch (err) {
                setError('No se pudo desactivar la lección.');
            }
        }
    };

  if (loading) return <p>Cargando lecciones...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Catálogo de Lecciones</h2>
        {/* Más adelante, este botón nos llevará a un formulario para crear una nueva lección */}
        <Link to="/lecciones/new">
          <button>Crear Nueva Lección</button>
        </Link>
      </div>
      <br />
      <table border={1} style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Título</th>
            <th>Objetivo</th>
            <th>Categoría</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {lecciones.map((leccion) => (
            <tr key={leccion.id}>
              <td>{leccion.title}</td>
              <td>{leccion.objective}</td>
              <td>{leccion.category}</td>
              <td>
                    <Link to={`/lecciones/edit/${leccion.id}`}>
                      <button style={{ marginRight: '5px' }}>Editar</button>
                    </Link>
                    <button onClick={() => handleDelete(leccion.id)}>Eliminar</button>
                  </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LeccionesPage;