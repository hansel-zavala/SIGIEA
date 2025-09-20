// backend/src/controllers/therapistController.ts

import { Request, Response } from 'express';
import prisma from '../db.js';
import bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { toCsv, sendCsvResponse, buildTimestampedFilename } from '../utils/csv.js';

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
                    role: 'terapeuta',
                    name: fullName,
                }
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

export const getAllTherapists = async (req: Request, res: Response) => {
    try {
        const { search, page = '1', limit = '10', status } = req.query;
        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const skip = (pageNum - 1) * limitNum;

        const whereCondition: Prisma.TherapistProfileWhereInput = {}; 

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
            assignedStudents: therapist.assignedStudents.map(student => ({
                ...student,
                fullName: `${student.nombres} ${student.apellidos}`,
            })),
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

        if (format !== 'csv') {
            return res.status(400).json({ error: 'Formato no soportado. Actualmente solo se permite CSV.' });
        }

        const whereCondition: Prisma.TherapistProfileWhereInput = {};
        if (status === 'active') whereCondition.isActive = true;
        if (status === 'inactive') whereCondition.isActive = false;

        const therapists = await prisma.therapistProfile.findMany({
            where: whereCondition,
            orderBy: [
                { isActive: 'desc' },
                { createdAt: 'desc' },
            ],
            include: {
                assignedStudents: {
                    select: { id: true, nombres: true, apellidos: true, isActive: true },
                },
            },
        });

        const rows = therapists.map((therapist) => [
            therapist.id,
            `${therapist.nombres} ${therapist.apellidos}`,
            therapist.email,
            therapist.specialty,
            therapist.identityNumber,
            therapist.assignedStudents.filter((s) => s.isActive).map((s) => `${s.nombres} ${s.apellidos}`).join('; '),
            therapist.assignedStudents.filter((s) => !s.isActive).map((s) => `${s.nombres} ${s.apellidos}`).join('; '),
            therapist.isActive ? 'Activo' : 'Inactivo',
            therapist.createdAt.toISOString(),
        ]);

        const headers = [
            'ID',
            'Nombre completo',
            'Correo electrónico',
            'Especialidad',
            'Número de identidad',
            'Estudiantes activos',
            'Estudiantes inactivos',
            'Estado',
            'Fecha de registro',
        ];

        const csv = toCsv(headers, rows);
        const filename = buildTimestampedFilename(`terapeutas-${status}`);
        sendCsvResponse(res, filename, csv);
    } catch (error) {
        res.status(500).json({ error: 'No se pudo exportar la lista de terapeutas.' });
    }
};
