// backend/src/controllers/tipoParentescoController.ts

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Obtener todos los tipos de parentesco
export const getAllTiposParentesco = async (req: Request, res: Response) => {
  try {
    const tiposParentesco = await prisma.tipoParentesco.findMany();
    res.status(200).json(tiposParentesco);
  } catch (error) {
    console.error('Error fetching tipos de parentesco:', error);
    res.status(500).json({ message: 'Error al obtener los tipos de parentesco' });
  }
};

// Crear un nuevo tipo de parentesco (solo para admins)
export const createTipoParentesco = async (req: Request, res: Response) => {
  const { nombre } = req.body;
  if (!nombre) {
    return res.status(400).json({ message: 'El campo nombre es requerido' });
  }

  try {
    const newTipoParentesco = await prisma.tipoParentesco.create({
      data: {
        nombre,
      },
    });
    res.status(201).json(newTipoParentesco);
  } catch (error) {
    console.error('Error creating tipo de parentesco:', error);
    res.status(500).json({ message: 'Error al crear el tipo de parentesco' });
  }
};

// Eliminar un tipo de parentesco (solo para admins)
export const deleteTipoParentesco = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.tipoParentesco.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting tipo de parentesco:', error);
    res.status(500).json({ message: 'Error al eliminar el tipo de parentesco' });
  }
};

export const updateTipoParentesco = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nombre } = req.body;
  if (!nombre) {
    return res.status(400).json({ message: 'El campo nombre es requerido' });
  }

  try {
    const updatedTipo = await prisma.tipoParentesco.update({
      where: { id: parseInt(id) },
      data: { nombre },
    });
    res.status(200).json(updatedTipo);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el tipo de parentesco' });
  }
};