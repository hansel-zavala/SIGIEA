// backend/src/controllers/userController.ts

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '../services/emailService.js';

const prisma = new PrismaClient();

export const registerUser = async (req: Request, res: Response) => {
  try {
    console.log("1. Entrando a la función registerUser...");
    const { email, password, name, role } = req.body;
    console.log("2. Datos recibidos del cliente:", { email, name, role });

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("3. Contraseña hasheada correctamente.");

    console.log("4. Intentando crear el usuario en la base de datos...");
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
      },
    });
    console.log("5. ¡Usuario creado con éxito en la BD!");

    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);

  } catch (error) {
    console.error("¡ERROR! Ocurrió un error en el registro:", error);
    res.status(500).json({ error: 'No se pudo registrar el usuario.' });
  }
};


export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET as string,
      { expiresIn: '8h' }
    );

    res.json({ token });

  } catch (error) {
    res.status(500).json({ error: 'No se pudo iniciar sesión.' });
  }
};

export const getUserProfile = async (req: any, res: Response) => {
  const user = req.user;
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ error: 'Usuario no encontrado.' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos desde ahora

      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetCode: resetCode,
          resetCodeExpiry: expires,
        },
      });

      await sendPasswordResetEmail(user.email, resetCode);
    }

    res.status(200).json({ message: 'Si existe una cuenta con ese correo, se ha enviado un código de recuperación.' });

  } catch (error) {
    console.error("Error en forgotPassword:", error);
    res.status(500).json({ error: 'No se pudo procesar la solicitud.' });
  }
};

export const verifyResetCode = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: 'Faltan datos (email, code).' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(400).json({ error: 'El código o el correo son inválidos.' });
    }

    if (!user.resetCode || user.resetCode !== code) {
      return res.status(400).json({ error: 'El código es incorrecto.' });
    }

    if (!user.resetCodeExpiry || user.resetCodeExpiry < new Date()) {
      return res.status(400).json({ error: 'El código ha expirado.' });
    }

    res.status(200).json({ message: 'Código válido.' });

  } catch (error) {
    console.error("Error en verifyResetCode:", error);
    res.status(500).json({ error: 'No se pudo verificar el código.' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'Faltan datos (email, code, newPassword).' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(400).json({ error: 'El código o el correo son inválidos.' });
    }

    if (!user.resetCode || user.resetCode !== code) {
      return res.status(400).json({ error: 'El código es incorrecto.' });
    }

    if (!user.resetCodeExpiry || user.resetCodeExpiry < new Date()) {
      return res.status(400).json({ error: 'El código ha expirado.' });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ error: 'La nueva contraseña no puede ser igual a la anterior.' });
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

    res.status(200).json({ message: 'Contraseña actualizada correctamente.' });

  } catch (error) {
    console.error("Error en resetPassword:", error);
    res.status(500).json({ error: 'No se pudo resetear la contraseña.' });
  }
};