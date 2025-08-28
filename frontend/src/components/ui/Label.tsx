// frontend/src/components/ui/Label.tsx
import React from 'react';

// ✅ PASO 1.1: Mejoramos la definición de las props
interface LabelProps {
  children: React.ReactNode;
  // 'as' es opcional y puede ser cualquier tipo de componente de React (ej: 'label', 'h3')
  as?: React.ElementType;
  // Permitimos que pasen cualquier otra prop de HTML
  [x: string]: any;
}

function Label({ children, as: Component = 'label', className, ...props }: LabelProps) {
  // ✅ PASO 1.2: Usamos el componente dinámico que se pasa a través de 'as'
  // Por defecto, seguirá siendo una etiqueta <label> si no se especifica nada.
  return (
    <Component
      // Combinamos las clases base con las que puedan venir de fuera
      className={`block text-lg font-medium text-gray-700 mb-1 ${className || ''}`}
      {...props}
    >
      {children}
    </Component>
  );
}

export default Label;