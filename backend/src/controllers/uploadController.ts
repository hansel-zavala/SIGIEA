// backend/src/controllers/uploadController.ts
import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';

// 1. Configuración de Multer (dónde guardar y cómo nombrar los archivos)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/'); // La carpeta donde se guardan
  },
  filename: function (req, file, cb) {
    // Crea un nombre de archivo único con la fecha para evitar duplicados
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// 2. Creamos la instancia de multer que usaremos como middleware
export const upload = multer({ storage: storage });

// 3. El controlador que responde después de que el archivo se ha subido
export const uploadFile = (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se subió ningún archivo.' });
  }

  // Devolvemos la ruta donde se guardó el archivo
  const filePath = `/public/uploads/${req.file.filename}`;
  res.status(200).json({ filePath });
};