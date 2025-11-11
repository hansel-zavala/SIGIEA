// backend/src/server.ts

import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import leccionRoutes from './routes/leccionRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import guardianRoutes from './routes/guardianRoutes.js';
import therapistRoutes from './routes/therapistRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import medicamentoRoutes from './routes/medicamentoRoutes.js';
import alergiaRoutes from './routes/alergiaRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import reportTemplateRoutes from './routes/reportTemplateRoutes.js';
import reportTemplatePublicRoutes from './routes/reportTemplatePublicRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import tipoParentescoRoutes from './routes/tipoParentescoRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import controlesRoutes from './routes/controlesRoutes.js';
import sessionReportRoutes from './routes/sessionReportRoutes.js';

const app = express();
const PORT = 3001;

app.use(cors({
  exposedHeaders: ['X-New-Token', 'Content-Disposition'], // exponer nombre de archivo para descargas
}));


app.use(express.json());
app.get('/', (req: Request, res: Response) => {
  res.send('API de SIGIEA funcionando correctamente!');
});
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/lecciones', leccionRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/guardians', guardianRoutes);
app.use('/api/therapists', therapistRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/medicamentos', medicamentoRoutes);
app.use('/api/alergias', alergiaRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/report-templates-public', reportTemplatePublicRoutes);
app.use('/api/report-templates', reportTemplateRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/reports-sessions', sessionReportRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/controles', controlesRoutes);
app.use('/api', tipoParentescoRoutes);
app.use('/public', express.static('public'));

app.listen(PORT, () => {
  console.log(`Servidor de SIGIEA corriendo en TypeScript en http://localhost:${PORT}`);
});
