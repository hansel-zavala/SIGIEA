// Servicio de render DOCX usando 'docx'
// Genera documento Word en A4 u Oficio con cortes controlados

import type { Report, ReportItem, ReportItemAnswer, ReportSection, ReportTemplate, Student, User } from '@prisma/client';

export type PageSize = 'A4' | 'OFICIO';

export interface DocxRenderOptions {
  size: PageSize; // Tamaño de papel
  title?: string; // Título opcional de documento
  logoBuffer?: Buffer | null; // Logo para encabezado
  institutionName?: string; // Pie con nombre de institución
}

type FullReport = Report & {
  student: Student;
  therapist: Pick<User, 'name' | 'email'>;
  template: ReportTemplate & {
    sections: (ReportSection & { items: ReportItem[] })[];
  };
  itemAnswers: ReportItemAnswer[];
};

function buildAnswerMap(answers: ReportItemAnswer[]) {
  const map = new Map<number, string>();
  for (const a of answers) {
    if (a.level !== null && a.level !== undefined) {
      map.set(a.itemId, String(a.level));
    } else if (a.valueJson !== null && a.valueJson !== undefined) {
      map.set(a.itemId, typeof a.valueJson === 'string' ? a.valueJson : JSON.stringify(a.valueJson));
    } else {
      map.set(a.itemId, '');
    }
  }
  return map;
}

// Convierte mm → twips (1 in = 25.4 mm; 1 in = 1440 twips) 
function mmToTwips(mm: number): number {
  return Math.round((mm / 25.4) * 1440);
}

// Convierte pulgadas → twips
function inToTwips(inches: number): number {
  return Math.round(inches * 1440);
}

