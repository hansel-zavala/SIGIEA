// Servicio de render PDF usando Puppeteer
// Genera PDF en A4 u Oficio a partir de un HTML simple

import type { Report, ReportItem, ReportItemAnswer, ReportSection, ReportTemplate, Student, User } from '@prisma/client';

export type PageSize = 'A4' | 'OFICIO';

export interface PdfRenderOptions {
  size: PageSize; // Tamaño de papel
  title?: string; // Título opcional en encabezado
  logoDataUrl?: string | null; // Logo en data URL para header
  institutionName?: string; // Nombre de la institución para footer
}

type FullReport = Report & {
  student: Student;
  therapist: Pick<User, 'name' | 'email'>;
  template: ReportTemplate & {
    sections: (ReportSection & { items: ReportItem[] })[];
  };
  itemAnswers: ReportItemAnswer[];
};

// Convierte respuestas del reporte a un diccionario por itemId
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

// Construye HTML básico con estilos de paginado
function buildHtml(report: FullReport, opts: PdfRenderOptions) {
  const answerMap = buildAnswerMap(report.itemAnswers);

  // CSS para controlar saltos y márgenes
  const pageCss = opts.size === 'A4' ? 'size: A4;' : 'size: 216mm 330mm;'; // Oficio ~ 8.5x13 in

  // Tabla de datos generales
  const age = calcAge(report.student.dateOfBirth as unknown as string);
  const guardians = (report as any).student.guardians?.map((g: any) => `${g.nombres || ''} ${g.apellidos || ''}`.trim()).filter(Boolean).join(', ') || '';
  const assignedTherapist = (report as any).student.therapist ? `${(report as any).student.therapist.nombres} ${(report as any).student.therapist.apellidos}`.trim() : (report.therapist.name ?? report.therapist.email);
  const generalTable = `
    <table class="table boxed">
      <tr><th style="width:40%">Nombre del niño/a:</th><td>${escapeHtml(report.student.nombres + ' ' + report.student.apellidos)}</td></tr>
      <tr><th>Fecha de nacimiento:</th><td>${new Date(report.student.dateOfBirth as any).toLocaleDateString()}</td></tr>
      <tr><th>Edad cronológica:</th><td>${age}</td></tr>
      <tr><th>Nombre de los padres o encargados:</th><td>${escapeHtml(guardians)}</td></tr>
      <tr><th>Fecha de entrega informe:</th><td>${new Date(report.reportDate).toLocaleDateString()}</td></tr>
      <tr><th>Asistencia:</th><td></td></tr>
      <tr><th>Nombre del terapeuta:</th><td>${escapeHtml(assignedTherapist)}</td></tr>
    </table>
  `;

  // Leyenda de niveles de adquisición
  const legend = `
    <div class="legend">
      <div><span class="lv lv-cons">CONSEGUIDO</span> (cuando el niño/a, joven realiza correctamente la acción señalada)</div>
      <div><span class="lv lv-oral">CON AYUDA ORAL</span> (cuando el niño/a, joven necesita una/s palabra/s para realizar la acción)</div>
      <div><span class="lv lv-gestual">CON AYUDA GESTUAL</span> (cuando el niño/a, joven necesita gestos para realizar la acción)</div>
      <div><span class="lv lv-fisica">CON AYUDA FÍSICA</span> (cuando hay que guiar físicamente al niño/a, joven para que realice la acción)</div>
      <div><span class="lv">NO CONSEGUIDO</span> (acción no realizada ni siquiera con ayuda)</div>
      <div><span class="lv">NO TRABAJADO</span> (cuando no se ha trabajado ese aspecto con el niño/a, joven)</div>
    </div>
  `;

  const sectionsHtml = report.template.sections
    .sort((a, b) => a.order - b.order)
    .map((s) => {
      const items = s.items.sort((a,b)=>a.order-b.order);
      const hasLevels = items.some(it => it.type === 'level');
      if (hasLevels) {
        const rows = items.map((it)=>{
          const raw = answerMap.get(it.id) ?? '';
          const ans = it.type === 'level' ? formatLevel(raw) : raw;
          return `<tr><td class=\"td-left\">${escapeHtml(it.label)}</td><td class=\"td-right\">${escapeHtml(ans || ' ')}</td></tr>`;
        }).join('');
        return `
          <section class="section">
            <div class="boxed-title">${escapeHtml(s.title.toUpperCase())}</div>
            <table class="table boxed">
              <thead>
                <tr>
                  <th class="th-left">Descripción de la actividad desarrollada</th>
                  <th class="th-right">Grado de adquisición</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </section>
        `;
      } else {
        const blocks = items.map((it)=>{
          const ans = answerMap.get(it.id) ?? '';
          if (!ans) return '';
          return `<div class="block boxed"><div class="block-title">${escapeHtml(it.label)}</div><div class="block-body">${escapeHtml(ans)}</div></div>`;
        }).join('');
        return `
          <section class="section">
            <div class="boxed-title">${escapeHtml(s.title.toUpperCase())}</div>
            ${s.description ? `<p class="section-desc">${escapeHtml(s.description)}</p>` : ''}
            ${blocks}
          </section>
        `;
      }
    })
    .join('');

  return `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        @page { ${pageCss} margin: 20mm 15mm; }
        body { font-family: Arial, sans-serif; font-size: 12px; color: #222; }
        header { margin-bottom: 8mm; display:grid; grid-template-columns: 1fr 1fr; align-items:center; column-gap: 12px; }
        .head-left { display:flex; align-items:center; gap:10px; }
        header img { height: 32px; }
        h1 { font-size: 22px; margin: 0; }
        .meta { font-size: 11px; color: #555; justify-self: end; text-align: right; }
        .title-box { text-align:center; border:1px solid #444; padding:6px; width: 70%; margin: 0 auto 6mm; }
        .title-box .inst { font-size: 12px; margin-top:2px; }
        .section { break-inside: avoid; page-break-inside: avoid; margin: 8mm 0 6mm; }
        .boxed-title { font-weight:bold; border:1px solid #444; padding:4px 6px; background:#f8fafc; display:inline-block; margin-bottom:4px; }
        .section-desc { margin: 4px 0 6px 0; color: #444; }
        .table { width:100%; border-collapse: collapse; }
        .boxed .th-left, .boxed .th-right, .boxed td, .boxed th { border:1px solid #444; }
        .th-left { width:65%; background:#f3f4f6; text-align:left; padding:6px; }
        .th-right { width:35%; background:#f3f4f6; text-align:left; padding:6px; }
        .td-left { padding:6px; vertical-align:top; }
        .td-right { padding:6px; vertical-align:top; text-align:left; }
        .block { margin: 4mm 0; }
        .block-title { font-weight:bold; margin-bottom:2mm; }
        .block-body { white-space: pre-wrap; }
        .legend { margin: 4mm 0; line-height:1.5; }
        .lv { font-weight:bold; }
        .lv-cons { color:#059669; }
        .lv-oral { color:#2563eb; }
        .lv-gestual { color:#ea580c; }
        .lv-fisica { color:#dc2626; }
        .signatures { margin-top: 12mm; display:grid; grid-template-columns: 1fr 1fr; column-gap: 20mm; }
        .sig { text-align:center; }
        .sig-line { margin: 10mm 0 2mm; border-top:1px solid #000; }
        .sig-boxstack { display:flex; flex-direction:column; gap:4px; align-items:center; }
        .sig-box { border:1px solid #000; padding:2px 8px; font-weight:bold; display:inline-block; }
        footer { font-size: 10px; color: #666; }
      </style>
    </head>
    <body>
      <header>
        <div class="head-left">
          ${opts.logoDataUrl ? `<img src="${opts.logoDataUrl}" alt="logo" />` : ''}
          <h1>${escapeHtml(opts.title ?? report.template.title)}</h1>
        </div>
        <div class="meta">
          <div><strong>Estudiante:</strong> ${escapeHtml(report.student.nombres + ' ' + report.student.apellidos)}</div>
          <div><strong>Terapeuta:</strong> ${escapeHtml(report.therapist.name ?? report.therapist.email)}</div>
          <div><strong>Fecha:</strong> ${new Date(report.reportDate).toLocaleDateString()}</div>
        </div>
      </header>
      <div class="title-box">
        <div>${escapeHtml(opts.title ?? report.template.title)}</div>
        <div class="inst">${escapeHtml(opts.institutionName ?? '')}</div>
      </div>
      <div class="section">
        <div class="boxed-title">I. Datos Generales:</div>
        ${generalTable}
      </div>
      <div class="section">
        <div class="boxed-title">II. Observaciones Generales</div>
        ${legend}
      </div>
      ${sectionsHtml}
      <div class="signatures">
        <div class="sig">
          <div class="sig-line"></div>
          <div class="sig-boxstack">
            <div class="sig-box">APO-AUTIS</div>
          </div>
        </div>
        <div class="sig">
          <div class="sig-line"></div>
          <div class="sig-boxstack">
            <div class="sig-box">APO-AUTIS</div>
          </div>
        </div>
      </div>
    </body>
  </html>`;
}

