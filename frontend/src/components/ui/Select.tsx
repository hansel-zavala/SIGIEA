// frontend/src/components/ui/Select.tsx
import Select, { type Props as SelectProps } from 'react-select';

// Definimos la "forma" que tendrá cada objeto en la lista de opciones
interface OptionType {
  value: string;
  label: string;
}

// Las props de nuestro nuevo componente
interface CustomSelectProps extends SelectProps<OptionType, false> {
  options: OptionType[];
  // No necesitamos 'placeholder' aquí, react-select lo maneja internamente
}

// --- Objeto de estilos para personalizar react-select ---
const customStyles = {
  control: (provided: any, state: { isFocused: any; }) => ({
    ...provided,
    borderRadius: '0.375rem', // rounded-md
    borderColor: state.isFocused ? '#8b5cf6' : '#d1d5db', // Borde violeta al enfocar
    boxShadow: state.isFocused ? '0 0 0 1px #8b5cf6' : 'none',
    '&:hover': {
      borderColor: '#8b5cf6',
    },
    minHeight: '42px', // Altura similar a nuestros inputs
  }),
  option: (provided: any, state: { isSelected: any; isFocused: any; }) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? '#8b5cf6' // Fondo violeta para la opción seleccionada
      : state.isFocused
      ? '#ede9fe' // Fondo violeta claro al pasar el cursor (hover)
      : 'white',
    color: state.isSelected ? 'white' : 'black',
    '&:active': {
      backgroundColor: '#7c3aed',
    },
  }),
  singleValue: (provided: any) => ({
    ...provided,
    color: '#1f2937', // Color del texto de la opción seleccionada
  }),
};


function CustomSelect({ options, className, ...props }: CustomSelectProps) {
  return (
    <Select
      className={`sm:text-lg ${className || ''}`}
      styles={customStyles}
      options={options}
      {...props}
    />
  );
}

export default CustomSelect;
