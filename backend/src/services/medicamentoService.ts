// backend/src/services/medicamentoService.ts
import { medicamentoRepository } from '../repositories/medicamentoRepository.js';
import { MedicamentoInUseError } from '../errors/medicamentoErrors.js';

const getAllMedicamentos = () => {
  return medicamentoRepository.findAll();
};

const createMedicamento = (nombre: string) => {
  return medicamentoRepository.create(nombre);
};

const updateMedicamento = (id: number, nombre: string) => {
  return medicamentoRepository.update(id, nombre);
};

const deleteMedicamento = async (id: number) => {
  const studentsCount = await medicamentoRepository.countStudentsWithMedicamento(id);

  if (studentsCount > 0) {
    throw new MedicamentoInUseError('No se puede eliminar el medicamento porque está asignado a otros estudiantes.');
  }

  return medicamentoRepository.remove(id);
};

export const medicamentoService = {
  getAllMedicamentos,
  createMedicamento,
  updateMedicamento,
  deleteMedicamento,
};