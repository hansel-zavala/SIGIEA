// frontend/src/components/ui/Pagination.tsx
import React, { useEffect, useMemo, useState } from 'react';
import VioletDropdown from './VioletDropdown';

interface PaginationProps {
  itemsPerPage: number;
  totalItems: number;
  currentPage: number;
  onPageChange: (pageNumber: number) => void;
  onItemsPerPageChange?: (pageSize: number) => void;
  itemsPerPageOptions?: number[];
}

const Pagination: React.FC<PaginationProps> = ({
  itemsPerPage,
  totalItems,
  currentPage,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions,
}) => {
  const normalizedItemsPerPage = Math.max(1, Math.floor(itemsPerPage) || 1);
  const totalPages = Math.max(1, Math.ceil(totalItems / normalizedItemsPerPage));

  const pageNumbers = useMemo(
    () => Array.from({ length: totalPages }, (_, idx) => idx + 1),
    [totalPages],
  );

  const pageSizeOptions = useMemo(() => {
    const defaultOptions = itemsPerPageOptions && itemsPerPageOptions.length > 0
      ? itemsPerPageOptions
      : [5, 10, 20, 50];
    const merged = Array.from(new Set([...defaultOptions, normalizedItemsPerPage]));
    return merged.sort((a, b) => a - b);
  }, [itemsPerPageOptions, normalizedItemsPerPage]);

  const pageSizeDropdownOptions = useMemo(
    () => pageSizeOptions.map((option) => ({ value: option, label: option.toString() })),
    [pageSizeOptions],
  );

  const [manualPageSize, setManualPageSize] = useState<string>(String(normalizedItemsPerPage));

  useEffect(() => {
    setManualPageSize(String(normalizedItemsPerPage));
  }, [normalizedItemsPerPage]);

  const goToPage = (pageNumber: number) => {
    const safePage = Math.min(Math.max(pageNumber, 1), totalPages);
    if (safePage !== currentPage) {
      onPageChange(safePage);
    }
  };

  const handlePresetPageSizeChange = (value: number) => {
    if (Number.isNaN(value) || value <= 0) {
      return;
    }
    setManualPageSize(String(value));
    if (onItemsPerPageChange) {
      onItemsPerPageChange(value);
    }
  };

  const commitManualPageSize = () => {
    const parsed = Number(manualPageSize);
    if (Number.isNaN(parsed) || parsed <= 0) {
      setManualPageSize(String(normalizedItemsPerPage));
      return;
    }
    const sanitized = Math.floor(parsed);
    setManualPageSize(String(sanitized));
    if (onItemsPerPageChange) {
      onItemsPerPageChange(sanitized);
    }
  };

  const handleManualInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setManualPageSize(event.target.value);
  };

  const handleManualInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      commitManualPageSize();
    }
  };

  const navigationButtonClasses = 'rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-1';

  return (
    <nav className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-gray-600">Mostrar</span>
        <VioletDropdown
          value={normalizedItemsPerPage}
          onChange={handlePresetPageSizeChange}
          options={pageSizeDropdownOptions}
          ariaLabel="Definir elementos por página"
        />
        {/*<span className="text-sm text-gray-600">por página</span>
        <input
          type="number"
          min={1}
          step={1}
          value={manualPageSize}
          onChange={handleManualInputChange}
          onBlur={commitManualPageSize}
          onKeyDown={handleManualInputKeyDown}
          className="w-20 rounded-md border border-gray-300 px-2 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
          aria-label="Definir manualmente elementos por página"
        />*/}
        <span className="text-sm text-gray-600">
          Mostrando {(currentPage - 1) * normalizedItemsPerPage + 1} -{' '}
          {Math.min(currentPage * normalizedItemsPerPage, totalItems)} de{' '}
          {totalItems}
        </span>
      </div>

      <div className="flex w-full items-center justify-center gap-2 sm:w-auto">
        <button
          type="button"
          onClick={() => goToPage(currentPage - 1)}
          aria-disabled={currentPage === 1}
          className={navigationButtonClasses}
        >
          &larr; Anterior
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {pageNumbers.map((number) => {
            const isCurrent = number === currentPage;
            const pageButtonClasses = isCurrent
              ? 'rounded-md border border-violet-500 bg-violet-500 px-3 py-1 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-1'
              : 'rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-1';

            return (
              <button
                key={number}
                type="button"
                onClick={() => goToPage(number)}
                className={pageButtonClasses}
                aria-current={isCurrent ? 'page' : undefined}
              >
                {number}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => goToPage(currentPage + 1)}
          aria-disabled={currentPage === totalPages}
          className={navigationButtonClasses}
        >
          Siguiente &rarr;
        </button>
      </div>
    </nav>
  );
};

export default Pagination;
