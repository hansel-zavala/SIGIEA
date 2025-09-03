// frontend/src/pages/EventsPage.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import eventService, { type Event } from "../services/eventService";
import { FaCalendarAlt, FaPlus, FaPencilAlt, FaTrash, FaTags } from "react-icons/fa";

function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = () => {
    setLoading(true);
    eventService.getAllEvents()
      .then(data => {
        setEvents(data);
      })
      .catch(() => {
        setError("No se pudo cargar la lista de eventos.");
      })
      .finally(() => {
        setLoading(false);
      });
  }

  const handleDelete = async (eventId: number) => {
    if (window.confirm("¿Estás seguro de que quieres desactivar este evento?")) {
      try {
        await eventService.deleteEvent(eventId);
        fetchEvents(); 
      } catch (err) {
        setError("No se pudo desactivar el evento.");
      }
    }
  };


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-HN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) return <p>Cargando eventos...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Gestión de Eventos
        </h2>
        <Link to="/categories">
          <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded flex items-center gap-2">
            <FaTags />
            Gestionar Categorías
          </button>
        </Link>
        <Link to="/events/new">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2">
            <FaPlus />
            Crear Nuevo Evento
          </button>
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-3 font-medium text-gray-500 text-left">Título del Evento</th>
              <th className="px-5 py-3 font-medium text-gray-500 text-left">Fecha de Inicio</th>
              <th className="px-5 py-3 font-medium text-gray-500 text-left">Audiencia</th>
              <th className="px-5 py-3 font-medium text-gray-500 text-left">Categoría</th>
              <th className="px-5 py-3 font-medium text-gray-500 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {events.length > 0 ? (
              events.map((event) => (
                <tr key={event.id}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="text-blue-600"><FaCalendarAlt /></div>
                      <span className="font-medium text-gray-800">{event.title}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-600">{formatDate(event.startDate)}</td>
                  <td className="px-5 py-4 text-gray-600">{event.audience}</td>
                  <td className="px-5 py-4 text-gray-600 flex items-center gap-2">
                    {event.category?.color && (
                      <span
                        className="inline-block w-3 h-3 rounded-full"
                        style={{ backgroundColor: event.category.color }}
                        title={event.category?.name}
                      />
                    )}
                    {event.category?.name}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-4">
                      
                      <Link to={`/events/edit/${event.id}`} title="Editar Evento">
                        <FaPencilAlt className="text-blue-500 hover:text-blue-700 cursor-pointer" />
                      </Link>
                      <button onClick={() => handleDelete(event.id)} title="Desactivar Evento">
                        <FaTrash className="text-red-500 hover:text-red-700 cursor-pointer" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center p-8 text-gray-500">
                  No hay eventos creados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default EventsPage;