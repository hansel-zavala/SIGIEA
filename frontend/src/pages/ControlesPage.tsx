// frontend/src/pages/ControlesPage.tsx

import { useState, useEffect } from 'react';
import api from '../services/api';
import { FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { actionButtonStyles } from '../styles/actionButtonStyles';

interface Therapist {
  id: number;
  fullName: string;
  email: string;
  permissions: Record<string, boolean>;
}

interface Permission {
  key: string;
  label: string;
  description: string;
}

interface PermissionModule {
  name: string;
  label: string;
  permissions: Permission[];
}

const PERMISSION_MODULES: PermissionModule[] = [
  {
    name: 'dashboard',
    label: 'Dashboard',
    permissions: [
      { key: 'VIEW_DASHBOARD', label: 'Ver Dashboard', description: 'Puede acceder al dashboard del sistema' },
    ]
  },
  {
    name: 'matricula',
    label: 'Matrícula',
    permissions: [
      { key: 'VIEW_MATRICULA', label: 'Ver Matrícula', description: 'Puede acceder al módulo de matrícula' },
    ]
  },
  {
    name: 'students',
    label: 'Estudiante',
    permissions: [
      { key: 'VIEW_STUDENTS', label: 'Ver Estudiante', description: 'Puede ver la lista de estudiantes asignados' },
      { key: 'EDIT_STUDENTS', label: 'Editar Estudiante', description: 'Puede modificar información de estudiantes' },
      { key: 'DELETE_STUDENTS', label: 'Eliminar / Reactivar ', description: 'Puede eliminar/reactivar estudiantes' },
      { key: 'MANAGE_SESSIONS', label: 'Gestionar Horario Estudiante', description: 'Puede crear y editar sesiones de terapia' },
      { key: 'EXPORT_STUDENTS', label: 'Exportar Listado', description: 'Puede exportar listas de estudiantes' },
    ]
  },
  {
    name: 'guardians',
    label: 'Padres',
    permissions: [
      { key: 'VIEW_GUARDIANS', label: 'Ver Padre', description: 'Puede ver la lista de padres asignados' },
      { key: 'CREATE_GUARDIANS', label: 'Crear Nuevo Padre', description: 'Puede crear nuevos padres' },
      { key: 'EDIT_GUARDIANS', label: 'Editar Padre', description: 'Puede modificar información de padres' },
      { key: 'DELETE_GUARDIANS', label: 'Eliminar / Reactivar', description: 'Puede eliminar/reactivar padres' },
      { key: 'EXPORT_GUARDIANS', label: 'Exportar Listado', description: 'Puede exportar listas de padres' },
    ]
  },
  {
    name: 'therapists',
    label: 'Terapeuta',
    permissions: [
      { key: 'VIEW_THERAPISTS', label: 'Ver Terapeuta', description: 'Puede ver la lista de terapeutas' },
      { key: 'CREATE_THERAPISTS', label: 'Crear Terapeuta', description: 'Puede crear nuevos terapeutas' },
      { key: 'EDIT_THERAPISTS', label: 'Editar Terapeuta', description: 'Puede modificar información de terapeutas' },
      { key: 'DELETE_THERAPISTS', label: 'Eliminar / Reactivar', description: 'Puede eliminar/reactivar terapeutas' },
      { key: 'EXPORT_THERAPISTS', label: 'Exportar Listado', description: 'Puede exportar listas de terapeutas' },
    ]
  },
  {
    name: 'lecciones',
    label: 'Lecciones',
    permissions: [
      { key: 'VIEW_LECCIONES', label: 'Ver Lecciones', description: 'Puede ver las lecciones' },
      { key: 'CREATE_LECCIONES', label: 'Crear Lecciones', description: 'Puede crear nuevas lecciones' },
      { key: 'EDIT_LECCIONES', label: 'Editar Lecciones', description: 'Puede modificar lecciones' },
      { key: 'DELETE_LECCIONES', label: 'Eliminar / Reactivar', description: 'Puede eliminar/reactivar lecciones' },
      { key: 'EXPORT_LECCIONES', label: 'Exportar Listado', description: 'Puede exportar listas de lecciones' },
    ]
  },
  {
    name: 'events',
    label: 'Eventos',
    permissions: [
      { key: 'VIEW_EVENTS', label: 'Ver Eventos', description: 'Puede ver los eventos del sistema' },
      { key: 'CREATE_EVENTS', label: 'Crear Evento', description: 'Puede crear nuevos eventos' },
      { key: 'EDIT_EVENTS', label: 'Editar Evento', description: 'Puede modificar eventos' },
      { key: 'DELETE_EVENTS', label: 'Eliminar / Reactivar', description: 'Puede eliminar/reactivar eventos' },
      { key: 'MANAGE_CATEGORIES', label: 'Gestionar Categorías', description: 'Puede crear y gestionar categorías' },
      { key: 'EXPORT_EVENTS', label: 'Exportar Listado', description: 'Puede exportar listas de eventos' },
    ]
  },
  {
    name: 'documents',
    label: 'Archivero',
    permissions: [
      { key: 'MANAGE_DOCUMENTS', label: 'Ver Archivero, Subir Nuevo Archivo, Descargar Archivos', description: 'Puede ver, subir y descargar documentos' },
    ]
  },
  {
    name: 'reports',
    label: 'Reportes',
    permissions: [
      { key: 'VIEW_REPORTS', label: 'Ver Reporte', description: 'Puede ver reportes de sus estudiantes' },
      { key: 'CREATE_REPORTS', label: 'Generar Reportes', description: 'Puede crear nuevos reportes' },
    ]
  },
  {
    name: 'templates',
    label: 'Plantillas',
    permissions: [
      { key: 'VIEW_TEMPLATES', label: 'Ver Plantilla', description: 'Puede ver plantillas de reportes' },
      { key: 'MANAGE_TEMPLATES', label: 'Crear Plantilla', description: 'Puede crear y gestionar plantillas de reportes' },
    ]
  },
];

function ControlesPage() {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editPermissions, setEditPermissions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadTherapists();
  }, []);

  const loadTherapists = async () => {
    try {
      const response = await api.get('controles/therapists');
      setTherapists(response.data.data || []);
      setError(null);
    } catch (error: any) {
      console.error('Error loading therapists:', error);
      setError(error.response?.data?.error || 'Error al cargar terapeutas');
      setTherapists([]);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (therapist: Therapist) => {
    setEditingId(therapist.id);
    setEditPermissions(therapist.permissions);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditPermissions({});
  };

  const savePermissions = async (therapistId: number) => {
    try {
      await api.put(`controles/therapists/${therapistId}/permissions`, {
        permissions: editPermissions
      });
      setTherapists(therapists.map(t =>
        t.id === therapistId ? { ...t, permissions: editPermissions } : t
      ));
      setEditingId(null);
    } catch (error: any) {
      console.error('Error saving permissions:', error);
      setError(error.response?.data?.error || 'Error al guardar permisos');
    }
  };

  const togglePermission = (permissionKey: string) => {
    setEditPermissions(prev => {
      const newPermissions = { ...prev };
      const isChecked = !prev[permissionKey];

      // Set the toggled permission
      newPermissions[permissionKey] = isChecked;

      // Define dependencies: if you check a permission, automatically check its prerequisites
      const dependencies: Record<string, string[]> = {
        // Students
        'EDIT_STUDENTS': ['VIEW_STUDENTS'],
        'DELETE_STUDENTS': ['VIEW_STUDENTS'],
        'EXPORT_STUDENTS': ['VIEW_STUDENTS'],
        'MANAGE_SESSIONS': ['VIEW_STUDENTS'],

        // Guardians
        'EDIT_GUARDIANS': ['VIEW_GUARDIANS'],
        'CREATE_GUARDIANS': ['VIEW_GUARDIANS'],
        'DELETE_GUARDIANS': ['VIEW_GUARDIANS'],
        'EXPORT_GUARDIANS': ['VIEW_GUARDIANS'],

        // Therapists
        'EDIT_THERAPISTS': ['VIEW_THERAPISTS'],
        'CREATE_THERAPISTS': ['VIEW_THERAPISTS'],
        'DELETE_THERAPISTS': ['VIEW_THERAPISTS'],
        'EXPORT_THERAPISTS': ['VIEW_THERAPISTS'],

        // Lecciones
        'EDIT_LECCIONES': ['VIEW_LECCIONES'],
        'CREATE_LECCIONES': ['VIEW_LECCIONES'],
        'DELETE_LECCIONES': ['VIEW_LECCIONES'],
        'EXPORT_LECCIONES': ['VIEW_LECCIONES'],

        // Events
        'EDIT_EVENTS': ['VIEW_EVENTS'],
        'CREATE_EVENTS': ['VIEW_EVENTS'],
        'DELETE_EVENTS': ['VIEW_EVENTS'],
        'EXPORT_EVENTS': ['VIEW_EVENTS'],
        'MANAGE_CATEGORIES': ['VIEW_EVENTS'],

        // Documents
        // 'MANAGE_DOCUMENTS': [], // No prerequisites

        // Reports
        'CREATE_REPORTS': ['VIEW_REPORTS'],
        'EDIT_REPORTS': ['VIEW_REPORTS'],
        'EXPORT_REPORTS': ['VIEW_REPORTS'],

        // Templates
        'MANAGE_TEMPLATES': ['VIEW_TEMPLATES'],

        // Controls
        // 'MANAGE_PERMISSIONS': [], // No prerequisites
      };

      // If checking a permission, ensure prerequisites are also checked
      if (isChecked && dependencies[permissionKey]) {
        dependencies[permissionKey].forEach(dep => {
          newPermissions[dep] = true;
        });
      }

      return newPermissions;
    });
  };

  const selectAllModule = (module: PermissionModule) => {
    const newPermissions = { ...editPermissions };
    module.permissions.forEach(perm => {
      newPermissions[perm.key] = true;
    });
    setEditPermissions(newPermissions);
  };

  const deselectAllModule = (module: PermissionModule) => {
    const newPermissions = { ...editPermissions };
    module.permissions.forEach(perm => {
      newPermissions[perm.key] = false;
    });
    setEditPermissions(newPermissions);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Cargando...</div>;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-2">Error</p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Controles de Acceso</h1>
        <p className="text-gray-600">Gestiona los permisos de los terapeutas</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Terapeutas y sus Permisos</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre del Terapeuta
                </th>
                {PERMISSION_MODULES.map(module => (
                  <th key={module.name} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {module.label}
                  </th>
                ))}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {therapists.map(therapist => (
                <tr key={therapist.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{therapist.fullName}</div>
                      <div className="text-sm text-gray-500">{therapist.email}</div>
                    </div>
                  </td>
                  {PERMISSION_MODULES.map(module => (
                    <td key={module.name} className="px-6 py-4 align-top">
                      {editingId === therapist.id ? (
                        <div className="space-y-2">
                          <div className="flex space-x-1">
                            <button
                              onClick={() => selectAllModule(module)}
                              className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
                            >
                              Todos
                            </button>
                            <button
                              onClick={() => deselectAllModule(module)}
                              className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200"
                            >
                              Ninguno
                            </button>
                          </div>
                          <div className="space-y-1">
                            {module.permissions.map(perm => (
                              <label key={perm.key} className="flex items-center text-sm">
                                <input
                                  type="checkbox"
                                  checked={editPermissions[perm.key] || false}
                                  onChange={() => togglePermission(perm.key)}
                                  className="h-3 w-3 text-violet-600 focus:ring-violet-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-gray-700">{perm.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-900">
                          {module.permissions
                            .filter(perm => therapist.permissions[perm.key])
                            .map(perm => perm.label)
                            .join(', ') || 'Ninguno'}
                        </div>
                      )}
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {editingId === therapist.id ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => savePermissions(therapist.id)}
                          className={actionButtonStyles.save}
                        >
                          <FaSave size={16} />
                        </button>
                        <button
                          onClick={cancelEditing}
                          className={actionButtonStyles.delete}
                        >
                          <FaTimes size={16} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEditing(therapist)}
                        className={actionButtonStyles.edit2}
                      >
                        <FaEdit size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-blue-900 mb-2">Información sobre Permisos</h3>
        {PERMISSION_MODULES.map(module => (
          <div key={module.name} className="mb-4">
            <h4 className="font-semibold text-blue-900 mb-2">{module.label}</h4>
            <ul className="list-disc list-inside text-blue-800 space-y-1 ml-4">
              {module.permissions.map(perm => (
                <li key={perm.key}>
                  <strong>{perm.label}:</strong> {perm.description}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ControlesPage;