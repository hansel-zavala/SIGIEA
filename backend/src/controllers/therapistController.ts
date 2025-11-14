// backend/src/controllers/therapistController.ts

import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import bcrypt from 'bcrypt';
import { Prisma, Role, PermissionType } from '@prisma/client';
import { AuthRequest } from '../types/express.js';
import { toCsv, sendCsvResponse, buildTimestampedFilename } from '../utils/csv.js';
import { sendExcelResponse } from '../utils/excel.js';
import { sendPdfTableResponse } from '../utils/pdf.js';

export const createTherapist = async (req: Request, res: Response) => {
    try {
        const { 
            nombres, apellidos, email, password, identityNumber, 
            lugarNacimiento, direccion, specialty, hireDate, 
            identityCardUrl, resumeUrl, workDays, workStartTime, 
            workEndTime, lunchStartTime, lunchEndTime, ...profileData 
        } = req.body;
        
        const fullName = `${nombres} ${apellidos}`;

        if (!nombres || !apellidos || !email || !password || !identityNumber || !specialty) {
            return res.status(400).json({ error: 'Los campos de nombres, apellidos, email, contraseña, identidad y cargo son obligatorios.' });
        }
        
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ error: 'El correo electrónico ya está en uso.' });
        }
        const existingProfile = await prisma.therapistProfile.findUnique({ where: { identityNumber } });
        if (existingProfile) {
            return res.status(409).json({ error: 'El número de identidad ya está registrado.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const dataForPrisma = {
            ...profileData,
            nombres,
            apellidos,
            email,
            identityNumber,
            lugarNacimiento,
            direccion,
            specialty,
            hireDate: hireDate ? new Date(hireDate) : new Date(),
            identityCardUrl,
            resumeUrl,
            workDays: workDays || ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
            workEndTime,
            lunchStartTime,
            lunchEndTime,
            user: {
                create: {
                    email,
                    password: hashedPassword,
                    role: Role.THERAPIST,
                    name: fullName,
                }
            },
            permissions: {
                create: [
                    { permission: PermissionType.VIEW_STUDENTS, granted: true },
                    { permission: PermissionType.EDIT_STUDENTS, granted: true },
                    { permission: PermissionType.MANAGE_SESSIONS, granted: true },
                    { permission: PermissionType.VIEW_REPORTS, granted: true },
                    { permission: PermissionType.CREATE_REPORTS, granted: true },
                    { permission: PermissionType.MANAGE_DOCUMENTS, granted: true },
                    { permission: PermissionType.VIEW_GUARDIANS, granted: true },
                    { permission: PermissionType.VIEW_EVENTS, granted: true },
                    { permission: PermissionType.VIEW_THERAPISTS, granted: true },
                    { permission: PermissionType.VIEW_MATRICULA, granted: true },
                    { permission: PermissionType.VIEW_TEMPLATES, granted: true },
                    { permission: PermissionType.VIEW_DASHBOARD, granted: true },
                    { permission: PermissionType.VIEW_CONTROLS, granted: true },
                    { permission: PermissionType.VIEW_DOCUMENTS, granted: true },
                    { permission: PermissionType.UPLOAD_FILES, granted: true },
                    { permission: PermissionType.DOWNLOAD_FILES, granted: true },
                ]
            }
        };
        
        if (profileData.dateOfBirth) {
            dataForPrisma.dateOfBirth = new Date(profileData.dateOfBirth);
        }

        const newTherapistProfile = await prisma.therapistProfile.create({
            data: dataForPrisma,
            include: { user: true }
        });

        res.status(201).json(newTherapistProfile);

    } catch (error) {
        console.error("Error al crear el perfil:", error);
        res.status(500).json({ error: 'No se pudo crear el perfil del personal.' });
    }
};

export const getAllTherapists = async (req: AuthRequest, res: Response) => {
    try {
        const { search, page = '1', limit = '10', status } = req.query;
        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const skip = (pageNum - 1) * limitNum;

        const whereCondition: Prisma.TherapistProfileWhereInput = {};

        // Role-based filtering
        if (req.user?.role === 'PARENT' && req.user.guardian) {
            // Parents only see therapists assigned to their students
            whereCondition.assignedStudents = {
                some: {
                    guardians: {
                        some: { id: req.user.guardian.id }
                    }
                }
            };
        }

        if (status === 'active') {
            whereCondition.isActive = true;
        } else if (status === 'inactive') {
            whereCondition.isActive = false;
        }

        if (search) {
            const searchQuery = (search as string).trim();
            if (searchQuery.length > 0) {
                const terms = searchQuery.split(/\s+/);
                const existingAnd = Array.isArray(whereCondition.AND)
                    ? whereCondition.AND
                    : whereCondition.AND
                        ? [whereCondition.AND]
                        : [];

                whereCondition.AND = [
                    ...existingAnd,
                    ...terms.map(term => ({
                        OR: [
                            { nombres: { contains: term } },
                            { apellidos: { contains: term } },
                            { specialty: { contains: term } },
                        ],
                    })),
                ];
            }
        }
        
        const [therapists, totalTherapists] = await prisma.$transaction([
            prisma.therapistProfile.findMany({
                where: whereCondition,
                orderBy: [
                    { isActive: 'desc' }, 
                    { createdAt: 'desc' }
                ],
                skip: skip,
                take: limitNum,
                include: {
                    assignedStudents: {
                        where: { isActive: true },
                    },
                },
            }),
            prisma.therapistProfile.count({ where: whereCondition }),
        ]);

        const therapistsWithFullName = therapists.map(t => ({
            ...t,
            fullName: `${t.nombres} ${t.apellidos}`
        }));

        res.json({
            data: therapistsWithFullName,
            total: totalTherapists,
            page: pageNum,
            totalPages: Math.ceil(totalTherapists / limitNum),
        });
    } catch (error) {
        res.status(500).json({ error: 'No se pudieron obtener los terapeutas.' });
    }
};

