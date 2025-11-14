// backend/src/controllers/categoryController.ts
import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'No se pudieron obtener las categorías.' });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, color } = req.body;
    if (!name || !color) {
      return res.status(400).json({ error: 'El nombre y el color son obligatorios.' });
    }
    const newCategory = await prisma.category.create({
      data: { name, color },
    });
    res.status(201).json(newCategory);
  } catch (error) {
    if (error instanceof Error && 'code' in error && (error as any).code === 'P2002') {
        return res.status(409).json({ error: 'Ya existe una categoría con ese nombre.' });
    }
    res.status(500).json({ error: 'No se pudo crear la categoría.' });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, color } = req.body;
    const updatedCategory = await prisma.category.update({
      where: { id: parseInt(id) },
      data: { name, color },
    });
    res.json(updatedCategory);
  } catch (error) {
    if (error instanceof Error && 'code' in error && (error as any).code === 'P2002') {
        return res.status(409).json({ error: 'Ya existe una categoría con ese nombre.' });
    }
    res.status(500).json({ error: 'No se pudo actualizar la categoría.' });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const eventsWithCategory = await prisma.event.count({
        where: { categoryId: parseInt(id) }
    });

    if (eventsWithCategory > 0) {
        return res.status(400).json({ error: 'No se puede eliminar la categoría porque está siendo utilizada por uno o más eventos.' });
    }

    await prisma.category.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: 'Categoría eliminada correctamente.' });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo eliminar la categoría.' });
  }
};