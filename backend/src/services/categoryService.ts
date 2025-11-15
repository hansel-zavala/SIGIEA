// backend/src/services/categoryService.ts
import { categoryRepository } from '../repositories/categoryRepository.js';
import { CategoryInUseError, CategoryNameExistsError } from '../errors/categoryErrors.js';
import { Prisma } from '@prisma/client';

const getAllCategories = () => {
  return categoryRepository.findAll();
};

const createCategory = async (name: string, color: string) => {
  try {
    return await categoryRepository.create(name, color);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new CategoryNameExistsError('Ya existe una categoría con ese nombre.');
    }
    throw error;
  }
};

const updateCategory = async (id: number, name?: string, color?: string) => {
  if (!name && !color) {
    throw new Error('Se requiere al menos un campo (nombre o color) para actualizar.');
  }

  try {
    return await categoryRepository.update(id, name, color);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new CategoryNameExistsError('Ya existe una categoría con ese nombre.');
    }
    throw error;
  }
};

const deleteCategory = async (id: number) => {
  const eventCount = await categoryRepository.countEventsByCategoryId(id);
  
  if (eventCount > 0) {
    throw new CategoryInUseError('No se puede eliminar la categoría porque está siendo utilizada por uno o más eventos.');
  }

  return categoryRepository.remove(id);
};

export const categoryService = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};