export const getTherapistById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const therapist = await prisma.therapistProfile.findFirst({
            where: { id: parseInt(id), isActive: true },
            include: {
                assignedStudents: {
                    where: { isActive: true },
                },
            },
        });
        if (!therapist) return res.status(404).json({ error: 'Terapeuta no encontrado.' });
        
        const therapistWithDetails = {
            ...therapist,
            fullName: `${therapist.nombres} ${therapist.apellidos}`,
            assignedStudents: therapist.assignedStudents.map(student => {
                const { 
                    atencionGrupal, atencionIndividual, atencionPrevocacional, 
                    atencionDistancia, terapiaDomicilio, atencionVocacional, 
                    inclusionEscolar, educacionFisica, ...restOfStudent 
                } = student;

                return {
                    ...restOfStudent,
                    fullName: `${student.nombres} ${student.apellidos}`,
                    tipoAtencion: {
                        atencionGrupal,
                        atencionIndividual,
                        atencionPrevocacional,
                        atencionDistancia,
                        terapiaDomicilio,
                        atencionVocacional,
                        inclusionEscolar,
                        educacionFisica,
                    },
                };
            }),
        };

        res.json(therapistWithDetails);
    } catch (error) {
        res.status(500).json({ error: 'No se pudo obtener el terapeuta.' });
    }
};

export const updateTherapist = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { email, nombres, apellidos, password, ...profileData } = req.body;
        const fullName = `${nombres} ${apellidos}`;

        if (profileData.dateOfBirth) {
            profileData.dateOfBirth = new Date(profileData.dateOfBirth);
        }
        if (profileData.hireDate) {
            profileData.hireDate = new Date(profileData.hireDate);
        }

        const profile = await prisma.therapistProfile.findUnique({ where: { id: parseInt(id) }});
        if (profile) {
            const userDataToUpdate: { email?: string; name?: string; password?: string } = {
                email: email,
                name: fullName
            };

            if (password) {
                const hashedPassword = await bcrypt.hash(password, 10);
                userDataToUpdate.password = hashedPassword;
            }
            
            await prisma.user.update({
                where: { id: profile.userId },
                data: userDataToUpdate
            });
        }

        const updatedTherapist = await prisma.therapistProfile.update({
            where: { id: parseInt(id) },
            data: { email, nombres, apellidos, ...profileData }
        });
        res.json(updatedTherapist);
    } catch (error) {
        console.error("Error al actualizar el perfil:", error);
        res.status(500).json({ error: 'No se pudo actualizar el perfil del personal.' });
    }
};

export const deleteTherapist = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.therapistProfile.update({
            where: { id: parseInt(id) },
            data: { isActive: false }
        });
        res.json({ message: 'Terapeuta desactivado correctamente.' });
    } catch (error) {
        res.status(500).json({ error: 'No se pudo desactivar el terapeuta.' });
    }
};

export const reactivateTherapist = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.therapistProfile.update({
            where: { id: parseInt(id) },
            data: { isActive: true },
        });
        res.json({ message: 'Terapeuta reactivado correctamente.' });
    } catch (error) {
        res.status(500).json({ error: 'No se pudo reactivar al terapeuta.' });
    }
};

