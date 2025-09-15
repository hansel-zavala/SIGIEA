// frontend/src/pages/AddLeccionPage.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import leccionService from '../services/leccionService';
import Label from '../components/ui/Label';
import Input from '../components/ui/Input';

function AddLeccionPage() {
  const [formData, setFormData] = useState({
    title: '',
    objective: '',
    description: '',
    category: '',
    keySkill: ''
  });
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

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

    try {
      await leccionService.createLeccion(formData);
      navigate('/lecciones');
    } catch (err: any) {
      setError(err.response?.data?.error || 'No se pudo crear la lección.');
    }
  };

  const textAreaStyles = "block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 sm:text-sm";

  return (
    <div className="bg-white rounded-lg shadow-md p-6 ">
      <div className="max-w-8xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Crear Nueva Lección</h2>
        <form onSubmit={handleSubmit} >
          {error && <p className="text-red-500">{error}</p>}
          <fieldset className="border border-violet-300 p-4 rounded-md">
          <legend className="text-xl font-semibold text-gray-700">
            Datos de la Lección
          </legend>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="title">Título:</Label>
                <Input id="title" name="title" type="text" value={formData.title} onChange={handleChange}  />
                {formErrors.title && <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>}
              </div>
              <div>
                <Label htmlFor="objective">Objetivo:</Label>
                <Input id="objective" name="objective" type="text" value={formData.objective} onChange={handleChange}  />
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
                <textarea id="description" name="description" value={formData.description} onChange={handleChange} className={textAreaStyles} rows={6} />
                {formErrors.description && <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>}
              </div>
            </div>
          </fieldset>
          
          <div className="pt-6 flex justify-end gap-6">
            <button
              type="submit"
              className="min-w-[220px] py-3 px-4 text-white font-bold rounded-lg bg-gradient-to-r from-violet-400 to-violet-500 hover:from-violet-500 hover:to-violet-600 transition-all duration-200 flex items-center justify-center gap-3 shadow-md"
            >
              Guardar Lección
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default AddLeccionPage;