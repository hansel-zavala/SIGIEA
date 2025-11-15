// backend/src/errors/categoryErrors.ts

// Error base
export class CategoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CategoryError';
  }
}

export class CategoryInUseError extends CategoryError {
  constructor(message: string) {
    super(message);
    this.name = 'CategoryInUseError';
  }
}

export class CategoryNameExistsError extends CategoryError {
  constructor(message: string) {
    super(message);
    this.name = 'CategoryNameExistsError';
  }
}