// backend/src/controllers/documentController.ts
import type { Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import fsp from 'fs/promises';
import prisma from '../lib/prisma.js';
import type { AuthRequest } from '../types/express.js';
import {
  DocumentOwnerType,
  type Document,
  type Student,
  type TherapistProfile,
  type Guardian,
} from '@prisma/client';

const TMP_UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'tmp');
const DOCUMENT_BASE_DIR = path.join(process.cwd(), 'public', 'documents');
const PUBLIC_ROOT_DIR = path.join(process.cwd(), 'public');

if (!fs.existsSync(TMP_UPLOAD_DIR)) {
  fs.mkdirSync(TMP_UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, TMP_UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

export const documentUpload = multer({ storage });

const ownerSegmentMap: Record<DocumentOwnerType, string> = {
  STUDENT: 'students',
  THERAPIST: 'therapists',
  GUARDIAN: 'guardians',
  MISC: 'misc',
};

const parseOwnerType = (value: unknown): DocumentOwnerType => {
  if (typeof value !== 'string') {
    throw new Error('El tipo de propietario es obligatorio.');
  }

  const normalized = value.trim().toUpperCase();
  if (!Object.prototype.hasOwnProperty.call(DocumentOwnerType, normalized)) {
    throw new Error('Tipo de propietario no válido.');
  }

  return DocumentOwnerType[normalized as keyof typeof DocumentOwnerType];
};

const parseOwnerId = (ownerType: DocumentOwnerType, rawValue: unknown): number | null => {
  if (ownerType === DocumentOwnerType.MISC) {
    if (rawValue === undefined || rawValue === null || rawValue === '') {
      return null;
    }
  }

  if (rawValue === undefined || rawValue === null || rawValue === '') {
    throw new Error('El identificador del propietario es obligatorio para este tipo.');
  }

  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error('El identificador del propietario no es válido.');
  }
  return parsed;
};

const toPublicUrl = (storagePath: string): string => {
  const normalized = storagePath.replace(/\\/g, '/');
  return `/public/${normalized}`;
};

interface DocumentResponse {
  id: number;
  ownerType: DocumentOwnerType;
  ownerId: number | null;
  title: string;
  description: string | null;
  category: string | null;
  fileName: string;
  mimeType: string;
  size: number;
  storagePath: string;
  uploadedBy: number | null;
  metadata: unknown;
  createdAt: Date;
  updatedAt: Date;
  fileUrl: string;
  readOnly: boolean;
  source: 'archivero' | 'legacy';
}

const mapDocument = (doc: Document): DocumentResponse => ({
  ...doc,
  fileUrl: toPublicUrl(doc.storagePath),
  readOnly: false,
  source: 'archivero',
});

const ensurePublicUrl = (value?: string | null): string | null => {
  if (!value) return null;
  let cleaned = value.trim();
  if (!cleaned) return null;
  if (!cleaned.startsWith('/public/')) {
    cleaned = cleaned.startsWith('public/')
      ? `/${cleaned}`
      : `/public/${cleaned.replace(/^\/+/, '')}`;
  }
  return cleaned;
};

const tryStatSize = async (absolutePath: string): Promise<number> => {
  try {
    const stat = await fsp.stat(absolutePath);
    return stat.size;
  } catch {
    return 0;
  }
};

let syntheticIdSeed = -1;

const buildLegacyDocument = async (args: {
  ownerType: DocumentOwnerType;
  ownerId: number | null;
  title: string;
  category: string;
  url: string;
  createdAt: Date;
}): Promise<DocumentResponse | null> => {
  const publicUrl = ensurePublicUrl(args.url);
  if (!publicUrl) return null;

  const storageRelative = publicUrl.replace(/^\/?public\//, '');
  const absolutePath = path.join(PUBLIC_ROOT_DIR, storageRelative);
  const size = await tryStatSize(absolutePath);
  const fileName = path.basename(publicUrl);

  return {
    id: syntheticIdSeed--,
    ownerType: args.ownerType,
    ownerId: args.ownerId,
    title: args.title,
    description: null,
    category: args.category,
    fileName,
    mimeType: 'application/octet-stream',
    size,
    storagePath: storageRelative,
    uploadedBy: null,
    metadata: null,
    createdAt: args.createdAt,
    updatedAt: args.createdAt,
    fileUrl: publicUrl,
    readOnly: true,
    source: 'legacy',
  };
};

const buildLegacyStudentDocuments = async (student: Student): Promise<DocumentResponse[]> => {
  const extras: DocumentResponse[] = [];
  const entries: Array<{ url?: string | null; title: string; category: string }> = [
    {
      url: student.partidaNacimientoUrl ?? undefined,
      title: 'Partida de nacimiento',
      category: 'Documentos de identidad',
    },
    {
      url: student.resultadoEvaluacionUrl ?? undefined,
      title: 'Resultado de evaluación',
      category: 'Evaluaciones',
    },
  ];

  for (const entry of entries) {
    if (!entry.url) continue;
    const legacy = await buildLegacyDocument({
      ownerType: DocumentOwnerType.STUDENT,
      ownerId: student.id,
      title: entry.title,
      category: entry.category,
      url: entry.url,
      createdAt: student.updatedAt ?? student.createdAt,
    });
    if (legacy) extras.push(legacy);
  }
  return extras;
};

const buildLegacyTherapistDocuments = async (therapist: TherapistProfile): Promise<DocumentResponse[]> => {
  const extras: DocumentResponse[] = [];
  const entries: Array<{ url?: string | null; title: string; category: string }> = [
    {
      url: therapist.identityCardUrl ?? undefined,
      title: 'Copia de identidad',
      category: 'Documentos personales',
    },
    {
      url: therapist.resumeUrl ?? undefined,
      title: 'Currículum',
      category: 'Perfil profesional',
    },
  ];

  for (const entry of entries) {
    if (!entry.url) continue;
    const legacy = await buildLegacyDocument({
      ownerType: DocumentOwnerType.THERAPIST,
      ownerId: therapist.id,
      title: entry.title,
      category: entry.category,
      url: entry.url,
      createdAt: therapist.updatedAt ?? therapist.createdAt,
    });
    if (legacy) extras.push(legacy);
  }
  return extras;
};

const buildLegacyGuardianDocuments = async (guardian: Guardian): Promise<DocumentResponse[]> => {
  const extras: DocumentResponse[] = [];
  if (!guardian.copiaIdentidadUrl) return extras;
  const legacy = await buildLegacyDocument({
    ownerType: DocumentOwnerType.GUARDIAN,
    ownerId: guardian.id,
    title: 'Copia de identidad',
    category: 'Documentos personales',
    url: guardian.copiaIdentidadUrl,
    createdAt: guardian.updatedAt ?? guardian.createdAt,
  });
  if (legacy) extras.push(legacy);
  return extras;
};

export const listDocuments = async (req: AuthRequest, res: Response) => {
  try {
    const {
      ownerType: ownerTypeRaw,
      ownerId: ownerIdRaw,
      search,
      category,
      page = '1',
      pageSize = '10',
    } = req.query;

    let ownerTypeFilter: DocumentOwnerType | undefined;
    let ownerIdFilter: number | null | undefined;

    if (ownerTypeRaw !== undefined) {
      ownerTypeFilter = parseOwnerType(ownerTypeRaw);
      ownerIdFilter = parseOwnerId(ownerTypeFilter, ownerIdRaw);
    }

    const pageNumber = Math.max(parseInt(String(page), 10) || 1, 1);
    const pageSizeNumber = Math.min(Math.max(parseInt(String(pageSize), 10) || 10, 1), 100);

    const where: any = {};

    if (ownerTypeFilter) {
      where.ownerType = ownerTypeFilter;
      where.ownerId = ownerIdFilter;
    }

    if (category) {
      where.category = {
        contains: String(category),
      };
    }

    if (search) {
      const searchValue = String(search);
      where.OR = [
        { title: { contains: searchValue } },
        { description: { contains: searchValue } },
        { fileName: { contains: searchValue } },
      ];
    }

    const filteredDbItems = await prisma.document.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    let finalDocuments: DocumentResponse[] = filteredDbItems.map(mapDocument);

    let legacyDocs: DocumentResponse[] = [];
    if (ownerTypeFilter === DocumentOwnerType.STUDENT && ownerIdFilter) {
      const student = await prisma.student.findUnique({ where: { id: ownerIdFilter } });
      if (student) {
        legacyDocs = await buildLegacyStudentDocuments(student);
      }
    } else if (ownerTypeFilter === DocumentOwnerType.THERAPIST && ownerIdFilter) {
      const therapist = await prisma.therapistProfile.findUnique({ where: { id: ownerIdFilter } });
      if (therapist) {
        legacyDocs = await buildLegacyTherapistDocuments(therapist);
      }
    } else if (ownerTypeFilter === DocumentOwnerType.GUARDIAN && ownerIdFilter) {
      const guardian = await prisma.guardian.findUnique({ where: { id: ownerIdFilter } });
      if (guardian) {
        legacyDocs = await buildLegacyGuardianDocuments(guardian);
      }
    }

    let filteredLegacyDocs = legacyDocs;
    if (category) {
      const categoryValue = String(category).toLowerCase();
      filteredLegacyDocs = filteredLegacyDocs.filter(
        (doc) => doc.category && doc.category.toLowerCase().includes(categoryValue),
      );
    }
    if (search) {
      const searchValue = String(search).toLowerCase();
      filteredLegacyDocs = filteredLegacyDocs.filter(
        (doc) =>
          doc.title.toLowerCase().includes(searchValue) ||
          (doc.description || '').toLowerCase().includes(searchValue) ||
          doc.fileName.toLowerCase().includes(searchValue),
      );
    }

    finalDocuments.push(...filteredLegacyDocs);

    finalDocuments.sort((a, b) => new Date(b.createdAt as any).getTime() - new Date(a.createdAt as any).getTime());

    const total = finalDocuments.length;
    const totalPages = Math.max(Math.ceil(total / pageSizeNumber), 1);
    const paginatedDocuments = finalDocuments.slice(
      (pageNumber - 1) * pageSizeNumber,
      pageNumber * pageSizeNumber,
    );

    res.json({
      data: paginatedDocuments,
      pagination: {
        page: pageNumber,
        pageSize: pageSizeNumber,
        total,
        totalPages,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudieron obtener los documentos.';
    console.error('Error in final listDocuments:', error);
    res.status(400).json({ error: message });
  }
};

const moveUploadedFile = async (
  filePath: string,
  ownerType: DocumentOwnerType,
  ownerId: number | null,
  finalFileName: string,
): Promise<{ storagePath: string; absolutePath: string }> => {
  const ownerSegment = ownerSegmentMap[ownerType];
  const ownerFolder = ownerType === DocumentOwnerType.MISC ? 'general' : String(ownerId);
  const destinationDir = path.join(DOCUMENT_BASE_DIR, ownerSegment, ownerFolder);
  await fsp.mkdir(destinationDir, { recursive: true });

  const finalPath = path.join(destinationDir, finalFileName);
  await fsp.rename(filePath, finalPath);

  const relativePath = path.relative(PUBLIC_ROOT_DIR, finalPath).replace(/\\/g, '/');
  return {
    storagePath: relativePath,
    absolutePath: finalPath,
  };
};

export const createDocument = async (req: AuthRequest, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'Se requiere un archivo para subir.' });
    }

    const ownerType = parseOwnerType(req.body.ownerType);
    const ownerId = parseOwnerId(ownerType, req.body.ownerId);

    const title = (req.body.title ?? file.originalname).trim();
    const description = req.body.description?.trim() || null;
    const category = req.body.category?.trim() || null;

    if (!title) {
      return res.status(400).json({ error: 'El título del documento es obligatorio.' });
    }

    const { storagePath } = await moveUploadedFile(file.path, ownerType, ownerId, file.filename);

    const document = await prisma.document.create({
      data: {
        ownerType,
        ownerId,
        title,
        description,
        category,
        fileName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        storagePath,
        uploadedBy: req.user?.id ?? null,
      },
    });

    res.status(201).json({ document: mapDocument(document) });
  } catch (error) {
    console.error('Error al crear documento', error);
    const message = error instanceof Error ? error.message : 'No se pudo crear el documento.';
    res.status(400).json({ error: message });
  } finally {
    if (req.file) {
      try {
        await fsp.rm(req.file.path, { force: true });
      } catch (err) {
        // Archivo ya movido o eliminado, ignorar
      }
    }
  }
};

export const downloadDocument = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: 'Identificador no válido.' });
    }

    const document = await prisma.document.findUnique({ where: { id } });
    if (!document) {
      return res.status(404).json({ error: 'Documento no encontrado.' });
    }

    const filePath = path.join(PUBLIC_ROOT_DIR, document.storagePath);
    try {
      await fsp.access(filePath);
    } catch {
      return res.status(410).json({ error: 'El archivo asociado ya no se encuentra disponible.' });
    }

    res.setHeader('Content-Type', document.mimeType);
    res.download(filePath, document.fileName);
  } catch (error) {
    console.error('Error al descargar documento', error);
    res.status(500).json({ error: 'No se pudo descargar el documento.' });
  }
};

export const deleteDocument = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: 'Identificador no válido.' });
    }

    const document = await prisma.document.findUnique({ where: { id } });
    if (!document) {
      return res.status(404).json({ error: 'Documento no encontrado.' });
    }

    await prisma.document.delete({ where: { id } });

    const filePath = path.join(PUBLIC_ROOT_DIR, document.storagePath);
    try {
      await fsp.unlink(filePath);
    } catch (error) {
      // Si el archivo no existe, lo ignoramos para evitar romper la operación
      console.warn('No se pudo eliminar el archivo físico:', error);
    }

    res.json({ message: 'Documento eliminado correctamente.' });
  } catch (error) {
    console.error('Error al eliminar documento', error);
    res.status(500).json({ error: 'No se pudo eliminar el documento.' });
  }
};