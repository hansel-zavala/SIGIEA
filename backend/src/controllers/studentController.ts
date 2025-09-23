// backend/src/controllers/studentController.ts

import { Request, Response } from 'express';
import { Parentesco, PrismaClient, Role } from '@prisma/client';
import { AuthRequest } from '../types/express.js';
import bcrypt from 'bcrypt';
import { toCsv, sendCsvResponse, buildTimestampedFilename } from '../utils/csv.js';
import { sendExcelResponse } from '../utils/excel.js';
import { sendPdfTableResponse } from '../utils/pdf.js';

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
    for (const g of guardians) {
      if (!g?.numeroIdentidad) {
        return res.status(400).json({ error: 'Cada guardián debe incluir el número de identidad (DNI).' });
      }
      const exists = await prisma.guardian.findUnique({ where: { numeroIdentidad: g.numeroIdentidad } });
      if (!exists) {
        const missing: string[] = [];
        if (!g.nombres) missing.push('nombres');
        if (!g.apellidos) missing.push('apellidos');
        if (!g.telefono) missing.push('telefono');
        if (!g.parentesco) missing.push('parentesco');
        if (missing.length) {
          return res.status(400).json({
            error: `Faltan campos para crear al guardián con DNI ${g.numeroIdentidad}: ${missing.join(', ')}`,
          });
        }
      }
    }

    // Validar correos únicos para guardianes con credenciales
    const guardianCreds = guardians.filter((g: any) => g.email && g.password);
    if (guardianCreds.length) {
      const emails = guardianCreds.map((g: any) => g.email);
      const duplicates = emails.filter((e: string, i: number) => emails.indexOf(e) !== i);
      if (duplicates.length) {
        return res.status(400).json({ error: `Correos duplicados en tutores: ${Array.from(new Set(duplicates)).join(', ')}` });
      }

      // Verificar que no existan ya como usuarios
      const existingUsers = await prisma.user.findMany({ where: { email: { in: emails } }, select: { email: true } });
      if (existingUsers.length) {
        return res.status(409).json({ error: `El correo ya está en uso: ${existingUsers.map(u => u.email).join(', ')}` });
      }
    }

    if (studentData.dateOfBirth) studentData.dateOfBirth = new Date(studentData.dateOfBirth);
    if (studentData.anoIngreso) studentData.anoIngreso = new Date(studentData.anoIngreso);

    // Prepara datos de creación (hash contraseñas si vienen)
    const hashedMap: Record<string, string> = {};
    await Promise.all(guardianCreds.map(async (g: any) => {
      hashedMap[g.email] = await bcrypt.hash(String(g.password), 10);
    }));

    // Si el guardián ya existe y se proporcionaron credenciales, crear usuario y asociarlo
    for (const g of guardianCreds) {
      const existing = await prisma.guardian.findUnique({ where: { numeroIdentidad: g.numeroIdentidad } });
      if (existing && !existing.userId) {
        const newUser = await prisma.user.create({
          data: {
            email: g.email,
            password: hashedMap[g.email],
            role: Role.PARENT,
            name: `${g.nombres} ${g.apellidos}`,
          }
        });
        await prisma.guardian.update({ where: { id: existing.id }, data: { userId: newUser.id } });
      }
    }

    const newStudent = await prisma.student.create({
      data: {
        ...studentData,
        guardians: {
          connectOrCreate: guardians.map((g: any) => ({
            where: { numeroIdentidad: g.numeroIdentidad },
            create: {
              nombres: g.nombres,
              apellidos: g.apellidos,
              direccionEmergencia: g.direccionEmergencia || null,
              numeroIdentidad: g.numeroIdentidad,
              telefono: g.telefono,
              parentesco: g.parentesco,
              parentescoEspecifico: g.parentescoEspecifico,
              copiaIdentidadUrl: g.copiaIdentidadUrl || null,
              observaciones: g.observaciones || null,
              ...(g.email && g.password ? {
                user: {
                  create: {
                    email: g.email,
                    password: hashedMap[g.email],
                    role: Role.PARENT,
                    name: `${g.nombres} ${g.apellidos}`,
                  }
                }
              } : {}),
            },
          })),
        },
        medicamentos: { connect: medicamentos?.map((id: number) => ({ id })) || [] },
        alergias: { connect: alergias?.map((id: number) => ({ id })) || [] },
      },
      include: { guardians: true, medicamentos: true, alergias: true },
    });

    res.status(201).json(newStudent);
  } catch (error) {
    console.error("Error al crear la matrícula:", error);
    res.status(500).json({ error: 'No se pudo procesar la matrícula.' });
  }
};

