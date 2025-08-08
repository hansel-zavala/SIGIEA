// backend/src/controllers/userController.ts

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'; // ¡Importar!

const prisma = new PrismaClient();

// --- Función de Registro (ya la tienes) ---
export const registerUser = async (req: Request, res: Response) => {
  try {
    console.log("1. Entrando a la función registerUser...");
    const { email, password, name, role } = req.body;
    console.log("2. Datos recibidos del cliente:", { email, name, role });

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("3. Contraseña hasheada correctamente.");

    // El punto más probable donde se puede colgar es aquí:
    console.log("4. Intentando crear el usuario en la base de datos...");
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
      },
    });
    // Si no ves el siguiente log, el problema es 100% con la base de datos.
    console.log("5. ¡Usuario creado con éxito en la BD!");

    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);

  } catch (error) {
    // Es muy importante imprimir el error para saber qué falló
    console.error("¡ERROR! Ocurrió un error en el registro:", error);
    res.status(500).json({ error: 'No se pudo registrar el usuario.' });
  }
};


// --- NUEVA FUNCIÓN DE LOGIN ---
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 1. Buscar al usuario por su email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    // 2. Comparar la contraseña enviada con la hasheada en la BD
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    // 3. Si todo es correcto, generar el Token (JWT)
    const token = jwt.sign(
      { id: user.id, role: user.role }, // Payload: ¿Qué guardamos en el token?
      process.env.JWT_SECRET as string, // La frase secreta del .env
      { expiresIn: '8h' } // Opciones: ¿Cuánto dura el token?
    );

    // 4. Enviar el token al cliente
    res.json({ token });

  } catch (error) {
    res.status(500).json({ error: 'No se pudo iniciar sesión.' });
  }
};

export const getUserProfile = async (req: any, res: Response) => {
  // La información del usuario viene del middleware 'protect'
  const user = req.user;
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ error: 'Usuario no encontrado.' });
  }
};