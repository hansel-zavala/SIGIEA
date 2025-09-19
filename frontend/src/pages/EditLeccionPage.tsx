// frontend/src/pages/EditLeccionPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import leccionService from '../services/leccionService';
import Label from '../components/ui/Label';
import Input from '../components/ui/Input';
import { useToast } from '../context/ToastContext';

function EditLeccionPage() {
  const [formData, setFormData] = useState({ title: '', objective: '', description: '', category: '', keySkill: '' });
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { id } = useParams();
  const { showToast } = useToast();

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

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const validCharsRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,;:'"¡!¿?()-]+$/;

    if (!formData.title.trim()) {
      errors.title = "El título es obligatorio.";
    } else if (!validCharsRegex.test(formData.title)) {
      errors.title = "El título contiene caracteres no permitidos.";
    }

    if (!formData.objective.trim()) {
      errors.objective = "El objetivo es obligatorio.";
    } else if (!validCharsRegex.test(formData.objective)) {
      errors.objective = "El objetivo contiene caracteres no permitidos.";
    }

    if (!formData.description.trim()) {
      errors.description = "La descripción es obligatoria.";
    } else if (!validCharsRegex.test(formData.description)) {
      errors.description = "La descripción contiene caracteres no permitidos.";
    }

    if (!formData.category.trim()) {
      errors.category = "La categoría es obligatoria.";
    } else if (formData.category && !validCharsRegex.test(formData.category)) {
        errors.category = "La categoría contiene caracteres no permitidos.";
    }

    if (!formData.keySkill.trim()) {
      errors.keySkill = "La habilidad clave es obligatoria.";
    } else if (formData.keySkill && !validCharsRegex.test(formData.keySkill)) {
      errors.keySkill = "La habilidad clave contiene caracteres no permitidos.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) {
        setError("Por favor, corrige los errores en el formulario.");
        return;
    }
    setError('');

    if (id) {
        try {
            await leccionService.updateLeccion(Number(id), formData);
            const lessonTitle = formData.title.trim() || 'la lección';
            showToast({ message: `Se actualizó correctamente la lección "${lessonTitle}".` });
            navigate('/lecciones');
        } catch (err) {
            setError('No se pudo actualizar la lección.');
        }
    }
  };

  const textAreaStyles = "block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 sm:text-sm";

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
    <div className="max-w-8xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Editar Lección</h2>
      <form onSubmit={handleSubmit} >
        {error && (<p className="text-red-500 bg-red-100 p-3 rounded-md mb-6">{error}</p>)}

        <fieldset className="border border-violet-300 p-4 rounded-md">
        <legend className="text-xl font-semibold text-gray-700">
            Datos de la Lección
        </legend>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="title">Título:</Label>
          <Input id="title" name="title" type="text" value={formData.title} onChange={handleChange} required />
          {formErrors.title && <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>}
        </div>
        <div>
          <Label htmlFor="objective">Objetivo:</Label>
          <Input id="objective" name="objective" type="text" value={formData.objective} onChange={handleChange} required />
          {formErrors.objective && <p className="text-red-500 text-sm mt-1">{formErrors.objective}</p>}
        </div>
        
        <div>
          <Label htmlFor="category">Categoría:</Label>
          <Input id="category" name="category" type="text" value={formData.category} onChange={handleChange} />
          {formErrors.category && <p className="text-red-500 text-sm mt-1">{formErrors.category}</p>}
        </div>
        <div>
          <Label htmlFor="keySkill">Habilidad Clave:</Label>
          <Input id="keySkill" name="keySkill" type="text" value={formData.keySkill} onChange={handleChange} />
          {formErrors.keySkill && <p className="text-red-500 text-sm mt-1">{formErrors.keySkill}</p>}
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="description">Descripción:</Label>
          <textarea id="description" name="description" value={formData.description} onChange={handleChange} className={textAreaStyles} rows={6}/>
          {formErrors.description && <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>}
        </div>
        </div>
        </fieldset>
        
        <div className="pt-6 flex justify-end gap-6">
        <button
          type="submit"
          className="py-3 px-8 text-white font-bold rounded-lg bg-gradient-to-r from-violet-400 to-purple-500 hover:from-violet-500 hover:to-purple-600 transition-all duration-200"
        >
          Guardar Cambios
        </button>
        </div>
      </form>
    </div>
    </div>
  );
}
export default EditLeccionPage;