export const addGuardianToStudent = async (req: Request, res: Response) => {
  try {
    const studentId = parseInt(req.params.id);
    const body: any = req.body;

    const required = ['numeroIdentidad', 'parentesco'];
    for (const f of required) if (!body[f]) return res.status(400).json({ error: `Campo requerido: ${f}` });

    const student = await prisma.student.findUnique({ where: { id: studentId }, include: { guardians: true } });
    if (!student) return res.status(404).json({ error: 'Estudiante no encontrado.' });

    // Validar que no existan dos Padres/Madres asociados al mismo estudiante
    if (body.parentesco === 'Padre' && student.guardians.some(g => g.parentesco === 'Padre')) {
      return res.status(400).json({ error: 'Ya existe un Padre registrado para este estudiante.' });
    }
    if (body.parentesco === 'Madre' && student.guardians.some(g => g.parentesco === 'Madre')) {
      return res.status(400).json({ error: 'Ya existe una Madre registrada para este estudiante.' });
    }

    // Email único si se envía
    if (body.email) {
      const existingUser = await prisma.user.findUnique({ where: { email: body.email } });
      if (existingUser) return res.status(409).json({ error: 'El correo electrónico ya está en uso.' });
    }

    // Buscar guardián por DNI
    const existingGuardian = await prisma.guardian.findUnique({ where: { numeroIdentidad: body.numeroIdentidad } });

    let guardianId: number;
    if (existingGuardian) {
      // si ya está vinculado, error
      const alreadyLinked = await prisma.student.findFirst({ where: { id: studentId, guardians: { some: { id: existingGuardian.id } } } });
      if (alreadyLinked) return res.status(409).json({ error: 'Este guardián ya está asociado al estudiante.' });

      // Actualizar datos básicos opcionales
      const updated = await prisma.guardian.update({
        where: { id: existingGuardian.id },
        data: {
          nombres: body.nombres ?? existingGuardian.nombres,
          apellidos: body.apellidos ?? existingGuardian.apellidos,
          telefono: body.telefono ?? existingGuardian.telefono,
          parentesco: body.parentesco ?? existingGuardian.parentesco,
          parentescoEspecifico: body.parentescoEspecifico ?? existingGuardian.parentescoEspecifico,
          direccionEmergencia: body.direccionEmergencia ?? existingGuardian.direccionEmergencia,
          copiaIdentidadUrl: body.copiaIdentidadUrl ?? existingGuardian.copiaIdentidadUrl,
        }
      });
      guardianId = updated.id;

      // Crear user si viene email+password y aún no tiene
      if (!updated.userId && body.email && body.password) {
        const newUser = await prisma.user.create({
          data: {
            email: body.email,
            password: await bcrypt.hash(String(body.password), 10),
            role: Role.PARENT,
            name: `${updated.nombres} ${updated.apellidos}`,
          }
        });
        await prisma.guardian.update({ where: { id: guardianId }, data: { userId: newUser.id } });
      }
    } else {
      // Crear guardián y asociar usuario si corresponde
      const createData: any = {
        nombres: body.nombres,
        apellidos: body.apellidos,
        numeroIdentidad: body.numeroIdentidad,
        telefono: body.telefono,
        parentesco: body.parentesco,
        parentescoEspecifico: body.parentescoEspecifico,
        direccionEmergencia: body.direccionEmergencia,
        copiaIdentidadUrl: body.copiaIdentidadUrl,
      };
      if (body.email && body.password) {
        createData.user = {
          create: {
            email: body.email,
            password: await bcrypt.hash(String(body.password), 10),
            role: Role.PARENT,
            name: `${body.nombres} ${body.apellidos}`,
          }
        };
      }
      const created = await prisma.guardian.create({ data: createData });
      guardianId = created.id;
    }

    // Vincular al estudiante
    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: { guardians: { connect: { id: guardianId } } },
      include: { guardians: true }
    });

    res.status(201).json(updatedStudent);
  } catch (error) {
    console.error('Error al agregar guardián:', error);
    res.status(500).json({ error: 'No se pudo agregar el guardián.' });
  }
};
export const getAllStudents = async (req: AuthRequest, res: Response) => {
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

    // Role-based filtering
    if (req.user?.role === Role.THERAPIST && req.user.therapistProfile) {
      whereCondition.therapistId = req.user.therapistProfile.id;
    } else if (req.user?.role === Role.PARENT && req.user.guardian) {
      whereCondition.guardians = { some: { id: req.user.guardian.id } };
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

        // Validation for therapist assignment conflicts
        if (therapistId) {
            const currentStudent = await prisma.student.findUnique({
                where: { id: parseInt(id) },
                include: { therapySessions: true }
            });

            if (!currentStudent) {
                return res.status(404).json({ error: 'Estudiante no encontrado.' });
            }

            if (parseInt(therapistId) !== currentStudent.therapistId) {
                // Check for schedule conflicts
                for (const session of currentStudent.therapySessions) {
                    const conflictingSession = await prisma.therapySession.findFirst({
                        where: {
                            therapistId: parseInt(therapistId),
                            studentId: { not: parseInt(id) },
                            OR: [
                                {
                                    AND: [
                                        { startTime: { lte: session.startTime } },
                                        { endTime: { gt: session.startTime } }
                                    ]
                                },
                                {
                                    AND: [
                                        { startTime: { lt: session.endTime } },
                                        { endTime: { gte: session.endTime } }
                                    ]
                                },
                                {
                                    AND: [
                                        { startTime: { gte: session.startTime } },
                                        { endTime: { lte: session.endTime } }
                                    ]
                                }
                            ]
                        }
                    });

                    if (conflictingSession) {
                        return res.status(400).json({
                            error: 'El terapeuta tiene un conflicto de horario con otra sesión programada.'
                        });
                    }
                }
            }
        }

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

    const result = await prisma.$transaction(async (tx) => {
      const student = await tx.student.update({
        where: { id: studentId },
        data: { isActive: false },
      });

      const guardians = await tx.guardian.findMany({
        where: { students: { some: { id: studentId } } },
        select: { id: true },
      });

      for (const g of guardians) {
        const activeChildrenCount = await tx.student.count({
          where: { isActive: true, guardians: { some: { id: g.id } } },
        });
        if (activeChildrenCount === 0) {
          await tx.guardian.update({ where: { id: g.id }, data: { isActive: false } });
        }
      }

      return student;
    });

    res.json({ message: 'Estudiante desactivado correctamente.', student: result });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo desactivar el estudiante.' });
  }
};