export const exportTherapists = async (req: Request, res: Response) => {
    try {
        const { status = 'all', format = 'csv' } = req.query as { status?: string; format?: string };

        const where: any = {};
        if (status === 'active') {where.isActive = true;} 
            else if (status === 'inactive') {where.isActive = false;
        }

        const whereCondition: Prisma.TherapistProfileWhereInput = {};
        if (status === 'active') whereCondition.isActive = true;
        if (status === 'inactive') whereCondition.isActive = false;

        const therapists = await prisma.therapistProfile.findMany({
            where,
            select: {
                id: true,
                nombres: true,
                apellidos: true,
                email: true,
                specialty: true,
                identityNumber: true,
                isActive: true,
                createdAt: true,
                assignedStudents: {
                    select:{
                        id: true,
                        nombres: true,
                        apellidos: true,
                        isActive: true
                    },
                    orderBy:{ isActive: 'desc' }, 
                },
            },
            orderBy: { nombres: 'asc' },
        });

        const filenameBase = `terapeutas-${status}`;

        const processedData = therapists.map((t) => {
            const primaryStudent = t.assignedStudents[0];
            return {
                id: t.id,
                fullName: `${t.nombres} ${t.apellidos}`,
                identityNumber: t.identityNumber,
                specialty: t.specialty,
                email: t.email,
                fullnamestudent: primaryStudent ? `${primaryStudent.nombres} ${primaryStudent.apellidos}` : 'N/A',
                createAt: t.createdAt.toISOString().split('T')[0],
                isActive: t.isActive,
            };
        });

        const headersForExcel = [
            { key: 'id', header: 'Id', width: 10 },
            { key: 'fullname', header: 'Nombre Completo', width: 30 },
            { key: 'identityNumber', header: 'Número de identidad', width: 20 },
            { key: 'specialty', header: 'Especialidad', width: 20 },
            { key: 'email', header: 'Correo electrónico', width: 30 },
            { key: 'createAt', header: 'Fecha de registro', width: 20 },
            { key: 'isActive', header: 'Estado', width: 15 },
        ];
        
        const dataForExcel = processedData.map((t) => ({ ...t, isActive: t.isActive ? 'Activo' : 'Inactivo' }));

        const headersForPdfAndCsv = ['Id', 'Nombre Completo', 'Numero de Identidad', 'Especialidad', 'Email', 'Fecha de registro', 'Estado']
        const dataForPdfAndCsv = processedData.map((t) => [
            t.id,
            t.fullName,
            t.identityNumber,
            t.specialty,
            t.email,
            t.createAt,
            t.isActive ? 'Activo' : 'Inactivo',
        ]);

        switch (format) {
            case 'excel':
                const excelFilename = buildTimestampedFilename(filenameBase, 'xlsx'); 
                await sendExcelResponse(res, excelFilename, headersForExcel, dataForExcel);
                break;
        
            case 'pdf':
                const pdfFilename = buildTimestampedFilename(filenameBase, 'pdf');
                sendPdfTableResponse(res, pdfFilename, {
                    title: 'Lista de Terapeutas',
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

export const exportAssignedStudents = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { format = 'csv' } = req.query as { format?: string };

        const therapist = await prisma.therapistProfile.findUnique({
            where: { id: parseInt(id) },
            include: {
                assignedStudents: {
                    where: { isActive: true },
                    orderBy: { nombres: 'asc' },
                },
            },
        });

        if (!therapist) {
            return res.status(404).json({ error: 'Terapeuta no encontrado.' });
        }

        const filenameBase = `alumnos-asignados-${therapist.nombres}-${therapist.apellidos}`.toLowerCase().replace(/\s+/g, '-');

        const formatAttentionTypes = (student: any) => {
            const types = [
                student.atencionIndividual && 'Individual',
                student.atencionGrupal && 'Grupal',
                student.atencionPrevocacional && 'Prevocacional',
                student.atencionDistancia && 'A distancia',
                student.terapiaDomicilio && 'Domicilio',
                student.atencionVocacional && 'Vocacional',
                student.inclusionEscolar && 'Inclusión Escolar',
                student.educacionFisica && 'Educación Física',
            ].filter(Boolean);
            return types.join(', ') || 'No especificado';
        };

        const processedData = therapist.assignedStudents.map((s) => ({
            id: s.id,
            fullName: `${s.nombres} ${s.apellidos}`,
            dateOfBirth: s.dateOfBirth.toISOString().split('T')[0],
            jornada: s.jornada || 'No especificada',
            genero: s.genero || 'No especificado',
            tiposDeAtencion: formatAttentionTypes(s),
        }));

        const headers = [
            { key: 'id', header: 'ID', width: 10 },
            { key: 'fullName', header: 'Nombre Completo', width: 30 },
            { key: 'dateOfBirth', header: 'Fecha de Nacimiento', width: 20 },
            { key: 'jornada', header: 'Jornada', width: 20 },
            { key: 'genero', header: 'Género', width: 15 },
            { key: 'tiposDeAtencion', header: 'Tipos de Atención', width: 40 },
        ];

        const dataForPdfAndCsv = processedData.map((s) => [
            s.id,
            s.fullName,
            s.dateOfBirth,
            s.jornada,
            s.genero,
            s.tiposDeAtencion,
        ]);

        switch (format) {
            case 'excel':
                const excelFilename = buildTimestampedFilename(filenameBase, 'xlsx');
                await sendExcelResponse(res, excelFilename, headers, processedData);
                break;
            case 'pdf':
                const pdfFilename = buildTimestampedFilename(filenameBase, 'pdf');
                sendPdfTableResponse(res, pdfFilename, {
                    title: `Alumnos Asignados a ${therapist.nombres} ${therapist.apellidos}`,
                    headers: headers.map(h => h.header),
                    rows: dataForPdfAndCsv,
                });
                break;
            default:
                const csvFilename = buildTimestampedFilename(filenameBase, 'csv');
                const csvContent = toCsv(headers.map(h => h.header), dataForPdfAndCsv);
                sendCsvResponse(res, csvFilename, csvContent);
                break;
        }
    } catch (error) {
        console.error('Error al exportar estudiantes asignados:', error);
        res.status(500).json({ error: 'No se pudo generar el archivo de exportación.' });
    }
};
