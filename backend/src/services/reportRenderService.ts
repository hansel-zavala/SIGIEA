// Servicio orquestador para renderizar reportes a PDF o DOCX
// Obtiene el reporte de Prisma y delega a los renderers

import prisma from '../lib/prisma.js';
import { promises as fs } from 'fs';
import path from 'path';
import { renderReportPdf } from '../lib/renderers/pdfRenderer.js';
import { renderReportDocx } from '../lib/renderers/docxRenderer.js';

export type RenderFormat = 'pdf' | 'docx';
export type RenderSize = 'A4' | 'OFICIO';

export async function renderReportById(reportId: number, format: RenderFormat, size: RenderSize) {
  // Carga completa del reporte con secciones, ítems y respuestas
  const report = await prisma.report.findUnique({
    where: { id: reportId },
    include: {
      student: {
        include: {
          guardians: true,
          therapist: true,
        },
      },
      therapist: { select: { name: true, email: true } },
      template: {
        include: {
          sections: { orderBy: { order: 'asc' }, include: { items: { orderBy: { order: 'asc' } } } },
        },
      },
      itemAnswers: true,
    },
  });

  if (!report) throw new Error('Reporte no encontrado');

  const title = report.template.title;

  // Intenta cargar logo desde /public/logo.(png|jpg|jpeg|svg)
  const { logoBuffer, logoDataUrl } = await tryLoadLogo();
  const institutionName = process.env.INSTITUTION_NAME || 'SIGIEA';

  if (format === 'pdf') {
    const buffer = await renderReportPdf(report as any, { size, title, logoDataUrl, institutionName });
    return { buffer, mime: 'application/pdf', filename: safeFilename(`${title}.pdf`) };
  } else {
    const buffer = await renderReportDocx(report as any, { size, title, logoBuffer, institutionName });
    return { buffer, mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', filename: safeFilename(`${title}.docx`) };
  }
}

// Sanea un nombre de archivo simple
function safeFilename(name: string) {
  return name.replace(/[\\/:*?"<>|]/g, '_');
}

// Busca un logo en la carpeta public y devuelve buffer y dataUrl
async function tryLoadLogo() {
  const pub = path.resolve(process.cwd(), 'public');
  const candidates = ['logo.png', 'logo.jpg', 'logo.jpeg', 'logo.svg'];
  for (const name of candidates) {
    const p = path.join(pub, name);
    try {
      const data = await fs.readFile(p);
      const ext = path.extname(name).toLowerCase();
      const mime = ext === '.png' ? 'image/png' : ext === '.svg' ? 'image/svg+xml' : 'image/jpeg';
      const b64 = data.toString('base64');
      const dataUrl = `data:${mime};base64,${b64}`;
      return { logoBuffer: data, logoDataUrl: dataUrl };
    } catch (_) {
      // continua con siguiente candidato
    }
  }
  return { logoBuffer: null as any, logoDataUrl: null as any };
}
