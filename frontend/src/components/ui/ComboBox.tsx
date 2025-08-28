// frontend/src/components/ui/ComboBox.tsx
import { useState, useEffect, useRef } from 'react';
import Input from './Input'; // ✅ CORRECCIÓN: Importamos el componente Input

// ... (El resto del código del ComboBox se mantiene igual)
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

  return (
    <div className="relative" ref={wrapperRef}>
      <Input
        type="text"
        value={searchTerm}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => { // ✅ CORRECCIÓN: Tipado del evento 'e'
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full"
      />

      {isOpen && !disabled && (
        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
          {filteredOptions.length > 0 ? (
            filteredOptions.map(option => (
              <li
                key={option.value}
                className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
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