// frontend/src/services/reportService.ts

import api from './api';

// --- INICIO DE LA CORRECCIÓN ---
// Se reemplaza el 'enum' por un objeto constante y un tipo derivado
// para cumplir con la regla "erasableSyntaxOnly".

// 1. Un objeto constante para los valores en tiempo de ejecución.
export const AcquisitionLevel = {
    CONSEGUIDO: 'CONSEGUIDO',
    CON_AYUDA_ORAL: 'CON_AYUDA_ORAL',
    CON_AYUDA_GESTUAL: 'CON_AYUDA_GESTUAL',
    CON_AYUDA_FISICA: 'CON_AYUDA_FISICA',
    NO_CONSEGUIDO: 'NO_CONSEGUIDO',
    NO_TRABAJADO: 'NO_TRABAJADO',
} as const;

// 2. Un tipo derivado para usar en las interfaces y la comprobación de tipos.
export type AcquisitionLevel = typeof AcquisitionLevel[keyof typeof AcquisitionLevel];
// --- FIN DE LA CORRECCIÓN ---


export interface ReportItemAnswer {
    id: number;
    reportId: number;
    itemId: number;
    level: AcquisitionLevel; // Esto seguirá funcionando gracias al tipo derivado.
}

export interface ReportItem {
    id: number;
    description: string;
    order: number;
    sectionId: number;
}

export interface ReportSection {
    id: number;
    title: string;
    order: number;
    templateId: number;
    items: ReportItem[];
}

export interface ReportTemplate {
    id: number;
    title: string;
    description: string | null;
    sections: ReportSection[];
}

export interface ReportDetail {
    id: number;
    studentId: number;
    therapistId: number;
    templateId: number;
    reportDate: string;
    attendance: string | null;
    summary: string | null;
    therapyActivities: string | null;
    conclusions: string | null;
    recommendations: string | null;
    itemAnswers: ReportItemAnswer[];
    template: ReportTemplate;
    student: {
        nombres: string;
        apellidos: string;
    };
    therapist: {
        name: string | null;
    };
}


// --- FUNCIONES DEL SERVICIO ---

/**
 * Obtiene los detalles completos de un reporte específico por su ID.
 * @param reportId El ID del reporte a obtener.
 * @returns Una promesa que se resuelve con los detalles del reporte.
 */
const getReportById = async (reportId: number): Promise<ReportDetail> => {
    const response = await api.get(`/reports/${reportId}`);
    return response.data;
};

export default {
    getReportById
};