// backend/src/errors/studentErrors.ts

export class StudentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StudentError';
  }
}

export class StudentNotFoundError extends StudentError {
  constructor(message: string = 'Estudiante no encontrado.') {
    super(message);
    this.name = 'StudentNotFoundError';
  }
}

export class GuardianValidationError extends StudentError {
  constructor(message: string) {
    super(message);
    this.name = 'GuardianValidationError';
  }
}

export class ScheduleConflictError extends StudentError {
  constructor(message: string = 'Conflicto de horario con el terapeuta.') {
    super(message);
    this.name = 'ScheduleConflictError';
  }
}