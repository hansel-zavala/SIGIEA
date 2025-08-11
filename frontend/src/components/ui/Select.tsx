// frontend/src/components/ui/Select.tsx
import React from 'react';

// Definimos la "forma" que tendrá cada objeto en la lista de opciones
interface SelectOption {
  value: string;
  label: string;
}

// Definimos las props de nuestro componente. Hereda todas las de un <select> normal
// y añade las nuestras: 'options' y 'placeholder'.
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  placeholder?: string;
}

function Select({ options, placeholder, className, ...props }: SelectProps) {
  // Usamos los mismos estilos base que nuestro componente Input para consistencia
  const baseStyles = "block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 sm:text-sm";

  return (
    <select
      className={`${baseStyles} ${className || ''}`}
      {...props}
    >
      {/* Si nos pasan un placeholder, lo mostramos como la primera opción (deshabilitada) */}
      {placeholder && <option value="" disabled>{placeholder}</option>}

      {/* Aquí recorremos el array de 'options' y creamos una etiqueta <option> por cada una */}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export default Select;