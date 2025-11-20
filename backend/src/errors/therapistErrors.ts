// backend/src/errors/therapistErrors.ts

export class TherapistError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TherapistError';
  }
}

export class TherapistNotFoundError extends TherapistError {
  constructor(message: string = 'Terapeuta no encontrado.') {
    super(message);
    this.name = 'TherapistNotFoundError';
  }
}

export class EmailInUseError extends TherapistError {
  constructor(message: string = 'El correo electrónico ya está en uso.') {
    super(message);
    this.name = 'EmailInUseError';
  }
}

export class IdentityInUseError extends TherapistError {
  constructor(message: string = 'El número de identidad ya está registrado.') {
    super(message);
    this.name = 'IdentityInUseError';
  }
}