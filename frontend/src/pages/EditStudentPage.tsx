// frontend/src/pages/EditStudentPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import studentService from '../services/studentService';
import therapistService, { type TherapistProfile } from '../services/therapistService.js';
import uploadService from '../services/uploadService';
import medicamentoService, { type Medicamento } from '../services/medicamentoService';
import alergiaService, { type Alergia } from '../services/alergiaService';
import Label from '../components/ui/Label';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import ComboBox from '../components/ui/ComboBox';
import MultiSelectWithCatalog from '../components/ui/MultiSelectWithCatalog';
import { departamentos, municipiosPorDepartamento } from '../data/honduras-data';
import { FaExternalLinkAlt, FaTrash } from 'react-icons/fa';

type StudentFormData = {
    fullName: string; dateOfBirth: string; lugarNacimiento: string; direccion: string; institucionProcedencia: string;
    recibioEvaluacion: boolean; institutoIncluido: string; anoIngreso: string;
    zona: 'Urbano' | 'Rural'; jornada: 'Matutina' | 'Vespertina';
    genero: 'Masculino' | 'Femenino';
    therapistId?: number | string;
    atencionGrupal: boolean; atencionIndividual: boolean; atencionPrevocacional: boolean; atencionDistancia: boolean;
    terapiaDomicilio: boolean; atencionVocacional: boolean; inclusionEscolar: boolean; educacionFisica: boolean;
    partidaNacimientoUrl?: string;
    resultadoEvaluacionUrl?: string;
};

const tiposDeAtencion: { id: keyof StudentFormData; label: string }[] = [
    { id: 'atencionGrupal', label: 'Atención Grupal' },
    { id: 'atencionIndividual', label: 'Atención Individual' },
    { id: 'atencionPrevocacional', label: 'Atención Prevocacional' },
    { id: 'atencionDistancia', label: 'Atención a Distancia' },
    { id: 'terapiaDomicilio', label: 'Terapia a Domicilio' },
    { id: 'atencionVocacional', label: 'Atención Vocacional' },
    { id: 'inclusionEscolar', label: 'Inclusión Escolar' },
    { id: 'educacionFisica', label: 'Educación Física' },
];

