// frontend/src/pages/CategoriesPage.tsx
import { useState, useEffect, useMemo } from "react";
import categoryService, { type Category } from "../services/categoryService";
import { FaPlus, FaPencilAlt, FaTrash } from "react-icons/fa";
import Modal from 'react-modal';
import Label from "../components/ui/Label";
import Input from "../components/ui/Input";
import Pagination from "../components/ui/Pagination";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', color: '#4287f5' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const totalCategories = categories.length;

  useEffect(() => {
    if (!totalCategories) {
      setCurrentPage(1);
      return;
    }
    const totalPages = Math.max(1, Math.ceil(totalCategories / Math.max(itemsPerPage, 1)));
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalCategories, itemsPerPage]);

  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * Math.max(itemsPerPage, 1);
    return categories.slice(start, start + Math.max(itemsPerPage, 1));
  }, [categories, currentPage, itemsPerPage]);

  const handleItemsPerPageChange = (size: number) => {
    if (size <= 0) return;
    setItemsPerPage(size);
    setCurrentPage(1);
  };

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
          <button onClick={() => handleOpenModal()} className="min-w-[220px] py-3 px-8 text-white font-bold rounded-lg bg-gradient-to-r from-violet-400 to-purple-500 hover:from-violet-500 hover:to-purple-600 transition-all duration-200 flex items-center justify-center gap-3 shadow-md">
            <FaPlus /> Nueva Categoría
          </button>
        </div>

        {error && !isModalOpen && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">{error}</div>
        )}

        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="max-w-full overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left font-medium text-gray-500">Nombre de la Categoría</th>
                  <th className="px-5 py-3 text-left font-medium text-gray-500">Color</th>
                  <th className="px-5 py-3 text-right font-medium text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="px-5 py-8 text-center text-gray-500">Cargando categorías...</td>
                  </tr>
                ) : paginatedCategories.length > 0 ? (
                  paginatedCategories.map((cat) => (
                    <tr key={cat.id}>
                      <td className="px-5 py-4 font-medium text-gray-800">{cat.name}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span
                            className="inline-block h-5 w-5 rounded-full border border-gray-300"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span className="font-mono text-gray-600">{cat.color}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => handleOpenModal(cat)}
                            title="Editar"
                            className="inline-flex items-center justify-center rounded-md border border-blue-200 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
                          >
                            <FaPencilAlt />
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id)}
                            title="Eliminar"
                            className="inline-flex items-center justify-center rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-5 py-8 text-center text-gray-500">No hay categorías registradas.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {totalCategories > 0 && (
            <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
              <Pagination
                itemsPerPage={itemsPerPage}
                totalItems={totalCategories}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            </div>
          )}
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
            <button type="button" onClick={handleCloseModal} className="py-3 px-8 text-white font-bold rounded-lg bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 transition-all duration-200 flex items-center justify-center gap-3 shadow-md">Cancelar</button> 
            <button type="submit" className="py-3 px-8 text-white font-bold rounded-lg bg-gradient-to-r from-violet-400 to-purple-500 hover:from-violet-500 hover:to-purple-600 transition-all duration-200 flex items-center justify-center gap-3 shadow-md">Guardar</button>
          </div>
        </form>
      </Modal>
    </>
  );
}

export default CategoriesPage;
