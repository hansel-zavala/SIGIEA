// backend/src/services/controlService.ts
import { controlRepository } from '../repositories/catalogRepository.js';

export const getAllControls = async () => {
  const [
    medicamentos,
    alergias,
    therapists,
    lecciones
  ] = await Promise.all([
    controlRepository.findAllMedicamentos(),
    controlRepository.findAllAlergias(),
    controlRepository.findAllTherapistsList(),
    controlRepository.findAllLeccionesList(),
  ]);

  const formattedTherapists = therapists.map(t => ({
    id: t.id,
    fullName: `${t.nombres} ${t.apellidos}`,
  }));

  const formattedLecciones = lecciones.map(l => ({
    id: l.id,
    title: l.title,
  }));

  return {
    medicamentos,
    alergias,
    therapists: formattedTherapists,
    lecciones: formattedLecciones,
  };
};