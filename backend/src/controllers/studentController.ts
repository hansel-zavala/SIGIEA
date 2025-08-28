// backend/src/controllers/studentController.ts

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createStudent = async (req: Request, res: Response) => {
  try {
    const { guardians, medicamentos, alergias, ...studentData } = req.body;

    if (!studentData.fullName || !studentData.dateOfBirth) {
        return res.status(400).json({ error: 'El nombre completo y la fecha de nacimiento son obligatorios.' });
    }
    if (!studentData.therapistId) {
        return res.status(400).json({ error: 'Debe asignar un terapeuta al estudiante.' });
    }
    if (!guardians || !Array.isArray(guardians) || guardians.length === 0) {
        return res.status(400).json({ error: 'Se requiere al menos un padre o tutor.' });
    }
    for (const guardian of guardians) {
        if (!guardian.fullName || !guardian.numeroIdentidad || !guardian.telefono) {
            return res.status(400).json({ error: 'El nombre, DNI y teléfono son obligatorios para cada guardián.' });
        }
        const existingGuardian = await prisma.guardian.findUnique({
            where: { numeroIdentidad: guardian.numeroIdentidad }
        });
        if (existingGuardian) {
            return res.status(409).json({ error: `El número de identidad ${guardian.numeroIdentidad} ya está registrado en el sistema.` });
        }
    }


    if (studentData.dateOfBirth) {
      studentData.dateOfBirth = new Date(studentData.dateOfBirth);
    }
    if (studentData.anoIngreso) {
      studentData.anoIngreso = new Date(studentData.anoIngreso);
    }

    const newStudent = await prisma.student.create({
      data: {
        ...studentData,
        guardians: {
          create: guardians,
        },
        medicamentos: {
          connect: medicamentos?.map((id: number) => ({ id })) || [],
        },
        alergias: {
          connect: alergias?.map((id: number) => ({ id })) || [],
        },
      },
      include: {
        guardians: true,
        medicamentos: true,
        alergias: true,
      },
    });

    res.status(201).json(newStudent);
  } catch (error) {
    console.error("Error al crear la matrícula:", error);
    res.status(500).json({ error: 'No se pudo procesar la matrícula.' });
  }
};

export const getAllStudents = async (req: Request, res: Response) => {
  try {
    const { search, page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const whereCondition = {
      isActive: true,
      ...(search && {
        fullName: {
          contains: search as string,
        },
      }),
    };

    const [students, totalStudents] = await prisma.$transaction([
      prisma.student.findMany({
        where: whereCondition,
        orderBy: { createdAt: 'desc' },
        skip: skip,
        take: limitNum,
        include: {
          therapist: {
            select: { fullName: true },
          },
        },
      }),
      prisma.student.count({ where: whereCondition }),
    ]);

    res.json({
      data: students,
      total: totalStudents,
      page: pageNum,
      totalPages: Math.ceil(totalStudents / limitNum),
    });

  } catch (error) {
    res.status(500).json({ error: 'No se pudieron obtener los estudiantes.' });
  }
};

export const getStudentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const student = await prisma.student.findFirst({
      where: {
        id: parseInt(id),
        isActive: true
      },
      include: {
        therapySessions: {
          where: {
            startTime: { gte: new Date() }
          },
          include: { leccion: true }
        },
        therapist: true,
        guardians: true, 
        medicamentos: true,
        alergias: true
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

export const updateStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { therapistId, medicamentos, alergias, ...studentData } = req.body;

    delete studentData.id;
    delete studentData.guardians;
    delete studentData.therapySessions; 
    delete studentData.therapyPlans;
    delete studentData.sessionLogs;
    delete studentData.therapist;
    delete studentData.createdAt;
    delete studentData.updatedAt;
    delete studentData.usaMedicamentos;
    delete studentData.esAlergico;

    if (studentData.dateOfBirth) {
      studentData.dateOfBirth = new Date(studentData.dateOfBirth);
    }
    if (studentData.anoIngreso) {
      studentData.anoIngreso = new Date(studentData.anoIngreso);
    }

    const updatedStudent = await prisma.student.update({
        where: { id: parseInt(id) },
        data: {
            ...studentData,
            medicamentos: {
              set: medicamentos?.map((medId: number) => ({ id: medId })) || [],
            },
            alergias: {
              set: alergias?.map((alergiaId: number) => ({ id: alergiaId })) || [],
            },
            therapist: therapistId ? { connect: { id: parseInt(therapistId) } } : { disconnect: true },
        },
    });
    res.json(updatedStudent);
  } catch (error) {
      console.error("Error al actualizar estudiante:", error);
      res.status(500).json({ error: 'No se pudo actualizar el estudiante.' });
  }
};

export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const student = await prisma.student.update({
      where: { id: parseInt(id) },
      data: { isActive: false },
    });

    res.json({ message: 'Estudiante desactivado correctamente.', student });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo desactivar el estudiante.' });
  }
};