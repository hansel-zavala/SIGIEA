// backend/src/utils/pdf.ts
import { Response } from "express";
import puppeteer from "puppeteer";

// Interfaz para los datos de la tabla que se pasará a la función
interface PdfTableData {
  title: string;
  headers: string[];
  rows: (string | number | boolean | null | undefined)[][];
}

/**
 * Genera el HTML para el PDF con estilos modernos.
 */
const generateTableHtml = (data: PdfTableData): string => {
  const headersHtml = data.headers.map((h) => `<th>${h}</th>`).join("");
  const rowsHtml = data.rows
    .map(
      (row) =>
        `<tr>${row.map((cell) => `<td>${cell != null ? String(cell) : ""}</td>`).join("")}</tr>`,
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8" />
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');
        
        body { 
          font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif; 
          padding: 40px; 
          color: #1f2937; /* Gray 800 */
        }
        
        h1 { 
          text-align: center; 
          color: #111827; /* Gray 900 */
          margin-bottom: 2rem; 
          font-weight: 600; 
          font-size: 24px; 
          text-transform: uppercase; 
          letter-spacing: 0.05em;
        }

        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-top: 1rem; 
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06); 
          border-radius: 8px;
          overflow: hidden;
        }

        thead {
          background-color: #f3f4f6; /* Gray 100 */
        }

        th { 
          color: #374151; /* Gray 700 */
          font-weight: 600; 
          text-transform: uppercase; 
          font-size: 10px; 
          padding: 12px 16px; 
          text-align: left; 
          letter-spacing: 0.05em;
          border-bottom: 1px solid #e5e7eb;
        }

        td { 
          padding: 12px 16px; 
          border-bottom: 1px solid #f3f4f6; 
          font-size: 12px; 
          color: #4b5563; /* Gray 600 */
        }

        tr:last-child td { 
          border-bottom: none; 
        }

        tr:nth-child(even) { 
          background-color: #f9fafb; /* Gray 50 */
        }

        .footer { 
          position: fixed;
          bottom: 20px;
          left: 0;
          right: 0;
          text-align: center; 
          font-size: 9px; 
          color: #9ca3af; /* Gray 400 */
          border-top: 1px solid #f3f4f6; 
          padding-top: 10px;
          margin: 0 40px;
        }
      </style>
    </head>
    <body>
      <h1>${data.title}</h1>
      <table>
        <thead>
          <tr>${headersHtml}</tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
      <div class="footer">
        Generado por SIGIEA - ${new Date().toLocaleDateString("es-ES", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
      </div>
    </body>
    </html>
  `;
};

/**
 * Genera una respuesta HTTP con un archivo PDF generado por Puppeteer.
 * @param res - El objeto de respuesta de Express.
 * @param filename - El nombre del archivo PDF a generar.
 * @param tableData - Los datos para construir la tabla en el PDF.
 */
export const sendPdfTableResponse = async (
  res: Response,
  filename: string,
  tableData: PdfTableData,
): Promise<void> => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    // Generar contenido HTML dinámico
    const htmlContent = generateTableHtml(tableData);

    await page.setContent(htmlContent, {
      waitUntil: "networkidle0",
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      landscape: true,
      printBackground: true,
      margin: { top: "20px", right: "20px", bottom: "40px", left: "20px" },
    });

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    // En Express, res.send acepta Buffer directamente
    res.send(Buffer.from(pdfBuffer));
  } catch (error) {
    console.error("Error generando PDF con Puppeteer:", error);
    if (!res.headersSent) {
      res.status(500).json({
        message: "Error al generar el reporte PDF.",
        error: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  }
};
