// backend/src/utils/pdf.ts
import { Response } from 'express';
// Asegúrate de tener instalados pdfkit y pdfkit-table
import PDFDocument from 'pdfkit-table';

// Interfaz para los datos de la tabla que se pasará a la función
interface PdfTableData {
  title: string;
  headers: string[];
  rows: (string | number | boolean | null | undefined)[][];
}

/**
 * Genera una respuesta HTTP con un archivo PDF que contiene una tabla.
 * @param res - El objeto de respuesta de Express.
 * @param filename - El nombre del archivo PDF a generar.
 * @param tableData - Los datos para construir la tabla en el PDF.
 */
export const sendPdfTableResponse = (res: Response, filename: string, tableData: PdfTableData): void => {
  // Crea un nuevo documento PDF. 'A4' es un buen tamaño estándar.
  // El layout 'landscape' (horizontal) da más espacio para las columnas.
  const doc = new PDFDocument({ 
    margin: 30, 
    size: 'A4',
    layout: 'landscape' 
  });

  // Configura las cabeceras de la respuesta para indicar que es un archivo PDF.
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  // Envía el contenido del PDF directamente a la respuesta HTTP.
  doc.pipe(res);

  // Agrega el título principal del documento.
  doc.fontSize(16).font('Helvetica-Bold').text(tableData.title, { align: 'center' });
  doc.moveDown(1.5); // Añade un espacio después del título.

  // Prepara la estructura de la tabla para pdfkit-table.
  // Es importante convertir todas las celdas a string para evitar errores.
  const table = {
    headers: tableData.headers,
    rows: tableData.rows.map(row => row.map(cell => String(cell ?? ''))),
  };

  // Dibuja la tabla en el documento. pdfkit-table se encargará del resto.
  doc.table(table, {
    prepareHeader: () => doc.font('Helvetica-Bold').fontSize(8),
    prepareRow: () => doc.font('Helvetica').fontSize(8),
  });

  // Finaliza el documento PDF. Esto es crucial para que se envíe correctamente.
  doc.end();
};