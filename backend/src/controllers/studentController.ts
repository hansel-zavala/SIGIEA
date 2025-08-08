// backend/src/controllers/studentController.ts

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// --- CREATE (Sin cambios) ---
export const createStudent = async (req: Request, res: Response) => {
  try {
    const { fullName, dateOfBirth, diagnosis, supportLevel } = req.body;
    const student = await prisma.student.create({
      data: {
        fullName,
        dateOfBirth: new Date(dateOfBirth),
        diagnosis,
        supportLevel,
      },
    });
    res.status(201).json(student);
  } catch (error) {
    console.error("Error al crear el estudiante:", error);
    res.status(500).json({ error: 'No se pudo crear el estudiante.' });
  }
};

// --- GET ALL (Modificado) ---
export const getAllStudents = async (req: Request, res: Response) => {
  try {
    // ✅ CAMBIO: Añadimos un 'where' para traer solo los activos
    const students = await prisma.student.findMany({
      where: { isActive: true },
    });
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: 'No se pudieron obtener los estudiantes.' });
  }
};

// --- GET BY ID (Modificado) ---
export const getStudentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const student = await prisma.student.findFirst({
      where: { id: parseInt(id), isActive: true },
      // ✅ CAMBIO: Filtramos para incluir solo los planes activos
      include: {
        therapyPlans: {
          where: { isActive: true }
        },
      }
    });
    // ... (el resto de la función se queda igual) ...
    if (!student) {
      return res.status(404).json({ error: 'Estudiante no encontrado o inactivo.' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: 'No se pudo obtener el estudiante.' });
  }
};

// --- UPDATE (Modificado) ---
export const updateStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const dataToUpdate = req.body;

    if (dataToUpdate.dateOfBirth) {
      dataToUpdate.dateOfBirth = new Date(dataToUpdate.dateOfBirth);
    }
    // ✅ CAMBIO: Usamos 'updateMany' para asegurar que solo actualizamos si está activo
    const result = await prisma.student.updateMany({
      where: { 
        id: parseInt(id),
        isActive: true,
      },
      data: dataToUpdate,
    });

    if (result.count === 0) {
      return res.status(404).json({ error: 'Estudiante no encontrado o inactivo.' });
    }
    // Devolvemos el registro actualizado
    const updatedStudent = await prisma.student.findUnique({ where: { id: parseInt(id) }});
    res.json(updatedStudent);
  } catch (error) {
    res.status(500).json({ error: 'No se pudo actualizar el estudiante.' });
  }
};

// --- DELETE (Refactorizado a SOFT DELETE) ---
export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // ✅ CAMBIO: Ya no usamos 'delete'. Usamos 'update' para cambiar el estado.
    const student = await prisma.student.update({
      where: { id: parseInt(id) },
      data: { isActive: false },
    });

    res.json({ message: 'Estudiante desactivado correctamente.', student });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo desactivar el estudiante.' });
  }
};