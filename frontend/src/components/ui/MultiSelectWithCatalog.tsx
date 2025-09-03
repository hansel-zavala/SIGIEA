// frontend/src/components/ui/MultiSelectWithCatalog.tsx
import { useState } from 'react';
import { FaCog, FaTimes } from 'react-icons/fa';
import CatalogModal from './CatalogModal';

// Interfaces que definen la estructura de los datos que manejará este componente
interface Item {
  id: number;
  nombre: string;
}

interface MultiSelectProps {
  // Props para el catálogo completo
  catalogTitle: string;
  allItems: Item[];
  onAddItem: (name: string) => Promise<void>;
  onUpdateItem: (id: number, name: string) => Promise<void>;
  onDeleteItem: (id: number) => Promise<void>;

  // Props para los ítems actualmente seleccionados
  selectedItems: Item[];
  onSelectionChange: (selected: Item[]) => void;
}

function MultiSelectWithCatalog({
  catalogTitle,
  allItems,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  selectedItems,
  onSelectionChange,
}: MultiSelectProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  // Filtra los ítems del catálogo que aún no han sido seleccionados
  const availableItems = allItems.filter(
    (item) => !selectedItems.some((selected) => selected.id === item.id)
  );

  const handleSelectItem = (item: Item) => {
    onSelectionChange([...selectedItems, item]);
    setIsSelectorOpen(false);
  };

  const handleRemoveItem = (itemId: number) => {
    onSelectionChange(selectedItems.filter((item) => item.id !== itemId));
  };

  return (
    <div>
      {/* Contenedor para los ítems seleccionados (las "píldoras") */}
      <div className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded-md min-h-[40px]">
        {selectedItems.map((item) => (
          <div key={item.id} className="bg-violet-500 text-white flex items-center gap-2 px-2 py-1 rounded-full text-sm">
            {item.nombre}
            <button
              type="button"
              onClick={() => handleRemoveItem(item.id)}
              className="text-white hover:text-gray-200"
            >
              <FaTimes />
            </button>
          </div>
        ))}

        {/* Botón para abrir el selector de ítems */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsSelectorOpen(!isSelectorOpen)}
            className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-300"
          >
            + Añadir
          </button>

          {/* Lista desplegable de ítems disponibles */}
          {isSelectorOpen && (
            <ul className="absolute z-20 w-48 bg-white border rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg">
              {availableItems.length > 0 ? (
                availableItems.map((item) => (
                  <li
                    key={item.id}
                    className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                    onClick={() => handleSelectItem(item)}
                  >
                    {item.nombre}
                  </li>
                ))
              ) : (
                <li className="px-3 py-2 text-gray-500">No hay más opciones</li>
              )}
            </ul>
          )}
        </div>
      </div>

      {/* Botón para abrir el modal de gestión del catálogo */}
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="text-sm text-violet-600 hover:underline mt-2 flex items-center gap-1"
      >
        <FaCog /> Gestionar Catálogo
      </button>

      {/* El Modal que creamos en el paso anterior */}
      <CatalogModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        title={catalogTitle}
        items={allItems}
        onAddItem={onAddItem}
        onUpdateItem={onUpdateItem}
        onDeleteItem={onDeleteItem}
      />
    </div>
  );
}

export default MultiSelectWithCatalog;