// frontend/src/pages/AddEventPage.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import eventService, { type Event as EventType,} from "../services/eventService";
import categoryService, { type Category } from "../services/categoryService"; //
import Label from "../components/ui/Label";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";

function AddEventPage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    isAllDay: false,
    location: "",
    audience: "General",
    categoryId: "",
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

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

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const titleRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,#\-°]+$/;
    const locationRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,#\-°]+$/;
    const descriptionRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,#\-°()!?:;"'\/]+$/;

    if (!formData.title.trim()) errors.title = "El título es obligatorio.";
    else if (!titleRegex.test(formData.title)) errors.title = "El título contiene caracteres no permitidos.";

    if (!formData.startDate) errors.startDate = "La fecha de inicio es obligatoria.";
    if (!formData.endDate) errors.endDate = "La fecha de fin es obligatoria.";

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) errors.endDate = "La fecha de fin no puede ser anterior a la de inicio.";
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

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Crear Nuevo Evento
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {error && (
          <p className="text-red-500 bg-red-100 p-3 rounded-md">{error}</p>
        )}

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
            {formErrors.title && (
              <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
            )}
          </div>
          <div>
            <Label htmlFor="categoryId">Categoría</Label>
            <Select
              instanceId="category-select"
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
              placeholder="Selecciona una categoría"
            />
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
          <div>
            <Label htmlFor="startDate">Fecha de Inicio</Label>
            <Input
              id="startDate"
              name="startDate"
              type={formData.isAllDay ? "date" : "datetime-local"}
              value={formData.startDate}
              onChange={handleChange}
              required
            />
            {formErrors.startDate && (
              <p className="text-red-500 text-sm mt-1">{formErrors.startDate}</p>
            )}
          </div>
          <div>
            <Label htmlFor="endDate">Fecha de Fin</Label>
            <Input
              id="endDate"
              name="endDate"
              type={formData.isAllDay ? "date" : "datetime-local"}
              value={formData.endDate}
              onChange={handleChange}
              required
            />
            {formErrors.endDate && (
              <p className="text-red-500 text-sm mt-1">{formErrors.endDate}</p>
            )}
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
            {formErrors.location && (
              <p className="text-red-500 text-sm mt-1">{formErrors.location}</p>
            )}
          </div>
          <div>
            <Label htmlFor="audience">Dirigido a</Label>
            <Select
              instanceId="audience-select"
              inputId="audience"
              name="audience"
              value={
                audienceOptions.find((o) => o.value === formData.audience) ||
                null
              }
              onChange={(option) =>
                handleSelectChange("audience", option?.value || null)
              }
              options={audienceOptions}
            />
          </div>
          <div className="flex items-center gap-2 pt-5">
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
