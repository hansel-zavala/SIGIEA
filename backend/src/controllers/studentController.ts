// backend/src/controllers/studentController.ts

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createStudent = async (req: Request, res: Response) => {
  try {
    const { fullName, dateOfBirth, diagnosis, supportLevel } = req.body;

    // Prisma espera un objeto Date, pero JSON envía un string. Hacemos la conversión.
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

// --- NUEVA FUNCIÓN: OBTENER TODOS LOS ESTUDIANTES ---
export const getAllStudents = async (req: Request, res: Response) => {
  try {
    const students = await prisma.student.findMany();
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: 'No se pudieron obtener los estudiantes.' });
  }
};


// --- NUEVA FUNCIÓN: OBTENER UN ESTUDIANTE POR SU ID ---
export const getStudentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // Obtenemos el ID de los parámetros de la URL
    const student = await prisma.student.findUnique({
      where: { id: parseInt(id) }, // Convertimos el ID de string a número
    });

    if (!student) {
      return res.status(404).json({ error: 'Estudiante no encontrado.' });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ error: 'No se pudo obtener el estudiante.' });
  }
};

// --- NUEVA FUNCIÓN: ACTUALIZAR UN ESTUDIANTE ---
export const updateStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const dataToUpdate = req.body;

    // Si la fecha de nacimiento se envía, la convertimos a objeto Date
    if (dataToUpdate.dateOfBirth) {
      dataToUpdate.dateOfBirth = new Date(dataToUpdate.dateOfBirth);
    }

    const student = await prisma.student.update({
      where: { id: parseInt(id) },
      data: dataToUpdate,
    });

    res.json(student);
  } catch (error) {
    res.status(500).json({ error: 'No se pudo actualizar el estudiante.' });
  }
};


// --- NUEVA FUNCIÓN: ELIMINAR UN ESTUDIANTE ---
export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.student.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Estudiante eliminado correctamente.' });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo eliminar el estudiante.' });
  }
};