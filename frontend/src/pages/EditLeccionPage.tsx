// frontend/src/pages/EditLeccionPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import leccionService from '../services/leccionService';

function EditLeccionPage() {
  const [formData, setFormData] = useState({ title: '', objective: '', description: '', category: '', keySkill: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      leccionService.getLeccionById(Number(id))
        .then(data => setFormData({
            title: data.title,
            objective: data.objective,
            description: data.description || '',
            category: data.category || '',
            keySkill: data.keySkill || ''
        }))
        .catch(() => setError('No se pudieron cargar los datos de la lección.'));
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (id) {
        try {
            await leccionService.updateLeccion(Number(id), formData);
            navigate('/lecciones');
        } catch (err) {
            setError('No se pudo actualizar la lección.');
        }
    }
  };

  return (
    <div>
      <h2>Editar Lección</h2>
      <form onSubmit={handleSubmit}>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {/* ... El mismo JSX del formulario de AddLeccionPage ... */}
        <div><label>Título:</label><input name="title" type="text" value={formData.title} onChange={handleChange} required /></div>
        <div><label>Objetivo:</label><input name="objective" type="text" value={formData.objective} onChange={handleChange} required /></div>
        <div><label>Descripción:</label><textarea name="description" value={formData.description} onChange={handleChange} /></div>
        <div><label>Categoría:</label><input name="category" type="text" value={formData.category} onChange={handleChange} /></div>
        <div><label>Habilidad Clave:</label><input name="keySkill" type="text" value={formData.keySkill} onChange={handleChange} /></div>
        <button type="submit">Guardar Cambios</button>
      </form>
    </div>
  );
}
export default EditLeccionPage;