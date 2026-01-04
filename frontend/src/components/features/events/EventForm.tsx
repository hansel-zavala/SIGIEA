import { useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form"; // Corregido: import type
import type { EventFormData } from "../../../hooks/useEventForm"; // Corregido: import type
import categoryService from "../../../services/categoryService";
import type { Category } from "../../../services/categoryService"; // Corregido: import type
import { parseDateValue, ensureEndNotBeforeStart } from "../../../utils/eventDateUtils";

// UI Components
import Label from "../../ui/Label";
import Input from "../../ui/Input";
import Select from "../../ui/Select";
import EventDateTimePicker from "../../events/EventDateTimePicker";

interface EventFormProps {
  formMethods: UseFormReturn<EventFormData>;
  onSubmit: (data: EventFormData) => void;
  isSubmitting: boolean;
}

export const EventForm = ({ formMethods, onSubmit, isSubmitting }: EventFormProps) => {
  const { 
    register, 
    control, 
    handleSubmit, 
    watch, 
    setValue, 
    formState: { errors } 
  } = formMethods;
  
  const [categories, setCategories] = useState<Category[]>([]);

  // Cargar categorías
  useEffect(() => {
    categoryService.getAllCategories().then(setCategories);
  }, []);

  // Observadores de estado para lógica condicional
  const isAllDay = watch("isAllDay");
  const startDate = watch("startDate");
  const endDate = watch("endDate");

  const categoryOptions = categories.map((c) => ({ value: String(c.id), label: c.name }));
  
  const audienceOptions = [
    { value: "General", label: "Público General" },
    { value: "Padres", label: "Padres" },
    { value: "Terapeutas", label: "Terapeutas" },
    { value: "Personal", label: "Personal Interno" },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
       <fieldset className="border border-violet-300 p-4 rounded-md">
          <legend className="text-xl font-semibold text-gray-700 px-2">Datos del Evento</legend>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            
            {/* Título */}
            <div>
              <Label htmlFor="title">Título del Evento</Label>
              <Input 
                id="title" 
                placeholder="Ingresa el título" 
                {...register("title")} 
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
            </div>

            {/* Categoría */}
            <div>
                <Label htmlFor="categoryId">Categoría</Label>
                <Controller
                    name="categoryId"
                    control={control}
                    render={({ field }) => (
                    <Select
                        inputId="categoryId"
                        placeholder="Selecciona una categoría"
                        options={categoryOptions}
                        value={categoryOptions.find((c) => c.value === field.value) || null}
                        onChange={(opt) => field.onChange(opt?.value)}
                    />
                    )}
                />
                {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId.message}</p>}
            </div>
            
            {/* Checkbox Todo el Día */}
            <div className="pt-5">
               <p className="text-xs text-gray-500 mb-2">
                Si seleccionas este botón el evento durará todo el día.
              </p>
              <div className="flex items-center gap-2">
                <input
                  id="isAllDay"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  {...register("isAllDay")}
                />
                <Label htmlFor="isAllDay" className="mb-0">El evento dura todo el día</Label>
              </div>
            </div>

            {/* Ubicación */}
            <div>
              <Label htmlFor="location">Ubicación</Label>
              <Input
                id="location"
                placeholder="Ej: Salón Principal, Zoom, etc."
                {...register("location")}
              />
              {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>}
            </div>

             {/* Fechas (Componentes Controlados) */}
             <div>
              <Controller
                name="startDate"
                control={control}
                render={({ field }) => (
                  <EventDateTimePicker
                    id="startDate"
                    label="Fecha de Inicio"
                    value={field.value}
                    isAllDay={isAllDay}
                    // Lógica inteligente: si cambia inicio, ajustamos fin si es necesario
                    onChange={(val) => {
                        field.onChange(val);
                        if (val && endDate) {
                            const newEnd = ensureEndNotBeforeStart(val, endDate);
                            if (newEnd !== endDate) setValue("endDate", newEnd);
                        }
                    }}
                    selectsStart
                    startDate={parseDateValue(field.value, isAllDay)}
                    endDate={parseDateValue(endDate, isAllDay)}
                    minDate={new Date()}
                    error={errors.startDate?.message}
                  />
                )}
              />
            </div>

            <div>
              <Controller
                name="endDate"
                control={control}
                render={({ field }) => (
                  <EventDateTimePicker
                    id="endDate"
                    label="Fecha de Fin"
                    value={field.value}
                    isAllDay={isAllDay}
                    onChange={field.onChange}
                    selectsEnd
                    startDate={parseDateValue(startDate, isAllDay)}
                    endDate={parseDateValue(field.value, isAllDay)}
                    minDate={parseDateValue(startDate, isAllDay) || new Date()}
                    error={errors.endDate?.message}
                  />
                )}
              />
            </div>

            {/* Audiencia */}
            <div>
              <Label htmlFor="audience">Dirigido a</Label>
              <Controller
                name="audience"
                control={control}
                render={({ field }) => (
                    <Select
                        inputId="audience"
                        placeholder="Selecciona el público"
                        options={audienceOptions}
                        value={audienceOptions.find((a) => a.value === field.value) || null}
                        onChange={(opt) => field.onChange(opt?.value)}
                    />
                )}
              />
              {errors.audience && <p className="text-red-500 text-sm mt-1">{errors.audience.message}</p>}
            </div>

            {/* Descripción */}
            <div className="md:col-span-2">
              <Label htmlFor="description">Descripción</Label>
              <textarea
                id="description"
                rows={4}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-lg p-2 border"
                placeholder="Ingresa la descripción del evento"
                {...register("description")}
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
            </div>

          </div>
       </fieldset>

       <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="min-w-[220px] py-3 px-8 text-white font-bold rounded-lg bg-gradient-to-r from-violet-400 to-purple-500 hover:from-violet-500 hover:to-purple-600 transition-all duration-200 shadow-md disabled:opacity-70"
          >
            {isSubmitting ? "Guardando..." : "Guardar Evento"}
          </button>
       </div>
    </form>
  );
};