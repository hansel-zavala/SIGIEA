// frontend/src/pages/CategoriesPage.tsx
import { useState, useEffect } from "react";
import categoryService, { type Category } from "../services/categoryService";
import { FaTag, FaPlus, FaPencilAlt, FaTrash } from "react-icons/fa";
import Modal from 'react-modal';
import Label from "../components/ui/Label";
import Input from "../components/ui/Input";

// Estilos para el modal (puedes moverlos a un archivo CSS si prefieres)
const modalStyles = {
  content: {
    top: '50%', left: '50%', right: 'auto', bottom: 'auto',
    marginRight: '-50%', transform: 'translate(-50%, -50%)',
    width: '400px', borderRadius: '8px', padding: '25px'
  },
  overlay: { backgroundColor: 'rgba(0, 0, 0, 0.6)' }
};

Modal.setAppElement('#root');

function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Estados para el modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', color: '#4287f5' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = () => {
    setLoading(true);
    categoryService.getAllCategories()
      .then(setCategories)
      .catch(() => setError("No se pudo cargar la lista de categorías."))
      .finally(() => setLoading(false));
  };

  const handleOpenModal = (category: Category | null = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name, color: category.color });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', color: '#4287f5' });
    }
    setError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("El nombre de la categoría es obligatorio.");
      return;
    }

    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, formData);
      } else {
        await categoryService.createCategory(formData);
      }
      fetchCategories();
      handleCloseModal();
    } catch (err: any) {
      setError(err.response?.data?.error || "Ocurrió un error.");
    }
  };

  const handleDelete = async (categoryId: number) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta categoría?")) {
      try {
        await categoryService.deleteCategory(categoryId);
        fetchCategories();
      } catch (err: any) {
        alert(err.response?.data?.error || "No se pudo eliminar la categoría.");
      }
    }
  };

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Gestionar Categorías de Eventos</h2>
          <button onClick={() => handleOpenModal()} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2">
            <FaPlus /> Nueva Categoría
          </button>
        </div>

        {loading && <p>Cargando...</p>}
        {error && !isModalOpen && <p className="text-red-500 mb-4">{error}</p>}
        
        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div style={{ backgroundColor: cat.color }} className="w-6 h-6 rounded-full border border-gray-300"></div>
                <span className="font-medium">{cat.name}</span>
              </div>
              <div className="flex gap-4">
                <button onClick={() => handleOpenModal(cat)} title="Editar"><FaPencilAlt className="text-blue-500 hover:text-blue-700" /></button>
                <button onClick={() => handleDelete(cat.id)} title="Eliminar"><FaTrash className="text-red-500 hover:text-red-700" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onRequestClose={handleCloseModal} style={modalStyles}>
        <h2 className="text-xl font-bold mb-4">{editingCategory ? 'Editar' : 'Crear'} Categoría</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-500">{error}</p>}
          <div>
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}/>
          </div>
          <div>
            <Label htmlFor="color">Color</Label>
            <div className="flex items-center gap-3">
              <Input id="color" type="color" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} className="w-16 h-10 p-1"/>
              <span className="font-mono text-gray-700">{formData.color}</span>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={handleCloseModal} className="bg-gray-200 py-2 px-4 rounded">Cancelar</button>
            <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded">Guardar</button>
          </div>
        </form>
      </Modal>
    </>
  );
}

export default CategoriesPage;