export const reactivateStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const studentId = parseInt(id);

    const result = await prisma.$transaction(async (tx) => {
      const student = await tx.student.update({
        where: { id: studentId },
        data: { isActive: true },
      });

      const guardians = await tx.guardian.findMany({
        where: { students: { some: { id: studentId } } },
        select: { id: true, isActive: true },
      });

      for (const g of guardians) {
        const activeChildrenCount = await tx.student.count({
          where: { isActive: true, guardians: { some: { id: g.id } } },
        });
        if (!g.isActive && activeChildrenCount > 0) {
          await tx.guardian.update({ where: { id: g.id }, data: { isActive: true } });
        }
      }

      return student;
    });

    res.json({ message: 'Estudiante reactivado correctamente.', student: result });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo reactivar el estudiante.' });
  }
};

export const exportStudents = async (req: AuthRequest, res: Response) => {
  try {
    const { status = 'all', format = 'csv' } = req.query as { status: string; format: string };

    const where: any = {};
    if (status === 'active') {where.isActive = true;}
      else if (status === 'inactive') {where.isActive = false;
    }

    // Role-based filtering
    if (req.user?.role === Role.THERAPIST && req.user.therapistProfile) {
      where.therapistId = req.user.therapistProfile.id;
    } else if (req.user?.role === Role.PARENT && req.user.guardian) {
      where.guardians = { some: { id: req.user.guardian.id } };
    }

    const students = await prisma.student.findMany({
      where,
      select: {
        id: true,
        nombres: true,
        apellidos: true,
        dateOfBirth: true,
        anoIngreso: true,
        isActive: true,
        guardians: {
          select: {
            nombres: true,
            apellidos: true,
            numeroIdentidad: true,
            telefono: true,
            parentesco: true,
            user: { select: { email: true } },
          },
          orderBy: { isActive: 'asc' },
          take: 1,
        },
        therapist: {
          select: {
            nombres: true,
            apellidos: true,
          },
        },
      },
      orderBy: { nombres: 'asc' },
    });

    const filenameBase = `estudiantes-${status}`;

    const processedData = students.map(s => {
      const primaryGuardian = s.guardians[0];
      return {
        id: s.id,
        fullName: `${s.nombres} ${s.apellidos}`,
        fullnametherapist: s.therapist ? `${s.therapist.nombres} ${s.therapist.apellidos}` : 'N/A',
        fullnameguardian: `${primaryGuardian?.nombres ?? 'N/A'} ${primaryGuardian?.apellidos ?? 'N/A'}`,
        telefono: primaryGuardian?.telefono ?? 'N/A',
        Parentesco: primaryGuardian?.parentesco ?? 'N/A',
        anoIngreso: s.anoIngreso.toISOString().split('T')[0],
        isActive: s.isActive,
      };
    });

    const headersForExcel = [
      { key: 'id', header: 'Id', width: 10 },
      { key: 'fullName', header: 'Nombre del Estudiante', width: 30 },
      { key: 'fullnametherapist', header: 'Nombre de Terapeuta', width: 35 },
      { key: 'fullnameguardian', header: 'Nombre de Padre/Tutor', width: 35 },
      { key: 'telefono', header: 'Teléfono', width: 20 },
      { key: 'Parentesco', header: 'Parentesco', width: 20 },
      { key: 'anoIngreso', header: 'Fecha de Ingreso', width: 20 },
      { key: 'isActive', header: 'Estado', width: 15 },
    ];
    const dataForExcel = processedData.map((s) => ({ ...s, isActive: s.isActive ? 'Activo' : 'Inactivo' }));

    const headersForPdfAndCsv = ['Id', 'Nombre Completo', 'Nombre de Terapeuta','Nombre de Padre/Tutor', 'Teléfono (Tutor)', 'Parentesco', 'Año de Ingreso', 'Estado'];
    const dataForPdfAndCsv = processedData.map((s) => [
      s.id,
      s.fullName,
      s.fullnametherapist,
      s.fullnameguardian,
      s.telefono,
      s.Parentesco,
      s.anoIngreso,
      s.isActive ? 'Activo' : 'Inactivo',
    ]);

    switch (format) {
      case 'excel':
        const excelFilename = buildTimestampedFilename(filenameBase, 'xlsx'); 
        await sendExcelResponse(res, excelFilename, headersForExcel, dataForExcel);
        break;

      case 'pdf':
        const pdfFilename = buildTimestampedFilename(filenameBase, 'pdf');
        sendPdfTableResponse(res, pdfFilename, {
          title: 'Lista de Estudiantes',
          headers: headersForPdfAndCsv,
          rows: dataForPdfAndCsv,
        });
        break;

      default:
        const csvFilename = buildTimestampedFilename(filenameBase, 'csv');
        const csvContent = toCsv(headersForPdfAndCsv, dataForPdfAndCsv);
        sendCsvResponse(res, csvFilename, csvContent);
        break;
    }
  } catch (error) {
    console.error('Error al exportar estudiantes:', error);
    res.status(500).json({ error: 'No se pudo generar el archivo de exportación.' });
  }
};