function EditStudentPage() {
  const [formData, setFormData] = useState<Partial<StudentFormData>>({});
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [therapists, setTherapists] = useState<TherapistProfile[]>([]);
  const [newPartidaFile, setNewPartidaFile] = useState<File | null>(null);
  const [newEvaluacionFile, setNewEvaluacionFile] = useState<File | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [departamento, setDepartamento] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [municipios, setMunicipios] = useState<{ id: string; nombre: string }[]>([]);

  // Estados para catálogos médicos
  const [allMedicamentos, setAllMedicamentos] = useState<Medicamento[]>([]);
  const [selectedMedicamentos, setSelectedMedicamentos] = useState<Medicamento[]>([]);
  const [allAlergias, setAllAlergias] = useState<Alergia[]>([]);
  const [selectedAlergias, setSelectedAlergias] = useState<Alergia[]>([]);

  // Carga inicial de datos
  useEffect(() => {
    if (id) {
      // Cargar catálogos
      therapistService.getAllTherapists().then(setTherapists);
      medicamentoService.getAll().then(setAllMedicamentos);
      alergiaService.getAll().then(setAllAlergias);

      studentService.getStudentById(parseInt(id, 10))
        .then(student => {
          const formattedStudent = {
            ...student,
            therapistId: student.therapistId || '',
            dateOfBirth: new Date(student.dateOfBirth).toISOString().split('T')[0],
            anoIngreso: new Date(student.anoIngreso).toISOString().split('T')[0],
          };
          setFormData(formattedStudent);
          
          // Pre-seleccionar catálogos médicos
          setSelectedMedicamentos(student.medicamentos || []);
          setSelectedAlergias(student.alergias || []);

          if (student.lugarNacimiento) {
            const parts = student.lugarNacimiento.split(',').map((p: string) => p.trim());
            if (parts.length === 2) {
              const depto = departamentos.find(d => d.nombre === parts[1]);
              if (depto) {
                setDepartamento(depto.id);
                const munic = municipiosPorDepartamento[depto.id]?.find(m => m.nombre === parts[0]);
                if (munic) setMunicipio(munic.id);
              }
            }
          }
        })
        .catch(() => setError('No se pudieron cargar los datos del estudiante.'));
    }
  }, [id]);

  useEffect(() => {
    if (departamento) setMunicipios(municipiosPorDepartamento[departamento] || []);
  }, [departamento]);

  // ... (Las funciones handleChange, validateForm, handleFileDelete se mantienen igual, pero las incluimos para que el código esté completo)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    
    if (!formData.fullName?.trim()) errors.fullName = "El nombre es obligatorio.";
    else if (formData.fullName.trim().length < 5) errors.fullName = "El nombre parece demasiado corto.";
    else if (!formData.fullName.trim().includes(' ')) errors.fullName = "Ingresa nombre y apellido.";
    else if (!nameRegex.test(formData.fullName)) errors.fullName = "El nombre solo debe contener letras.";

    if (!departamento) errors.departamento = "Debe seleccionar un departamento.";
    if (!municipio) errors.municipio = "Debe seleccionar un municipio.";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
   const handleFileDelete = (fieldName: 'partidaNacimientoUrl' | 'resultadoEvaluacionUrl') => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este archivo?')) {
      setFormData(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

  // Funciones de gestión de catálogos
  const handleAddMedicamento = async (name: string) => { await medicamentoService.create(name); setAllMedicamentos(await medicamentoService.getAll()); };
  const handleUpdateMedicamento = async (id: number, name: string) => { await medicamentoService.update(id, name); setAllMedicamentos(await medicamentoService.getAll()); };
  const handleDeleteMedicamento = async (id: number) => { await medicamentoService.remove(id); setAllMedicamentos(await medicamentoService.getAll()); };

  const handleAddAlergia = async (name: string) => { await alergiaService.create(name); setAllAlergias(await alergiaService.getAll()); };
  const handleUpdateAlergia = async (id: number, name: string) => { await alergiaService.update(id, name); setAllAlergias(await alergiaService.getAll()); };
  const handleDeleteAlergia = async (id: number) => { await alergiaService.remove(id); setAllAlergias(await alergiaService.getAll()); };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) {
        setError('Por favor, corrige los errores en el formulario.');
        return;
    }
    setError('');

    if (id) {
      try {
        const dataToUpdate = { ...formData };

        if (newPartidaFile) dataToUpdate.partidaNacimientoUrl = (await uploadService.uploadFile(newPartidaFile)).filePath;
        if (newEvaluacionFile) dataToUpdate.resultadoEvaluacionUrl = (await uploadService.uploadFile(newEvaluacionFile)).filePath;
        
        dataToUpdate.lugarNacimiento = `${municipios.find(m => m.id === municipio)?.nombre}, ${departamentos.find(d => d.id === departamento)?.nombre}`;
        
        const finalData = {
          ...dataToUpdate,
          medicamentos: selectedMedicamentos.map(m => m.id),
          alergias: selectedAlergias.map(a => a.id),
          usaMedicamentos: selectedMedicamentos.length > 0,
          esAlergico: selectedAlergias.length > 0,
        };

        await studentService.updateStudent(parseInt(id, 10), finalData);
        navigate('/students');
      } catch (err) {
        setError('No se pudo actualizar el estudiante.');
      }
    }
  };
  
  return (
    <div className="max-w-8xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Editar Ficha del Estudiante</h2>
      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-lg shadow-md" noValidate>
        {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-6">{error}</p>}
        
        {/* ... (Sección Datos del Alumno igual, con ComboBox) ... */}
        <div className="border-b pb-6">
          <h3 className="text-xl font-semibold text-gray-700">Datos del Alumno</h3>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <Label htmlFor="fullName">Nombre Completo</Label>
                <Input id="fullName" name="fullName" type="text" value={formData.fullName || ''} onChange={handleChange}/>
                {formErrors.fullName && <p className="text-red-500 text-sm mt-1">{formErrors.fullName}</p>}
            </div>
            <div>
                <Label htmlFor="dateOfBirth">Fecha de Nacimiento</Label>
                <Input id="dateOfBirth" name="dateOfBirth" type="date" value={formData.dateOfBirth || ''} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="departamento">Departamento de Nacimiento</Label>
              <ComboBox
                value={departamento}
                onChange={setDepartamento}
                options={departamentos.map(d => ({ value: d.id, label: d.nombre }))}
                placeholder="Busca o selecciona un departamento"
              />
              {formErrors.departamento && <p className="text-red-500 text-sm mt-1">{formErrors.departamento}</p>}
            </div>
            <div>
              <Label htmlFor="municipio">Municipio de Nacimiento</Label>
              <ComboBox
                value={municipio}
                onChange={setMunicipio}
                options={municipios.map(m => ({ value: m.id, label: m.nombre }))}
                placeholder="Busca o selecciona un municipio"
                disabled={!departamento}
              />
              {formErrors.municipio && <p className="text-red-500 text-sm mt-1">{formErrors.municipio}</p>}
            </div>
            <div><Label htmlFor="direccion">Dirección</Label><Input id="direccion" name="direccion" type="text" value={formData.direccion || ''} onChange={handleChange} /></div>
            <div><Label htmlFor="genero">Género</Label><Select id="genero" name="genero" value={formData.genero || ''} onChange={handleChange} options={[{ value: 'Masculino', label: 'Masculino' }, { value: 'Femenino', label: 'Femenino' }]}/></div>
            <div><Label htmlFor="zona">Zona</Label><Select id="zona" name="zona" value={formData.zona || ''} onChange={handleChange} options={[{ value: 'Urbano', label: 'Urbano' }, { value: 'Rural', label: 'Rural' }]}/></div>
            <div><Label htmlFor="jornada">Jornada</Label><Select id="jornada" name="jornada" value={formData.jornada || ''} onChange={handleChange} options={[{ value: 'Matutina', label: 'Matutina' }, { value: 'Vespertina', label: 'Vespertina' }]}/></div>
            <div><Label htmlFor="institucionProcedencia">Institución de Procedencia</Label><Input id="institucionProcedencia" name="institucionProcedencia" type="text" value={formData.institucionProcedencia || ''} onChange={handleChange} /></div>
            <div>
              <Label>Partida de Nacimiento</Label>
              {formData.partidaNacimientoUrl ? (
                <div className="flex items-center gap-4 mt-1">
                  <a href={`http://localhost:3001${formData.partidaNacimientoUrl}`} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline flex items-center gap-2">
                    Ver Archivo Actual <FaExternalLinkAlt />
                  </a>
                  <button type="button" onClick={() => handleFileDelete('partidaNacimientoUrl')} title="Eliminar Archivo">
                    <FaTrash className="text-red-500 hover:text-red-700" />
                  </button>
                </div>
              ) : ( <p className="text-sm text-gray-500 mt-1">No hay archivo subido.</p> )}
              <Input type="file" onChange={(e) => setNewPartidaFile(e.target.files ? e.target.files[0] : null)} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
              
            </div>
            <div>
              <Label>Resultado de Evaluación</Label>
              {formData.resultadoEvaluacionUrl ? (
                <div className="flex items-center gap-4 mt-1">
                  <a href={`http://localhost:3001${formData.resultadoEvaluacionUrl}`} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline flex items-center gap-2">
                    Ver Archivo Actual <FaExternalLinkAlt />
                  </a>
                  <button type="button" onClick={() => handleFileDelete('resultadoEvaluacionUrl')} title="Eliminar Archivo">
                    <FaTrash className="text-red-500 hover:text-red-700" />
                  </button>
                </div>
              ) : ( <p className="text-sm text-gray-500 mt-1">No hay archivo subido.</p> )}
              <Input type="file" onChange={(e) => setNewEvaluacionFile(e.target.files ? e.target.files[0] : null)} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            </div>
          </div>
        </div>

        {/* ... (Sección Tipos de Atención se mantiene igual) ... */}
        <div className="border-b pb-6">
          <h3 className="text-xl font-semibold text-gray-700">Tipos de Atención</h3>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {tiposDeAtencion.map(atencion => (
              <div key={atencion.id} className="flex items-center">
                <input 
                  id={atencion.id} 
                  name={atencion.id} 
                  type="checkbox" 
                  checked={!!formData[atencion.id as keyof StudentFormData]}  
                  onChange={handleChange} 
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" 
                />
                <Label htmlFor={atencion.id} className="ml-2">{atencion.label}</Label>
              </div>
            ))}
          </div>
        </div>
        
        {/* ✅ Sección de Información Médica actualizada */}
        <div className="border-b pb-6">
          <h3 className="text-xl font-semibold text-gray-700">Información Médica</h3>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Medicamentos</Label>
              <MultiSelectWithCatalog
                catalogTitle="Gestionar Medicamentos"
                allItems={allMedicamentos}
                selectedItems={selectedMedicamentos}
                onSelectionChange={setSelectedMedicamentos}
                onAddItem={handleAddMedicamento}
                onUpdateItem={handleUpdateMedicamento}
                onDeleteItem={handleDeleteMedicamento}
              />
            </div>
            <div>
              <Label>Alergias</Label>
              <MultiSelectWithCatalog
                catalogTitle="Gestionar Alergias"
                allItems={allAlergias}
                selectedItems={selectedAlergias}
                onSelectionChange={setSelectedAlergias}
                onAddItem={handleAddAlergia}
                onUpdateItem={handleUpdateAlergia}
                onDeleteItem={handleDeleteAlergia}
              />
            </div>
          </div>
        </div>

        {/* ... (Resto del formulario se mantiene igual) ... */}
        <div className="border-b pb-6">
          <h3 className="text-xl font-semibold text-gray-700">Asignación de Terapeuta</h3>
          <div className="mt-4">
            <Label htmlFor="therapistId">Terapeuta Asignado</Label>
            <Select
              id="therapistId"
              name="therapistId"
              value={formData.therapistId || ''}
              onChange={handleChange}
              placeholder="-- No asignado --"
              options={therapists.map(therapist => ({ 
                value: String(therapist.id), 
                label: therapist.fullName 
              }))}
            />
            {formErrors.therapistId && <p className="text-red-500 text-sm mt-1">{formErrors.therapistId}</p>}
          </div>
        </div>

        <div className="pt-6 text-right">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg">
                Guardar Cambios
            </button>
        </div>
      </form>
    </div>
  );
}
export default EditStudentPage;