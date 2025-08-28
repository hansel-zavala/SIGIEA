// frontend/src/components/ui/CatalogModal.tsx
import { useState, useEffect } from 'react';
import Modal from 'react-modal';
import Input from './Input';
import Label from './Label';
import { FaPlus, FaTrash, FaEdit, FaSave } from 'react-icons/fa';

// Estilos para el modal, para mantener la consistencia
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

// Definimos la estructura de los ítems que manejará el modal
interface CatalogItem {
  id: number;
  nombre: string;
}

// Definimos las props que nuestro modal necesitará para funcionar
interface CatalogModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  title: string; // Título del modal (ej. "Gestionar Medicamentos")
  items: CatalogItem[];
  onAddItem: (name: string) => Promise<void>;
  onUpdateItem: (id: number, name: string) => Promise<void>;
  onDeleteItem: (id: number) => Promise<void>;
}

function CatalogModal({ isOpen, onRequestClose, title, items, onAddItem, onUpdateItem, onDeleteItem }: CatalogModalProps) {
  const [newItemName, setNewItemName] = useState('');
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);

  // Limpiamos los campos del formulario cada vez que el modal se abre/cierra
  useEffect(() => {
    if (!isOpen) {
      setNewItemName('');
      setEditingItem(null);
    }
  }, [isOpen]);

  const handleAddItem = async () => {
    if (newItemName.trim()) {
      await onAddItem(newItemName.trim());
      setNewItemName(''); // Limpiamos el input después de agregar
    }
  };

  const handleUpdateItem = async () => {
    if (editingItem && editingItem.nombre.trim()) {
      await onUpdateItem(editingItem.id, editingItem.nombre.trim());
      setEditingItem(null); // Salimos del modo edición
    }
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} style={modalStyles} contentLabel={title}>
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
        
        {/* Formulario para añadir nuevos ítems */}
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder={`Añadir nuevo...`}
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="flex-grow"
          />
          <button onClick={handleAddItem} className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <FaPlus /> Añadir
          </button>
        </div>

        {/* Lista de ítems existentes */}
        <div className="max-h-64 overflow-y-auto pr-2">
          <ul className="space-y-2">
            {items.map(item => (
              <li key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                {editingItem?.id === item.id ? (
                  // Vista de edición
                  <Input
                    type="text"
                    value={editingItem.nombre}
                    onChange={(e) => setEditingItem({ ...editingItem, nombre: e.target.value })}
                    className="flex-grow"
                  />
                ) : (
                  // Vista normal
                  <span className="text-gray-700">{item.nombre}</span>
                )}
                
                <div className="flex gap-2">
                  {editingItem?.id === item.id ? (
                    <button onClick={handleUpdateItem} className="text-green-500 hover:text-green-700 p-2"><FaSave /></button>
                  ) : (
                    <button onClick={() => setEditingItem(item)} className="text-blue-500 hover:text-blue-700 p-2"><FaEdit /></button>
                  )}
                  <button onClick={() => onDeleteItem(item.id)} className="text-red-500 hover:text-red-700 p-2"><FaTrash /></button>
                </div>
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