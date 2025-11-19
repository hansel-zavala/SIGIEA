// backend/src/errors/reportErrors.ts

export class ReportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ReportError';
  }
}

export class ReportNotFoundError extends ReportError {
  constructor(message: string = 'Reporte no encontrado.') {
    super(message);
    this.name = 'ReportNotFoundError';
  }
}

export class ReportDuplicateError extends ReportError {
  public existingReportId: number;
  constructor(message: string, existingReportId: number) {
    super(message);
    this.name = 'ReportDuplicateError';
    this.existingReportId = existingReportId;
  }
}

export class ReportAccessDeniedError extends ReportError {
  constructor(message: string = 'No autorizado para acceder a este reporte.') {
    super(message);
    this.name = 'ReportAccessDeniedError';
  }
}

export class TemplateNotFoundError extends ReportError {
  constructor(message: string = 'Plantilla no encontrada.') {
    super(message);
    this.name = 'TemplateNotFoundError';
  }
}