export async function renderReportDocx(report: FullReport, opts: DocxRenderOptions): Promise<Buffer> {
  // Importación dinámica para fallar con mensaje claro si falta la lib
  let Docx: any; // usar any para evitar error de tipos si no está instalada
  try {
    const moduleName = 'docx';
    // Evita que TypeScript resuelva tipos del módulo si no está instalado
    Docx = await (0, eval)(`import(${JSON.stringify(moduleName)})`);
  } catch (e) {
    throw new Error('Dependencia faltante: instala docx (npm i docx)');
  }

  const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageOrientation, Header, Footer, PageNumber, ImageRun, Table, TableRow, TableCell, WidthType, BorderStyle } = Docx;

  // Configura tamaño y márgenes
  const marginTw = mmToTwips(20); // 20mm en todos los lados
  const page = opts.size === 'A4'
    ? { width: Docx.PageSize.A4_WIDTH, height: Docx.PageSize.A4_HEIGHT }
    : { width: inToTwips(8.5), height: inToTwips(13) }; // Oficio

  // Encabezado simple (título + meta)
  const title = new Paragraph({
    text: opts.title ?? report.template.title,
    heading: HeadingLevel.HEADING_1,
    spacing: { after: mmToTwips(2) },
  });

  const assignedTherapist = (report as any).student?.therapist
    ? `${(report as any).student.therapist.nombres} ${(report as any).student.therapist.apellidos}`.trim()
    : (report as any).therapist?.name || (report as any).therapist?.email || '';

  const meta = new Paragraph({
    children: [
      new TextRun({ text: `Estudiante: ${report.student.nombres} ${report.student.apellidos}`, break: 1 }),
      new TextRun({ text: `Terapeuta: ${assignedTherapist}`, break: 1 }),
      new TextRun({ text: `Fecha: ${new Date(report.reportDate).toLocaleDateString()}`, break: 1 }),
    ],
    spacing: { after: mmToTwips(4) },
  });

  const answerMap = buildAnswerMap(report.itemAnswers);

  const children: any[] = [title, meta];

  // Render de secciones: si tienen items tipo 'level', usa tabla 2 columnas
  for (const s of [...report.template.sections].sort((a, b) => a.order - b.order)) {
    children.push(new Paragraph({
      text: s.title.toUpperCase(),
      heading: HeadingLevel.HEADING_2,
      spacing: { before: mmToTwips(4), after: mmToTwips(2) },
    }));
    const items = [...s.items].sort((a, b) => a.order - b.order);
    const hasLevels = items.some((it) => it.type === 'level');
    if (hasLevels) {
      const headerRow = new TableRow({
        children: [
          new TableCell({
            width: { size: 65, type: WidthType.PERCENTAGE },
            borders: { top: { style: BorderStyle.SINGLE, size: 4 }, bottom: { style: BorderStyle.SINGLE, size: 4 }, left: { style: BorderStyle.SINGLE, size: 4 }, right: { style: BorderStyle.SINGLE, size: 4 } },
            children: [new Paragraph({ children: [new TextRun({ text: 'Descripción de la actividad desarrollada', bold: true })] })],
          }),
          new TableCell({
            width: { size: 35, type: WidthType.PERCENTAGE },
            borders: { top: { style: BorderStyle.SINGLE, size: 4 }, bottom: { style: BorderStyle.SINGLE, size: 4 }, left: { style: BorderStyle.SINGLE, size: 4 }, right: { style: BorderStyle.SINGLE, size: 4 } },
            children: [new Paragraph({ children: [new TextRun({ text: 'Grado de adquisición', bold: true })] })],
          }),
        ],
      });

      const dataRows = items.map((it) => {
        const raw = answerMap.get(it.id) ?? '';
        const val = it.type === 'level' ? (String(raw).replace(/_/g, ' ')) : raw;
        return new TableRow({
          children: [
            new TableCell({
              width: { size: 65, type: WidthType.PERCENTAGE },
              borders: { top: { style: BorderStyle.SINGLE, size: 4 }, bottom: { style: BorderStyle.SINGLE, size: 4 }, left: { style: BorderStyle.SINGLE, size: 4 }, right: { style: BorderStyle.SINGLE, size: 4 } },
              children: [new Paragraph({ text: it.label })],
            }),
            new TableCell({
              width: { size: 35, type: WidthType.PERCENTAGE },
              borders: { top: { style: BorderStyle.SINGLE, size: 4 }, bottom: { style: BorderStyle.SINGLE, size: 4 }, left: { style: BorderStyle.SINGLE, size: 4 }, right: { style: BorderStyle.SINGLE, size: 4 } },
              children: [new Paragraph({ text: val })],
            }),
          ],
        });
      });

      children.push(new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [headerRow, ...dataRows],
      }));
    } else {
      for (const it of items) {
        const val = answerMap.get(it.id) ?? '';
        if (!val) continue;
        children.push(new Paragraph({ children: [new TextRun({ text: it.label + ':', bold: true })] }));
        children.push(new Paragraph({ text: val }));
      }
    }
  }

  // Header con logo opcional y título
  const headerChildren: any[] = [];
  if (opts.logoBuffer) {
    headerChildren.push(new Paragraph({
      children: [new ImageRun({ data: opts.logoBuffer, transformation: { width: 120, height: 32 } })],
    }));
  }
  headerChildren.push(new Paragraph({
    alignment: AlignmentType.LEFT,
    children: [new TextRun({ text: opts.title ?? report.template.title, bold: true })],
  }));
  const header = new Header({ children: headerChildren });

  // Footer con numeración de página
  const footer = new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.BOTH,
        children: [
          new TextRun({ text: opts.institutionName ?? '', size: 18 }),
          new TextRun({ text: '  \t' }), // tab para separar
          new TextRun('Página '),
          PageNumber.CURRENT,
          new TextRun(' de '),
          PageNumber.TOTAL_PAGES,
        ],
      }),
    ],
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: page.width, height: page.height, orientation: PageOrientation.PORTRAIT },
            margin: { top: marginTw, right: mmToTwips(15), bottom: marginTw, left: mmToTwips(15) },
          },
        },
        headers: { default: header },
        footers: { default: footer },
        children,
      },
    ],
  });

  // Empaqueta a Buffer
  const buffer = await Packer.toBuffer(doc);
  return buffer;
}
