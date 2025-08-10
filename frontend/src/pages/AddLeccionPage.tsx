// frontend/src/pages/AddLeccionPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import leccionService from '../services/leccionService';

function AddLeccionPage() {
  const [formData, setFormData] = useState({
    title: '',
    objective: '',
    description: '',
    category: '',
    keySkill: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      await leccionService.createLeccion(formData);
      navigate('/lecciones'); // Redirigir a la lista de lecciones
    } catch (err) {
      setError('No se pudo crear la lección. Verifique los datos.');
    }
  };

  return (
    <div>
      <h2>Crear Nueva Lección</h2>
      <form onSubmit={handleSubmit}>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div>
          <label>Título:</label>
          <input name="title" type="text" value={formData.title} onChange={handleChange} required />
        </div>
        <div>
          <label>Objetivo:</label>
          <input name="objective" type="text" value={formData.objective} onChange={handleChange} required />
        </div>
        <div>
          <label>Descripción:</label>
          <textarea name="description" value={formData.description} onChange={handleChange} />
        </div>
        <div>
          <label>Categoría:</label>
          <input name="category" type="text" value={formData.category} onChange={handleChange} />
        </div>
        <div>
          <label>Habilidad Clave:</label>
          <input name="keySkill" type="text" value={formData.keySkill} onChange={handleChange} />
        </div>
        <button type="submit">Guardar Lección</button>
      </form>
    </div>
  );
}
export default AddLeccionPage;