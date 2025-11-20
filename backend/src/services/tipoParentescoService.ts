// backend/src/services/tipoParentescoService.ts
import { tipoParentescoRepository } from '../repositories/tipoParentescoRepository.js';
import { TipoParentescoNotFoundError } from '../errors/tipoParentescoErrors.js';

export const getAllTiposParentesco = async () => {
  return tipoParentescoRepository.findAll();
};

export const createTipoParentesco = async (nombre: string) => {
  return tipoParentescoRepository.create({ nombre });
};

export const updateTipoParentesco = async (id: number, nombre: string) => {
  const exists = await tipoParentescoRepository.findById(id);
  if (!exists) {
    throw new TipoParentescoNotFoundError();
  }
  return tipoParentescoRepository.update(id, { nombre });
};

export const deleteTipoParentesco = async (id: number) => {
  const exists = await tipoParentescoRepository.findById(id);
  if (!exists) {
    throw new TipoParentescoNotFoundError();
  }
  return tipoParentescoRepository.remove(id);
};