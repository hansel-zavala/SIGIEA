// backend/src/errors/medicamentoErrors.ts

export class MedicamentoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MedicamentoError';
  }
}

export class MedicamentoInUseError extends MedicamentoError {
  constructor(message: string) {
    super(message);
    this.name = 'MedicamentoInUseError';
  }
}