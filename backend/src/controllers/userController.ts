// backend/src/controllers/userController.ts

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

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