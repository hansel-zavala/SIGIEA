// frontend/src/pages/ControlesPage.tsx

import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaSave, FaTimes } from 'react-icons/fa';

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

const PERMISSIONS: Permission[] = [
  { key: 'VIEW_STUDENTS', label: 'Ver Estudiantes', description: 'Puede ver la lista de estudiantes asignados' },
  { key: 'EDIT_STUDENTS', label: 'Editar Estudiantes', description: 'Puede modificar información de estudiantes' },
  { key: 'MANAGE_SESSIONS', label: 'Gestionar Sesiones', description: 'Puede crear y editar sesiones de terapia' },
  { key: 'VIEW_REPORTS', label: 'Ver Reportes', description: 'Puede ver reportes de sus estudiantes' },
  { key: 'CREATE_REPORTS', label: 'Crear Reportes', description: 'Puede crear nuevos reportes' },
  { key: 'MANAGE_DOCUMENTS', label: 'Gestionar Documentos', description: 'Puede subir y gestionar documentos' },
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
      const response = await axios.get('controles/therapists');
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
      await axios.put(`controles/therapists/${therapistId}/permissions`, {
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
    setEditPermissions(prev => ({
      ...prev,
      [permissionKey]: !prev[permissionKey]
    }));
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
                  Terapeuta
                </th>
                {PERMISSIONS.map(perm => (
                  <th key={perm.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {perm.label}
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
                  {PERMISSIONS.map(perm => (
                    <td key={perm.key} className="px-6 py-4 whitespace-nowrap">
                      {editingId === therapist.id ? (
                        <input
                          type="checkbox"
                          checked={editPermissions[perm.key] || false}
                          onChange={() => togglePermission(perm.key)}
                          className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300 rounded"
                        />
                      ) : (
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          therapist.permissions[perm.key]
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {therapist.permissions[perm.key] ? 'Sí' : 'No'}
                        </span>
                      )}
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {editingId === therapist.id ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => savePermissions(therapist.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <FaSave size={16} />
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FaTimes size={16} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEditing(therapist)}
                        className="text-violet-600 hover:text-violet-900"
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
        <ul className="list-disc list-inside text-blue-800 space-y-1">
          {PERMISSIONS.map(perm => (
            <li key={perm.key}>
              <strong>{perm.label}:</strong> {perm.description}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ControlesPage;