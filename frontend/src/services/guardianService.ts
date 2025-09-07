// frontend/src/services/guardianService.ts

import api from './api';

// --- DEFINICIÓN DE TIPOS DE DATOS (INTERFACES) ---

// Tipo base para un guardián
export interface Guardian {
  id: number;
  nombres: string;
  apellidos: string;
  direccionEmergencia: string | null;
  numeroIdentidad: string;
  telefono: string;
  parentesco: string;
}

// --- INICIO DE LA MODIFICACIÓN ---
// Interfaz para una sesión de terapia individual
export interface TherapySession {
    id: number;
    startTime: string;
    status: 'Programada' | 'Completada' | 'Cancelada' | 'Ausente';
    notes: string | null;
    behavior: string | null;
    progress: string | null;
    leccion: {
        id: number;
        title: string;
    };
}

// Interfaz para el nuevo perfil detallado del guardián
export interface GuardianProfile extends Guardian {
  student: {
    id: number;
    nombres: string;
    apellidos: string;
    dateOfBirth: string;
    anoIngreso: string;
    jornada: string;
    therapist: {
      nombres: string;
      apellidos: string;
    } | null;
    therapySessions: TherapySession[]; // Se reemplaza 'reports' por 'therapySessions'
  };
}
// --- FIN DE LA MODIFICACIÓN ---

// Interfaz para la lista enriquecida de guardianes que se mostrará en la tabla
export interface GuardianListItem {
    id: number;
    fullName: string;
    parentesco: string;
    numeroIdentidad: string;
    telefono: string;
    student: {
        id: number;
        fullName: string;
        therapist: {
            fullName: string;
        } | null;
    };
}

// Interfaz para la respuesta paginada de la API
interface GuardiansResponse {
  data: GuardianListItem[];
  total: number;
  page: number;
  totalPages: number;
}


// --- FUNCIONES DEL SERVICIO ---

const getAllGuardians = async (search: string, page: number, limit: number): Promise<GuardiansResponse> => {
  const response = await api.get('/guardians', { params: { search, page, limit } });
  return response.data;
};

const getGuardianById = async (id: number): Promise<GuardianProfile> => {
  const response = await api.get(`/guardians/${id}`);
  return response.data;
};

const updateGuardian = async (id: number, data: Partial<Guardian>): Promise<Guardian> => {
  const response = await api.put(`/guardians/${id}`, data);
  return response.data;
};

const deleteGuardian = async (id: number): Promise<{ message: string }> => {
  const response = await api.delete(`/guardians/${id}`);
  return response.data;
};

export default {
    getAllGuardians,
    getGuardianById,
    updateGuardian,
    deleteGuardian,
};