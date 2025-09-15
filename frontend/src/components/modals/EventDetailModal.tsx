// frontend/src/components/modals/EventDetailModal.tsx
import React from 'react';
import Modal from 'react-modal'; // <-- 1. Usar la librería react-modal
import { type Event } from '../../services/eventService';
import { FaCalendarAlt, FaInfoCircle, FaClock, FaMapMarkerAlt, FaUsers, FaTag, FaTimes } from 'react-icons/fa';

// Usamos clases para permitir tema/branding vía Tailwind + CSS
const contentClass = 'mx-auto w-[min(90vw,560px)] outline-none rounded-2xl bg-white p-6 shadow-xl ring-1 ring-black/10';
const overlayClass = 'fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4';

Modal.setAppElement('#root');

interface EventDetailModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
}

function EventDetailModal({ event, isOpen, onClose }: EventDetailModalProps) {
  if (!event) return null; // Solo necesitamos verificar el evento

  const sameDay = (a: string, b: string) => {
    const da = new Date(a), db = new Date(b);
    return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const formatTime = (dateString: string) => new Date(dateString).toLocaleTimeString('es-ES', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  });

  const dateLine = (() => {
    const { startDate, endDate, isAllDay } = event;
    if (sameDay(startDate, endDate)) {
      if (isAllDay) return `${formatDate(startDate)} (Todo el día)`;
      return `${formatDate(startDate)} de ${formatTime(startDate)} a ${formatTime(endDate)}`;
    }
    if (isAllDay) return `Del ${formatDate(startDate)} al ${formatDate(endDate)}`;
    return `Del ${formatDate(startDate)} ${formatTime(startDate)} al ${formatDate(endDate)} ${formatTime(endDate)}`;
  })();

  return (
    // --- 2. USAR EL COMPONENTE MODAL ---
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className={contentClass}
      overlayClassName={overlayClass}
      contentLabel="Detalles del Evento"
    >
      <div className="relative">
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute -top-3 -right-3 grid place-items-center rounded-full bg-white shadow-md ring-1 ring-black/10 p-1 text-gray-500 hover:text-gray-900"
        >
          <FaTimes size={18} />
        </button>
        <div className="flex items-start gap-3">
          <FaCalendarAlt className="mt-1 text-[var(--brand-primary)]" size={20} />
          <h3 className="text-2xl font-bold text-gray-900 flex-1">{event.title}</h3>
        </div>
        <div className="mt-4 pt-4 border-t">
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <FaClock className="text-gray-500 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm"><span className="font-semibold">Fecha:</span> {dateLine}</p>
              </div>
            </li>
            {event.location && (
              <li className="flex items-start gap-3">
                <FaMapMarkerAlt className="text-gray-500 mt-1 flex-shrink-0" />
                <p className="text-sm"><span className="font-semibold">Ubicación:</span> {event.location}</p>
              </li>
            )}
            <li className="flex items-start gap-3">
              <FaUsers className="text-gray-500 mt-1 flex-shrink-0" />
              <p className="text-sm"><span className="font-semibold">Audiencia:</span> {event.audience}</p>
            </li>
            {event.category && (
              <li className="flex items-start gap-3">
                <FaTag className="text-gray-500 mt-1 flex-shrink-0" />
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">Categoría:</span>
                  <span className="inline-flex items-center gap-2 text-sm px-2 py-0.5 rounded-full ring-1 ring-black/10" style={{ backgroundColor: 'var(--brand-surface)', color: 'var(--brand-text)' }}>
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: event.category.color }}></span>
                    {event.category.name}
                  </span>
                </div>
              </li>
            )}
            {event.description && (
              <li className="flex items-start gap-3">
                <FaInfoCircle className="text-gray-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm"><span className="font-semibold">Descripción:</span> {event.description}</p>
                </div>
              </li>
            )}
          </ul>
        </div>
      </div>
    </Modal>
  );
}

export default EventDetailModal;
