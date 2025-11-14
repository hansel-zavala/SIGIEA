// src/errors/authErrors.ts

export class AuthError extends Error {
  public field: string | null;

  constructor(message: string, field: string | null = null) {
    super(message);
    this.name = 'AuthError';
    this.field = field;
  }
}

export class RateLimitError extends AuthError {
  public timeLeft: number;

  constructor(message: string, timeLeft: number) {
    super(message);
    this.name = 'RateLimitError';
    this.timeLeft = timeLeft;
  }
}