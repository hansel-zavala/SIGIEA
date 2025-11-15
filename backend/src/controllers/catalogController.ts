// backend/src/controllers/controlesController.ts

import { Response } from 'express';
import { getAllControls as getAllControlsService } from '../services/catalogService.js';

export const getAllControls = async (req: Request, res: Response) => {
  try {
    const controles = await getAllControlsService();
    
    res.json(controles);
    
  } catch (error) {
    console.error("Error al obtener los controles:", error);
    res.status(500).json({ error: 'No se pudieron obtener los datos de control.' });
  }
};