// frontend/src/components/ui/VioletDropdown.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type VioletDropdownOption<T> = {
  value: T;
  label: React.ReactNode;
};

interface VioletDropdownProps<T> {
  value: T;
  onChange: (value: T) => void;
  options: VioletDropdownOption<T>[];
  ariaLabel?: string;
  buttonClassName?: string;
  menuClassName?: string;
  optionClassName?: string;
  selectedOptionClassName?: string;
  placeholder?: React.ReactNode;
}

function VioletDropdown<T>({
  value,
  onChange,
  options,
  ariaLabel,
  buttonClassName,
  menuClassName,
  optionClassName,
  selectedOptionClassName,
  placeholder = 'Seleccionar',
}: VioletDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLUListElement | null>(null);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const selectedOption = useMemo(
    () => options.find((option) => Object.is(option.value, value)),
    [options, value],
  );

  const updateMenuPosition = () => {
    if (!buttonRef.current) {
      return;
    }
    const rect = buttonRef.current.getBoundingClientRect();
    const offset = 8;
    setMenuPosition({
      top: rect.bottom + offset,
      left: rect.left,
      width: rect.width,
    });
  };

  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!isOpen) {
      return;
    }

    updateMenuPosition();

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const insideMenu = menuRef.current?.contains(target);
      const insideButton = buttonRef.current?.contains(target);
      if (!insideMenu && !insideButton) {
        closeMenu();
      }
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    };

    const handleViewportChange = () => {
      updateMenuPosition();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
    };
  }, [isOpen]);

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  const handleOptionClick = (optionValue: T) => {
    onChange(optionValue);
    closeMenu();
  };

  const arrowClasses = 'h-4 w-4 transition-transform' + (isOpen ? ' rotate-180' : '');
  const baseOptionClass = optionClassName
    || 'flex w-full items-center justify-between px-3 py-2 text-left text-sm transition hover:bg-violet-50 focus:bg-violet-100 focus:outline-none';
  const selectedClassName = selectedOptionClassName
    || 'bg-violet-100 font-semibold text-violet-700';

  return (
    <div className="relative inline-flex" aria-label={ariaLabel}>
      <button
        type="button"
        ref={buttonRef}
        onClick={toggleMenu}
        className={
          buttonClassName
            || 'flex items-center gap-2 rounded-md border border-violet-500 px-3 py-2 text-sm text-gray-800 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-violet-500'
        }
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span>{selectedOption?.label ?? placeholder}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={arrowClasses}
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {isOpen && menuPosition && typeof document !== 'undefined'
        && createPortal(
          <ul
            ref={menuRef}
            role="listbox"
            style={{
              position: 'fixed',
              top: menuPosition.top,
              left: menuPosition.left,
              width: menuPosition.width,
            }}
            className={
              menuClassName
                || 'z-50 min-w-[5rem] overflow-hidden rounded-md border border-violet-400 bg-white shadow-lg'
            }
          >
            {options.map((option) => {
              const isSelected = Object.is(option.value, value);
              const optionClasses = baseOptionClass + (isSelected ? ' ' + selectedClassName : ' text-gray-700');

              return (
                <li key={String(option.value)}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleOptionClick(option.value)}
                    className={optionClasses}
                  >
                    <span>{option.label}</span>
                    {isSelected && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="h-4 w-4"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>,
          document.body,
        )}
    </div>
  );
}

export type { VioletDropdownOption };
export default VioletDropdown;
