// frontend/src/components/ui/MaskedDateInput.tsx
import { forwardRef } from 'react';
import { IMaskInput } from 'react-imask';
import IMask from 'imask';

interface CustomProps {
  onChange: (event: { target: { name: string; value: unknown } }) => void;
  name: string;
  placeholder?: string;
  value?: string;
}

export const MaskedDateInput = forwardRef<HTMLInputElement, CustomProps>(
  (props, ref) => {
    const { onChange, ...other } = props;
    return (
      <IMaskInput
        {...other}
        mask={Date}
        lazy={false}
        blocks={{
          d: {
            mask: IMask.MaskedRange,
            from: 1,
            to: 31,
            maxLength: 2,
          },
          m: {
            mask: IMask.MaskedRange,
            from: 1,
            to: 12,
            maxLength: 2,
          },
          Y: {
            mask: IMask.MaskedRange,
            from: 1900,
            to: new Date().getFullYear(),
            maxLength: 4,
          },
        }}
        onAccept={(value) => onChange({ target: { name: props.name, value } })}
        overwrite
        inputRef={ref as React.Ref<HTMLInputElement>}
        className={`
          block w-full rounded-md border-gray-300 px-3 py-2 text-lg shadow-sm
          transition-colors duration-200 ease-in-out
          focus:ring-2 focus:ring-violet-500 focus:border-violet-500 focus:outline-none
          disabled:cursor-not-allowed disabled:bg-gray-100
        `}
      />
    );
  },
);