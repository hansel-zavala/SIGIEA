// backend/src/services/uploadService.ts
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import fsp from 'fs/promises';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

export const uploadMiddleware = multer({ storage });


export const processUpload = (file?: Express.Multer.File) => {
  if (!file) {
    throw new Error('No se ha subido ningún archivo.');
  }
  return `/uploads/${file.filename}`;
};

export const deleteFile = async (filename: string) => {
  const safeFilename = path.basename(filename);
  const filePath = path.join(UPLOAD_DIR, safeFilename);

  try {
    await fsp.access(filePath);
    await fsp.unlink(filePath);
  } catch (error) {
    throw new Error('El archivo no existe o no se pudo eliminar.');
  }
};