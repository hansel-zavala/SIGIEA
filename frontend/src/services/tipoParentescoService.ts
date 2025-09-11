// frontend/src/services/tipoParentescoService.ts

import api from './api';

export interface TipoParentesco {
  id: number;
  nombre: string;
}

// Obtener todos los tipos de parentesco
export const getAllTiposParentesco = async (): Promise<TipoParentesco[]> => {
  const response = await api.get('/tiposparentesco');
  return response.data;
};

// Crear un nuevo tipo de parentesco (requiere admin)
export const createTipoParentesco = async (nombre: string): Promise<TipoParentesco> => {
  const response = await api.post('/tiposparentesco', { nombre });
  return response.data;
};

// Eliminar un tipo de parentesco (requiere admin)
export const deleteTipoParentesco = async (id: number): Promise<void> => {
  await api.delete(`/tiposparentesco/${id}`);
};

export const updateTipoParentesco = async (id: number, nombre: string): Promise<TipoParentesco> => {
  const response = await api.put(`/tiposparentesco/${id}`, { nombre });
  return response.data;
};