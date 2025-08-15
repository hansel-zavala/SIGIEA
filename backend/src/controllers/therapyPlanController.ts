// backend/src/controllers/therapyPlanController.ts
import { Request, Response } from 'express';
import prisma from '../db.js';

export const createTherapyPlan = async (req: Request, res: Response) => {
    try {
        const { studentId } = req.params;
        const { dayOfWeek, time, leccionId } = req.body;
        const therapistId = req.user?.id;

        if (!therapistId) {
            return res.status(401).json({ error: 'Usuario no autenticado.' });
        }

        const newPlan = await prisma.therapyPlan.create({
            data: {
                dayOfWeek,
                time,
                studentId: parseInt(studentId),
                therapistId,
                leccionId: parseInt(leccionId),
            },
        });
        res.status(201).json(newPlan);
    } catch (error) {
        res.status(500).json({ error: 'No se pudo crear el plan.' });
    }
};

export const getTherapyPlanById = async (req: Request, res: Response) => {
    try {
        const { planId } = req.params;
        const plan = await prisma.therapyPlan.findUnique({ where: { id: parseInt(planId) } });
        if (!plan) return res.status(404).json({ error: 'Plan no encontrado.' });
        res.json(plan);
    } catch (error) { res.status(500).json({ error: 'Error al obtener el plan.' }); }
};

export const updateTherapyPlan = async (req: Request, res: Response) => {
    try {
        const { planId } = req.params;
        const { dayOfWeek, time, leccionId } = req.body;
        const updatedPlan = await prisma.therapyPlan.update({
            where: { id: parseInt(planId) },
            data: { dayOfWeek, time, leccionId: parseInt(leccionId) },
        });
        res.json(updatedPlan);
    } catch (error) { res.status(500).json({ error: 'No se pudo actualizar el plan.' }); }
};

export const deleteTherapyPlan = async (req: Request, res: Response) => {
    try {
        const { planId } = req.params;
        const updatedPlan = await prisma.therapyPlan.update({
            where: { id: parseInt(planId) },
            data: { isActive: false },
        });
        res.json({ message: 'Plan desactivado.', plan: updatedPlan });
    } catch (error) { res.status(500).json({ error: 'No se pudo desactivar el plan.' }); }
};