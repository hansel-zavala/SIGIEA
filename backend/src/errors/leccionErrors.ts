// backend/src/errors/leccionErrors.ts

export class LeccionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LeccionError';
  }
}

export class LeccionNotFoundError extends LeccionError {
  constructor(message: string = 'Lección no encontrada.') {
    super(message);
    this.name = 'LeccionNotFoundError';
  }
}