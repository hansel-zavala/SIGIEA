// frontend/src/pages/MatriculaPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import studentService from "../services/studentService";
import uploadService from "../services/uploadService";
import therapistService, { type TherapistProfile, } from "../services/therapistService.js";
import medicamentoService, { type Medicamento, } from "../services/medicamentoService";
import alergiaService, { type Alergia } from "../services/alergiaService";
import MultiSelectWithCatalog from "../components/ui/MultiSelectWithCatalog";
import { SelectWithCatalog } from "../components/ui/SelectWithCatalog";
import {  departamentos,  municipiosPorDepartamento, } from "../data/honduras-data";
import { FaPlus, FaTrash } from "react-icons/fa";
import CustomDatePicker from "../components/ui/DatePicker";
import { getAllTiposParentesco, createTipoParentesco, deleteTipoParentesco, updateTipoParentesco } from "../services/tipoParentescoService";
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog';
import Label from "../components/ui/Label";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";


interface Guardian {
  nombres: string;
  apellidos: string;
  numeroIdentidad: string;
  telefono: string;
  parentesco: string;
  direccionEmergencia: string;
  parentescoEspecifico?: string;
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
  { value: "A_POSITIVO", label: "A+" },
  { value: "A_NEGATIVO", label: "A-" },
  { value: "B_POSITIVO", label: "B+" },
  { value: "B_NEGATIVO", label: "B-" },
  { value: "AB_POSITIVO", label: "AB+" },
  { value: "AB_NEGATIVO", label: "AB-" },
  { value: "O_POSITIVO", label: "O+" },
  { value: "O_NEGATIVO", label: "O-" },
];

const genderOptions = [
  { value: "Masculino", label: "Masculino" },
  { value: "Femenino", label: "Femenino" },
];

const zonaOptions = [
  { value: "Urbano", label: "Urbano" },
  { value: "Rural", label: "Rural" },
];

const jornadaOptions = [
  { value: "Matutina", label: "Matutina" },
  { value: "Vespertina", label: "Vespertina" },
];

const parentescoOptions = [
  { value: "Padre", label: "Padre" },
  { value: "Madre", label: "Madre" },
  { value: "Tutor_Legal", label: "Tutor Legal" },
  { value: "Otro", label: "Otro" },
];

