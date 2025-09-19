// frontend/src/pages/EditEventPage.tsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import eventService, {
  type Event as EventType,
} from "../services/eventService";
import categoryService, { type Category } from "../services/categoryService";
import Label from "../components/ui/Label";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import EventDateTimePicker from "../components/events/EventDateTimePicker";
import { useToast } from "../context/ToastContext";
import {
  parseDateValue,
  toDateOnlyString,
  toDateTimeString,
  ensureEndNotBeforeStart,
  DEFAULT_EVENT_START_TIME,
  DEFAULT_EVENT_END_TIME,
  isBeforeToday,
} from "../utils/eventDateUtils";

type EventFormData = Omit<EventType, "categoryId"> & { categoryId?: string };

function EditEventPage() {
  const [formData, setFormData] = useState<Partial<EventFormData>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();

  useEffect(() => {
    if (id) {
      Promise.all([
        eventService.getEventById(Number(id)),
        categoryService.getAllCategories(),
      ])
        .then(([eventData, categoriesData]) => {
          setCategories(categoriesData);

          const pad = (value: number) => value.toString().padStart(2, '0');

          const formatDateOnly = (dateString: string) => {
            const date = new Date(dateString);
            if (Number.isNaN(date.getTime())) return '';
            return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
          };

          const formatDateTimeLocal = (dateString: string) => {
            const date = new Date(dateString);
            if (Number.isNaN(date.getTime())) return '';
            const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
            return local.toISOString().slice(0, 16);
          };

          const formatForInput = (dateString: string, isAllDay: boolean) => {
            return isAllDay ? formatDateOnly(dateString) : formatDateTimeLocal(dateString);
          };

          setFormData({
            ...eventData,
            startDate: formatForInput(eventData.startDate, eventData.isAllDay),
            endDate: formatForInput(eventData.endDate, eventData.isAllDay),
            categoryId: eventData.categoryId
              ? String(eventData.categoryId)
              : "",
          });
        })
        .catch(() =>
          setError(
            "No se pudieron cargar los datos necesarios para la edición."
          )
        );
    }
  }, [id]);

  const handleSelectChange = (name: string, value: string | null) => {
    setFormData((prev) => ({ ...prev, [name]: value || "" }));
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === "checkbox";
    const checked = isCheckbox ? (e.target as HTMLInputElement).checked : false;
    if (isCheckbox && name === "isAllDay") {
      setFormData(prev => {
        const nextIsAllDay = checked;
        const currentStart = typeof prev.startDate === 'string' ? prev.startDate : '';
        const currentEnd = typeof prev.endDate === 'string' ? prev.endDate : '';

        const normalizedStart = nextIsAllDay
          ? toDateOnlyString(currentStart)
          : toDateTimeString(currentStart || '', DEFAULT_EVENT_START_TIME);

        let normalizedEnd = nextIsAllDay
          ? toDateOnlyString(currentEnd || currentStart)
          : toDateTimeString(currentEnd || currentStart, DEFAULT_EVENT_END_TIME);

        normalizedEnd = ensureEndNotBeforeStart(normalizedStart, normalizedEnd);

        return {
          ...prev,
          isAllDay: nextIsAllDay,
          startDate: normalizedStart,
          endDate: normalizedEnd,
        };
      });
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: isCheckbox ? checked : value }));
  };

  const handleDateValueChange = (field: 'startDate' | 'endDate', value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };

      if (field === 'startDate' && value && typeof updated.endDate === 'string' && updated.endDate) {
        updated.endDate = ensureEndNotBeforeStart(value, updated.endDate);
      }

      return updated;
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!id || !formData.title || !formData.startDate || !formData.endDate) {
      setError('El título y las fechas son campos obligatorios.');
      return;
    }

    if (isBeforeToday(formData.startDate as string, isAllDay)) {
      setError('La fecha de inicio no puede ser anterior a hoy.');
      return;
    }

    if (isBeforeToday(formData.endDate as string, isAllDay)) {
      setError('La fecha de fin no puede ser anterior a hoy.');
      return;
    }

    try {
      const {
        id: eventId,
        createdAt,
        updatedAt,
        category,
        ...dataToUpdate
      } = formData;

      const finalData = {
        ...dataToUpdate,
        categoryId: dataToUpdate.categoryId
          ? parseInt(dataToUpdate.categoryId, 10)
          : null,
      };

      await eventService.updateEvent(Number(id), finalData);
      const eventTitle = `${formData.title ?? ''}`.trim() || 'el evento';
      showToast({ message: `Evento "${eventTitle}" actualizado correctamente.` });
      navigate("/events");
    } catch (err) {
      setError("No se pudo actualizar el evento.");
    }
  };

  const categoryOptions = categories.map((cat) => ({
    value: String(cat.id),
    label: cat.name,
  }));
  const audienceOptions = [
    { value: "General", label: "Público General" },
    { value: "Padres", label: "Padres" },
    { value: "Terapeutas", label: "Terapeutas" },
    { value: "Personal", label: "Personal Interno" },
  ];

  const isAllDay = Boolean(formData.isAllDay);
  const startDateObj = parseDateValue((formData.startDate as string) || '', isAllDay);
  const endDateObj = parseDateValue((formData.endDate as string) || '', isAllDay);
  const minSelectableDate = new Date();
  minSelectableDate.setHours(0, 0, 0, 0);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Editar Evento</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (<p className="text-red-500 bg-red-100 p-3 rounded-md">{error}</p>)}

        <fieldset className="border border-violet-300 p-4 rounded-md">
        <legend className="text-xl font-semibold text-gray-700">
            Datos del Evento
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="title">Título del Evento</Label>
            <Input
              id="title"
              name="title"
              type="text"
              value={formData.title || ""}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="categoryId">Categoría</Label>
            <Select
              instanceId="category-edit-select"
              inputId="categoryId"
              name="categoryId"
              value={
                categoryOptions.find((o) => o.value === formData.categoryId) ||
                null
              }
              onChange={(option) =>
                handleSelectChange("categoryId", option?.value || null)
              }
              options={categoryOptions}
              placeholder="-- Selecciona una categoría --"
            />
          </div>

          <div className="pt-5">
            <p className="text-xs text-gray-500 mb-2">
                Si seleccionas este boton el evento durara todo el día.
              </p>
              <div className="flex items-center gap-2">
            <input
              id="isAllDay"
              name="isAllDay"
              type="checkbox"
              checked={!!formData.isAllDay}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
            />
            <Label htmlFor="isAllDay" className="mb-0">
              El evento dura todo el día
            </Label>
            </div>
          </div>

          <div>
            <Label htmlFor="location">Ubicación</Label>
            <Input
              id="location"
              name="location"
              type="text"
              value={formData.location || ""}
              onChange={handleChange}
              placeholder="Ej: Salón Principal, Zoom, etc."
            />
          </div>

          
          <div>
            <EventDateTimePicker
              id="startDate"
              label="Fecha de Inicio"
              value={(formData.startDate as string) || ''}
              onChange={(value) => handleDateValueChange('startDate', value)}
              isAllDay={isAllDay}
              selectsStart
              startDate={startDateObj}
              endDate={endDateObj}
              minDate={minSelectableDate}
            />
          </div>
          <div>
            <EventDateTimePicker
              id="endDate"
              label="Fecha de Fin"
              value={(formData.endDate as string) || ''}
              onChange={(value) => handleDateValueChange('endDate', value)}
              isAllDay={isAllDay}
              minDate={startDateObj ?? minSelectableDate}
              selectsEnd
              startDate={startDateObj}
              endDate={endDateObj}
            />
          </div>
          
          
          <div>
            <Label htmlFor="audience">Dirigido a</Label>
            <Select
              instanceId="audience-edit-select"
              inputId="audience"
              name="audience"
              value={
                audienceOptions.find((o) => o.value === formData.audience) || null
              }
              onChange={(option) =>
                handleSelectChange("audience", option?.value || null)
              }
              options={audienceOptions}
            />
          </div>
        </div>
        <div className="md:col-span-2">
            <Label htmlFor="description">Descripción</Label>
            <textarea
              id="description"
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              rows={4}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-lg"
            />
          </div>
          </fieldset>
          
        <div className="t-6 flex justify-end gap-6">
          <button
            type="submit"
            className="min-w-[220px] py-3 px-8 text-white font-bold rounded-lg bg-gradient-to-r from-violet-400 to-purple-500 hover:from-violet-500 hover:to-purple-600 transition-all duration-200 flex items-center justify-center gap-3 shadow-md"
          >
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditEventPage;
