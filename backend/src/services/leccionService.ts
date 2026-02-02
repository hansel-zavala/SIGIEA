// backend/src/services/leccionService.ts
import { leccionRepository } from "../repositories/leccionRepository.js";
import { LeccionNotFoundError } from "../errors/leccionErrors.js";
import { Prisma } from "@prisma/client";
import {
  toCsv,
  sendCsvResponse,
  buildTimestampedFilename,
} from "../utils/csv.js";
import { sendExcelResponse } from "../utils/excel.js";
import { sendPdfTableResponse } from "../utils/pdf.js";
import type { Response } from "express";

const buildWhereClause = (status?: string): Prisma.LeccionWhereInput => {
  if (status === "active") return { isActive: true };
  if (status === "inactive") return { isActive: false };
  return {};
};

export const createLeccion = async (data: any, userId: number) => {
  return leccionRepository.create({
    ...data,
    createdBy: { connect: { id: userId } },
  });
};

export const getAllLecciones = async (status?: string) => {
  const where = buildWhereClause(status);
  return leccionRepository.findAll(where);
};

export const getLeccionById = async (id: number) => {
  const leccion = await leccionRepository.findById(id);
  if (!leccion) {
    throw new LeccionNotFoundError();
  }
  return leccion;
};

export const updateLeccion = async (id: number, data: any) => {
  await getLeccionById(id);
  return leccionRepository.update(id, data);
};

export const deleteLeccion = async (id: number) => {
  await getLeccionById(id);
  return leccionRepository.update(id, { isActive: false });
};

export const activateLeccion = async (id: number) => {
  await getLeccionById(id);
  return leccionRepository.update(id, { isActive: true });
};

export const exportLecciones = async (
  status: string,
  format: string,
  res: Response,
) => {
  const where = buildWhereClause(status);
  const lecciones = await leccionRepository.findAllForExport(where);

  const filenameBase = `lecciones-${status || "all"}`;

  const processedData = lecciones.map((l) => ({
    id: l.id,
    title: l.title,
    objective: l.objective,
    category: l.category || "",
    keySkill: l.keySkill || "",
    createdBy: l.createdBy?.name ?? "No registrado",
    createdAt: l.createdAt.toISOString().split("T")[0],
    isActive: l.isActive,
  }));

  const headersForExcel = [
    { key: "id", header: "ID", width: 10 },
    { key: "title", header: "Título", width: 30 },
    { key: "objective", header: "Objetivo", width: 30 },
    { key: "category", header: "Categoría", width: 20 },
    { key: "keySkill", header: "Habilidad clave", width: 20 },
    { key: "createdBy", header: "Creador", width: 20 },
    { key: "createdAt", header: "Fecha de creación", width: 20 },
    { key: "isActive", header: "Estado", width: 15 },
  ];
  const dataForExcel = processedData.map((l) => ({
    ...l,
    isActive: l.isActive ? "Activo" : "Inactivo",
  }));

  const headersForPdfAndCsv = [
    "ID",
    "Titulo",
    "Objetivo",
    "Categoria",
    "Habilidad clave",
    "Creador",
    "Fecha de creación",
    "Estado",
  ];
  const dataForPdfAndCsv = processedData.map((l) => [
    l.id,
    l.title,
    l.objective,
    l.category,
    l.keySkill,
    l.createdBy,
    l.createdAt,
    l.isActive ? "Activa" : "Inactiva",
  ]);

  switch (format) {
    case "excel":
      await sendExcelResponse(
        res,
        buildTimestampedFilename(filenameBase, "xlsx"),
        headersForExcel,
        dataForExcel,
      );
      break;
    case "pdf":
      await sendPdfTableResponse(
        res,
        buildTimestampedFilename(filenameBase, "pdf"),
        {
          title: "Lista de Lecciones",
          headers: headersForPdfAndCsv,
          rows: dataForPdfAndCsv,
        },
      );
      break;
    default:
      const csvContent = toCsv(headersForPdfAndCsv, dataForPdfAndCsv);
      sendCsvResponse(
        res,
        buildTimestampedFilename(filenameBase, "csv"),
        csvContent,
      );
      break;
  }
};
