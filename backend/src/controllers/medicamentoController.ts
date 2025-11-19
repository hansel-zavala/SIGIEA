// backend/src/controllers/medicamentoController.ts
import { Request, Response } from 'express';
import { medicamentoService } from '../services/medicamentoService.js';
import { MedicamentoInUseError } from '../errors/medicamentoErrors.js';

export const getAllMedicamentos = async (req: Request, res: Response) => {
  try {
    const medicamentos = await medicamentoService.getAllMedicamentos();
    res.json(medicamentos);
  } catch (error) {
    res.status(500).json({ error: 'No se pudieron obtener los medicamentos.' });
  }
};

export const createMedicamento = async (req: Request, res: Response) => {
  try {
    const { nombre } = req.body;
    const newMedicamento = await medicamentoService.createMedicamento(nombre);
    res.status(201).json(newMedicamento);
  } catch (error) {
    res.status(500).json({ error: 'No se pudo crear el medicamento.' });
  }
};

export const updateMedicamento = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;
    const updatedMedicamento = await medicamentoService.updateMedicamento(parseInt(id), nombre);
    res.json(updatedMedicamento);
  } catch (error) {
    res.status(500).json({ error: 'No se pudo actualizar el medicamento.' });
  }
};

export const deleteMedicamento = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const medicamentoId = parseInt(id, 10);

    if (Number.isNaN(medicamentoId)) {
        return res.status(400).json({ error: 'Identificador de medicamento inválido.' });
    }

    await medicamentoService.deleteMedicamento(medicamentoId);
    res.json({ message: 'Medicamento eliminado correctamente.' });
  } catch (error) {
    if (error instanceof MedicamentoInUseError) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'No se pudo eliminar el medicamento.' });
  }
};