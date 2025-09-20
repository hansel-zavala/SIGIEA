import type { Response } from 'express';
const escapeCell = (value: string | number | boolean | null | undefined): string => {
  if (value === null || value === undefined) return '';
  const stringValue = String(value);
  if (/[\r\n",]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};
export const toCsv = (
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][],
): string => {
  const headerLine = headers.map(escapeCell).join(',');
  const dataLines = rows.map((row) => row.map(escapeCell).join(','));
  return [headerLine, ...dataLines].join('\n');
};
export const sendCsvResponse = (res: Response, filename: string, csvContent: string) => {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(`\ufeff${csvContent}`);
};
export const buildTimestampedFilename = (baseName: string, extension: string = 'csv') => {
  const now = new Date();
  const datePart = now.toISOString().replace(/[:T]/g, '-').split('.')[0];
  return `${baseName}-${datePart}.${extension}`;
};