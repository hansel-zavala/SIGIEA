// backend/src/services/documentService.ts
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import fsp from 'fs/promises';
import { documentRepository } from '../repositories/documentRepository.js';
import { DocumentOwnerType, Prisma } from '@prisma/client';
import type { AuthRequest } from '../types/express.js';
import type { Document } from '@prisma/client';

const TMP_UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'tmp');
const DOCUMENT_BASE_DIR = path.join(process.cwd(), 'public', 'documents');
const PUBLIC_ROOT_DIR = path.join(process.cwd(), 'public');

if (!fs.existsSync(TMP_UPLOAD_DIR)) {
  fs.mkdirSync(TMP_UPLOAD_DIR, { recursive: true });
}

const ownerSegmentMap: Record<DocumentOwnerType, string> = {
  STUDENT: 'students',
  THERAPIST: 'therapists',
  GUARDIAN: 'guardians',
  MISC: 'misc',
};

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

export class DocumentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DocumentError';
  }
}
export class DocumentNotFoundError extends DocumentError {
  constructor(message: string = 'Documento no encontrado.') {
    super(message);
    this.name = 'DocumentNotFoundError';
  }
}
export class FileAccessError extends DocumentError {
  constructor(message: string = 'El archivo asociado ya no se encuentra disponible.') {
    super(message);
    this.name = 'FileAccessError';
  }
}

const parseOwnerType = (value: unknown): DocumentOwnerType => {
  if (typeof value !== 'string') {
    throw new DocumentError('El tipo de propietario es obligatorio.');
  }
  const normalized = value.trim().toUpperCase();
  if (!Object.prototype.hasOwnProperty.call(DocumentOwnerType, normalized)) {
    throw new DocumentError('Tipo de propietario no válido.');
  }
  return DocumentOwnerType[normalized as keyof typeof DocumentOwnerType];
};

const parseOwnerId = (ownerType: DocumentOwnerType, rawValue: unknown): number | null => {
  if (ownerType === DocumentOwnerType.MISC) {
    return (rawValue === undefined || rawValue === null || rawValue === '') ? null : Number(rawValue);
  }
  if (rawValue === undefined || rawValue === null || rawValue === '') {
    throw new DocumentError('El identificador del propietario es obligatorio.');
  }
  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new DocumentError('El identificador del propietario no es válido.');
  }
  return parsed;
};

const toPublicUrl = (storagePath: string): string => {
  const normalized = storagePath.replace(/\\/g, '/');
  return `/public/${normalized}`;
};

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
    cleaned = cleaned.startsWith('public/') ? `/${cleaned}` : `/public/${cleaned.replace(/^\/+/, '')}`;
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

export const listDocuments = async (queryParams: any) => {
  const {
    ownerType: ownerTypeRaw,
    ownerId: ownerIdRaw,
    search,
    category,
    page = '1',
    pageSize = '10',
  } = queryParams;

  let ownerTypeFilter: DocumentOwnerType | undefined;
  let ownerIdFilter: number | null | undefined;

  if (ownerTypeRaw !== undefined) {
    ownerTypeFilter = parseOwnerType(ownerTypeRaw);
    ownerIdFilter = parseOwnerId(ownerTypeFilter, ownerIdRaw);
  }

  const pageNumber = Math.max(parseInt(String(page), 10) || 1, 1);
  const pageSizeNumber = Math.min(Math.max(parseInt(String(pageSize), 10) || 10, 1), 100);

  const where: Prisma.DocumentWhereInput = {};
  if (ownerTypeFilter) {
    where.ownerType = ownerTypeFilter;
    where.ownerId = ownerIdFilter;
  }
  if (category) where.category = { contains: String(category) };
  if (search) {
    const searchValue = String(search);
    where.OR = [
      { title: { contains: searchValue } },
      { description: { contains: searchValue } },
      { fileName: { contains: searchValue } },
    ];
  }

  const dbItems = await documentRepository.findDocuments(where);
  let finalDocuments: DocumentResponse[] = dbItems.map(mapDocument);

  let legacyDocs: DocumentResponse[] = [];
  if (ownerTypeFilter === DocumentOwnerType.STUDENT && ownerIdFilter) {
    const student = await documentRepository.findLegacyStudent(ownerIdFilter);
    if (student) {
      const docs = [
        { url: student.partidaNacimientoUrl, title: 'Partida de nacimiento', category: 'Documentos de identidad' },
        { url: student.resultadoEvaluacionUrl, title: 'Resultado de evaluación', category: 'Evaluaciones' },
      ];
      for (const entry of docs) {
        if (entry.url) {
          const legacy = await buildLegacyDocument({
            ownerType: DocumentOwnerType.STUDENT, ownerId: student.id, title: entry.title, category: entry.category,
            url: entry.url, createdAt: student.updatedAt ?? student.createdAt,
          });
          if (legacy) legacyDocs.push(legacy);
        }
      }
    }
  } else if (ownerTypeFilter === DocumentOwnerType.THERAPIST && ownerIdFilter) {
    const therapist = await documentRepository.findLegacyTherapist(ownerIdFilter);
    if (therapist) {
    }
  } else if (ownerTypeFilter === DocumentOwnerType.GUARDIAN && ownerIdFilter) {
    const guardian = await documentRepository.findLegacyGuardian(ownerIdFilter);
    if (guardian && guardian.copiaIdentidadUrl) {
    }
  }

  let filteredLegacyDocs = legacyDocs;
  if (category) {
    filteredLegacyDocs = filteredLegacyDocs.filter(doc => doc.category?.toLowerCase().includes(String(category).toLowerCase()));
  }
  if (search) {
    filteredLegacyDocs = filteredLegacyDocs.filter(doc => 
        doc.title.toLowerCase().includes(String(search).toLowerCase()) ||
        doc.fileName.toLowerCase().includes(String(search).toLowerCase())
    );
  }

  finalDocuments.push(...filteredLegacyDocs);
  finalDocuments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const total = finalDocuments.length;
  const totalPages = Math.max(Math.ceil(total / pageSizeNumber), 1);
  const paginatedDocuments = finalDocuments.slice(
    (pageNumber - 1) * pageSizeNumber,
    pageNumber * pageSizeNumber,
  );

  return {
    data: paginatedDocuments,
    pagination: { page: pageNumber, pageSize: pageSizeNumber, total, totalPages },
  };
};

