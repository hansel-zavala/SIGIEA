// frontend/src/pages/AddEventPage.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import eventService from "../services/eventService";
import categoryService, { type Category } from "../services/categoryService"; //
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
  areDatesValidRange,
  isBeforeToday,
} from "../utils/eventDateUtils";

function AddEventPage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    isAllDay: false,
    location: "",
    audience: "",
    categoryId: "",
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    categoryService
      .getAllCategories()
      .then(setCategories)
      .catch(() => setError("No se pudieron cargar las categorías."));
  }, []);

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
        const normalizedStart = nextIsAllDay
          ? toDateOnlyString(prev.startDate)
          : toDateTimeString(prev.startDate || '', DEFAULT_EVENT_START_TIME);

        let normalizedEnd = nextIsAllDay
          ? toDateOnlyString(prev.endDate || prev.startDate)
          : toDateTimeString(prev.endDate || prev.startDate, DEFAULT_EVENT_END_TIME);

        normalizedEnd = ensureEndNotBeforeStart(normalizedStart, normalizedEnd);

        return {
          ...prev,
          isAllDay: nextIsAllDay,
          startDate: normalizedStart,
          endDate: normalizedEnd,
        };
      });

      setFormErrors(prev => {
        const next = { ...prev };
        delete next.startDate;
        delete next.endDate;
        return next;
      });

      return;
    }

    // Filtros para evitar caracteres no permitidos
    let processedValue = value;
    // Permitir letras (incluye acentos), números, espacios y puntuación básica
    const basicTextRegex = /[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,#\-°]/g;
    const descTextRegex = /[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,#\-°()!?:;"'\/]/g;

    if (name === "title" || name === "location") {
      processedValue = value.replace(basicTextRegex, "");
    }
    if (name === "description") {
      processedValue = value.replace(descTextRegex, "");
    }

    setFormData((prev) => ({
      ...prev,
      [name]: isCheckbox ? checked : processedValue,
    }));
  };

  const handleDateValueChange = (field: 'startDate' | 'endDate', newValue: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: newValue };

      if (field === 'startDate' && newValue && updated.endDate) {
        updated.endDate = ensureEndNotBeforeStart(newValue, updated.endDate);
      }

      return updated;
    });

    setFormErrors(prev => {
      const next = { ...prev };
      delete next[field];
      if (field === 'startDate') {
        delete next.endDate;
      }
      return next;
    });
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const titleRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,#\-°]+$/;
    const locationRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,#\-°]+$/;
    const descriptionRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,#\-°()!?:;"'\/]+$/;

    if (!formData.title.trim()) errors.title = "El título es obligatorio.";
    else if (!titleRegex.test(formData.title)) errors.title = "El título contiene caracteres no permitidos.";

    if (!formData.startDate) errors.startDate = "La fecha de inicio es obligatoria.";
    if (!formData.endDate) errors.endDate = "La fecha de fin es obligatoria.";
    if (!formData.location.trim()) errors.location = "La ubicación es obligatoria.";
    if (!formData.description.trim()) errors.description = "La descripción es obligatoria.";
    if (!formData.categoryId) errors.category = "La categoría es obligatoria.";
    if (!formData.audience) errors.audience = "El público dirigido es obligatorio.";



    if (formData.startDate && formData.endDate && !areDatesValidRange(formData.startDate, formData.endDate)) {
      errors.endDate = "La fecha de fin no puede ser anterior a la de inicio.";
    }

    if (formData.startDate && isBeforeToday(formData.startDate, formData.isAllDay)) {
      errors.startDate = "La fecha de inicio no puede ser anterior a hoy.";
    }

    if (formData.endDate && isBeforeToday(formData.endDate, formData.isAllDay)) {
      errors.endDate = "La fecha de fin no puede ser anterior a hoy.";
    }

    if (formData.location && !locationRegex.test(formData.location)) {
      errors.location = "La ubicación contiene caracteres no permitidos.";
    }

    if (formData.description && !descriptionRegex.test(formData.description)) {
      errors.description = "La descripción contiene caracteres no permitidos.";
    }

    const finalErrors = Object.fromEntries(Object.entries(errors).filter(([_, v]) => v));
    setFormErrors(finalErrors);
    return Object.keys(finalErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) {
      setError("Por favor, corrige los errores marcados.");
      return;
    }
    setError("");

    const dataToSend = {
      ...formData,
      categoryId: formData.categoryId
        ? parseInt(formData.categoryId, 10)
        : undefined,
    };

    try {
      await eventService.createEvent(dataToSend as any);
      const eventTitle = formData.title.trim() || 'el evento';
      showToast({ message: `Evento "${eventTitle}" creado correctamente.` });
      navigate("/events");
    } catch (err) {
      setError("No se pudo crear el evento. Verifica los datos.");
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

  const startDateObj = parseDateValue(formData.startDate, formData.isAllDay);
  const endDateObj = parseDateValue(formData.endDate, formData.isAllDay);
  const minSelectableDate = new Date();
  minSelectableDate.setHours(0, 0, 0, 0);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Crear Nuevo Evento</h2>
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
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
              value={formData.title}
              onChange={handleChange}
              placeholder="Ingresa el título del evento"
            />
            {formErrors.title && (<p className="text-red-500 text-sm mt-1">{formErrors.title}</p>)}
          </div>
          <div>
          <Label htmlFor="categoryId">Categoría</Label>
          <Select
            instanceId="category-select"
            inputId="categoryId"
            name="categoryId"
            value={categoryOptions.find((o) => o.value === formData.categoryId) ||null}
            onChange={(option) =>handleSelectChange("categoryId", option?.value || null)}
            options={categoryOptions}
            placeholder="Selecciona una categoría"
          />
            {formErrors.category && (<p className="text-red-500 text-sm mt-1">{formErrors.category}</p>)}
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
                checked={formData.isAllDay}
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
              value={formData.location}
              onChange={handleChange}
              placeholder="Ej: Salón Principal, Zoom, etc."
            />
            {formErrors.location && (<p className="text-red-500 text-sm mt-1">{formErrors.location}</p>)}
          </div>

          <div>
            <EventDateTimePicker
              id="startDate"
              label="Fecha de Inicio"
              value={formData.startDate}
              onChange={(value) => handleDateValueChange('startDate', value)}
              isAllDay={formData.isAllDay}
              error={formErrors.startDate}
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
              value={formData.endDate}
              onChange={(value) => handleDateValueChange('endDate', value)}
              isAllDay={formData.isAllDay}
              error={formErrors.endDate}
              minDate={startDateObj ?? minSelectableDate}
              selectsEnd
              startDate={startDateObj}
              endDate={endDateObj}
            />
          </div>

          
          <div>
            <Label htmlFor="audience">Dirigido a</Label>
            <Select
              instanceId="audience-select"
              inputId="audience"
              name="audience"
              value={audienceOptions.find((o) => o.value === formData.audience) || null}
              onChange={(option) =>handleSelectChange("audience", option?.value || null)}
              options={audienceOptions}
              placeholder="Selecciona el público dirigido"
            />
            {formErrors.audience && (<p className="text-red-500 text-sm mt-1">{formErrors.audience}</p>)}
          </div>
          
          <div className="md:col-span-2">
            <Label htmlFor="description">Descripción</Label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder=" Ingresa la descripción del evento"
              rows={4}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-lg"
            />
            {formErrors.description && (
              <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
            )}
          </div>
        </div>
        </fieldset>

        <div className="pt-6 flex justify-end gap-6">
          <button
            type="submit"
            className="min-w-[220px] py-3 px-8 text-white font-bold rounded-lg bg-gradient-to-r from-violet-400 to-purple-500 hover:from-violet-500 hover:to-purple-600 transition-all duration-200 flex items-center justify-center gap-3 shadow-md"
          >
            Guardar Evento
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddEventPage;
