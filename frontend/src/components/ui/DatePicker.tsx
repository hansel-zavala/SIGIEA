// frontend/src/components/ui/DatePicker.tsx
import DatePicker, { registerLocale, setDefaultLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { es } from 'date-fns/locale/es';
import Input from './Input'; 
import { forwardRef } from 'react';

registerLocale('es', es);
setDefaultLocale('es');

interface DatePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  maxDate?: Date;
  onMonthChange?: (date: Date) => void;
  onYearChange?: (date: Date) => void;
}

const CustomInput = forwardRef<HTMLInputElement, { value?: string; onClick?: () => void }>(
  ({ value, onClick }, ref) => (
    <Input
      value={value}
      onClick={onClick}
      ref={ref}
      placeholder="dd/mm/aaaa"
      readOnly 
    />
  )
);

function CustomDatePicker({ selected, onChange, maxDate, onMonthChange, onYearChange }: DatePickerProps) {
  return (
    <DatePicker
      selected={selected}
      onChange={onChange}
      locale="es"
      dateFormat="P"
      maxDate={maxDate}
      showYearDropdown
      scrollableYearDropdown
      showMonthDropdown
      yearDropdownItemNumber={60}
      onMonthChange={onMonthChange}
      onYearChange={onYearChange}
      customInput={<CustomInput />}
      popperPlacement="bottom-start"
      wrapperClassName="w-full" 
    />
  );
}

export default CustomDatePicker;
