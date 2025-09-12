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

type EventFormData = Omit<EventType, "categoryId"> & { categoryId?: string };

function EditEventPage() {
  const [formData, setFormData] = useState<Partial<EventFormData>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (id) {
      Promise.all([
        eventService.getEventById(Number(id)),
        categoryService.getAllCategories(),
      ])
        .then(([eventData, categoriesData]) => {
          setCategories(categoriesData);

          const formatForInput = (dateString: string, isAllDay: boolean) => {
            const date = new Date(dateString);
            if (isAllDay) return date.toISOString().split("T")[0];
            return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
              .toISOString()
              .slice(0, 16);
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
    setFormData((prev) => ({ ...prev, [name]: isCheckbox ? checked : value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!id || !formData.title || !formData.startDate || !formData.endDate) {
      setError("El título y las fechas son campos obligatorios.");
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

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Editar Evento</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
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
          <div>
            <Label htmlFor="startDate">Fecha de Inicio</Label>
            <Input
              id="startDate"
              name="startDate"
              type={formData.isAllDay ? "date" : "datetime-local"}
              value={formData.startDate || ""}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="endDate">Fecha de Fin</Label>
            <Input
              id="endDate"
              name="endDate"
              type={formData.isAllDay ? "date" : "datetime-local"}
              value={formData.endDate || ""}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex items-center gap-2 pt-5">
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
