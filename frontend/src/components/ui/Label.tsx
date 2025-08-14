// frontend/src/components/ui/Label.tsx
import React from 'react';

// Extendemos las propiedades estándar de una etiqueta HTML
interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

function Label({ children, ...props }: LabelProps) {
  // Aplicamos las clases de Tailwind para darle el estilo deseado
  return (
    <label
      className="block text-lg font-medium text-gray-700 mb-1"
      {...props}
    >
      {children}
    </label>
  );
}

export default Label;