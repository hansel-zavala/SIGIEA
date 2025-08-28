// frontend/src/components/ui/Label.tsx
import React from 'react';

interface LabelProps {
  children: React.ReactNode;
  as?: React.ElementType;
  [x: string]: any;
}

function Label({ children, as: Component = 'label', className, ...props }: LabelProps) {
  return (
    <Component
      className={`block text-lg font-medium text-gray-700 mb-1 ${className || ''}`}
      {...props}
    >
      {children}
    </Component>
  );
}

export default Label;