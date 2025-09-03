// frontend/src/components/modals/EventDetailModal.tsx
import React from 'react';
import Modal from 'react-modal'; // <-- 1. Usar la librería react-modal
import { type Event } from '../../services/eventService';
import { FaCalendarAlt, FaInfoCircle, FaClock, FaMapMarkerAlt, FaUsers, FaTag, FaTimes } from 'react-icons/fa';

// Estilos estándar para el modal, para mantener la consistencia
const modalStyles = {
  content: {
    top: '50%', left: '50%', right: 'auto', bottom: 'auto',
    marginRight: '-50%', transform: 'translate(-50%, -50%)',
    width: '90%', maxWidth: '500px', borderRadius: '8px', padding: '25px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
  },
  overlay: { backgroundColor: 'rgba(0, 0, 0, 0.6)', zIndex: 1000 }
};

Modal.setAppElement('#root');

interface EventDetailModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
}

function EventDetailModal({ event, isOpen, onClose }: EventDetailModalProps) {
  if (!event) return null; // Solo necesitamos verificar el evento

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-HN', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-HN', {
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
  };

  return (
    // --- 2. USAR EL COMPONENTE MODAL ---
    <Modal isOpen={isOpen} onRequestClose={onClose} style={modalStyles} contentLabel="Detalles del Evento">
      <div className="relative">
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 text-gray-500 hover:text-gray-800"
        >
          <FaTimes size={20} />
        </button>
        <h3 className="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-3">
          <FaCalendarAlt className="text-blue-600" /> {event.title}
        </h3>
        <div className="space-y-4 text-gray-700 border-t pt-4">
          <p className="flex items-start gap-3">
            <FaClock className="text-gray-500 mt-1 flex-shrink-0" />
            <span>
              <strong>Fecha:</strong> {formatDate(event.startDate)}
              {event.isAllDay ? ' (Todo el día)' : ` de ${formatTime(event.startDate)} a ${formatTime(event.endDate)}`}
            </span>
          </p>
          {event.location && (
            <p className="flex items-start gap-3">
              <FaMapMarkerAlt className="text-gray-500 mt-1 flex-shrink-0" />
              <span><strong>Ubicación:</strong> {event.location}</span>
            </p>
          )}
          <p className="flex items-start gap-3">
            <FaUsers className="text-gray-500 mt-1 flex-shrink-0" />
            <span><strong>Audiencia:</strong> {event.audience}</span>
          </p>
          {event.category && (
            <p className="flex items-start gap-3">
              <FaTag className="text-gray-500 mt-1 flex-shrink-0" />
              <span className="flex items-center gap-2">
                <strong>Categoría:</strong> 
                <span className="flex items-center gap-2">
                  <div style={{ backgroundColor: event.category.color }} className="w-4 h-4 rounded-full"></div>
                  {event.category.name}
                </span>
              </span>
            </p>
          )}
          {event.description && (
            <div className="flex items-start gap-3">
              <FaInfoCircle className="text-gray-500 mt-1 flex-shrink-0" />
              <div>
                <strong>Descripción:</strong>
                <p className="text-sm whitespace-pre-line mt-1">{event.description}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default EventDetailModal;