// backend/src/controllers/therapistController.ts
import { Request, Response } from 'express';
import prisma from '../db.js';
import bcrypt from 'bcrypt';

// Crear un nuevo terapeuta
export const createTherapist = async (req: Request, res: Response) => {
    try {
        const { fullName, email, password, identityNumber, ...profileData } = req.body;

        // --- Validaciones ---
        if (!fullName || !email || !password || !identityNumber) {
            return res.status(400).json({ error: 'Nombre, email, contraseña e identidad son obligatorios.' });
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
        
        // Convertimos la fecha si viene del frontend
        if (profileData.dateOfBirth) {
            profileData.dateOfBirth = new Date(profileData.dateOfBirth);
        }

        const newTherapistProfile = await prisma.therapistProfile.create({
            data: {
                fullName,
                email,
                identityNumber,
                ...profileData, // Resto de datos del perfil (teléfono, especialidad, etc.)
                user: {
                    create: {
                        email,
                        password: hashedPassword,
                        role: 'terapeuta', // Rol asignado por defecto
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

// Obtener todos los perfiles de terapeutas
export const getAllTherapists = async (req: Request, res: Response) => {
    try {
        const therapists = await prisma.therapistProfile.findMany({
            where: { isActive: true }
        });
        res.json(therapists);
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

// Actualizar un terapeuta
export const updateTherapist = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { email, fullName, identityNumber, ...profileData } = req.body;

        if (profileData.dateOfBirth) {
            profileData.dateOfBirth = new Date(profileData.dateOfBirth);
        }

        // Si se cambia el email o el nombre, también actualizamos el modelo User asociado
        if (email || fullName) {
            const profile = await prisma.therapistProfile.findUnique({ where: { id: parseInt(id) }});
            if (profile) {
                await prisma.user.update({
                    where: { id: profile.userId },
                    data: {
                        email: email,
                        name: fullName
                    }
                });
            }
        }

        const updatedTherapist = await prisma.therapistProfile.update({
            where: { id: parseInt(id) },
            data: { email, fullName, identityNumber, ...profileData }
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