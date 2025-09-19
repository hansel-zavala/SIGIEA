import { forwardRef } from 'react';
import DatePicker, { registerLocale, setDefaultLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { es } from 'date-fns/locale/es';
import Label from '../ui/Label';
import Input from '../ui/Input';
import { parseDateValue } from '../../utils/eventDateUtils';

registerLocale('es', es);
setDefaultLocale('es');

interface EventDateTimePickerProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  isAllDay: boolean;
  error?: string;
  minDate?: Date | null;
  disabled?: boolean;
  selectsStart?: boolean;
  selectsEnd?: boolean;
  startDate?: Date | null;
  endDate?: Date | null;
}

interface DatePickerInputProps {
  value?: string;
  onClick?: () => void;
  placeholder?: string;
  hasError?: boolean;
  disabled?: boolean;
  id?: string;
}

const DatePickerInput = forwardRef<HTMLInputElement, DatePickerInputProps>(
  ({ value, onClick, placeholder, hasError, disabled, id }, ref) => (
    <Input
      id={id}
      value={value ?? ''}
      onClick={onClick}
      placeholder={placeholder}
      readOnly
      ref={ref}
      disabled={disabled}
      className={hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
    />
  )
);

DatePickerInput.displayName = 'EventDatePickerInput';

const formatDateValue = (date: Date | null, isAllDay: boolean): string => {
  if (!date) return '';
  if (isAllDay) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

function EventDateTimePicker({
  id,
  label,
  value,
  onChange,
  isAllDay,
  error,
  minDate,
  disabled,
  selectsStart,
  selectsEnd,
  startDate,
  endDate,
}: EventDateTimePickerProps) {
  const selectedDate = parseDateValue(value, isAllDay);
  const placeholder = isAllDay ? 'Selecciona la fecha' : 'Selecciona fecha y hora';

  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}</Label>
      <DatePicker
        id={id}
        selected={selectedDate}
        onChange={(date) => onChange(formatDateValue(date, isAllDay))}
        locale="es"
        showTimeSelect={!isAllDay}
        timeIntervals={15}
        timeCaption="Hora"
        dateFormat={isAllDay ? 'dd/MM/yyyy' : 'dd/MM/yyyy HH:mm'}
        minDate={minDate ?? undefined}
        disabled={disabled}
        selectsStart={selectsStart}
        selectsEnd={selectsEnd}
        startDate={startDate ?? undefined}
        endDate={endDate ?? undefined}
        shouldCloseOnSelect={isAllDay}
        customInput={
          <DatePickerInput
            id={id}
            placeholder={placeholder}
            hasError={Boolean(error)}
            disabled={disabled}
          />
        }
        popperPlacement="bottom-start"
        wrapperClassName="w-full"
        placeholderText={placeholder}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}

export { formatDateValue as formatEventDateValue };
export default EventDateTimePicker;
