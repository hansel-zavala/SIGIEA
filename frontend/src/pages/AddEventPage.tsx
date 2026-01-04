// src/pages/AddEventPage.tsx
import { useEventForm } from "../hooks/useEventForm";
import { EventForm } from "../components/features/events/EventForm";

function AddEventPage() {
  // 1. Llamamos a la lógica (Hook)
  const { formMethods, submitEvent } = useEventForm();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Crear Nuevo Evento</h2>
      
      {/* 2. Renderizamos la feature (UI) */}
      <EventForm 
        formMethods={formMethods} 
        onSubmit={submitEvent}
        isSubmitting={formMethods.formState.isSubmitting}
      />
    </div>
  );
}

export default AddEventPage;