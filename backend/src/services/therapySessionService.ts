// backend/src/services/therapySessionService.ts
import { therapySessionRepository } from '../repositories/therapySessionRepository.js';
import { 
  SessionNotFoundError, 
  TherapistNotFoundError, 
  ScheduleConflictError, 
  WorkHoursError 
} from '../errors/therapySessionErrors.js';

const DAY_MAP = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export const createRecurringSessions = async (data: any) => {
  const { studentId, therapistId, leccionId, daysOfWeek, startTime, duration, weeksToSchedule } = data;

  const therapist = await therapySessionRepository.findTherapistById(therapistId);
  if (!therapist) throw new TherapistNotFoundError();

  const sessionsToCreate: any[] = [];
  const today = new Date();
  const [hour, minute] = startTime.split(':').map(Number);

  for (const dayName of daysOfWeek) {
    const dayNumber = DAY_MAP.indexOf(dayName);
    if (dayNumber === -1) continue;

    let firstDate = new Date(today);
    firstDate.setDate(firstDate.getDate() + (dayNumber - firstDate.getDay() + 7) % 7);
    
    const now = new Date();
    if (firstDate.toDateString() === now.toDateString()) {
        if (hour < now.getHours() || (hour === now.getHours() && minute <= now.getMinutes())) {
             firstDate.setDate(firstDate.getDate() + 7);
        }
    }

    for (let week = 0; week < weeksToSchedule; week++) {
      const sessionDate = new Date(firstDate);
      sessionDate.setDate(sessionDate.getDate() + (week * 7));
      sessionDate.setHours(hour, minute, 0, 0);

      const endTime = new Date(sessionDate.getTime() + duration * 60000);

      const timeString = startTime;
      if (timeString < therapist.workStartTime || timeString > therapist.workEndTime) {
        throw new WorkHoursError(`El horario ${timeString} está fuera del horario laboral.`);
      }
      if (timeString >= therapist.lunchStartTime && timeString < therapist.lunchEndTime) {
        throw new WorkHoursError('La sesión no puede ser durante el almuerzo.');
      }

      sessionsToCreate.push({
        studentId,
        therapistId,
        leccionId,
        startTime: sessionDate,
        endTime,
        duration,
      });
    }
  }

  const timeRanges = sessionsToCreate.map(s => ({ start: s.startTime, end: s.endTime }));
  const conflicts = await therapySessionRepository.findManyConflictingSessions(therapistId, timeRanges);
  
  if (conflicts.length > 0) {
    throw new ScheduleConflictError();
  }

  await therapySessionRepository.createMany(sessionsToCreate);
  return { count: sessionsToCreate.length };
};

export const getSessionsByStudent = async (studentId: number) => {
  return therapySessionRepository.findByStudentId(studentId);
};

export const updateSession = async (sessionId: number, data: any) => {
  const { leccionId, startTime, duration, status, notes, behavior, progress } = data;
  
  const dataToUpdate: any = {};

  if (startTime && duration) {
    const currentSession = await therapySessionRepository.findById(sessionId);
    if (!currentSession) throw new SessionNotFoundError();

    const newStartTime = new Date(startTime);
    const newEndTime = new Date(newStartTime.getTime() + duration * 60000);

    const conflict = await therapySessionRepository.findConflictingSessions(
      currentSession.therapistId,
      newStartTime,
      newEndTime,
      sessionId
    );
    if (conflict) throw new ScheduleConflictError();

    dataToUpdate.startTime = newStartTime;
    dataToUpdate.endTime = newEndTime;
    dataToUpdate.duration = duration;
  }

  if (leccionId) dataToUpdate.leccionId = parseInt(leccionId);
  if (status) dataToUpdate.status = status;
  if (notes !== undefined) dataToUpdate.notes = notes;
  if (behavior !== undefined) dataToUpdate.behavior = behavior;
  if (progress !== undefined) dataToUpdate.progress = progress;

  return therapySessionRepository.update(sessionId, dataToUpdate);
};

export const deleteSession = async (sessionId: number) => {
  const session = await therapySessionRepository.findById(sessionId);
  if (!session) throw new SessionNotFoundError();
  return therapySessionRepository.remove(sessionId);
};