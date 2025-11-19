// backend/src/errors/reportTemplateErrors.ts

export class ReportTemplateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ReportTemplateError';
  }
}

export class TemplateNotFoundError extends ReportTemplateError {
  constructor(message: string = 'Plantilla no encontrada.') {
    super(message);
    this.name = 'TemplateNotFoundError';
  }
}

export class TemplateTitleExistsError extends ReportTemplateError {
  constructor(message: string = 'Ya existe una plantilla con este título.') {
    super(message);
    this.name = 'TemplateTitleExistsError';
  }
}