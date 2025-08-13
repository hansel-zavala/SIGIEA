// backend/src/server.ts

import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import leccionRoutes from './routes/leccionRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import guardianRoutes from './routes/guardianRoutes.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/lecciones', leccionRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/guardians', guardianRoutes);
app.use('/public', express.static('public'));

app.listen(PORT, () => {
  console.log(`Servidor de SIGIEA corriendo en TypeScript en http://localhost:${PORT}`);
});