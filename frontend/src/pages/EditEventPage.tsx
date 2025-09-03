// frontend/src/pages/EditEventPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import eventService, { type Event as EventType } from '../services/eventService';
import categoryService, { type Category } from '../services/categoryService';
import Label from '../components/ui/Label';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';

// --- 1. CREAMOS UN TIPO ESPECÍFICO PARA EL FORMULARIO ---
// Es igual que EventType, pero nos aseguramos de que categoryId sea un string
type EventFormData = Omit<EventType, 'categoryId'> & { categoryId?: string };

function EditEventPage() {
  const [formData, setFormData] = useState<Partial<EventFormData>>({}); // <-- 2. USAMOS EL NUEVO TIPO
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (id) {
      Promise.all([
        eventService.getEventById(Number(id)),
        categoryService.getAllCategories()
      ]).then(([eventData, categoriesData]) => {
        setCategories(categoriesData);

        const formatForInput = (dateString: string, isAllDay: boolean) => {
          const date = new Date(dateString);
          if (isAllDay) return date.toISOString().split('T')[0];
          return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
        };
        
        setFormData({
            ...eventData,
            startDate: formatForInput(eventData.startDate, eventData.isAllDay),
            endDate: formatForInput(eventData.endDate, eventData.isAllDay),
            // --- 3. CORRECCIÓN AL ESTABLECER EL ESTADO ---
            // Ahora asignamos un string a una propiedad que espera un string. ¡Correcto!
            categoryId: eventData.categoryId ? String(eventData.categoryId) : '',
        });
      }).catch(() => setError('No se pudieron cargar los datos necesarios para la edición.'));
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    const checked = isCheckbox ? (e.target as HTMLInputElement).checked : false;
    setFormData(prev => ({ ...prev, [name]: isCheckbox ? checked : value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!id || !formData.title || !formData.startDate || !formData.endDate) {
      setError('El título y las fechas son campos obligatorios.');
      return;
    }

    try {
      const { id: eventId, createdAt, updatedAt, category, ...dataToUpdate } = formData;
      
      // --- 4. CORRECCIÓN AL ENVIAR DATOS ---
      // Convertimos categoryId (que es un string) a número. ¡Correcto!
      const finalData = {
        ...dataToUpdate,
        categoryId: dataToUpdate.categoryId ? parseInt(dataToUpdate.categoryId, 10) : null,
      };

      await eventService.updateEvent(Number(id), finalData);
      navigate('/events');
    } catch (err) {
      setError('No se pudo actualizar el evento.');
    }
  };

  return (
    // ... El resto del componente (el JSX del formulario) no necesita cambios ...
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Editar Evento</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <p className="text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <Label htmlFor="title">Título del Evento</Label>
                <Input id="title" name="title" type="text" value={formData.title || ''} onChange={handleChange} required />
            </div>
            <div>
                <Label htmlFor="categoryId">Categoría</Label>
                <Select
                  id="categoryId"
                  name="categoryId"
                  value={formData.categoryId || ''}
                  onChange={handleChange}
                  options={categories.map(cat => ({ value: String(cat.id), label: cat.name }))}
                  placeholder="-- Selecciona una categoría --"
                />
            </div>
            <div className="md:col-span-2">
                <Label htmlFor="description">Descripción</Label>
                <textarea id="description" name="description" value={formData.description || ''} onChange={handleChange} rows={4} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-lg" />
            </div>
            <div>
                <Label htmlFor="startDate">Fecha de Inicio</Label>
                <Input id="startDate" name="startDate" type={formData.isAllDay ? 'date' : 'datetime-local'} value={formData.startDate || ''} onChange={handleChange} required />
            </div>
            <div>
                <Label htmlFor="endDate">Fecha de Fin</Label>
                <Input id="endDate" name="endDate" type={formData.isAllDay ? 'date' : 'datetime-local'} value={formData.endDate || ''} onChange={handleChange} required />
            </div>
            <div className="flex items-center gap-2 pt-5">
                <input id="isAllDay" name="isAllDay" type="checkbox" checked={!!formData.isAllDay} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"/>
                <Label htmlFor="isAllDay" className="mb-0">El evento dura todo el día</Label>
            </div>
            <div>
                <Label htmlFor="location">Ubicación</Label>
                <Input id="location" name="location" type="text" value={formData.location || ''} onChange={handleChange} placeholder="Ej: Salón Principal, Zoom, etc."/>
            </div>
             <div>
                <Label htmlFor="audience">Dirigido a</Label>
                <Select id="audience" name="audience" value={formData.audience || 'General'} onChange={handleChange}
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
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditEventPage;