// frontend/src/components/ui/SearchInput.tsx
import { forwardRef, type InputHTMLAttributes } from 'react';

type SearchInputProps = InputHTMLAttributes<HTMLInputElement>;

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(({ className = '', ...props }, ref) => (
  <input
    ref={ref}
    className={`w-full bg-transparent text-sm text-gray-700 placeholder-gray-400 border-none outline-none focus:outline-none focus:ring-0 focus:border-none ${className}`}
    {...props}
  />
));

SearchInput.displayName = 'SearchInput';

export default SearchInput;
