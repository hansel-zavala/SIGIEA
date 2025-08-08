// backend/src/server.ts

import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';
import studentRoutes from './routes/studentRoutes.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);

app.listen(PORT, () => {
  console.log(`Servidor de SIGIEA corriendo en TypeScript en http://localhost:${PORT}`);
});