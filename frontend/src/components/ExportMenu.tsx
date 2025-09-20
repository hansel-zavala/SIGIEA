import { useState, useRef, useEffect } from 'react';

// ExportMenu encapsula la UI reutilizable para descargar listados filtrados.
// Recibe un callback onExport que regresa una promesa; el componente gestiona
// el estado de carga y cierra el panel al finalizar.

interface Option {
  value: string;
  label: string;
}

interface ExportMenuProps {
  defaultStatus?: string;
  statuses?: Option[];
  formats?: Option[];
  onExport: (options: { status: string; format: string }) => Promise<void>;
  triggerLabel?: string;
  disabled?: boolean;
}

const defaultStatuses: Option[] = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Activos' },
  { value: 'inactive', label: 'Inactivos' },
];

const defaultFormats: Option[] = [{ value: 'csv', label: 'CSV' }];

function ExportMenu({
  defaultStatus = 'all',
  statuses = defaultStatuses,
  formats = defaultFormats,
  onExport,
  triggerLabel = 'Exportar',
  disabled = false,
}: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(defaultStatus);
  const [format, setFormat] = useState(formats[0]?.value ?? 'csv');
  const [isLoading, setIsLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleExport = async () => {
    try {
      setIsLoading(true);
      await onExport({ status, format });
      setOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative inline-block text-left" ref={panelRef}>
      <button
        type="button"
        onClick={() => !disabled && setOpen((prev) => !prev)}
        disabled={disabled}
        className={`inline-flex items-center gap-2 rounded-lg border border-violet-200 px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
          disabled
            ? 'cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200'
            : 'bg-violet-50 text-violet-600 hover:bg-violet-100 focus:ring-violet-400'
        }`}
      >
        {triggerLabel}
        <span className="text-xs">▼</span>
      </button>

      {open && !disabled && (
        <div className="absolute right-0 z-30 mt-2 w-64 rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</p>
              <div className="mt-2 space-y-1">
                {statuses.map((option) => (
                  <label key={option.value} className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="export-status"
                      value={option.value}
                      checked={status === option.value}
                      onChange={(event) => setStatus(event.target.value)}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Formato</p>
              <div className="mt-2 space-y-1">
                {formats.map((option) => (
                  <label key={option.value} className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="export-format"
                      value={option.value}
                      checked={format === option.value}
                      onChange={(event) => setFormat(event.target.value)}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleExport}
              disabled={isLoading}
              className="w-full rounded-lg bg-gradient-to-r from-violet-400 to-purple-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors hover:from-violet-500 hover:to-purple-600 disabled:cursor-not-allowed disabled:opacity-75"
            >
              {isLoading ? 'Generando...' : 'Generar archivo'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExportMenu;