function MatriculaPage() {
  const [departamento, setDepartamento] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [municipios, setMunicipios] = useState<
    { id: string; nombre: string }[]
  >([]);

  const [studentData, setStudentData] = useState({
    nombres: "",
    apellidos: "",
    dateOfBirth: "",
    lugarNacimiento: "",
    direccion: "",
    //institucionProcedencia: "",
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
    referenciaMedica: '',
  });

  const [guardians, setGuardians] = useState<Guardian[]>([
    {
      nombres: "",
      apellidos: "",
      numeroIdentidad: "",
      telefono: "",
      parentesco: "",
      parentescoEspecifico: '',
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
  const [therapistId, setTherapistId] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [guardianIndexToDelete, setGuardianIndexToDelete] = useState<number | null>(null);

  const validateFile = (file: File | null) => {
  if (!file) return "";

  const allowedFileTypes = [
    "image/jpeg",
    "image/png",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (!allowedFileTypes.includes(file.type)) {
    return "Archivo no válido. Solo se permiten imágenes, PDF o Word.";
  }

  const maxSizeInBytes = 5 * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    return "El archivo es demasiado grande. El límite es de 5MB.";
  }

  return "";
};


  useEffect(() => {
    if (departamento) {
      setMunicipios(municipiosPorDepartamento[departamento] || []);
      setMunicipio("");
    } else {
      setMunicipios([]);
    }
  }, [departamento]);

  useEffect(() => {
    therapistService.getAllTherapists("", 1, 999).then((response) => {setTherapists(response.data);}).catch(() => setError("No se pudo cargar la lista de terapeutas."));
    medicamentoService.getAll().then(setAllMedicamentos).catch(() => setError("No se pudo cargar el catálogo de medicamentos."));
    alergiaService.getAll().then(setAllAlergias).catch(() => setError("No se pudo cargar el catálogo de alergias."));
  }, []);

  const handleStudentSelectChange = (name: string, value: string | null) => {setStudentData((prev) => ({ ...prev, [name]: value || "" }));};

  const handleGuardianSelectChange = (
    index: number,
    name: string,
    value: string | null
  ) => {
    const newGuardians = [...guardians];
    const guardianToUpdate = { ...newGuardians[index], [name]: value || "" };

    // Si el parentesco principal cambia, y no es uno que requiera especificación, se limpia el campo específico.
    if (name === 'parentesco' && value !== 'Tutor_Legal' && value !== 'Otro') {
      guardianToUpdate.parentescoEspecifico = '';
    }
    
    newGuardians[index] = guardianToUpdate;
    setGuardians(newGuardians);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === "checkbox";
    const checked = isCheckbox ? (e.target as HTMLInputElement).checked : false;

    if (name === 'nombres' || name === 'apellidos') {
        const filteredValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
        setStudentData(prev => ({ ...prev, [name]: filteredValue }));
        return;
    }

    setStudentData((prev) => ({
      ...prev,
      [name]: isCheckbox ? checked : value,
    }));
  };

  const handleGuardianChange = ( index: number, e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  const newGuardians = [...guardians];
  const guardianToUpdate = { ...newGuardians[index] };

  let processedValue = value;

  if (name === 'nombres' || name === 'apellidos') {
    processedValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
  } else if (name === 'numeroIdentidad' || name === 'telefono') {
    const numericValue = value.replace(/[^0-9]/g, '');
    const maxLength = name === 'numeroIdentidad' ? 13 : 8;
    processedValue = numericValue.slice(0, maxLength);
  }

  guardianToUpdate[name as keyof Guardian] = processedValue as any;
  newGuardians[index] = guardianToUpdate;
  setGuardians(newGuardians);
};

  const addGuardian = () => {
    setGuardians([
      ...guardians,
      {
        nombres: "",
        apellidos: "",
        numeroIdentidad: "",
        telefono: "",
        parentesco: "",
        parentescoEspecifico: '',
        direccionEmergencia: "",
      },
    ]);
  };
  
  const handleRemoveGuardianClick = (index: number) => {
    setGuardianIndexToDelete(index); // Guardamos el índice de la ficha a eliminar
    setConfirmOpen(true); // Abrimos el diálogo
  };

  const handleConfirmDelete = () => {
    if (guardianIndexToDelete !== null) {
      // Filtramos el array para quitar la ficha correspondiente
      setGuardians(guardians.filter((_, i) => i !== guardianIndexToDelete));
      
      // Reseteamos los estados del diálogo
      setGuardianIndexToDelete(null);
      setConfirmOpen(false);
    }
  };

  const removeGuardian = (index: number) => {
    setGuardians(guardians.filter((_, i) => i !== index));
  };

  const handleGuardianFileChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      const newFiles = [...guardianIdFiles];
      newFiles[index] = e.target.files[0];
      setGuardianIdFiles(newFiles);
    }
  };

  const handleAddMedicamento = async (name: string) => {
    await medicamentoService.create(name);
    setAllMedicamentos(await medicamentoService.getAll());
  };
  const handleUpdateMedicamento = async (id: number, name: string) => {
    await medicamentoService.update(id, name);
    setAllMedicamentos(await medicamentoService.getAll());
  };

  const handleDeleteMedicamento = async (id: number) => {
    await medicamentoService.remove(id);
    setAllMedicamentos(await medicamentoService.getAll());
    setSelectedMedicamentos(prev => prev.filter(item => item.id !== id));
  };

  const handleAddAlergia = async (name: string) => {
    await alergiaService.create(name);
    setAllAlergias(await alergiaService.getAll());
  };
  const handleUpdateAlergia = async (id: number, name: string) => {
    await alergiaService.update(id, name);
    setAllAlergias(await alergiaService.getAll());
  };
  const handleDeleteAlergia = async (id: number) => {
    await alergiaService.remove(id);
    setAllAlergias(await alergiaService.getAll());
    setSelectedAlergias(prev => prev.filter(item => item.id !== id));
  };

  const validateForm = () => {
  const errors: Record<string, string> = {};
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
  const addressRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,#\-°]+$/;
  const dniRegex = /^\d{13}$/;
  const phoneRegex = /^\d{8}$/;

  if (!studentData.nombres.trim()) errors.nombres = "Los nombres son obligatorios.";
  else if (!nameRegex.test(studentData.nombres)) errors.nombres = "Los nombres solo deben contener letras.";

  if (!studentData.apellidos.trim()) errors.apellidos = "Los apellidos son obligatorios.";
  else if (!nameRegex.test(studentData.apellidos)) errors.apellidos = "Los apellidos solo deben contener letras.";
  
  if (!studentData.dateOfBirth) errors.dateOfBirth = "La fecha de nacimiento es obligatoria.";
  else if (new Date(studentData.dateOfBirth) > new Date()) errors.dateOfBirth = "La fecha no puede ser futura.";
  
  if (!departamento) errors.departamento = "Debe seleccionar un departamento.";
  if (!municipio) errors.municipio = "Debe seleccionar un municipio.";
  if (!studentData.genero) errors.genero = "Debe seleccionar un género.";
  if (!studentData.zona) errors.zona = "Debe seleccionar una zona.";
  if (!studentData.jornada) errors.jornada = "Debe seleccionar una jornada.";
  if (!studentData.tipoSangre) errors.tipoSangre = "Debe seleccionar un tipo de sangre.";
  if (!therapistId) errors.therapistId = "Debe seleccionar un terapeuta.";
  if (!Object.values(tiposDeAtencion).some((_, index) => studentData[tiposDeAtencion[index].id as keyof typeof studentData] === true)) {errors.tiposDeAtencion = "Debe seleccionar al menos un tipo de atención.";}

  if (!studentData.direccion.trim()) errors.direccion = "La dirección es obligatoria.";
  else if (!addressRegex.test(studentData.direccion)) errors.direccion = "La dirección contiene caracteres no permitidos.";

  if (!studentData.referenciaMedica.trim()) errors.referenciaMedica = "La referencia médica es obligatoria.";
  else if (!addressRegex.test(studentData.referenciaMedica)) errors.referenciaMedica = "El nombre contiene caracteres no permitidos.";

  // Validar archivos requeridos
  /*if (!partidaFile) errors.partidaFileError = "La partida de nacimiento es obligatoria.";
  else errors.partidaFileError = validateFile(partidaFile);*/
  if (partidaFile) errors.partidaFileError = validateFile(partidaFile);
  
  /*if (studentData.recibioEvaluacion && !evaluacionFile) errors.evaluacionFileError = "El archivo de evaluación es obligatorio.";
  else errors.evaluacionFileError = validateFile(evaluacionFile);*/
  if (studentData.recibioEvaluacion && evaluacionFile) errors.evaluacionFileError = validateFile(evaluacionFile);

  const guardianDNIs = new Set<string>();
  const parentescoCount = { Padre: 0, Madre: 0 };

  guardians.forEach((guardian, index) => {
    if (!guardian.nombres.trim()) errors[`guardian_nombres_${index}`] = "Los nombres son obligatorios.";
    else if (!nameRegex.test(guardian.nombres)) errors[`guardian_nombres_${index}`] = "Solo debe contener letras.";
    if (!guardian.apellidos.trim()) errors[`guardian_apellidos_${index}`] = "Los apellidos son obligatorios.";
    else if (!nameRegex.test(guardian.apellidos)) errors[`guardian_apellidos_${index}`] = "Solo debe contener letras.";

    if (!guardian.numeroIdentidad.trim()) errors[`guardian_numeroIdentidad_${index}`] = "El DNI es obligatorio.";
    else if (!dniRegex.test(guardian.numeroIdentidad)) errors[`guardian_numeroIdentidad_${index}`] = "El DNI debe tener 13 dígitos.";
    else if (guardianDNIs.has(guardian.numeroIdentidad)) errors[`guardian_numeroIdentidad_${index}`] = "Este DNI ya fue ingresado.";
    else guardianDNIs.add(guardian.numeroIdentidad);

    if (!guardian.telefono.trim()) errors[`guardian_telefono_${index}`] = "El teléfono es obligatorio.";
    else if (!phoneRegex.test(guardian.telefono)) errors[`guardian_telefono_${index}`] = "El teléfono debe tener 8 dígitos.";

    if (!guardian.direccionEmergencia.trim()) errors[`guardian_direccionEmergencia_${index}`] = "La dirección es obligatoria.";
    else if (!addressRegex.test(guardian.direccionEmergencia)) errors[`guardian_direccionEmergencia_${index}`] = "La dirección contiene caracteres no permitidos.";

    if (!guardian.parentesco) errors[`guardian_parentesco_${index}`] = "El parentesco es obligatorio.";
    else if (guardian.parentesco === 'Padre' || guardian.parentesco === 'Madre') {
      parentescoCount[guardian.parentesco]++;
      if (parentescoCount[guardian.parentesco] > 1) {
        errors[`guardian_parentesco_${index}`] = `Solo se puede registrar un ${guardian.parentesco}.`;
      }
    }

    if ((guardian.parentesco === 'Tutor_Legal' || guardian.parentesco === 'Otro') && !guardian.parentescoEspecifico) {
      errors[`guardian_parentescoEspecifico_${index}`] = "Debe especificar el parentesco.";
    }

    // Archivo de Identidad
    /*if (!guardianIdFiles[index]) errors[`guardianIdFile_${index}`] = "La copia de identidad es obligatoria.";
    else errors[`guardianIdFile_${index}`] = validateFile(guardianIdFiles[index]);*/
    if (guardianIdFiles[index]) errors[`guardianIdFile_${index}`] = validateFile(guardianIdFiles[index]);
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
      if (partidaFile)
        partidaUrl = (await uploadService.uploadFile(partidaFile)).filePath;

      let evaluacionUrl = "";
      if (evaluacionFile) {
        evaluacionUrl = (await uploadService.uploadFile(evaluacionFile))
          .filePath;
      }

      const guardianIdUrls = await Promise.all(
        guardianIdFiles.map((file) =>
          file ? uploadService.uploadFile(file) : Promise.resolve(null)
        )
      );

      const finalGuardians = guardians.map((guardian, index) => ({
        ...guardian,
        copiaIdentidadUrl: guardianIdUrls[index]?.filePath || "",
      }));

      const lugarNacimiento = `${
        municipios.find((m) => m.id === municipio)?.nombre
      }, ${departamentos.find((d) => d.id === departamento)?.nombre}`;

      const fullMatriculaData = {
        ...studentData,
        lugarNacimiento,
        partidaNacimientoUrl: partidaUrl,
        resultadoEvaluacionUrl: evaluacionUrl,
        guardians: finalGuardians,
        therapistId: parseInt(therapistId),
        medicamentos: selectedMedicamentos.map((m) => m.id),
        alergias: selectedAlergias.map((a) => a.id),
      };

      await studentService.createStudent(fullMatriculaData);
      navigate("/students");
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || "Ocurrió un error al matricular.";
      setError(errorMessage);
    }
  };

  const deptoOptions = departamentos.map((d) => ({
    value: d.id,
    label: d.nombre,
  }));

  const municipioOptions = municipios.map((m) => ({
    value: m.id,
    label: m.nombre,
  }));

  const handleDateChange = (date: Date | null) => {
    setStudentData((prev) => ({
      ...prev,
      dateOfBirth: date ? date.toISOString().split("T")[0] : "",
    }));
  };


  const acceptedFileTypes = "image/png, image/jpeg, application/pdf, .doc, .docx, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        Ficha de Matrícula
      </h2>
      <form onSubmit={handleSubmit} noValidate>
        {error && (<p className="text-red-500 bg-red-100 p-3 rounded-md mb-6">{error}</p>)}

        <fieldset className="border border-violet-300 p-4 rounded-md">
          <legend className="text-xl font-semibold text-gray-700">
            Datos del Alumno
          </legend>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="nombres">Nombres del Alumno(a)</Label>
              <Input
                id="nombres"
                name="nombres"
                type="text"
                value={studentData.nombres}
                onChange={handleChange}
                placeholder="Ingresa sus nombres"
              />
              {formErrors.nombres && (<p className="text-red-500 text-sm mt-1"> {formErrors.nombres} </p>)}
            </div>

            <div>
              <Label htmlFor="apellidos">Apellidos del Alumno(a)</Label>
              <Input
                id="apellidos"
                name="apellidos"
                type="text"
                value={studentData.apellidos}
                onChange={handleChange}
                placeholder="Ingresa sus apellido"
              />
              {formErrors.apellidos && (<p className="text-red-500 text-sm mt-1">{formErrors.apellidos}</p>)}
            </div>

            <div>
              <Label htmlFor="departamento">Departamento de Nacimiento</Label>
              <Select
                instanceId="depto-select"
                inputId="departamento"
                value={deptoOptions.find((d) => d.value === departamento) || null}
                onChange={(option) => setDepartamento(option?.value || "")}
                options={deptoOptions}
                placeholder="Busca o selecciona un departamento"
              />
              {formErrors.departamento && (<p className="text-red-500 text-sm mt-1">{formErrors.departamento}</p>)}
            </div>

            <div>
              <Label htmlFor="municipio">Municipio de Nacimiento</Label>
              <Select
                instanceId="municipio-select"
                inputId="municipio"
                value={municipioOptions.find((m) => m.value === municipio) || null}
                onChange={(option) => setMunicipio(option?.value || "")}
                options={municipioOptions}
                placeholder="Busca o selecciona un municipio"
                isDisabled={!departamento}
              />
              {formErrors.municipio && (<p className="text-red-500 text-sm mt-1">{formErrors.municipio}</p>)}
            </div>

            <div>
              <Label htmlFor="dateOfBirth">Fecha de Nacimiento</Label>
              <CustomDatePicker
                selected={ studentData.dateOfBirth ? new Date(studentData.dateOfBirth) : null }
                onChange={handleDateChange}
                maxDate={new Date()}
              />
              <p className="text-xs text-gray-500 mt-1">Día / Mes / Año</p>
              {formErrors.dateOfBirth && (<p className="text-red-500 text-sm mt-1">{formErrors.dateOfBirth}</p>)}
            </div>

            <div>
              <Label htmlFor="direccion">Dirección</Label>
              <Input
                id="direccion"
                name="direccion"
                type="text"
                value={studentData.direccion}
                onChange={handleChange}
                placeholder="Ingresa su dirección"
              />
              {formErrors.direccion && (<p className="text-red-500 text-sm mt-1">{formErrors.direccion}</p>)}
            </div>
            
            <div>
              <Label htmlFor="genero">Género</Label>
              <Select
                instanceId="genero-select"
                inputId="genero"
                value={ genderOptions.find((o) => o.value === studentData.genero) || null }
                onChange={(option) => handleStudentSelectChange("genero", option?.value || null)}
                placeholder=" Selecciona el género "
                options={genderOptions}
              />
              {formErrors.genero && (<p className="text-red-500 text-sm mt-1">{formErrors.genero}</p>)}
            </div>

            <div>
              <Label htmlFor="tipoSangre">Tipo de Sangre</Label>
              <Select
                instanceId="sangre-select"
                inputId="tipoSangre"
                value={tiposDeSangre.find((o) => o.value === studentData.tipoSangre) || null}
                onChange={(option) => handleStudentSelectChange("tipoSangre", option?.value || null)}
                placeholder="Selecciona el tipo de sangre"
                options={tiposDeSangre}
              />
              {formErrors.tipoSangre && (<p className="text-red-500 text-sm mt-1">{formErrors.tipoSangre}</p>)}
            </div>

            <div>
              <Label htmlFor="zona">Zona de Residencia</Label>
              <Select
                instanceId="zona-select"
                inputId="zona"
                value={ zonaOptions.find((o) => o.value === studentData.zona) || null }
                onChange={(option) => handleStudentSelectChange("zona", option?.value || null)}
                placeholder=" Selecciona la zona "
                options={zonaOptions}
              />
              {formErrors.zona && (<p className="text-red-500 text-sm mt-1">{formErrors.zona}</p>)}
            </div>

            <div>
              <Label htmlFor="jornada">Jornada</Label>
              <Select
                instanceId="jornada-select"
                inputId="jornada"
                value={ jornadaOptions.find((o) => o.value === studentData.jornada) || null }
                onChange={(option) => handleStudentSelectChange("jornada", option?.value || null)}
                placeholder=" Selecciona la jornada "
                options={jornadaOptions}
              />
              {formErrors.jornada && (<p className="text-red-500 text-sm mt-1">{formErrors.jornada}</p>)}
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
                placeholder="Ingresa su instituto o centro"
                onChange={handleChange}
              />
              {formErrors.institucionProcedencia && (<p className="text-red-500 text-sm mt-1"> {formErrors.institucionProcedencia}</p>)}
            </div>

            <div>
              <Label htmlFor="referenciaMedica">
                Referencia Medica
              </Label>
              <Input
                id="referenciaMedica"
                name="referenciaMedica"
                type="text"
                value={studentData.referenciaMedica}
                onChange={handleChange}
                placeholder="Ingresa la referencia médica"
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
                className="bg-grey-100"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="partidaNacimientoUrl">
                Subir Partida de Nacimiento
              </Label>
              {partidaFile ? (
            <div className="flex items-center justify-between p-2 border rounded-md bg-gray-50">
              <span className="text-sm text-gray-700">{partidaFile.name}</span>
              <button
                type="button"
                onClick={() => setPartidaFile(null)}
                className="text-red-500 hover:text-red-700"
                title="Eliminar archivo"
              >
                <FaTrash />
              </button>
            </div>
          ) : (
            <Input
              id="partidaNacimientoUrl"
              name="partidaNacimientoUrl"
              type="file"
              accept={acceptedFileTypes}
              onChange={(e) =>
                setPartidaFile(e.target.files ? e.target.files[0] : null)
              }
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-200 file:text-violet-700 hover:file:bg-violet-100"
            />
          )}
              {formErrors.partidaFileError && (<p className="text-red-500 text-sm mt-1"> {formErrors.partidaFileError}</p>)}
            </div>

            <div className="flex items-center gap-2">
              <input
                id="recibioEvaluacion"
                name="recibioEvaluacion"
                type="checkbox"
                checked={studentData.recibioEvaluacion}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500 accent-violet-500"
              />
              <Label htmlFor="recibioEvaluacion">¿Recibió Evaluación?</Label>
            </div>

            {studentData.recibioEvaluacion && (
              <div>
                <Label htmlFor="resultadoEvaluacionUrl">
                  Subir Resultado de Evaluación
                </Label>
            {evaluacionFile ? (
              <div className="flex items-center justify-between p-2 border rounded-md bg-gray-50">
                <span className="text-sm text-gray-700">{evaluacionFile.name}</span>
                  <button
                    type="button"
                    onClick={() => setEvaluacionFile(null)}
                    className="text-red-500 hover:text-red-700"
                    title="Eliminar archivo"
                    >   
                    <FaTrash />
                  </button>
              </div>
            ) : (
              <Input
                id="resultadoEvaluacionUrl"
                name="resultadoEvaluacionUrl"
                type="file"
                accept={acceptedFileTypes}
                onChange={(e) => setEvaluacionFile(e.target.files ? e.target.files[0] : null)}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-200 file:text-violet-700 hover:file:bg-violet-100"
              />
            )}
            {formErrors.evaluacionFileError && (<p className="text-red-500 text-sm mt-1">{formErrors.evaluacionFileError} </p>)}
          </div>
            )}
          </div>
        </fieldset>

        <fieldset className="border border-violet-300 p-4 rounded-md mt-6">
          <legend className="text-xl font-semibold text-gray-700 px-2">
            Tipos de Atención
          </legend>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {tiposDeAtencion.map((atencion) => (
              <div key={atencion.id} className="flex items-center">
                <input
                  id={atencion.id}
                  name={atencion.id}
                  type="checkbox"
                  checked={studentData[atencion.id as keyof typeof studentData] as boolean}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500 accent-violet-500"
                />
                <Label htmlFor={atencion.id} className="ml-2"> {atencion.label}</Label>
              </div>
            ))}
          </div>
          {formErrors.tiposDeAtencion && (<p className="text-red-500 text-sm mt-1">{formErrors.tiposDeAtencion}</p>)}
        </fieldset>

        <fieldset className="border border-violet-300 p-4 rounded-md mt-6">
          <legend className="text-xl font-semibold text-gray-700 px-2">
            Información Médica
          </legend>
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
        </fieldset>

        <fieldset className="border border-violet-300 p-4 rounded-md mt-6">
          <legend className="text-xl font-semibold text-gray-700 px-2">
            Asignación de Terapeuta
          </legend>
          <div className="mt-4">
            <Label htmlFor="therapistId">Nombre del Terapeuta</Label>
            <Select
              instanceId="therapist-matricula-select"
              inputId="therapistId"
              value={ therapists.map((t) => ({ value: String(t.id), label: t.fullName })).find((o) => o.value === therapistId) || null }
              onChange={(option) => setTherapistId(option?.value || "")}
              placeholder="Selecciona un terapeuta"
              options={therapists.map((therapist) => ({value: String(therapist.id),label: therapist.fullName, }))}
            />
            {formErrors.therapistId && (<p className="text-red-500 text-sm mt-1">{formErrors.therapistId}</p>)}
          </div>
        </fieldset>

        <fieldset className="border border-violet-300 p-4 rounded-md mt-6">
          <legend className="text-xl font-semibold text-gray-700">
            Información de los Padres o Tutores
          </legend>
          <div className="flex justify-between items-center mb-4 gap-4">
        <p className="text-xs text-gray-500 mt-1">La primera ficha va a ser para el padre principal. </p>
        <div/>
          </div>
          {guardians.map((guardian, index) => (
            <div key={index} className="mt-4 p-4 border border-violet-300 rounded-md relative">
              <h4 className="font-medium mb-2">Ficha {index + 1}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor={`g-nombres-${index}`}>Nombres</Label>
                  <Input
                    id={`g-nombres-${index}`}
                    name="nombres"
                    type="text"
                    value={guardian.nombres}
                    placeholder="Ingresa sus nombre"
                    onChange={(e) => handleGuardianChange(index, e)}
                  />
                  {formErrors[`guardian_nombres_${index}`] && (<p className="text-red-500 text-sm mt-1">{formErrors[`guardian_nombres_${index}`]}</p>)}
                </div>

                <div>
                  <Label htmlFor={`g-apellidos-${index}`}>Apellidos</Label>
                  <Input
                    id={`g-apellidos-${index}`}
                    name="apellidos"
                    type="text"
                    value={guardian.apellidos}
                    placeholder="Ingresa sus apellidos"
                    onChange={(e) => handleGuardianChange(index, e)}
                  />
                  {formErrors[`guardian_apellidos_${index}`] && (<p className="text-red-500 text-sm mt-1">{formErrors[`guardian_apellidos_${index}`]}</p>)}
                </div>

                

                <div>
                  <Label htmlFor={`g-numeroIdentidad-${index}`}>
                    Número de Identidad
                  </Label>
                  <Input
                    id={`g-numeroIdentidad-${index}`}
                    name="numeroIdentidad"
                    type="text"
                    value={guardian.numeroIdentidad}
                    placeholder="Ingresa su número de identidad"
                    onChange={(e) => handleGuardianChange(index, e)}
                  />
                  {formErrors[`guardian_numeroIdentidad_${index}`] && (<p className="text-red-500 text-sm mt-1">{formErrors[`guardian_numeroIdentidad_${index}`]}</p>)}
                </div>

                <div>
                  <Label htmlFor={`g-telefono-${index}`}>Teléfono</Label>
                  <Input
                    id={`g-telefono-${index}`}
                    name="telefono"
                    type="text"
                    value={guardian.telefono}
                    placeholder="Ingresa su teléfono"
                    onChange={(e) => handleGuardianChange(index, e)}
                  />
                  {formErrors[`guardian_telefono_${index}`] && (<p className="text-red-500 text-sm mt-1">{formErrors[`guardian_telefono_${index}`]}</p>)}
                </div>

                <div>
                  <Label htmlFor={`g-direccionEmergencia-${index}`}>
                    Dirección de Emergencia
                  </Label>
                  <Input
                    id={`g-direccionEmergencia-${index}`}
                    name="direccionEmergencia"
                    type="text"
                    value={guardian.direccionEmergencia}
                    placeholder="Ingresa su dirección de emergencia"
                    onChange={(e) => handleGuardianChange(index, e)}
                  />
                  {formErrors[`guardian_direccionEmergencia_${index}`] && (<p className="text-red-500 text-sm mt-1">{formErrors[`guardian_direccionEmergencia_${index}`]}</p>)}
                </div>

                <div>
                  <Label htmlFor={`g-parentesco-${index}`}>Parentesco</Label>
                  <Select
                    instanceId={`g-parentesco-select-${index}`}
                    inputId={`g-parentesco-${index}`}
                    name="parentesco"
                    value={parentescoOptions.find((o) => o.value === guardian.parentesco) || null}
                    onChange={(option) => handleGuardianSelectChange(index, "parentesco", option?.value || null)}
                    placeholder="Selecciona su parentesco"
                    options={parentescoOptions}
                  />
                  {formErrors[`guardian_parentesco_${index}`] && (
                  <p className="text-red-500 text-sm mt-1">{formErrors[`guardian_parentesco_${index}`]}</p>
                  )}
                </div>

                {(guardian.parentesco === 'Tutor_Legal' || guardian.parentesco === 'Otro') && (
                <div>
                  <SelectWithCatalog
                      label="Especifique Parentesco"
                      catalogName="Tipos de Parentesco"
                      instanceId={`g-parentesco-especifico-select-${index}`}
                      value={guardian.parentescoEspecifico || null}
                      onChange={(value) => handleGuardianSelectChange(index, "parentescoEspecifico", value)}
                      loadCatalogOptions={getAllTiposParentesco}
                      createOptionService={createTipoParentesco}
                      updateOptionService={updateTipoParentesco}
                      deleteOptionService={deleteTipoParentesco}
                      placeholder="Seleccione el tipo"
                    />
                  {formErrors[`guardian_parentescoEspecifico_${index}`] && (
                  <p className="text-red-500 text-sm mt-1">{formErrors[`guardian_parentescoEspecifico_${index}`]}</p>
                  )}
                </div>
                )}

                <div className="md:col-span-2">
                  <Label htmlFor={`g-copiaIdentidadUrl-${index}`}>
                    Subir Copia de Identidad
                  </Label>
                  {guardianIdFiles[index] ? (
                <div className="flex items-center justify-between p-2 border rounded-md bg-gray-50">
                  <span className="text-sm text-gray-700">{guardianIdFiles[index]?.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                    const newFiles = [...guardianIdFiles];
                    newFiles[index] = null;
                    setGuardianIdFiles(newFiles);
                    }}
                    className="text-red-500 hover:text-red-700"
                    title="Eliminar archivo"
                    >
                    <FaTrash />
                  </button>
                </div>
                  ) : (
                    <Input
                      id={`g-copiaIdentidadUrl-${index}`}
                      name="copiaIdentidadUrl"
                      type="file"
                      accept={acceptedFileTypes}
                      onChange={(e) => handleGuardianFileChange(index, e)}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-200 file:text-violet-700 hover:file:bg-violet-100"
                    />
                  )}
                  {formErrors[`guardianIdFile_${index}`] && (<p className="text-red-500 text-sm mt-1">{formErrors[`guardianIdFile_${index}`]}</p>)}
                </div>
              </div>
              
              {guardians.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveGuardianClick(index)}
                  className="absolute top-2 right-2 border border-red-500 bg-red-500 text-white hover:bg-red-600 hover:border-red-600 font-semibold py-1 px-3 rounded"
                >
                  Eliminar
                </button>
              )}
            </div>
          ))}
        </fieldset>

        <div className="pt-6 flex justify-end gap-6">
            <button
              type="button"
              onClick={addGuardian}
              className="min-w-[220px] py-3 px-4 text-white font-bold rounded-lg bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 transition-all duration-200 flex items-center justify-center gap-3 shadow-md"
            >
              <FaPlus className="text-xl" />
              <span className="text-lg">Crear Nueva Ficha</span>
            </button>
            <button
              type="submit"
              className="min-w-[220px] py-3 px-8 text-white font-bold rounded-lg bg-gradient-to-r from-violet-400 to-purple-500 hover:from-violet-500 hover:to-purple-600 transition-all duration-200 flex items-center justify-center gap-3 shadow-md"
            >
              Matricular Estudiante
            </button>
          </div>
      </form>

      {/* 5. Añadir el componente del diálogo al final del JSX */}
      <ConfirmationDialog
        isOpen={isConfirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar ficha del responsable"
        description="¿Estás seguro que deseas eliminar esta ficha? Los cambios no guardados se perderán."
        confirmText="Eliminar "
      />
    </div>
  );
}

export default MatriculaPage;
