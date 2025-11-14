// src/services/authService.ts
import bcrypt from 'bcrypt';
import { authRepository } from '../repositories/authRepository.js';
import { sendPasswordResetEmail } from './emailService.js'; //
import { AuthError, RateLimitError } from '../errors/authErrors.js';

const CODE_EXPIRATION_MINUTES = 15;
const RESEND_WAIT_MINUTES = 1;

const generateResetCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateCodeExpiry = (): Date => {
  return new Date(Date.now() + CODE_EXPIRATION_MINUTES * 60 * 1000);
};

export const sendResetCode = async (email: string) => {
  const user = await authRepository.findUserByEmail(email);

  if (user) {
    const resetCode = generateResetCode();
    const expires = generateCodeExpiry();

    await authRepository.updateUserResetCode(user.id, resetCode, expires);
    await sendPasswordResetEmail(user.email, resetCode);
  }

  return 'Si existe una cuenta con ese correo, se ha enviado un código de recuperación.';
};

export const resendResetCode = async (email: string) => {
  const user = await authRepository.findUserByEmail(email);

  if (!user) {
    return { 
      message: 'Si existe una cuenta con ese correo, se ha enviado un nuevo código.', 
      timeLeft: CODE_EXPIRATION_MINUTES * 60 
    };
  }

  if (user.resetCodeExpiry && user.resetCodeExpiry > new Date()) {
    const timeLeft = Math.ceil((user.resetCodeExpiry.getTime() - Date.now()) / 1000);
    const waitTime = (CODE_EXPIRATION_MINUTES - RESEND_WAIT_MINUTES) * 60;
    
    if (timeLeft > (CODE_EXPIRATION_MINUTES * 60 - waitTime)) {
      throw new RateLimitError(
        'Debes esperar antes de solicitar un nuevo código',
        timeLeft - (CODE_EXPIRATION_MINUTES * 60 - waitTime)
      );
    }
  }

  const resetCode = generateResetCode();
  const expires = generateCodeExpiry();
  
  await authRepository.updateUserResetCode(user.id, resetCode, expires);
  await sendPasswordResetEmail(user.email, resetCode);

  return { 
    message: 'Código reenviado exitosamente', 
    timeLeft: CODE_EXPIRATION_MINUTES * 60 
  };
};

export const verifyCode = async (email: string, code: string) => {
  const user = await authRepository.findUserByEmail(email);

  if (!user || !user.resetCode || user.resetCode !== code || !user.resetCodeExpiry || user.resetCodeExpiry < new Date()) {
    throw new AuthError('Código incorrecto o expirado');
  }

  const timeLeft = Math.ceil((user.resetCodeExpiry.getTime() - Date.now()) / 1000);

  return {
    message: 'Código verificado correctamente',
    timeLeft,
    expiresAt: user.resetCodeExpiry
  };
};

export const resetPassword = async (email: string, code: string, newPassword: string) => {
  const user = await authRepository.findUserByEmail(email);

  if (!user || !user.resetCode || user.resetCode !== code || !user.resetCodeExpiry || user.resetCodeExpiry < new Date()) {
    throw new AuthError('Código incorrecto o expirado');
  }

  const isSamePassword = await bcrypt.compare(newPassword, user.password);
  if (isSamePassword) {
    throw new AuthError('La nueva contraseña no puede ser igual a la anterior', 'newPassword');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await authRepository.updateUserPassword(user.id, hashedPassword);

  return {
    message: 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.'
  };
};