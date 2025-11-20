// backend/src/errors/therapySessionErrors.ts

export class TherapySessionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TherapySessionError';
  }
}

export class SessionNotFoundError extends TherapySessionError {
  constructor(message: string = 'Sesión no encontrada.') {
    super(message);
    this.name = 'SessionNotFoundError';
  }
}

export class TherapistNotFoundError extends TherapySessionError {
  constructor(message: string = 'Terapeuta no encontrado.') {
    super(message);
    this.name = 'TherapistNotFoundError';
  }
}

export class ScheduleConflictError extends TherapySessionError {
  constructor(message: string = 'Conflicto de horario con otra sesión.') {
    super(message);
    this.name = 'ScheduleConflictError';
  }
}

export class WorkHoursError extends TherapySessionError {
  constructor(message: string) {
    super(message);
    this.name = 'WorkHoursError';
  }
}