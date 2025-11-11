// backend/src/controllers/authController.ts

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendPasswordResetEmail } from '../services/emailService.js';

const prisma = new PrismaClient();

export const sendResetCode = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        error: 'El correo electrónico es requerido',
        field: 'email' 
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'El formato del correo electrónico no es válido',
        field: 'email' 
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetCode: resetCode,
          resetCodeExpiry: expires,
        },
      });

      await sendPasswordResetEmail(user.email, resetCode);
    }

    res.status(200).json({ 
      message: 'Si existe una cuenta con ese correo, se ha enviado un código de recuperación.' 
    });

  } catch (error) {
    console.error("Error in sendResetCode:", error);
    res.status(500).json({ error: 'No se pudo procesar la solicitud.' });
  }
};

export const resendResetCode = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        error: 'El correo electrónico es requerido',
        field: 'email' 
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (user.resetCodeExpiry && user.resetCodeExpiry > new Date()) {
      const timeLeft = Math.ceil((user.resetCodeExpiry.getTime() - Date.now()) / 1000);
      if (timeLeft > 60) { // If more than 1 minute left
        return res.status(429).json({ 
          error: 'Debes esperar antes de solicitar un nuevo código',
          timeLeft 
        });
      }
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetCode: resetCode,
        resetCodeExpiry: expires,
      },
    });

    await sendPasswordResetEmail(user.email, resetCode);

    res.status(200).json({ 
      message: 'Código reenviado exitosamente',
      timeLeft: 15 * 60
    });

  } catch (error) {
    console.error("Error in resendResetCode:", error);
    res.status(500).json({ error: 'No se pudo reenviar el código.' });
  }
};

export const verifyCode = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ 
        error: 'Faltan datos requeridos',
        missingFields: !email ? ['email'] : !code ? ['code'] : []
      });
    }

    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({ 
        error: 'El código debe tener 6 dígitos',
        field: 'code' 
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (!user.resetCode || user.resetCode !== code) {
      return res.status(400).json({ error: 'El código es incorrecto' });
    }

    if (!user.resetCodeExpiry || user.resetCodeExpiry < new Date()) {
      return res.status(400).json({ error: 'El código ha expirado' });
    }

    const timeLeft = Math.ceil((user.resetCodeExpiry.getTime() - Date.now()) / 1000);

    res.status(200).json({ 
      message: 'Código verificado correctamente',
      timeLeft,
      expiresAt: user.resetCodeExpiry
    });

  } catch (error) {
    console.error("Error in verifyCode:", error);
    res.status(500).json({ error: 'No se pudo verificar el código.' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ 
        error: 'Faltan datos requeridos',
        missingFields: [
          ...(!email ? ['email'] : []),
          ...(!code ? ['code'] : []),
          ...(!newPassword ? ['newPassword'] : [])
        ]
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        error: 'La contraseña debe tener al menos 6 caracteres',
        field: 'newPassword',
        minLength: 6
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (!user.resetCode || user.resetCode !== code) {
      return res.status(400).json({ error: 'El código es incorrecto' });
    }

    if (!user.resetCodeExpiry || user.resetCodeExpiry < new Date()) {
      return res.status(400).json({ error: 'El código ha expirado' });
    }

    const bcrypt = require('bcrypt');
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ 
        error: 'La nueva contraseña no puede ser igual a la anterior',
        field: 'newPassword'
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetCode: null,
        resetCodeExpiry: null,
      },
    });

    res.status(200).json({ 
      message: 'Contraseña actualizada correctamente. Ya puedes iniciar sesión con tu nueva contraseña.' 
    });

  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({ error: 'No se pudo actualizar la contraseña.' });
  }
};