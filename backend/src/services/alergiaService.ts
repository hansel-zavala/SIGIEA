// backend/src/services/alergiaService.ts
import { alergiaRepository } from '../repositories/alergiaRepository.js';

const getAllAlergias = async () => {
  return alergiaRepository.findAll();
};

const createAlergia = (nombre: string) => {
  if (!nombre) {
    throw new Error('El nombre es obligatorio.');
  }
  return alergiaRepository.create(nombre);
};

const updateAlergia = (id: number, nombre: string) => {
  if (!nombre) {
    throw new Error('El nombre es obligatorio.');
  }
  return alergiaRepository.update(id, nombre);
};

const deleteAlergia = async (id: number) => {
  const studentCount = await alergiaRepository.countStudentsWithAlergia(id);
  
  if (studentCount > 0) {
    throw new Error('No se puede eliminar la alergia porque está asignada a otros estudiantes.');
  }
  
  return alergiaRepository.remove(id);
};

export const alergiaService = {
  getAllAlergias,
  createAlergia,
  updateAlergia,
  deleteAlergia,
};