const moveUploadedFile = async (
  file: Express.Multer.File,
  ownerType: DocumentOwnerType,
  ownerId: number | null,
): Promise<{ storagePath: string; absolutePath: string }> => {
  const ownerSegment = ownerSegmentMap[ownerType];
  const ownerFolder = ownerType === DocumentOwnerType.MISC ? 'general' : String(ownerId);
  const destinationDir = path.join(DOCUMENT_BASE_DIR, ownerSegment, ownerFolder);
  await fsp.mkdir(destinationDir, { recursive: true });

  const finalPath = path.join(destinationDir, file.filename);
  await fsp.rename(file.path, finalPath);

  const relativePath = path.relative(PUBLIC_ROOT_DIR, finalPath).replace(/\\/g, '/');
  return { storagePath: relativePath, absolutePath: finalPath };
};

export const createDocument = async (
  file: Express.Multer.File, 
  body: any, 
  user: AuthRequest['user']
) => {
  const ownerType = parseOwnerType(body.ownerType);
  const ownerId = parseOwnerId(ownerType, body.ownerId);

  const title = (body.title ?? file.originalname).trim();
  if (!title) {
    throw new DocumentError('El título del documento es obligatorio.');
  }
  
  const { storagePath } = await moveUploadedFile(file, ownerType, ownerId);

  const dataToCreate: Prisma.DocumentCreateInput = {
    ownerType,
    ownerId,
    title,
    description: body.description?.trim() || null,
    category: body.category?.trim() || null,
    fileName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    storagePath,
  };

  if (user?.id) {
    dataToCreate.uploadedByUser = {
      connect: { id: user.id }
    };
  }

  const document = await documentRepository.createDocument(dataToCreate);

  return mapDocument(document);
};

export const getDownloadableDocument = async (id: number) => {
  const document = await documentRepository.findDocumentById(id);
  if (!document) {
    throw new DocumentNotFoundError();
  }

  const filePath = path.join(PUBLIC_ROOT_DIR, document.storagePath);
  try {
    await fsp.access(filePath);
  } catch {
    throw new FileAccessError();
  }

  return {
    filePath,
    fileName: document.fileName,
    mimeType: document.mimeType,
  };
};

export const deleteDocument = async (id: number) => {
  const document = await documentRepository.findDocumentById(id);
  if (!document) {
    throw new DocumentNotFoundError();
  }

  await documentRepository.deleteDocumentById(id);

  const filePath = path.join(PUBLIC_ROOT_DIR, document.storagePath);
  try {
    await fsp.unlink(filePath);
  } catch (error) {
    console.warn('No se pudo eliminar el archivo físico (puede que ya estuviera borrado):', error);
  }

  return { message: 'Documento eliminado correctamente.' };
};