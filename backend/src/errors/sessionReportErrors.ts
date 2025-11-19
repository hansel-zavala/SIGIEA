// backend/src/errors/sessionReportErrors.ts

export class SessionReportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SessionReportError';
  }
}

export class StudentNotFoundError extends SessionReportError {
  constructor(message: string = 'Estudiante no encontrado.') {
    super(message);
    this.name = 'StudentNotFoundError';
  }
}

export class ReportAccessDeniedError extends SessionReportError {
  constructor(message: string = 'Acceso denegado.') {
    super(message);
    this.name = 'ReportAccessDeniedError';
  }
}