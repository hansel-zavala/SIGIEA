// backend/src/errors/categoryErrors.ts

// Error base
export class CategoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CategoryError';
  }
}

// Error para cuando se intenta eliminar una categoría en uso
export class CategoryInUseError extends CategoryError {
  constructor(message: string) {
    super(message);
    this.name = 'CategoryInUseError';
  }
}

// Error para cuando el nombre ya existe (P2002)
export class CategoryNameExistsError extends CategoryError {
  constructor(message: string) {
    super(message);
    this.name = 'CategoryNameExistsError';
  }
}