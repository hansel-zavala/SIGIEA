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

    if (studentData.anoIngreso) {
      studentData.anoIngreso = new Date(studentData.anoIngreso);
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
      orderBy: {
        createdAt: 'desc', // 'desc' significa descendente (del más nuevo al más viejo)
      },
      include: {
        therapist: {
          select: {
            fullName: true
          }
        }
      }
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
    // 1. Extraemos therapistId del resto de los datos
    const { therapistId, ...studentData } = req.body;

    // 2. Limpiamos los datos que no se deben actualizar
    delete studentData.id;
    delete studentData.guardians;
    delete studentData.therapyPlans;
    delete studentData.sessionLogs;
    delete studentData.therapist;
    delete studentData.createdAt;
    delete studentData.updatedAt;

    // 3. Convertimos las fechas
    if (studentData.dateOfBirth) {
      studentData.dateOfBirth = new Date(studentData.dateOfBirth);
    }
    if (studentData.anoIngreso) {
      studentData.anoIngreso = new Date(studentData.anoIngreso);
    }

    // 4. Construimos la operación de actualización
    const updatedStudent = await prisma.student.update({
        where: { id: parseInt(id) },
        data: {
            ...studentData,
            // 5. Usamos la sintaxis 'connect' para actualizar la relación del terapeuta
            therapist: therapistId ? { connect: { id: parseInt(therapistId) } } : { disconnect: true },
        },
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