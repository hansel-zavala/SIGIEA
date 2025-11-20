// backend/src/errors/tipoParentescoErrors.ts

export class TipoParentescoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TipoParentescoError';
  }
}

export class TipoParentescoNotFoundError extends TipoParentescoError {
  constructor(message: string = 'Tipo de parentesco no encontrado.') {
    super(message);
    this.name = 'TipoParentescoNotFoundError';
  }
}