// backend/src/controllers/studentController.ts

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// --- CREATE (Sin cambios) ---
export const createStudent = async (req: Request, res: Response) => {
  try {
    // 1. Separamos la lista de guardianes del resto de los datos del estudiante
    const { guardians, ...studentData } = req.body;

    // 2. Convertimos la fecha de nacimiento a un objeto Date si viene como texto
    if (studentData.dateOfBirth) {
      studentData.dateOfBirth = new Date(studentData.dateOfBirth);
    }

    const newStudent = await prisma.student.create({
      data: {
        // 3. Pasamos todos los datos del estudiante
        ...studentData,
        // 4. Aquí ocurre la magia: le decimos a Prisma que cree
        // los guardianes que vienen en la lista y los conecte a este estudiante.
        guardians: {
          create: guardians, // 'guardians' debe ser un array de objetos
        },
      },
      // 5. Incluimos los guardianes creados en la respuesta para confirmar
      include: {
        guardians: true,
      },
    });

    res.status(201).json(newStudent);
  } catch (error) {
    console.error("Error al crear la matrícula:", error);
    res.status(500).json({ error: 'No se pudo procesar la matrícula.' });
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
      where: { 
        id: parseInt(id),
        isActive: true 
      },
      // ✅ CAMBIO: Añadimos un 'include' dentro del 'include'
      include: {
        therapyPlans: {
          where: { isActive: true },
          include: {
            leccion: true, // ¡Incluye la lección para cada plan!
          }
        },
        sessionLogs: true,
      }
    });

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

    // ✅ LA SOLUCIÓN:
    // Antes de actualizar, eliminamos los campos de relación que el frontend
    // nos envía pero que no deben ser parte de la actualización del estudiante.
    delete dataToUpdate.id; // Nunca se debe intentar actualizar el ID
    delete dataToUpdate.therapyPlans;
    delete dataToUpdate.sessionLogs;
    delete dataToUpdate.guardians; // Por si lo añadimos en el futuro

    // Convertimos la fecha si viene en el cuerpo de la petición
    if (dataToUpdate.dateOfBirth) {
      dataToUpdate.dateOfBirth = new Date(dataToUpdate.dateOfBirth);
    }

    // Usamos 'update' que encuentra y actualiza en un solo paso y devuelve el registro
    const updatedStudent = await prisma.student.update({
      where: { 
        id: parseInt(id),
        isActive: true, // Aseguramos que solo se pueda editar un estudiante activo
      },
      data: dataToUpdate,
    });

    res.json(updatedStudent);
  } catch (error) {
    console.error("Error al actualizar estudiante:", error);
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