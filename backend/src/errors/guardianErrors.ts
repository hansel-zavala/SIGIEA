// backend/src/errors/guardianErrors.ts

export class GuardianError extends Error {
  public field: string | null;
  constructor(message: string, field: string | null = null) {
    super(message);
    this.name = 'GuardianError';
    this.field = field;
  }
}

export class GuardianNotFoundError extends GuardianError {
  constructor(message: string = 'Guardián no encontrado.') {
    super(message);
    this.name = 'GuardianNotFoundError';
  }
}

export class EmailInUseError extends GuardianError {
  constructor(message: string = 'El correo electrónico ya está en uso.') {
    super(message, 'email');
    this.name = 'EmailInUseError';
  }
}

export class ReactivationError extends GuardianError {
  constructor(message: string) {
    super(message);
    this.name = 'ReactivationError';
  }
}