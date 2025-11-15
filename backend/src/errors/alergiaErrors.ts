// backend/src/errors/alergiaErrors.ts

// Error base para Alergias
export class AlergiaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AlergiaError';
  }
}

// Error para cuando se intenta eliminar una alergia en uso
export class AlergiaInUseError extends AlergiaError {
  constructor(message: string) {
    super(message);
    this.name = 'AlergiaInUseError';
  }
}


 export class AlergiaNameExistsError extends AlergiaError {
   constructor(message: string) {
    super(message);
    this.name = 'AlergiaNameExistsError';
  }
}