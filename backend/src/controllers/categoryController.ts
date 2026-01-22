// backend/src/controllers/categoryController.ts
import { Request, Response } from 'express';
import { categoryService } from '../services/categoryService.js';
import { CategoryInUseError, CategoryNameExistsError } from '../errors/categoryErrors.js';

export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await categoryService.getAllCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'No se pudieron obtener las categorías.' });
  }
};


export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, color } = req.body;
    const newCategory = await categoryService.createCategory(name, color);
    res.status(201).json(newCategory);
  } catch (error) {
    if (error instanceof CategoryNameExistsError) {
      return res.status(409).json({ error: error.message });
    }
    res.status(500).json({ error: 'No se pudo crear la categoría.' });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { name, color } = req.body;
    const updatedCategory = await categoryService.updateCategory(parseInt(id), name, color);
    res.json(updatedCategory);
  } catch (error) {
    if (error instanceof CategoryNameExistsError) {
      return res.status(409).json({ error: error.message });
    }
    res.status(500).json({ error: 'No se pudo actualizar la categoría.' });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    await categoryService.deleteCategory(parseInt(id));
    res.json({ message: 'Categoría eliminada correctamente.' });
  } catch (error) {
    if (error instanceof CategoryInUseError) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'No se pudo eliminar la categoría.' });
  }
};