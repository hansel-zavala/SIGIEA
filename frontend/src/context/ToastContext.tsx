import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

// --- TIPOS Y CONFIGURACIÓN (sin cambios) ---
type ToastType = 'success' | 'error' | 'info';

interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
}

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => string;
  removeToast: (id: string) => void;
}

const DEFAULT_DURATION = 5000; // 5 segundos por defecto

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

// --- NUEVO COMPONENTE PARA CADA TOAST ---
function ToastComponent({ toast, onRemove }: { toast: ToastItem; onRemove: (id: string) => void; }) {
  const { id, message, type, duration } = toast;
  
  // Mapeo de estilos y iconos
  const toastConfig = {
    success: {
      icon: <FaCheckCircle className="text-emerald-500" size={20} />,
      styles: "bg-emerald-50 text-emerald-800 border-emerald-200",
      progressBg: "bg-emerald-500",
    },
    error: {
      icon: <FaExclamationCircle className="text-red-500" size={20} />,
      styles: "bg-red-50 text-red-800 border-red-200",
      progressBg: "bg-red-500",
    },
    info: {
      icon: <FaInfoCircle className="text-sky-500" size={20} />,
      styles: "bg-sky-50 text-sky-800 border-sky-200",
      progressBg: "bg-sky-500",
    },
  };

  const config = toastConfig[type];

  // Agregamos una animación de entrada
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onRemove]);

  return (
    <div
      className={`relative flex w-full max-w-sm items-start gap-4 overflow-hidden rounded-lg border px-4 py-3 shadow-lg transition-all duration-300 animate-toast-in ${config.styles}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex-shrink-0">{config.icon}</div>
      <div className="flex-1">
        <p className="text-sm font-semibold leading-5">{message}</p>
      </div>
      <button
        type="button"
        onClick={() => onRemove(id)}
        className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-700"
        aria-label="Cerrar notificación"
      >
        <FaTimes size={12} />
      </button>

      {/* Barra de progreso */}
      <div
        className={`absolute bottom-0 left-0 h-1 ${config.progressBg}`}
        style={{ animation: `progress ${duration}ms linear forwards` }}
      />
    </div>
  );
}


// --- TOAST PROVIDER (lógica sin cambios, render actualizado) ---
function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);
  
  const showToast = useCallback(({ message, type = 'success', duration = DEFAULT_DURATION }: ToastOptions) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    // Ahora pasamos la duración a cada item
    setToasts(prev => [...prev, { id, message, type, duration }]);
    return id;
  }, []);
  
  const value = useMemo(() => ({ showToast, removeToast }), [showToast, removeToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-5 right-5 z-[9999] space-y-3 w-fit">
        {toasts.map(toast => (
          <ToastComponent
            key={toast.id}
            toast={toast}
            onRemove={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// --- HOOK useToast (sin cambios) ---
const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe usarse dentro de un ToastProvider');
  }
  return context;
};

export { ToastProvider, useToast };
