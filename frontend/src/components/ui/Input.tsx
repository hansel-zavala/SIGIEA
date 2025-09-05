// frontend/src/components/ui/Input.tsx
import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  // Puedes añadir props personalizadas aquí si las necesitas
}


const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`
          block w-full rounded-md border-gray-300 px-3 py-2 text-lg shadow-sm
          transition-colors duration-200 ease-in-out
          focus:ring-2 focus:ring-violet-500 focus:border-violet-500 focus:outline-none
          disabled:cursor-not-allowed disabled:bg-gray-100
          ${className}
        `}
        {...props}
      />
    );
  }
);

export default Input;