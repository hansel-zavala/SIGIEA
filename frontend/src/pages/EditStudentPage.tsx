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
    nombres: string;
    apellidos: string;
    dateOfBirth: string;
    lugarNacimiento: string;
    direccion: string;
    institucionProcedencia: string;
    recibioEvaluacion: boolean;
    institutoIncluido: string;
    anoIngreso: string;
    zona: string;
    jornada: string;
    genero: string;
    tipoSangre?: string;
    therapistId?: number | string;
    atencionGrupal: boolean;
    atencionIndividual: boolean;
    atencionPrevocacional: boolean;
    atencionDistancia: boolean;
    terapiaDomicilio: boolean;
    atencionVocacional: boolean;
    inclusionEscolar: boolean;
    educacionFisica: boolean;
    partidaNacimientoUrl?: string;
    resultadoEvaluacionUrl?: string;
};

const tiposDeSangre = [
    { value: 'A_POSITIVO', label: 'A+' }, { value: 'A_NEGATIVO', label: 'A-' },
    { value: 'B_POSITIVO', label: 'B+' }, { value: 'B_NEGATIVO', label: 'B-' },
    { value: 'AB_POSITIVO', label: 'AB+' }, { value: 'AB_NEGATIVO', label: 'AB-' },
    { value: 'O_POSITIVO', label: 'O+' }, { value: 'O_NEGATIVO', label: 'O-' },
];

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
  const [formData, setFormData] = useState<Partial<StudentFormData>>({
    nombres: '',
    apellidos: '',
  });
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
  const [allMedicamentos, setAllMedicamentos] = useState<Medicamento[]>([]);
  const [selectedMedicamentos, setSelectedMedicamentos] = useState<Medicamento[]>([]);
  const [allAlergias, setAllAlergias] = useState<Alergia[]>([]);
  const [selectedAlergias, setSelectedAlergias] = useState<Alergia[]>([]);

  useEffect(() => {
    if (id) {
      therapistService.getAllTherapists("", 1, 999)
        .then(response => {
            setTherapists(response.data);
        });

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    const checked = isCheckbox ? (e.target as HTMLInputElement).checked : false;

    const tiposDeAtencionIds = tiposDeAtencion.map(atencion => atencion.id as keyof StudentFormData);

    if (isCheckbox && tiposDeAtencionIds.includes(name as keyof StudentFormData)) {
        const resetAttentionTypes = Object.fromEntries(
            tiposDeAtencionIds.map(id => [id, false])
        );

        setFormData(prev => ({
            ...prev,
            ...resetAttentionTypes,
            [name]: checked,
        }));
    } else {
        setFormData(prev => ({ ...prev, [name]: isCheckbox ? checked : value }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    
    if (!formData.nombres?.trim()) errors.nombres = "Los nombres son obligatorios.";
    else if (!nameRegex.test(formData.nombres)) errors.nombres = "Los nombres solo deben contener letras.";

    if (!formData.apellidos?.trim()) errors.apellidos = "Los apellidos son obligatorios.";
    else if (!nameRegex.test(formData.apellidos)) errors.apellidos = "Los apellidos solo deben contener letras.";

    if (!departamento) errors.departamento = "Debe seleccionar un departamento.";
    if (!municipio) errors.municipio = "Debe seleccionar un municipio.";
    if (!formData.dateOfBirth) errors.dateOfBirth = "La fecha de nacimiento es obligatoria.";
    if (!departamento) errors.departamento = "Debe seleccionar un departamento.";
    if (!municipio) errors.municipio = "Debe seleccionar un municipio.";
    if (!formData.genero) errors.genero = "Debe seleccionar un género.";
    if (!formData.zona) errors.zona = "Debe seleccionar una zona.";
    if (!formData.jornada) errors.jornada = "Debe seleccionar una jornada.";
    if (!formData.tipoSangre) errors.tipoSangre = "Debe seleccionar un tipo de sangre.";
    if (!formData.direccion) errors.direccion = "La dirección es obligatoria.";
    if (!formData.institucionProcedencia) errors.institucionProcedencia = "La institución de procedencia es obligatoria.";
    if (!therapists) errors.therapistId = "Debe seleccionar un terapeuta.";
    if (formData.dateOfBirth && new Date(formData.dateOfBirth) > new Date()) {
        errors.dateOfBirth = "La fecha de nacimiento no puede ser futura.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

   const handleFileDelete = (fieldName: 'partidaNacimientoUrl' | 'resultadoEvaluacionUrl') => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este archivo?')) {
      setFormData(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

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
        const dataToUpdate: any = { ...formData };

        if (newPartidaFile) dataToUpdate.partidaNacimientoUrl = (await uploadService.uploadFile(newPartidaFile)).filePath;
        if (newEvaluacionFile) dataToUpdate.resultadoEvaluacionUrl = (await uploadService.uploadFile(newEvaluacionFile)).filePath;
        
        dataToUpdate.lugarNacimiento = `${municipios.find(m => m.id === municipio)?.nombre}, ${departamentos.find(d => d.id === departamento)?.nombre}`;
        
        const finalData = {
          ...dataToUpdate,
          medicamentos: selectedMedicamentos.map(m => m.id),
          alergias: selectedAlergias.map(a => a.id),
        };

        await studentService.updateStudent(parseInt(id, 10), finalData);
        navigate('/students');
      } catch (err) {
        setError('No se pudo actualizar el estudiante.');
      }
    }
  };
  
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Editar Ficha del Estudiante</h2>
      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-lg shadow-md" noValidate>
        {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-6">{error}</p>}
        
        <div className="border-b pb-6">
          <h3 className="text-xl font-semibold text-gray-700">Datos del Alumno</h3>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <Label htmlFor="nombres">Nombres</Label>
                <Input id="nombres" name="nombres" type="text" value={formData.nombres || ''} placeholder="Ingresa sus nombres" onChange={handleChange}/>
                {formErrors.nombres && <p className="text-red-500 text-sm mt-1">{formErrors.nombres}</p>}
            </div>
            <div>
                <Label htmlFor="apellidos">Apellidos</Label>
                <Input id="apellidos" name="apellidos" type="text" value={formData.apellidos || ''} placeholder="Ingresa sus apellidos" onChange={handleChange}/>
                {formErrors.apellidos && <p className="text-red-500 text-sm mt-1">{formErrors.apellidos}</p>}
            </div>

            <div>
                <Label htmlFor="dateOfBirth">Fecha de Nacimiento</Label>
                <Input id="dateOfBirth" name="dateOfBirth" type="date" value={formData.dateOfBirth || ''} onChange={handleChange} max={today} />
                <p className="text-xs text-gray-500 mt-1">Mes / Día / Año</p>
                {formErrors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{formErrors.dateOfBirth}</p>}
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
            <div>
              <Label htmlFor="direccion">Dirección</Label>
              <Input id="direccion" name="direccion" type="text" value={formData.direccion || ''} placeholder="Ingresa la dirección" onChange={handleChange} />
              {formErrors.direccion && <p className="text-red-500 text-sm mt-1">{formErrors.direccion}</p>}
            </div>

            <div>
              <Label htmlFor="genero">Género</Label>
              <Select 
                id="genero" 
                name="genero" 
                value={formData.genero || ''} 
                onChange={handleChange}
                placeholder=" Selecciona el género "
                options={[{ value: 'Masculino', label: 'Masculino' }, { value: 'Femenino', label: 'Femenino' }]}/>
              {formErrors.genero && <p className="text-red-500 text-sm mt-1">{formErrors.genero}</p>}
            </div>
            <div>
              <Label htmlFor="tipoSangre">Tipo de Sangre</Label>
              <Select
                id="tipoSangre"
                name="tipoSangre"
                value={formData.tipoSangre || ''}
                onChange={handleChange}
                placeholder="Selecciona el tipo de sangre"
                options={tiposDeSangre}
              />
              {formErrors.tipoSangre && <p className="text-red-500 text-sm mt-1">{formErrors.tipoSangre}</p>}
            </div>
            <div>
              <Label htmlFor="zona">Zona</Label>
              <Select id="zona" name="zona" value={formData.zona || ''} onChange={handleChange} placeholder=" Selecciona la zona " options={[{ value: 'Urbano', label: 'Urbano' }, { value: 'Rural', label: 'Rural' }]}/>
              {formErrors.zona && <p className="text-red-500 text-sm mt-1">{formErrors.zona}</p>}
            </div>
            <div>
              <Label htmlFor="jornada">Jornada</Label>
              <Select id="jornada" name="jornada" value={formData.jornada || ''} onChange={handleChange} placeholder=" Selecciona la jornada " options={[{ value: 'Matutina', label: 'Matutina' }, { value: 'Vespertina', label: 'Vespertina' }]}/>
              {formErrors.jornada && <p className="text-red-500 text-sm mt-1">{formErrors.jornada}</p>}
            </div>
            <div>
              <Label htmlFor="institucionProcedencia">Institución de Procedencia</Label>
              <Input id="institucionProcedencia" name="institucionProcedencia" type="text" value={formData.institucionProcedencia || ''} placeholder="Ingresa su institución de procedencia" onChange={handleChange} />
              {formErrors.institucionProcedencia && <p className="text-red-500 text-sm mt-1">{formErrors.institucionProcedencia}</p>}
            </div>
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