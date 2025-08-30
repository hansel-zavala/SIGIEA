// frontend/src/pages/MatriculaPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import studentService from "../services/studentService";
import uploadService from "../services/uploadService";
import therapistService, { type TherapistProfile } from '../services/therapistService.js';
import medicamentoService, { type Medicamento } from "../services/medicamentoService";
import alergiaService, { type Alergia } from "../services/alergiaService";
import Label from "../components/ui/Label";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import ComboBox from "../components/ui/ComboBox";
import MultiSelectWithCatalog from "../components/ui/MultiSelectWithCatalog";
import { departamentos, municipiosPorDepartamento } from '../data/honduras-data';

interface Guardian {
  nombres: string;
  apellidos: string;
  numeroIdentidad: string;
  telefono: string;
  parentesco: string;
  direccionEmergencia: string;
}

const tiposDeAtencion = [
  { id: "atencionGrupal", label: "Atención Grupal" },
  { id: "atencionIndividual", label: "Atención Individual" },
  { id: "atencionPrevocacional", label: "Atención Prevocacional" },
  { id: "atencionDistancia", label: "Atención a Distancia" },
  { id: "terapiaDomicilio", label: "Terapia a Domicilio" },
  { id: "atencionVocacional", label: "Atención Vocacional" },
  { id: "inclusionEscolar", label: "Inclusión Escolar" },
  { id: "educacionFisica", label: "Educación Física" },
];

const tiposDeSangre = [
    { value: 'A_POSITIVO', label: 'A+' }, { value: 'A_NEGATIVO', label: 'A-' },
    { value: 'B_POSITIVO', label: 'B+' }, { value: 'B_NEGATIVO', label: 'B-' },
    { value: 'AB_POSITIVO', label: 'AB+' }, { value: 'AB_NEGATIVO', label: 'AB-' },
    { value: 'O_POSITIVO', label: 'O+' }, { value: 'O_NEGATIVO', label: 'O-' },
];


