// frontend/src/pages/ArchiveroPage.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { FaCloudUploadAlt, FaDownload, FaFolderOpen, FaSearch, FaTrashAlt } from 'react-icons/fa';
import Input from '../components/ui/Input';
import Pagination from '../components/ui/Pagination';
import documentService, { type DocumentOwnerType, type DocumentRecord } from '../services/documentService';
import studentService from '../services/studentService';
import therapistService from '../services/therapistService';
import guardianService from '../services/guardianService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import SearchInput from '../components/ui/SearchInput';

type OwnerTabKey = DocumentOwnerType;

interface EntitySummary {
  id: number;
  name: string;
  subtitle?: string | null;
}

interface EntityListResponse {
  data: EntitySummary[];
  total: number;
}

const ownerTabs: { key: OwnerTabKey; label: string; helper: string }[] = [
  {
    key: 'STUDENT',
    label: 'Estudiantes',
    helper: 'Carpetas individuales con documentación académica y clínica de cada estudiante.',
  },
  {
    key: 'THERAPIST',
    label: 'Terapeutas',
    helper: 'Resguardos de credenciales, contratos y expedientes del personal terapéutico.',
  },
  {
    key: 'GUARDIAN',
    label: 'Padres / Tutores',
    helper: 'Identificaciones, consentimientos y correspondencia relevante para los tutores.',
  },
  {
    key: 'MISC',
    label: 'Archivos Varios',
    helper: 'Espacio común para documentos administrativos o recursos generales.',
  },
];

const CATEGORY_SUGGESTIONS: Record<OwnerTabKey, string[]> = {
  STUDENT: ['Partida de nacimiento', 'Matriculación', 'Reporte', 'Evaluación', 'Otro'],
  THERAPIST: ['Identidad', 'Currículum', 'Contrato', 'Certificación', 'Otro'],
  GUARDIAN: ['Identidad', 'Consentimiento', 'Correspondencia', 'Otro'],
  MISC: ['Administrativo', 'Finanzas', 'Comunicaciones', 'Material de apoyo', 'Otro'],
};

const formatFileSize = (bytes: number): string => {
  if (!Number.isFinite(bytes)) return '-';
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let size = bytes / 1024;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

const formatDateTime = (value: string | Date): string => {
  try {
    const dateValue = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(dateValue.getTime())) return String(value);
    return dateValue.toLocaleString();
  } catch {
    return String(value);
  }
};

function ArchiveroPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<OwnerTabKey>('STUDENT');

  const [entitySearch, setEntitySearch] = useState('');
  const [entityPage, setEntityPage] = useState(1);
  const [entityPageSize, setEntityPageSize] = useState(10);
  const [entityList, setEntityList] = useState<EntitySummary[]>([]);
  const [entityTotal, setEntityTotal] = useState(0);
  const [entityLoading, setEntityLoading] = useState(false);
  const entityFetchRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<EntitySummary | null>(null);

  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [docLoading, setDocLoading] = useState(false);
  const [docError, setDocError] = useState('');
  const [docSearch, setDocSearch] = useState('');
  const [docCategoryFilter, setDocCategoryFilter] = useState('');
  const [docPage, setDocPage] = useState(1);
  const [docPageSize, setDocPageSize] = useState(10);
  const [docTotal, setDocTotal] = useState(0);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputKeyRef = useRef(0);

  const isAdmin = user?.role === 'admin';

  const currentCategoryOptions = useMemo(() => CATEGORY_SUGGESTIONS[activeTab] ?? [], [activeTab]);

  const resetEntityState = () => {
    setEntitySearch('');
    setEntityPage(1);
    setEntityPageSize(10);
    setEntityList([]);
    setEntityTotal(0);
    setSelectedEntity(null);
  };

  const resetDocumentState = () => {
    setDocuments([]);
    setDocPage(1);
    setDocPageSize(10);
    setDocSearch('');
    setDocCategoryFilter('');
    setDocTotal(0);
    setDocError('');
  };

  useEffect(() => {
    resetEntityState();
    resetDocumentState();
    if (entityFetchRef.current) {
      clearTimeout(entityFetchRef.current);
    }
  }, [activeTab]);

  const fetchEntities = async () => {
    if (activeTab === 'MISC') {
      setEntityList([]);
      setEntityTotal(0);
      setSelectedEntity(null);
      return;
    }

    setEntityLoading(true);
    try {
      let response: EntityListResponse;
      if (activeTab === 'STUDENT') {
        const data = await studentService.getAllStudents(entitySearch, entityPage, entityPageSize, 'all');
        response = {
          data: data.data.map((student: any) => ({
            id: student.id,
            name: student.fullName ?? `${student.nombres} ${student.apellidos}`,
            subtitle: student.therapist?.fullName ?? null,
          })),
          total: data.total,
        };
      } else if (activeTab === 'THERAPIST') {
        const data = await therapistService.getAllTherapists(entitySearch, entityPage, entityPageSize, 'all');
        response = {
          data: data.data.map((therapist: any) => ({
            id: therapist.id,
            name: therapist.fullName ?? `${therapist.nombres} ${therapist.apellidos}`,
            subtitle: therapist.specialty,
          })),
          total: data.total,
        };
      } else {
        const data = await guardianService.getAllGuardians(entitySearch, entityPage, entityPageSize, 'all');
        response = {
          data: data.data.map((guardian: any) => ({
            id: guardian.id,
            name: guardian.fullName ?? `${guardian.nombres} ${guardian.apellidos}`,
            subtitle: guardian.parentesco,
          })),
          total: data.total,
        };
      }

      setEntityList(response.data);
      setEntityTotal(response.total);
      if (!response.data.some((entity) => entity.id === selectedEntity?.id)) {
        setSelectedEntity(response.data[0] ?? null);
      }
    } catch (error) {
      console.error('Error al cargar entidades para el archivero', error);
      setEntityList([]);
      setEntityTotal(0);
      showToast({ message: 'No se pudieron cargar los registros para el archivero.', type: 'error' });
    } finally {
      setEntityLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'MISC') {
      return;
    }

    if (entityFetchRef.current) {
      clearTimeout(entityFetchRef.current);
    }

    entityFetchRef.current = setTimeout(() => {
      fetchEntities();
    }, 300);

    return () => {
      if (entityFetchRef.current) {
        clearTimeout(entityFetchRef.current);
      }
    };
  }, [entitySearch, entityPage, entityPageSize, activeTab]);

  const fetchDocuments = async () => {
    try {
      setDocLoading(true);
      setDocError('');

    if (activeTab !== 'MISC' && !selectedEntity) {
      setDocuments([]);
      setDocTotal(0);
      return;
    }

      const params: any = {
        ownerType: activeTab,
        page: docPage,
        pageSize: docPageSize,
      };

      if (activeTab !== 'MISC' && selectedEntity) {
        params.ownerId = selectedEntity.id;
      }

      if (docSearch) {
        params.search = docSearch;
      }
      if (docCategoryFilter) {
        params.category = docCategoryFilter;
      }

      const response = await documentService.listDocuments(params);
      setDocuments(response.data);
      setDocTotal(response.pagination.total);

      const totalPages = Math.max(response.pagination.totalPages, 1);
      if (response.pagination.page > totalPages) {
        setDocPage(totalPages);
      }
    } catch (error) {
      console.error('Error al obtener documentos', error);
      setDocError('No se pudieron obtener los documentos.');
      setDocuments([]);
      setDocTotal(0);
    } finally {
      setDocLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'MISC' || selectedEntity) {
      fetchDocuments();
    }
  }, [activeTab, selectedEntity, docSearch, docCategoryFilter, docPage, docPageSize]);

  const handleTabChange = (tab: OwnerTabKey) => {
    setActiveTab(tab);
  };

  const handleEntitySelect = (entity: EntitySummary) => {
    setSelectedEntity(entity);
    setDocPage(1);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    if (file && !uploadTitle) {
      setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedFile) {
      showToast({ message: 'Selecciona un archivo antes de subir.', type: 'error' });
      return;
    }

    if (activeTab !== 'MISC' && !selectedEntity) {
      showToast({ message: 'Selecciona un registro para asociar el archivo.', type: 'error' });
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('ownerType', activeTab);
    if (activeTab !== 'MISC' && selectedEntity) {
      formData.append('ownerId', String(selectedEntity.id));
    }
    if (uploadTitle.trim()) {
      formData.append('title', uploadTitle.trim());
    }
    if (uploadCategory.trim()) {
      formData.append('category', uploadCategory.trim());
    }
    if (uploadDescription.trim()) {
      formData.append('description', uploadDescription.trim());
    }

    try {
      setUploading(true);
      await documentService.uploadDocument(formData);
      showToast({ message: 'Documento cargado correctamente.', type: 'success' });
      setSelectedFile(null);
      setUploadTitle('');
      setUploadCategory('');
      setUploadDescription('');
      fileInputKeyRef.current += 1;
      fetchDocuments();
    } catch (error) {
      console.error('Error al subir documento', error);
      showToast({ message: 'No se pudo subir el documento.', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (document: DocumentRecord) => {
    if (!isAdmin) {
      showToast({ message: 'Solo los administradores pueden eliminar documentos.', type: 'error' });
      return;
    }

    if (document.readOnly) {
      showToast({ message: 'Este archivo proviene de registros anteriores y no puede eliminarse desde el archivero.', type: 'info' });
      return;
    }

    const confirmed = window.confirm('¿Deseas eliminar este documento? Esta acción no se puede deshacer.');
    if (!confirmed) return;

    try {
      await documentService.deleteDocument(document.id);
      showToast({ message: 'Documento eliminado correctamente.', type: 'success' });
      fetchDocuments();
    } catch (error) {
      console.error('Error al eliminar documento', error);
      showToast({ message: 'No se pudo eliminar el documento.', type: 'error' });
    }
  };

  const handleDownload = (document: DocumentRecord) => {
    const url = documentService.buildDownloadUrl(document);
    window.open(url, '_blank');
  };

  const renderEntityList = () => (
    <div className="space-y-4">
      <label className="text-sm font-medium text-gray-700 mb-2 block">Buscar {ownerTabs.find((tab) => tab.key === activeTab)?.label.toLowerCase()}</label>
      <div className="group relative flex items-center gap-3 rounded-full bg-white px-4 py-2 shadow border border-gray-200">
        <FaSearch className="text-gray-400" size={16} />
        <SearchInput
              type="text"
              className="text-base"
              placeholder="Buscar por nombre o terapeuta..."
              value={entitySearch}
              onChange={(event) => {
                setEntitySearch(event.target.value);
                setEntityPage(1);
              }}
            />
      </div>
      <p className="text-xs text-gray-500 mt-1">Se mostrarán los registros que coincidan con el texto ingresado.</p>

      <div className="rounded-lg border border-gray-200 divide-y divide-gray-200 max-h-[420px] overflow-y-auto">
        {entityLoading ? (
          <div className="p-4 text-center text-gray-500">Cargando...</div>
        ) : entityList.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No se encontraron registros con los filtros actuales.</div>
        ) : (
          entityList.map((entity) => {
            const isActive = selectedEntity?.id === entity.id;
            return (
              <button
                key={entity.id}
                type="button"
                className={`w-full text-left p-4 transition-colors ${
                  isActive ? 'bg-violet-100/80 border-l-4 border-violet-500' : 'hover:bg-gray-50'
                }`}
                onClick={() => handleEntitySelect(entity)}
              >
                <p className="font-semibold text-gray-800">{entity.name}</p>
                {entity.subtitle && <p className="text-xs text-gray-500 mt-1">{entity.subtitle}</p>}
              </button>
            );
          })
        )}
      </div>

      {entityTotal > entityPageSize && (
        <Pagination
          itemsPerPage={entityPageSize}
          totalItems={entityTotal}
          currentPage={entityPage}
          onPageChange={(page) => setEntityPage(page)}
          onItemsPerPageChange={(size) => {
            setEntityPageSize(size);
            setEntityPage(1);
          }}
        />
      )}
    </div>
  );

  const renderUploadForm = () => (
    <form onSubmit={handleUpload} className="space-y-4 rounded-lg border border-gray-200 p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
        <FaCloudUploadAlt className="text-violet-500" />
        Subir nuevo archivo
      </h3>
      {activeTab !== 'MISC' && selectedEntity ? (
        <p className="text-sm text-gray-600">
          Guardarás este archivo en la carpeta de <span className="font-semibold">{selectedEntity.name}</span>.
        </p>
      ) : activeTab !== 'MISC' ? (
        <p className="text-sm text-gray-600">Selecciona un registro para poder subir archivos.</p>
      ) : (
        <p className="text-sm text-gray-600">Este archivo quedará disponible en la sección de “Archivos Varios”.</p>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="text-sm font-medium text-gray-700 mb-2 block">Archivo</label>
          <input
            key={fileInputKeyRef.current}
            type="file"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-md file:border-0 file:bg-violet-50 file:px-4 file:py-2 file:text-violet-600 hover:file:bg-violet-100"
          />
          {selectedFile && (
            <p className="text-xs text-gray-500 mt-1">{selectedFile.name} · {formatFileSize(selectedFile.size)}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Título</label>
          <Input
            placeholder="Nombre descriptivo del documento"
            value={uploadTitle}
            onChange={(event) => setUploadTitle(event.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Categoría</label>
          <Input
            list="document-categories"
            placeholder="Ej. Partida de nacimiento, Identidad..."
            value={uploadCategory}
            onChange={(event) => setUploadCategory(event.target.value)}
          />
          <datalist id="document-categories">
            {currentCategoryOptions.map((option) => (
              <option value={option} key={option} />
            ))}
          </datalist>
        </div>

        <div className="md:col-span-2">
          <label className="text-sm font-medium text-gray-700 mb-2 block">Descripción (opcional)</label>
          <textarea
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
            rows={3}
            placeholder="Notas adicionales sobre el documento"
            value={uploadDescription}
            onChange={(event) => setUploadDescription(event.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={uploading || (!selectedFile || (activeTab !== 'MISC' && !selectedEntity))}
          className="flex items-center gap-2 rounded-md bg-violet-600 px-4 py-2 text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {uploading ? 'Subiendo...' : 'Guardar archivo'}
        </button>
      </div>
    </form>
  );

  const renderDocumentFilters = () => {
    const isDisabled = activeTab !== 'MISC' && !selectedEntity;

    return (
      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-700 mb-2 block">Buscar en documentos</label>
          <div className={`group relative flex items-center gap-3 rounded-full bg-white px-4 py-2 shadow border border-gray-200 ${isDisabled ? 'bg-gray-100' : ''}`}>
            <FaSearch className="text-gray-400" size={16} />
            <SearchInput
              type="text"
              className="text-base"
              placeholder="Buscar por nombre, descripción o archivo..."
              value={docSearch}
              onChange={(event) => {
                setDocSearch(event.target.value);
                setDocPage(1);
              }}
              disabled={isDisabled}
            />
          </div>
        </div>
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-700 mb-2 block">Buscar por categoría</label>
          <div className={`group relative flex items-center gap-3 rounded-full bg-white px-4 py-2 shadow border border-gray-200 ${isDisabled ? 'bg-gray-100' : ''}`}>
            <FaSearch className="text-gray-400" size={16} />
            <SearchInput
              list="document-filter-categories"
              placeholder="Seleccione una categoría..."
              value={docCategoryFilter}
              onChange={(event) => {
                setDocCategoryFilter(event.target.value);
                setDocPage(1);
              }}
              disabled={isDisabled}
            />
          </div>
          <datalist id="document-filter-categories">
            {[...new Set(documents.map((doc) => doc.category).filter(Boolean) as string[])]
              .concat(currentCategoryOptions)
              .filter((value, index, self) => self.indexOf(value) === index)
              .map((option) => (
                <option value={option} key={option} />
              ))}
          </datalist>
        </div>
      </div>
    );
  };

  const renderDocumentTable = () => (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="max-w-full overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100 bg-gray-50">
            <tr>
              <th className="px-5 py-3 text-left font-medium text-gray-500">Nombre</th>
              <th className="px-5 py-3 text-left font-medium text-gray-500">Categoría</th>
              <th className="px-5 py-3 text-left font-medium text-gray-500">Tamaño</th>
              <th className="px-5 py-3 text-left font-medium text-gray-500">Subido</th>
              <th className="px-5 py-3 text-right font-medium text-gray-500">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {docLoading ? (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-gray-500">Cargando documentos...</td>
              </tr>
            ) : documents.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-gray-500">
                  {docError || 'No se encontraron documentos con los filtros aplicados.'}
                </td>
              </tr>
            ) : (
              documents.map((document) => (
                <tr key={document.id}>
                  <td className="px-5 py-4">
                    <div className="font-semibold text-gray-800">{document.title}</div>
                    <div className="text-xs text-gray-500 mt-1 line-clamp-2">{document.description ?? document.fileName}</div>
                  </td>
                  <td className="px-5 py-4 text-gray-600">{document.category ?? 'Sin categoría'}</td>
                  <td className="px-5 py-4 text-gray-600">{formatFileSize(document.size)}</td>
                  <td className="px-5 py-4 text-gray-600">{formatDateTime(document.createdAt)}</td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => handleDownload(document)}
                        className="flex items-center gap-2 rounded-md border border-violet-500 px-3 py-2 text-violet-600 transition hover:bg-violet-50"
                      >
                        <FaDownload /> Descargar
                      </button>
                      {isAdmin && !document.readOnly && (
                        <button
                          type="button"
                          onClick={() => handleDelete(document)}
                          className="flex items-center gap-2 rounded-md border border-red-500 px-3 py-2 text-red-600 transition hover:bg-red-50"
                        >
                          <FaTrashAlt /> Eliminar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {docTotal > 0 && (
        <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
          <Pagination
            itemsPerPage={docPageSize}
            totalItems={docTotal}
            currentPage={docPage}
            onPageChange={(page) => setDocPage(page)}
            onItemsPerPageChange={(size) => {
              setDocPageSize(size);
              setDocPage(1);
            }}
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <FaFolderOpen className="text-violet-500" size={28} />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Archivero Digital</h1>
            <p className="text-sm text-gray-600">Centraliza y organiza los documentos institucionales por tipo de registro.</p>
          </div>
        </div>
      </header>

      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
        {ownerTabs.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabChange(tab.key)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                isActive ? 'bg-violet-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <p className="text-sm text-gray-600">
        {ownerTabs.find((tab) => tab.key === activeTab)?.helper}
      </p>

      {activeTab !== 'MISC' ? (
        <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
          <section>
            {renderEntityList()}
          </section>

          <section className="space-y-5">
            {renderUploadForm()}
            {renderDocumentFilters()}
            {renderDocumentTable()}
          </section>
        </div>
      ) : (
        <div className="space-y-5">
          {renderUploadForm()}
          {renderDocumentFilters()}
          {renderDocumentTable()}
        </div>
      )}
    </div>
  );
}

export default ArchiveroPage;
