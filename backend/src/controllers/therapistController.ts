// backend/src/controllers/therapistController.ts

import { Request, Response } from 'express';
import prisma from '../db.js';
import bcrypt from 'bcrypt';

export const createTherapist = async (req: Request, res: Response) => {
    try {
        const { nombres, apellidos, email, password, identityNumber, ...profileData } = req.body;
        const fullName = `${nombres} ${apellidos}`;

        if (!nombres || !apellidos || !email || !password || !identityNumber) {
            return res.status(400).json({ error: 'Nombres, apellidos, email, contraseña e identidad son obligatorios.' });
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
        
        if (profileData.dateOfBirth) {
            profileData.dateOfBirth = new Date(profileData.dateOfBirth);
        }

        const newTherapistProfile = await prisma.therapistProfile.create({
            data: {
                nombres,
                apellidos,
                email,
                identityNumber,
                ...profileData,
                user: {
                    create: {
                        email,
                        password: hashedPassword,
                        role: 'terapeuta',
                        name: fullName,
                    }
                }
            },
            include: { user: true }
        });
        res.status(201).json(newTherapistProfile);
    } catch (error) {
        console.error("Error al crear terapeuta:", error);
        res.status(500).json({ error: 'No se pudo crear el terapeuta.' });
    }
};

export const getAllTherapists = async (req: Request, res: Response) => {
    try {
        const { search, page = '1', limit = '10' } = req.query;
        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const skip = (pageNum - 1) * limitNum;

        const whereCondition = {
            isActive: true,
            ...(search && {
                OR: [
                    { nombres: { contains: search as string } },
                    { apellidos: { contains: search as string } },
                ],
            }),
        };

        const [therapists, totalTherapists] = await prisma.$transaction([
            prisma.therapistProfile.findMany({
                where: whereCondition,
                orderBy: { nombres: 'asc' },
                skip: skip,
                take: limitNum,
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
            where: { id: parseInt(id), isActive: true }
        });
        if (!therapist) return res.status(404).json({ error: 'Terapeuta no encontrado.' });
        res.json(therapist);
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
        console.error("Error al actualizar terapeuta:", error);
        res.status(500).json({ error: 'No se pudo actualizar el terapeuta.' });
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