// frontend/src/components/ui/CatalogModal.tsx
import { useState, useEffect } from 'react';
import Modal from 'react-modal';
import Input from './Input';
import { FaPlus, FaTrash, FaEdit, FaSave } from 'react-icons/fa';

const modalStyles = {
  content: {
    top: '50%', left: '50%', right: 'auto', bottom: 'auto',
    marginRight: '-50%', transform: 'translate(-50%, -50%)',
    width: '500px', borderRadius: '8px', padding: '25px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
  },
  overlay: { backgroundColor: 'rgba(0, 0, 0, 0.6)', zIndex: 1000 }
};

Modal.setAppElement('#root');

interface CatalogItem {
  id: number;
  nombre: string;
}

interface CatalogModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  title: string;
  items: CatalogItem[];
  onAddItem: (name: string) => Promise<void>;
  onUpdateItem: (id: number, name: string) => Promise<void>;
  onDeleteItem: (id: number) => Promise<void>;
}

const getValidationErrorMessage = (error: any): string | null => {
  if (error.response && error.response.status === 400) {
    const backendErrors = error.response.data.errors;
    if (Array.isArray(backendErrors)) {
      const nameError = backendErrors.find(e => e.path === 'nombre');
      if (nameError) {
        return nameError.msg;
      }
    }
  }
  return null;
};

function CatalogModal({ isOpen, onRequestClose, title, items, onAddItem, onUpdateItem, onDeleteItem }: CatalogModalProps) {
  const [newItemName, setNewItemName] = useState('');
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [addError, setAddError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setNewItemName('');
      setEditingItem(null);
      setAddError(null);
      setEditError(null);
    }
  }, [isOpen]);

  const handleNewNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewItemName(e.target.value);
    if (addError) {
      setAddError(null);
    }
  };

  const handleEditNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingItem) {
      setEditingItem({ ...editingItem, nombre: e.target.value });
    }
    if (editError) {
      setEditError(null);
    }
  };

  const handleSetEditing = (item: CatalogItem) => {
    setEditingItem(item);
    setEditError(null);
  };

  const handleAddItem = async () => {
    setAddError(null);
    try {
      await onAddItem(newItemName.trim());
      setNewItemName('');
    } catch (error) {

      const message = getValidationErrorMessage(error);
      setAddError(message || 'Error al agregar. Intente de nuevo.');
    }
  };

  const handleUpdateItem = async () => {
    setEditError(null);
    if (editingItem && editingItem.nombre.trim()) {
      try {
        await onUpdateItem(editingItem.id, editingItem.nombre.trim());
        setEditingItem(null);
      } catch (error) {
        const message = getValidationErrorMessage(error);
        setEditError(message || 'Error al actualizar. Intente de nuevo.');
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} style={modalStyles} contentLabel={title}>
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-gray-800">{title}</h3>

        <div>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder={`Añadir nuevo...`}
              value={newItemName}
              onChange={handleNewNameChange}
              className="flex-grow"
            />
            <button onClick={handleAddItem} className="bg-violet-600 text-white p-2 rounded-lg hover:bg-violet-700 flex items-center gap-2">
              <FaPlus /> Añadir
            </button>
          </div>
          {addError && (
            <p className="text-red-500 text-sm mt-1">{addError}</p>
          )}
        </div>

        <div className="max-h-64 overflow-y-auto pr-2">
          <ul className="space-y-2">
            {items.map(item => (
              <li key={item.id} className="p-2 bg-gray-50 rounded-md">
                <div className="flex items-center justify-between">
                  {editingItem?.id === item.id ? (
                    <Input
                      type="text"
                      value={editingItem.nombre}
                      onChange={handleEditNameChange}
                      className="flex-grow"
                    />
                  ) : (
                    <span className="text-gray-700">{item.nombre}</span>
                  )}

                  <div className="flex gap-2 ml-2">
                    {editingItem?.id === item.id ? (
                      <button onClick={handleUpdateItem} className="text-green-500 hover:text-green-700 p-2"><FaSave /></button>
                    ) : (
                      <button onClick={() => handleSetEditing(item)} className="text-blue-500 hover:text-blue-700 p-2"><FaEdit /></button>
                    )}
                    <button onClick={() => onDeleteItem(item.id)} className="text-red-500 hover:text-red-700 p-2"><FaTrash /></button>
                  </div>
                </div>
                {editingItem?.id === item.id && editError && (
                  <p className="text-red-500 text-sm mt-1">{editError}</p>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="text-right">
          <button onClick={onRequestClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Cerrar</button>
        </div>
      </div>
    </Modal>
  );
}

export default CatalogModal;
