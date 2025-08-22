// backend/src/controllers/therapySessionController.ts
import { Request, Response } from 'express';
import prisma from '../db.js';

const getNextDateForDay = (startDate: Date, dayOfWeek: number): Date => {
    const resultDate = new Date(startDate.getTime());
    resultDate.setDate(startDate.getDate() + (dayOfWeek + (7 - startDate.getDay())) % 7);
    return resultDate;
};


export const createRecurringSessions = async (req: Request, res: Response) => {
    try {
        const { studentId, therapistId, leccionId, daysOfWeek, startTime, duration, weeksToSchedule } = req.body;
        
        const therapist = await prisma.therapistProfile.findUnique({ where: { id: therapistId } });
        if (!therapist) {
            return res.status(404).json({ error: 'Terapeuta no encontrado.' });
        }

        const sessionsToCreate = [];
        const today = new Date();

        for (let week = 0; week < weeksToSchedule; week++) {
            for (const day of daysOfWeek) {
                const dayNumber = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"].indexOf(day);
                
                let sessionDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + (week * 7));
                sessionDate = getNextDateForDay(sessionDate, dayNumber);
                
                const [hour, minute] = startTime.split(':').map(Number);
                sessionDate.setHours(hour, minute, 0, 0);

                const endTime = new Date(sessionDate.getTime() + duration * 60000);

                if (startTime < therapist.workStartTime || startTime > therapist.workEndTime) {
                     return res.status(400).json({ error: `El horario ${startTime} está fuera del horario laboral del terapeuta.` });
                }
                if (startTime >= therapist.lunchStartTime && startTime < therapist.lunchEndTime) {
                    return res.status(400).json({ error: 'La sesión no puede ser durante la hora de almuerzo del terapeuta.' });
                }

                sessionsToCreate.push({
                    startTime: sessionDate,
                    endTime: endTime,
                    studentId,
                    therapistId,
                    leccionId,
                    duration // ✅ AÑADIMOS EL CAMPO FALTANTE AQUÍ
                });
            }
        }

        const conflictingSessions = await prisma.therapySession.findMany({
            where: {
                therapistId: therapistId,
                OR: sessionsToCreate.map(session => ({
                    AND: [
                        { startTime: { lt: session.endTime } },
                        { endTime: { gt: session.startTime } }
                    ]
                }))
            }
        });

        if (conflictingSessions.length > 0) {
            return res.status(409).json({ error: 'Conflicto de horario. El terapeuta ya tiene una sesión programada en uno de los horarios solicitados.' });
        }
        
        await prisma.therapySession.createMany({
            data: sessionsToCreate
        });

        res.status(201).json({ message: `${sessionsToCreate.length} sesiones creadas exitosamente.` });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'No se pudieron crear las sesiones.' });
    }
};

export const getSessionsByStudent = async (req: Request, res: Response) => {
    try {
        const { studentId } = req.params;
        const sessions = await prisma.therapySession.findMany({
            where: { studentId: parseInt(studentId) },
            include: { leccion: true }
        });
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ error: 'No se pudieron obtener las sesiones.' });
    }
}

export const updateSession = async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;
        const { leccionId, startTime, duration } = req.body;

        const currentSession = await prisma.therapySession.findUnique({
            where: { id: parseInt(sessionId) },
        });

        if (!currentSession) {
            return res.status(404).json({ error: 'Sesión no encontrada.' });
        }

        const newStartTime = new Date(startTime);
        const newEndTime = new Date(newStartTime.getTime() + duration * 60000);

        const conflictingSessions = await prisma.therapySession.findMany({
            where: {
                therapistId: currentSession.therapistId,
                id: { not: parseInt(sessionId) },
                AND: [
                    { startTime: { lt: newEndTime } },
                    { endTime: { gt: newStartTime } }
                ]
            }
        });

        if (conflictingSessions.length > 0) {
            return res.status(409).json({ error: 'Conflicto de horario. El terapeuta ya tiene otra sesión en ese rango.' });
        }

        const updatedSession = await prisma.therapySession.update({
            where: { id: parseInt(sessionId) },
            data: {
                leccionId: parseInt(leccionId),
                startTime: newStartTime,
                endTime: newEndTime,
                duration: duration
            }
        });

        res.json(updatedSession);

    } catch (error) {
        console.error("Error al actualizar la sesión:", error);
        res.status(500).json({ error: 'No se pudo actualizar la sesión.' });
    }
};

export const deleteSession = async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;
        await prisma.therapySession.delete({
            where: { id: parseInt(sessionId) }
        });
        res.status(200).json({ message: 'Sesión eliminada correctamente.' });
    } catch (error) {
        console.error("Error al eliminar la sesión:", error);
        res.status(500).json({ error: 'No se pudo eliminar la sesión.' });
    }
};