// backend/src/services/userService.ts
import { userRepository } from '../repositories/userRepository.js';
import { UserAlreadyExistsError, InvalidCredentialsError } from '../errors/userErrors.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const registerUser = async (data: any) => {
  const { email, password, name, role } = data;

  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    throw new UserAlreadyExistsError();
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await userRepository.create({
    email,
    password: hashedPassword,
    name,
    role,
  });

  const { password: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

export const loginUser = async (data: any) => {
  const { email, password, rememberMe } = data;

  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new InvalidCredentialsError('Usuario no encontrado.'); 
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new InvalidCredentialsError();
  }

  const expiresIn = rememberMe ? '7d' : '8h';

  const token = jwt.sign(
    { id: user.id, role: user.role, name: user.name },
    process.env.JWT_SECRET as string,
    { expiresIn }
  );

  return { token };
};