// frontend/src/services/categoryService.ts
import api from './api';

export interface Category {
  id: number;
  name: string;
  color: string;
}

const getAllCategories = async (): Promise<Category[]> => {
  try {
    const response = await api.get('/categories');
    return response.data;
  } catch (error) {
    console.error("Error al obtener las categorías:", error);
    throw error;
  }
};

const createCategory = async (categoryData: Omit<Category, 'id'>): Promise<Category> => {
  try {
    const response = await api.post('/categories', categoryData);
    return response.data;
  } catch (error) {
    console.error("Error al crear la categoría:", error);
    throw error;
  }
};

const updateCategory = async (id: number, categoryData: Omit<Category, 'id'>): Promise<Category> => {
  try {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  } catch (error) {
    console.error("Error al actualizar la categoría:", error);
    throw error;
  }
};

const deleteCategory = async (id: number): Promise<void> => {
  try {
    await api.delete(`/categories/${id}`);
  } catch (error) {
    console.error("Error al eliminar la categoría:", error);
    throw error;
  }
};

export default {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};