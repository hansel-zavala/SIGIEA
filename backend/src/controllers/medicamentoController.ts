// backend/src/controllers/medicamentoController.ts
import { Request, Response } from 'express';
import prisma from '../db.js';

// Obtener todos los medicamentos
export const getAllMedicamentos = async (req: Request, res: Response) => {
  try {
    const medicamentos = await prisma.medicamento.findMany({
      orderBy: { nombre: 'asc' },
    });
    res.json(medicamentos);
  } catch (error) {
    res.status(500).json({ error: 'No se pudieron obtener los medicamentos.' });
  }
};

// Crear un nuevo medicamento
export const createMedicamento = async (req: Request, res: Response) => {
  try {
    const { nombre } = req.body;
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es obligatorio.' });
    }
    const newMedicamento = await prisma.medicamento.create({
      data: { nombre },
    });
    res.status(201).json(newMedicamento);
  } catch (error) {
    res.status(500).json({ error: 'No se pudo crear el medicamento.' });
  }
};

// Actualizar un medicamento
export const updateMedicamento = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;
    const updatedMedicamento = await prisma.medicamento.update({
      where: { id: parseInt(id) },
      data: { nombre },
    });
    res.json(updatedMedicamento);
  } catch (error) {
    res.status(500).json({ error: 'No se pudo actualizar el medicamento.' });
  }
};

// Eliminar un medicamento
export const deleteMedicamento = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const medicamentoId = parseInt(id, 10);

    if (Number.isNaN(medicamentoId)) {
      return res.status(400).json({ error: 'Identificador de medicamento inválido.' });
    }

    const studentsUsingMedicamento = await prisma.student.count({
      where: {
        medicamentos: {
          some: { id: medicamentoId },
        },
      },
    });

    if (studentsUsingMedicamento > 0) {
      return res.status(400).json({
        error: 'No se puede eliminar el medicamento porque está asignado a otros estudiantes.',
      });
    }

    await prisma.medicamento.delete({
      where: { id: medicamentoId },
    });
    res.json({ message: 'Medicamento eliminado correctamente.' });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo eliminar el medicamento.' });
  }
};
