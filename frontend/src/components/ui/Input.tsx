// frontend/src/components/ui/Input.tsx
import React from 'react';

// Le decimos a TypeScript que nuestro componente puede aceptar cualquier propiedad
// que un <input> normal de HTML aceptaría (type, id, placeholder, etc.).
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

function Input({ className, ...props }: InputProps) {
  // Aquí definimos las clases de estilo base de Tailwind que todos nuestros inputs tendrán.
  const baseStyles = "block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 sm:text-sm";

  return (
    <input
      // Combinamos los estilos base con cualquier clase extra (className) que le pasemos desde fuera.
      // Esto nos da flexibilidad para casos especiales.
      className={`${baseStyles} ${className || ''}`}
      {...props} // Pasamos todas las demás props (type, id, value, onChange, etc.) al input.
    />
  );
}

export default Input;