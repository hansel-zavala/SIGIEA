// backend/src/controllers/studentController.ts

import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();


export const createStudent = async (req: Request, res: Response) => {
  try {
    const { guardians, medicamentos, alergias, ...studentData } = req.body;

    if (!studentData.nombres || !studentData.apellidos || !studentData.dateOfBirth) {
        return res.status(400).json({ error: 'Nombres, apellidos y fecha de nacimiento son obligatorios.' });
    }
    if (!studentData.therapistId) {
        return res.status(400).json({ error: 'Debe asignar un terapeuta al estudiante.' });
    }
    if (!guardians || !Array.isArray(guardians) || guardians.length === 0) {
        return res.status(400).json({ error: 'Se requiere al menos un padre o tutor.' });
    }
    for (const guardian of guardians) {
        if (!guardian.nombres || !guardian.apellidos || !guardian.numeroIdentidad || !guardian.telefono) {
            return res.status(400).json({ error: 'Nombres, apellidos, DNI y teléfono son obligatorios para cada guardián.' });
        }
        const existingGuardian = await prisma.guardian.findUnique({
            where: { numeroIdentidad: guardian.numeroIdentidad }
        });
        if (existingGuardian) {
            return res.status(409).json({ error: `El número de identidad ${guardian.numeroIdentidad} ya está registrado.` });
        }
    }

    if (studentData.dateOfBirth) studentData.dateOfBirth = new Date(studentData.dateOfBirth);
    if (studentData.anoIngreso) studentData.anoIngreso = new Date(studentData.anoIngreso);

    const newStudent = await prisma.student.create({
      data: {
        ...studentData,
        guardians: { create: guardians },
        medicamentos: { connect: medicamentos?.map((id: number) => ({ id })) || [] },
        alergias: { connect: alergias?.map((id: number) => ({ id })) || [] },
      },
      include: { guardians: true, medicamentos: true, alergias: true },
    });

    res.status(201).json(newStudent);

  } catch (error) {
    console.error("Error detallado al crear la matrícula:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const fields = (error.meta as { target?: string[] })?.target?.join(', ');
        return res.status(409).json({ error: `Ya existe un registro con estos datos únicos: ${fields}` });
      }
      if (error.code === 'P2003') {
        const field = (error.meta as { field_name?: string })?.field_name;
        return res.status(400).json({ error: `Error de clave foránea en el campo: ${field}. El ID proporcionado no existe.` });
      }
    }
    res.status(500).json({ error: 'No se pudo procesar la matrícula. Revisa la consola del servidor para más detalles.' });
  }
};

export const getAllStudents = async (req: Request, res: Response) => {
  try {
    const { search, page = '1', limit = '10', status } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    let whereCondition: any = {};
    
    if (status === 'active') {
      whereCondition.isActive = true;
    } else if (status === 'inactive') {
      whereCondition.isActive = false;
    }

    if (search) {
      const searchTerms = (search as string).split(' ').filter(term => term);
      whereCondition.OR = [
        {
          AND: searchTerms.map(term => ({
            OR: [
              { nombres: { contains: term } },
              { apellidos: { contains: term } },
            ],
          })),
        },
        {
          therapist: {
            OR: searchTerms.map(term => ({
              OR: [
                { nombres: { contains: term } },
                { apellidos: { contains: term } },
              ],
            })),
          },
        },
      ];
    }

    const [students, totalStudents] = await prisma.$transaction([
      prisma.student.findMany({
        where: whereCondition,
        orderBy: [
          { isActive: 'desc' }, 
          { createdAt: 'desc' }
        ],
        skip: skip,
        take: limitNum,
        include: {
          therapist: { select: { id: true, nombres: true, apellidos: true } },
          guardians: { orderBy: { parentesco: 'asc' }, take: 1 },
        },
      }),
      prisma.student.count({ where: whereCondition }),
    ]);
    
    const calculateAge = (birthDate: Date) => {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
        return age;
    };

    const studentsWithDetails = students.map(s => {
        const primaryGuardian = s.guardians[0];
        return {
            ...s,
            fullName: `${s.nombres} ${s.apellidos}`,
            age: calculateAge(s.dateOfBirth),
            therapist: s.therapist ? { ...s.therapist, fullName: `${s.therapist.nombres} ${s.therapist.apellidos}` } : null,
            guardianName: primaryGuardian ? `${primaryGuardian.nombres} ${primaryGuardian.apellidos}` : 'No asignado',
            guardianPhone: primaryGuardian ? primaryGuardian.telefono : 'N/A'
        };
    });

    res.json({
      data: studentsWithDetails,
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
      where: { id: parseInt(id), isActive: true },
      include: {
        therapySessions: { include: { leccion: true } },
        therapist: true,
        guardians: true,
        medicamentos: true,
        alergias: true,
      }
    });

    if (!student) {
      return res.status(404).json({ error: 'Estudiante no encontrado.' });
    }
    
    const studentWithFullName = {
        ...student,
        fullName: `${student.nombres} ${student.apellidos}`,
        therapist: student.therapist ? {
            ...student.therapist,
            fullName: `${student.therapist.nombres} ${student.therapist.apellidos}`
        } : null,
        guardians: student.guardians.map(g => ({
            ...g,
            fullName: `${g.nombres} ${g.apellidos}`
        }))
    };

    res.json(studentWithFullName);
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
        delete studentData.therapist;
        delete studentData.createdAt;
        delete studentData.updatedAt;
        delete studentData.fullName;

        if (studentData.dateOfBirth) studentData.dateOfBirth = new Date(studentData.dateOfBirth);
        if (studentData.anoIngreso) studentData.anoIngreso = new Date(studentData.anoIngreso);

        const updatedStudent = await prisma.student.update({
            where: { id: parseInt(id) },
            data: {
                ...studentData,
                medicamentos: { set: medicamentos?.map((medId: number) => ({ id: medId })) || [] },
                alergias: { set: alergias?.map((alergiaId: number) => ({ id: alergiaId })) || [] },
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
    const studentId = parseInt(id);

    const transaction = await prisma.$transaction(async (tx) => {
      const student = await tx.student.update({
        where: { id: studentId },
        data: { isActive: false },
        include: { guardians: true },
      });

      for (const guardian of student.guardians) {
        const activeChildrenCount = await tx.student.count({
          where: {
            isActive: true,
            guardians: {
              some: {
                id: guardian.id,
              },
            },
          },
        });

        if (activeChildrenCount === 0) {
          await tx.guardian.update({
            where: { id: guardian.id },
            data: { isActive: false },
          });
        }
      }

      return student;
    });

    res.json({ message: 'Estudiante y guardianes correspondientes han sido desactivados.', student: transaction });
  } catch (error) {
    console.error("Error al desactivar al estudiante:", error);
    res.status(500).json({ error: 'No se pudo desactivar el estudiante.' });
  }
};


export const reactivateStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const student = await prisma.student.update({
      where: { id: parseInt(id) },
      data: { isActive: true },
    });
    res.json({ message: 'Estudiante reactivado correctamente.', student });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo reactivar el estudiante.' });
  }
};