// Escapa HTML simple para evitar inyecciones
function escapeHtml(input: string): string {
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function renderReportPdf(report: FullReport, opts: PdfRenderOptions): Promise<Buffer> {
  // Importación dinámica para fallar con mensaje claro si no está instalado
  let puppeteer: any; // usar 'any' para evitar error de tipos si la lib no está instalada aún
  try {
    const moduleName = 'puppeteer';
    // Evita que TypeScript resuelva tipos del módulo si no está instalado
    puppeteer = await (0, eval)(`import(${JSON.stringify(moduleName)})`);
  } catch (e) {
    throw new Error('Dependencia faltante: instala puppeteer (npm i puppeteer)');
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    // Permite usar un Chromium del sistema si se define en env
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    // Nota: en algunos servidores puede requerir args extra como --no-sandbox
    args: ['--no-sandbox', '--font-render-hinting=medium'],
  });
  try {
    const page = await browser.newPage();
    const html = buildHtml(report, opts);
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Header/Footer con numeración de página
    const headerTemplate = `
      <div style="font-size:10px; width:100%; padding:0 8px; color:#666; display:flex; align-items:center; justify-content:space-between;">
        <div style="display:flex; align-items:center; gap:6px;">
          ${opts.logoDataUrl ? `<img src='${opts.logoDataUrl}' style='height:16px;' />` : ''}
          <span>${escapeHtml(opts.title ?? report.template.title)}</span>
        </div>
        <span>${escapeHtml(report.student.nombres + ' ' + report.student.apellidos)}</span>
      </div>`;
    const footerTemplate = `
      <div style="font-size:10px; width:100%; padding:0 8px; color:#666; display:flex; justify-content:space-between;">
        <span>${escapeHtml(opts.institutionName ?? '')}</span>
        <span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span>
      </div>`;

    // Configura tamaño A4 u Oficio
    const pdfOptions: Parameters<typeof page.pdf>[0] = {
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate,
      footerTemplate,
      margin: { top: '22mm', right: '15mm', bottom: '18mm', left: '15mm' }, // espacio para header/footer
    } as any;

    if (opts.size === 'A4') {
      (pdfOptions as any).format = 'A4';
    } else {
      // Oficio ~ 8.5 x 13 in
      (pdfOptions as any).width = '8.5in';
      (pdfOptions as any).height = '13in';
    }

    const buffer = await page.pdf(pdfOptions);
    return buffer;
  } finally {
    await browser.close();
  }
}

// Calcula edad en años a partir de fecha
function calcAge(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    const today = new Date();
    let age = today.getFullYear() - d.getFullYear();
    const m = today.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
    return `${age} años`;
  } catch {
    return '';
  }
}

// Convierte enums con guiones bajos a texto con espacios
function formatLevel(value: string): string {
  return String(value || '').replace(/_/g, ' ');
}
