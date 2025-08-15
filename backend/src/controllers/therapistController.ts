// backend/src/controllers/therapistController.ts
import { Request, Response } from 'express';
import prisma from '../db.js';
import bcrypt from 'bcrypt';

// Crear un nuevo terapeuta
export const createTherapist = async (req: Request, res: Response) => {
    try {
        const { fullName, email, password, specialty, phone, identityNumber } = req.body;
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'El correo electrónico ya está en uso.' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newTherapistProfile = await prisma.therapistProfile.create({
            data: {
                fullName, email, identityNumber, specialty, phone,
                user: {
                    create: { email, password: hashedPassword, role: 'terapeuta', name: fullName, }
                }
            },
            include: { user: { select: { id: true, email: true } } }
        });
        res.status(201).json(newTherapistProfile);
    } catch (error) {
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

// ✅ AÑADIMOS LAS FUNCIONES FALTANTES
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
        const updatedTherapist = await prisma.therapistProfile.update({
            where: { id: parseInt(id) },
            data: req.body
        });
        res.json(updatedTherapist);
    } catch (error) {
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