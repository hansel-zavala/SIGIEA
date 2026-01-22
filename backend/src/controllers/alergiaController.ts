// backend/src/controllers/alergiaController.ts
import { Request, Response } from "express";
import { alergiaService } from "../services/alergiaService.js";
import { AlergiaInUseError } from "../errors/alergiaErrors.js";

export const getAllAlergias = async (req: Request, res: Response) => {
  try {
    const alergias = await alergiaService.getAllAlergias();
    res.json(alergias);
  } catch (error) {
    res.status(500).json({ error: "No se pudieron obtener las alergias." });
  }
};

export const createAlergia = async (req: Request, res: Response) => {
  try {
    const { nombre } = req.body;
    const newAlergia = await alergiaService.createAlergia(nombre);
    res.status(201).json(newAlergia);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "El nombre es obligatorio.") {
        return res.status(400).json({ error: error.message });
      }
    }
    res.status(500).json({ error: "No se pudo crear la alergia." });
  }
};

export const updateAlergia = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { nombre } = req.body;
    const updatedAlergia = await alergiaService.updateAlergia(
      parseInt(id),
      nombre,
    );
    res.json(updatedAlergia);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "El nombre es obligatorio.") {
        return res.status(400).json({ error: error.message });
      }
    }
    res.status(500).json({ error: "No se pudo actualizar la alergia." });
  }
};

export const deleteAlergia = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const alergiaId = parseInt(id, 10);

    if (Number.isNaN(alergiaId)) {
      return res
        .status(400)
        .json({ error: "Identificador de alergia inválido." });
    }

    await alergiaService.deleteAlergia(alergiaId);
    res.json({ message: "Alergia eliminada correctamente." });
  } catch (error) {
    if (error instanceof AlergiaInUseError) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "No se pudo eliminar la alergia." });
  }
};