function MatriculaPage() {
    const [departamento, setDepartamento] = useState('');
    const [municipio, setMunicipio] = useState('');
    const [municipios, setMunicipios] = useState<{ id: string; nombre: string }[]>([]);

  const [studentData, setStudentData] = useState({
    nombres: "",
    apellidos: "",
    dateOfBirth: "",
    lugarNacimiento: "",
    direccion: "",
    institucionProcedencia: "",
    recibioEvaluacion: false,
    institutoIncluido: "",
    anoIngreso: new Date().toISOString().split("T")[0],
    zona: "",
    jornada: "",
    genero: "",
    tipoSangre: "",
    atencionGrupal: false,
    atencionIndividual: false,
    atencionPrevocacional: false,
    atencionDistancia: false,
    terapiaDomicilio: false,
    atencionVocacional: false,
    inclusionEscolar: false,
    educacionFisica: false,
  });

  const [guardians, setGuardians] = useState<Guardian[]>([
    {
      nombres: "",
      apellidos: "",
      numeroIdentidad: "",
      telefono: "",
      parentesco: "",
      direccionEmergencia: "",
    },
  ]);

  const [allMedicamentos, setAllMedicamentos] = useState<Medicamento[]>([]);
  const [selectedMedicamentos, setSelectedMedicamentos] = useState<Medicamento[]>([]);
  const [allAlergias, setAllAlergias] = useState<Alergia[]>([]);
  const [selectedAlergias, setSelectedAlergias] = useState<Alergia[]>([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [partidaFile, setPartidaFile] = useState<File | null>(null);
  const [evaluacionFile, setEvaluacionFile] = useState<File | null>(null);
  const [guardianIdFiles, setGuardianIdFiles] = useState<(File | null)[]>([]);
  const [therapists, setTherapists] = useState<TherapistProfile[]>([]);
  const [therapistId, setTherapistId] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const allowedFileTypes = [
    "image/jpeg", "image/png", "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ];

  const validateFile = (file: File | null) => {
    if (file && !allowedFileTypes.includes(file.type)) {
      return "Archivo no válido. Solo se permiten imágenes, PDF o Word.";
    }
    return "";
  };
  
    useEffect(() => {
        if (departamento) {
            setMunicipios(municipiosPorDepartamento[departamento] || []);
            setMunicipio(''); 
        } else {
            setMunicipios([]);
        }
    }, [departamento]);

  useEffect(() => {
    therapistService.getAllTherapists("", 1, 999)
      .then(response => {
        setTherapists(response.data);
      })
      .catch(() => setError("No se pudo cargar la lista de terapeutas."));

    medicamentoService.getAll().then(setAllMedicamentos).catch(() => setError("No se pudo cargar el catálogo de medicamentos."));
    alergiaService.getAll().then(setAllAlergias).catch(() => setError("No se pudo cargar el catálogo de alergias."));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === "checkbox";
    const checked = isCheckbox ? (e.target as HTMLInputElement).checked : false;

    const tiposDeAtencionIds = tiposDeAtencion.map(atencion => atencion.id);

    if (isCheckbox && tiposDeAtencionIds.includes(name)) {
        const resetAttentionTypes = Object.fromEntries(
            tiposDeAtencionIds.map(id => [id, false])
        );

        setStudentData(prev => ({
            ...prev,
            ...resetAttentionTypes,
            [name]: checked,
        }));
    } else {
        setStudentData(prev => ({ ...prev, [name]: isCheckbox ? checked : value }));
    }
  };

  const handleGuardianChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const newGuardians = [...guardians];

    if (name === 'numeroIdentidad' || name === 'telefono') {
      const numericValue = value.replace(/[^0-9]/g, '');
      const maxLength = name === 'numeroIdentidad' ? 13 : 8;
      newGuardians[index][name as keyof Guardian] = numericValue.slice(0, maxLength) as any;
    } else {
      newGuardians[index][name as keyof Guardian] = value as any;
    }

    setGuardians(newGuardians);
  };

  const addGuardian = () => {
    setGuardians([...guardians, { nombres: "", apellidos: "", numeroIdentidad: "", telefono: "", parentesco: "Padre", direccionEmergencia: "" }]);
  };
  
  const removeGuardian = (index: number) => {
    setGuardians(guardians.filter((_, i) => i !== index));
  };

  const handleGuardianFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const newFiles = [...guardianIdFiles];
      newFiles[index] = e.target.files[0];
      setGuardianIdFiles(newFiles);
    }
  };

  const handleAddMedicamento = async (name: string) => { await medicamentoService.create(name); setAllMedicamentos(await medicamentoService.getAll()); };
  const handleUpdateMedicamento = async (id: number, name: string) => { await medicamentoService.update(id, name); setAllMedicamentos(await medicamentoService.getAll()); };
  const handleDeleteMedicamento = async (id: number) => { await medicamentoService.remove(id); setAllMedicamentos(await medicamentoService.getAll()); };

  const handleAddAlergia = async (name: string) => { await alergiaService.create(name); setAllAlergias(await alergiaService.getAll()); };
  const handleUpdateAlergia = async (id: number, name: string) => { await alergiaService.update(id, name); setAllAlergias(await alergiaService.getAll()); };
  const handleDeleteAlergia = async (id: number) => { await alergiaService.remove(id); setAllAlergias(await alergiaService.getAll()); };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    const dniRegex = /^\d{13}$/;
    const phoneRegex = /^\d{8}$/;

    if (!studentData.nombres.trim()) errors.nombres = "Los nombres son obligatorios.";
    else if (!nameRegex.test(studentData.nombres)) errors.nombres = "Los nombres solo deben contener letras.";
    
    if (!studentData.apellidos.trim()) errors.apellidos = "Los apellidos son obligatorios.";
    else if (!nameRegex.test(studentData.apellidos)) errors.apellidos = "Los apellidos solo deben contener letras.";

    if (!studentData.dateOfBirth) errors.dateOfBirth = "La fecha de nacimiento es obligatoria.";
    if (!departamento) errors.departamento = "Debe seleccionar un departamento.";
    if (!municipio) errors.municipio = "Debe seleccionar un municipio.";
    if (!studentData.genero) errors.genero = "Debe seleccionar un género.";
    if (!studentData.zona) errors.zona = "Debe seleccionar una zona.";
    if (!studentData.jornada) errors.jornada = "Debe seleccionar una jornada.";
    if (!studentData.tipoSangre) errors.tipoSangre = "Debe seleccionar un tipo de sangre.";
    if (!studentData.direccion) errors.direccion = "La dirección es obligatoria.";
    if (!studentData.institucionProcedencia) errors.institucionProcedencia = "La institución de procedencia es obligatoria.";
    if (!therapistId) errors.therapistId = "Debe seleccionar un terapeuta.";

    if (studentData.dateOfBirth && new Date(studentData.dateOfBirth) > new Date()) {
        errors.dateOfBirth = "La fecha de nacimiento no puede ser futura.";
    }
    
    errors.partidaFileError = validateFile(partidaFile);
    errors.evaluacionFileError = validateFile(evaluacionFile);
    guardianIdFiles.forEach((file, index) => {
        errors[`guardianIdFile_${index}`] = validateFile(file);
    });


    guardians.forEach((guardian, index) => {
        if (!guardian.nombres.trim()) errors[`guardian_nombres_${index}`] = "Los nombres son obligatorios.";
        else if (!nameRegex.test(guardian.nombres)) errors[`guardian_nombres_${index}`] = "Solo debe contener letras.";
        
        if (!guardian.apellidos.trim()) errors[`guardian_apellidos_${index}`] = "Los apellidos son obligatorios.";
        else if (!nameRegex.test(guardian.apellidos)) errors[`guardian_apellidos_${index}`] = "Solo debe contener letras.";

        if (!guardian.numeroIdentidad.trim()) errors[`guardian_numeroIdentidad_${index}`] = "El DNI es obligatorio.";
        else if (!dniRegex.test(guardian.numeroIdentidad)) errors[`guardian_numeroIdentidad_${index}`] = "El DNI debe tener 13 dígitos.";

        if (!guardian.telefono.trim()) errors[`guardian_telefono_${index}`] = "El teléfono es obligatorio.";
        else if (!phoneRegex.test(guardian.telefono)) errors[`guardian_telefono_${index}`] = "El teléfono debe tener 8 dígitos.";

        if (!guardian.direccionEmergencia.trim()) errors[`guardian_direccionEmergencia_${index}`] = "La dirección de emergencia es obligatoria.";

        if (!guardian.parentesco) errors[`guardian_parentesco_${index}`] = "El parentesco es obligatorio.";
    });
    
    const finalErrors = Object.fromEntries(Object.entries(errors).filter(([_, value]) => value));
    
    setFormErrors(finalErrors);
    return Object.keys(finalErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
        setError("Por favor, corrige los errores marcados.");
        return;
    }
    setError("");

    try {
      let partidaUrl = "";
      if (partidaFile) partidaUrl = (await uploadService.uploadFile(partidaFile)).filePath;

      let evaluacionUrl = "";
      if (evaluacionFile) {
        evaluacionUrl = (await uploadService.uploadFile(evaluacionFile)).filePath;
      }

      const guardianIdUrls = await Promise.all(
        guardianIdFiles.map(file => file ? uploadService.uploadFile(file) : Promise.resolve(null))
      );

      const finalGuardians = guardians.map((guardian, index) => ({
        ...guardian,
        copiaIdentidadUrl: guardianIdUrls[index]?.filePath || "",
      }));

      const lugarNacimiento = `${municipios.find(m => m.id === municipio)?.nombre}, ${departamentos.find(d => d.id === departamento)?.nombre}`;

      const fullMatriculaData = {
        ...studentData,
        lugarNacimiento,
        partidaNacimientoUrl: partidaUrl,
        resultadoEvaluacionUrl: evaluacionUrl,
        guardians: finalGuardians,
        therapistId: parseInt(therapistId),
        medicamentos: selectedMedicamentos.map(m => m.id),
        alergias: selectedAlergias.map(a => a.id),
      };

      await studentService.createStudent(fullMatriculaData);
      navigate("/students");
    } catch (err: any) {
        const errorMessage = err.response?.data?.error || "Ocurrió un error al matricular.";
        setError(errorMessage);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Ficha de Matrícula</h2>
      {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-6">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-lg shadow-md" noValidate>
        <div className="border-b pb-6">
          <h3 className="text-xl font-semibold text-gray-700">Datos del Alumno</h3>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="nombres">Nombres del Alumno(a)</Label>
              <Input id="nombres" name="nombres" type="text" value={studentData.nombres} onChange={handleChange} placeholder="Ingresa sus nombre"/>
              {formErrors.nombres && <p className="text-red-500 text-sm mt-1">{formErrors.nombres}</p>}
            </div>

            <div>
              <Label htmlFor="apellidos">Apellidos del Alumno(a)</Label>
              <Input id="apellidos" name="apellidos" type="text" value={studentData.apellidos} onChange={handleChange} placeholder="Ingresa sus apellido"/>
              {formErrors.apellidos && <p className="text-red-500 text-sm mt-1">{formErrors.apellidos}</p>}
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
              <Label htmlFor="dateOfBirth">Fecha de Nacimiento</Label>
              <Input id="dateOfBirth" name="dateOfBirth" type="date" value={studentData.dateOfBirth} onChange={handleChange} max={today}/>
              <p className="text-xs text-gray-500 mt-1">Mes / Día / Año</p>
              {formErrors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{formErrors.dateOfBirth}</p>}
            </div>

            <div>
              <Label htmlFor="direccion">Dirección</Label>
              <Input id="direccion" name="direccion" type="text" value={studentData.direccion} onChange={handleChange} placeholder="Ingresa su dirección"/>
              {formErrors.direccion && <p className="text-red-500 text-sm mt-1">{formErrors.direccion}</p>}
            </div>
            <div>
              <Label htmlFor="genero">Género</Label>
              <Select
                id="genero"
                name="genero"
                value={studentData.genero}
                onChange={handleChange}
                placeholder=" Selecciona el género "
                options={[
                  { value: "Masculino", label: "Masculino" },
                  { value: "Femenino", label: "Femenino" },
                ]}
              />
              {formErrors.genero && <p className="text-red-500 text-sm mt-1">{formErrors.genero}</p>}
            </div>
            
            <div>
              <Label htmlFor="tipoSangre">Tipo de Sangre</Label>
              <Select
                id="tipoSangre"
                name="tipoSangre"
                value={studentData.tipoSangre}
                onChange={handleChange}
                placeholder="Selecciona el tipo de sangre"
                options={tiposDeSangre}
              />
              {formErrors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{formErrors.dateOfBirth}</p>}
            </div>

            <div>
              <Label htmlFor="zona">Zona</Label>
              <Select
                id="zona"
                name="zona"
                value={studentData.zona}
                onChange={handleChange}
                placeholder=" Selecciona la zona "
                options={[
                  { value: "Urbano", label: "Urbano" },
                  { value: "Rural", label: "Rural" },
                ]}
              />
              {formErrors.zona && <p className="text-red-500 text-sm mt-1">{formErrors.zona}</p>}
            </div>

            <div>
              <Label htmlFor="jornada">Jornada</Label>
              <Select
                id="jornada"
                name="jornada"
                value={studentData.jornada}
                onChange={handleChange}
                placeholder=" Selecciona la jornada "
                options={[
                  { value: "Matutina", label: "Matutina" },
                  { value: "Vespertina", label: "Vespertina" },
                ]}
              />
              {formErrors.jornada && <p className="text-red-500 text-sm mt-1">{formErrors.jornada}</p>}
            </div>

            <div>
              <Label htmlFor="institucionProcedencia">
                Institución de Procedencia
              </Label>
              <Input
                id="institucionProcedencia"
                name="institucionProcedencia"
                type="text"
                value={studentData.institucionProcedencia}
                placeholder="Ingresa su institución de procedencia"
                onChange={handleChange}
              />
              {formErrors.institucionProcedencia && <p className="text-red-500 text-sm mt-1">{formErrors.institucionProcedencia}</p>}
            </div>

            <div>
              <Label htmlFor="institutoIncluido">
                Nombre del instituto u otro centro donde está incluido
              </Label>
              <Input
                id="institutoIncluido"
                name="institutoIncluido"
                type="text"
                value={studentData.institutoIncluido}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="anoIngreso">Fecha de Ingreso a APO-AUTIS</Label>
              <Input
                id="anoIngreso"
                name="anoIngreso"
                type="date"
                value={studentData.anoIngreso}
                readOnly
                disabled
                className="bg-gray-100"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="partidaNacimientoUrl">Subir Partida de Nacimiento</Label>
              <Input
                id="partidaNacimientoUrl"
                name="partidaNacimientoUrl"
                type="file"
                onChange={(e) => setPartidaFile(e.target.files ? e.target.files[0] : null)}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {formErrors.partidaFileError && <p className="text-red-500 text-sm mt-1">{formErrors.partidaFileError}</p>}
            </div>
            <div className="flex items-center gap-2">
              <input
                id="recibioEvaluacion"
                name="recibioEvaluacion"
                type="checkbox"
                checked={studentData.recibioEvaluacion}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
              />
              <Label htmlFor="recibioEvaluacion">¿Recibió Evaluación?</Label>
            </div>
            {studentData.recibioEvaluacion && (
              <div>
                <Label htmlFor="resultadoEvaluacionUrl">Subir Resultado de Evaluación</Label>
                <Input
                  id="resultadoEvaluacionUrl"
                  name="resultadoEvaluacionUrl"
                  type="file"
                  onChange={(e) => setEvaluacionFile(e.target.files ? e.target.files[0] : null)}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {formErrors.evaluacionFileError && <p className="text-red-500 text-sm mt-1">{formErrors.evaluacionFileError}</p>}
              </div>
            )}
          </div>
        </div>

        <div className="border-b pb-6">
          <h3 className="text-xl font-semibold text-gray-700">Tipos de Atención</h3>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {tiposDeAtencion.map((atencion) => (
              <div key={atencion.id} className="flex items-center">
                <input
                  id={atencion.id}
                  name={atencion.id}
                  type="checkbox"
                  checked={studentData[atencion.id as keyof typeof studentData] as boolean}
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
            <Label htmlFor="therapistId">Nombre del Terapeuta</Label>
            <Select
              id="therapistId"
              name="therapistId"
              value={therapistId}
              onChange={(e) => setTherapistId(e.target.value)}
              placeholder="Selecciona un terapeuta"
              options={therapists.map(therapist => ({ value: String(therapist.id), label: therapist.fullName }))}
            />
            {formErrors.therapistId && <p className="text-red-500 text-sm mt-1">{formErrors.therapistId}</p>}
          </div>
        </div>
        
        <div className="border-b pb-6">
          <h3 className="text-xl font-semibold text-gray-700">
            Información de los Padres o Tutores
          </h3>
          {guardians.map((guardian, index) => (
            <div key={index} className="mt-4 p-4 border rounded-md relative">
              <h4 className="font-medium mb-2">Ficha {index + 1}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor={`g-nombres-${index}`}>Nombres</Label>
                  <Input id={`g-nombres-${index}`} name="nombres" type="text" value={guardian.nombres} placeholder="Ingresa sus nombre" onChange={(e) => handleGuardianChange(index, e)} />
                  {formErrors[`guardian_nombres_${index}`] && <p className="text-red-500 text-sm mt-1">{formErrors[`guardian_nombres_${index}`]}</p>}
                </div>
                <div>
                  <Label htmlFor={`g-apellidos-${index}`}>Apellidos</Label>
                  <Input id={`g-apellidos-${index}`} name="apellidos" type="text" value={guardian.apellidos} placeholder="Ingresa sus apellidos" onChange={(e) => handleGuardianChange(index, e)} />
                  {formErrors[`guardian_apellidos_${index}`] && <p className="text-red-500 text-sm mt-1">{formErrors[`guardian_apellidos_${index}`]}</p>}
                </div>
                 <div>
                  <Label htmlFor={`g-parentesco-${index}`}>Parentesco</Label>
                  <Select id={`g-parentesco-${index}`} name="parentesco" value={guardian.parentesco} onChange={(e) => handleGuardianChange(index, e)} placeholder="Selecciona su parentesco" options={[{ value: "Padre", label: "Padre" }, { value: "Madre", label: "Madre" }, { value: "Tutor_Legal", label: "Tutor Legal" }, { value: "Otro", label: "Otro" }]} />
                  {formErrors[`guardian_parentesco_${index}`] && <p className="text-red-500 text-sm mt-1">{formErrors[`guardian_parentesco_${index}`]}</p>}
                </div>
                <div>
                  <Label htmlFor={`g-numeroIdentidad-${index}`}>Número de Identidad</Label>
                  <Input id={`g-numeroIdentidad-${index}`} name="numeroIdentidad" type="text" value={guardian.numeroIdentidad} placeholder="Ingresa su número de identidad" onChange={(e) => handleGuardianChange(index, e)} />
                  {formErrors[`guardian_numeroIdentidad_${index}`] && <p className="text-red-500 text-sm mt-1">{formErrors[`guardian_numeroIdentidad_${index}`]}</p>}
                </div>
                <div>
                  <Label htmlFor={`g-telefono-${index}`}>Teléfono</Label>
                  <Input id={`g-telefono-${index}`} name="telefono" type="text" value={guardian.telefono} placeholder="Ingresa su teléfono" onChange={(e) => handleGuardianChange(index, e)} />
                  {formErrors[`guardian_telefono_${index}`] && <p className="text-red-500 text-sm mt-1">{formErrors[`guardian_telefono_${index}`]}</p>}
                </div>
                <div>
                  <Label htmlFor={`g-direccionEmergencia-${index}`}>Dirección de Emergencia</Label>
                  <Input id={`g-direccionEmergencia-${index}`} name="direccionEmergencia" type="text" value={guardian.direccionEmergencia} placeholder="Ingresa su dirección de emergencia" onChange={(e) => handleGuardianChange(index, e)} />
                  {formErrors[`guardian_direccionEmergencia_${index}`] && <p className="text-red-500 text-sm mt-1">{formErrors[`guardian_direccionEmergencia_${index}`]}</p>}
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor={`g-copiaIdentidadUrl-${index}`}>Subir Copia de Identidad</Label>
                  <Input id={`g-copiaIdentidadUrl-${index}`} name="copiaIdentidadUrl" type="file" onChange={(e) => handleGuardianFileChange(index, e)} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                  {formErrors[`guardianIdFile_${index}`] && <p className="text-red-500 text-sm mt-1">{formErrors[`guardianIdFile_${index}`]}</p>}
                </div>
              </div>
              {guardians.length > 1 && (
                <button type="button" onClick={() => removeGuardian(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-semibold">
                  Eliminar
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addGuardian} className="mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
            Añadir Otra Ficha
          </button>
        </div>

        <div className="pt-6 text-right">
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg">
            Matricular Estudiante
          </button>
        </div>
      </form>
    </div>
  );
}

export default MatriculaPage;