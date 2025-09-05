// frontend/src/components/ui/ComboBox.tsx
import { useState, useEffect, useRef } from 'react';
import Input from './Input';

interface Option {
  value: string;
  label: string;
}

interface ComboBoxProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

function ComboBox({ options, value, onChange, placeholder, disabled }: ComboBoxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);
  
  useEffect(() => {
    const selectedOption = options.find(option => option.value === value);
    setSearchTerm(selectedOption ? selectedOption.label : '');
  }, [value, options]);

  const filteredOptions = searchTerm
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  const handleSelectOption = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };
  
  // ✅ CORRECCIÓN: Se han unificado los estilos para que coincidan con el componente Input y Select.
  // Se quitan los estilos de foco de aquí porque ya están definidos en el componente Input base.
  // El Input ya tiene `shadow-sm` y los estilos de foco `focus:border-indigo-500 focus:ring...`
  return (
    <div className="relative" ref={wrapperRef}>
      <Input
        type="text"
        value={searchTerm}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full" // Mantenemos w-full para asegurar que ocupe todo el espacio.
      />

      {isOpen && !disabled && (
        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
          {filteredOptions.length > 0 ? (
            filteredOptions.map(option => (
              <li
                key={option.value}
                className={`px-4 py-2 cursor-pointer ${
                  option.value === value
                    ? 'bg-violet-600 text-white' // Estilo para el elemento seleccionado
                    : 'hover:bg-violet-100'     // Estilo para el hover
                }`}
                onClick={() => handleSelectOption(option.value)}
              >
                {option.label}
              </li>
            ))
          ) : (
            <li className="px-4 py-2 text-gray-500">No se encontraron resultados</li>
          )}
        </ul>
      )}
    </div>
  );
}

export default ComboBox;