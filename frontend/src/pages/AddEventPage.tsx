// frontend/src/pages/AddEventPage.tsx
import { useState, useEffect } from 'react'; // Importa useEffect
import { useNavigate } from 'react-router-dom';
import eventService, { type Event as EventType } from '../services/eventService';
import categoryService, { type Category } from '../services/categoryService'; // <-- 1. IMPORTA EL SERVICIO DE CATEGORÍAS
import Label from '../components/ui/Label';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';

function AddEventPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    isAllDay: false,
    location: '',
    audience: 'General',
    categoryId: '', // <-- 2. CAMBIADO DE 'category' A 'categoryId'
  });
  const [categories, setCategories] = useState<Category[]>([]); // <-- 3. ESTADO PARA GUARDAR LAS CATEGORÍAS
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // --- 4. CARGAMOS LAS CATEGORÍAS CUANDO EL COMPONENTE SE MONTA ---
  useEffect(() => {
    categoryService.getAllCategories()
      .then(setCategories)
      .catch(() => setError("No se pudieron cargar las categorías."));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    const checked = isCheckbox ? (e.target as HTMLInputElement).checked : false;

    setFormData(prev => ({
      ...prev,
      [name]: isCheckbox ? checked : value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!formData.title || !formData.startDate || !formData.endDate) {
        setError('El título y las fechas son campos obligatorios.');
        return;
    }
    
    // Convertimos categoryId a número antes de enviar
    const dataToSend = {
        ...formData,
        categoryId: formData.categoryId ? parseInt(formData.categoryId, 10) : undefined,
    };

    try {
      await eventService.createEvent(dataToSend as any); // Usamos 'as any' temporalmente por el cambio de tipo
      navigate('/events');
    } catch (err) {
      setError('No se pudo crear el evento. Verifica los datos.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Crear Nuevo Evento</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <p className="text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <Label htmlFor="title">Título del Evento</Label>
                <Input id="title" name="title" type="text" value={formData.title} onChange={handleChange} required />
            </div>
            {/* --- 5. CAMBIO DE INPUT A SELECT PARA CATEGORÍA --- */}
            <div>
                <Label htmlFor="categoryId">Categoría</Label>
                <Select
                  id="categoryId"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  options={categories.map(cat => ({ value: String(cat.id), label: cat.name }))}
                  placeholder="-- Selecciona una categoría --"
                />
            </div>
            <div className="md:col-span-2">
                <Label htmlFor="description">Descripción</Label>
                <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-lg" />
            </div>
            {/* ... resto de los campos del formulario sin cambios ... */}
             <div>
                <Label htmlFor="startDate">Fecha de Inicio</Label>
                <Input id="startDate" name="startDate" type={formData.isAllDay ? 'date' : 'datetime-local'} value={formData.startDate} onChange={handleChange} required />
            </div>
            <div>
                <Label htmlFor="endDate">Fecha de Fin</Label>
                <Input id="endDate" name="endDate" type={formData.isAllDay ? 'date' : 'datetime-local'} value={formData.endDate} onChange={handleChange} required />
            </div>
            
            <div className="flex items-center gap-2 pt-5">
                <input id="isAllDay" name="isAllDay" type="checkbox" checked={formData.isAllDay} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"/>
                <Label htmlFor="isAllDay" className="mb-0">El evento dura todo el día</Label>
            </div>
            <div>
                <Label htmlFor="location">Ubicación</Label>
                <Input id="location" name="location" type="text" value={formData.location} onChange={handleChange} placeholder="Ej: Salón Principal, Zoom, etc."/>
            </div>
             <div>
                <Label htmlFor="audience">Dirigido a</Label>
                <Select id="audience" name="audience" value={formData.audience} onChange={handleChange}
                    options={[
                        { value: 'General', label: 'Público General' },
                        { value: 'Padres', label: 'Padres' },
                        { value: 'Terapeutas', label: 'Terapeutas' },
                        { value: 'Personal', label: 'Personal Interno' },
                    ]}
                />
            </div>
        </div>
        <div className="pt-6 text-right">
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg">
            Guardar Evento
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddEventPage;