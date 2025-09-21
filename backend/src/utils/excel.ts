import type { Response } from 'express';
import ExcelJS from 'exceljs';

interface Header {
  key: string;
  header: string;
  width?: number;
}

/**
 * Genera y envía una respuesta HTTP con un archivo Excel (.xlsx).
 *
 * @param res - El objeto de respuesta de Express.
 * @param filename - El nombre que tendrá el archivo descargado.
 * @param headers - Un array de objetos para definir las columnas de la tabla.
 * @param data - Un array de objetos, donde cada objeto es una fila.
 */
export const sendExcelResponse = async (
  res: Response,
  filename: string,
  headers: Header[],
  data: any[],
) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Datos');

  // Define las columnas y sus cabeceras
  worksheet.columns = headers;

  // Estilo para la cabecera
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF8E44AD' }, // Un tono violeta
  };

  // Agrega los datos
  worksheet.addRows(data);

  // Configura las cabeceras de la respuesta para la descarga
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  // Envía el archivo al cliente
  await workbook.xlsx.write(res);
  res.end();
};