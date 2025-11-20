// backend/src/errors/userErrors.ts

export class UserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UserError';
  }
}

export class UserAlreadyExistsError extends UserError {
  constructor(message: string = 'El usuario ya existe.') {
    super(message);
    this.name = 'UserAlreadyExistsError';
  }
}

export class InvalidCredentialsError extends UserError {
  constructor(message: string = 'Credenciales inválidas.') {
    super(message);
    this.name = 'InvalidCredentialsError';
  }
}