// frontend/src/pages/EditLeccionPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import leccionService from '../services/leccionService';
import Label from '../components/ui/Label';
import Input from '../components/ui/Input';

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

  const textAreaStyles = "block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 sm:text-sm";

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Editar Lección</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-500">{error}</p>}
        <div>
          <Label htmlFor="title">Título:</Label>
          <Input id="title" name="title" type="text" value={formData.title} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="objective">Objetivo:</Label>
          <Input id="objective" name="objective" type="text" value={formData.objective} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="description">Descripción:</Label>
          <textarea id="description" name="description" value={formData.description} onChange={handleChange} className={textAreaStyles} />
        </div>
        <div>
          <Label htmlFor="category">Categoría:</Label>
          <Input id="category" name="category" type="text" value={formData.category} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="keySkill">Habilidad Clave:</Label>
          <Input id="keySkill" name="keySkill" type="text" value={formData.keySkill} onChange={handleChange} />
        </div>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Guardar Cambios
        </button>
      </form>
    </div>
  );
}
export default EditLeccionPage;