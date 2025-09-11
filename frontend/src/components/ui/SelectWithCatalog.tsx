// frontend/src/components/ui/SelectWithCatalog.tsx

import React, { useState, useEffect } from 'react';
import Select from './Select'; // Tu componente Select personalizado
import Label from './Label';
import CatalogModal from './CatalogModal'; // <-- CAMBIO: Usamos TU CatalogModal
import { FaCog } from 'react-icons/fa';

// Interfaces que definen la estructura de los datos
interface CatalogOption {
  id: number;
  nombre: string;
}

interface SelectOption {
  value: string;
  label: string;
}

interface SelectWithCatalogProps {
  label: string;
  catalogName: string;
  value: string | null;
  onChange: (value: string | null) => void;
  loadCatalogOptions: () => Promise<CatalogOption[]>;
  createOptionService: (name: string) => Promise<any>;
  updateOptionService: (id: number, name: string) => Promise<any>; // Para editar
  deleteOptionService: (id: number) => Promise<void>;
  instanceId: string;
  placeholder?: string;
}

export const SelectWithCatalog: React.FC<SelectWithCatalogProps> = ({
  label,
  catalogName,
  value,
  onChange,
  loadCatalogOptions,
  createOptionService,
  updateOptionService,
  deleteOptionService,
  instanceId,
  placeholder = "Seleccione...",
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [catalogItems, setCatalogItems] = useState<CatalogOption[]>([]);

  // Cargar las opciones del catálogo al montar el componente
  useEffect(() => {
    handleLoadCatalog();
  }, []);

  const handleLoadCatalog = async () => {
    try {
      const data = await loadCatalogOptions();
      setCatalogItems(data);
    } catch (err) {
      console.error(`No se pudo cargar ${catalogName}.`, err);
    }
  };

  // Funciones que se pasarán al modal. Estas recargan la lista después de cada acción.
  const handleAddItem = async (name: string) => {
    await createOptionService(name);
    handleLoadCatalog();
  };

  const handleUpdateItem = async (id: number, name: string) => {
    await updateOptionService(id, name);
    handleLoadCatalog();
  };

  const handleDeleteItem = async (id: number) => {
    await deleteOptionService(id);
    // Si el item eliminado era el que estaba seleccionado, lo limpiamos.
    const deletedItem = catalogItems.find(item => item.id === id);
    if (deletedItem && value === deletedItem.nombre) {
      onChange(null);
    }
    handleLoadCatalog();
  };

  const selectOptions: SelectOption[] = catalogItems.map(item => ({
    value: item.nombre,
    label: item.nombre,
  }));

  return (
    <>
      <div> {/* Envolvemos en un div para que el Label y el contenedor del select estén en bloque */}
        <Label htmlFor={instanceId}>{label}</Label>
        <div className="flex items-center space-x-2"> {/* Contenedor flex para alinear Select y Botón */}
          <div className="flex-grow">
            <Select
              instanceId={instanceId}
              inputId={instanceId}
              name={instanceId}
              value={selectOptions.find(o => o.value === value) || null}
              onChange={(option: SelectOption | null) => onChange(option?.value || null)}
              placeholder={placeholder}
              options={selectOptions}
            />
          </div>

          
        </div>
        <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="text-sm text-violet-600 hover:underline mt-2 flex items-center gap-1"
          >
            <FaCog /> Gestionar {catalogName}
          </button>
      </div>

      {/* Usamos tu componente CatalogModal existente para mantener la consistencia del diseño */}
      <CatalogModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        title={`Gestionar ${catalogName}`}
        items={catalogItems}
        onAddItem={handleAddItem}
        onUpdateItem={handleUpdateItem}
        onDeleteItem={handleDeleteItem}
      />
    </>
  );
};