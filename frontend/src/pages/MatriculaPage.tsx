// frontend/src/pages/MatriculaPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import studentService from "../services/studentService";
import uploadService from "../services/uploadService";
import Label from "../components/ui/Label";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";

interface Guardian {
  fullName: string;
  numeroIdentidad: string;
  telefono: string;
  parentesco: "Padre" | "Madre" | "Tutor_Legal" | "Otro";
  direccionEmergencia: string;
}

// ✅ CORRECCIÓN: Definimos los tipos de atención en un array para evitar errores.
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

function MatriculaPage() {
  const [studentData, setStudentData] = useState({
    fullName: "",
    dateOfBirth: "",
    lugarNacimiento: "",
    direccion: "",
    institucionProcedencia: "",
    recibioEvaluacion: false,
    institutoIncluido: "",
    anoIngreso: new Date().toISOString().split("T")[0],
    zona: "Urbano" as "Urbano" | "Rural",
    jornada: "Matutina" as "Matutina" | "Vespertina",
    genero: "Masculino" as "Masculino" | "Femenino",
    atencionGrupal: false,
    atencionIndividual: false,
    atencionPrevocacional: false,
    atencionDistancia: false,
    terapiaDomicilio: false,
    atencionVocacional: false,
    inclusionEscolar: false,
    educacionFisica: false,
    usaMedicamentos: false,
    cualesMedicamentos: "",
    esAlergico: false,
    cualesAlergias: "",
  });
  const [guardians, setGuardians] = useState<Guardian[]>([
    {
      fullName: "",
      numeroIdentidad: "",
      telefono: "",
      parentesco: "Padre",
      direccionEmergencia: "",
    },
  ]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [partidaFile, setPartidaFile] = useState<File | null>(null);
  const [evaluacionFile, setEvaluacionFile] = useState<File | null>(null);
  const [guardianIdFiles, setGuardianIdFiles] = useState<(File | null)[]>([]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement;
      setStudentData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setStudentData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleGuardianChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const newGuardians = [...guardians];
    newGuardians[index][e.target.name as keyof Guardian] = e.target
      .value as any;
    setGuardians(newGuardians);
  };

  const addGuardian = () => {
    setGuardians([
      ...guardians,
      {
        fullName: "",
        numeroIdentidad: "",
        telefono: "",
        parentesco: "Padre",
        direccionEmergencia: "",
      },
    ]);
  };

  const removeGuardian = (index: number) => {
    const newGuardians = guardians.filter((_, i) => i !== index);
    setGuardians(newGuardians);
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

  // ✅ ASEGÚRATE DE QUE ESTA FUNCIÓN ESTÉ PRESENTE
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  try {
    let partidaUrl = '';
    if (partidaFile) {
      const response = await uploadService.uploadFile(partidaFile);
      partidaUrl = response.filePath;
    }

    let evaluacionUrl = '';
    if (evaluacionFile && studentData.recibioEvaluacion) {
      const response = await uploadService.uploadFile(evaluacionFile);
      evaluacionUrl = response.filePath;
    }

    const guardianIdUrls = await Promise.all(
      guardianIdFiles.map(file => file ? uploadService.uploadFile(file) : Promise.resolve(null))
    );

    const finalGuardians = guardians.map((guardian, index) => ({
      ...guardian,
      copiaIdentidadUrl: guardianIdUrls[index]?.filePath || '',
    }));

    const fullMatriculaData = {
      ...studentData,
      partidaNacimientoUrl: partidaUrl,
      resultadoEvaluacionUrl: evaluacionUrl,
      guardians: finalGuardians,
    };

    await studentService.createStudent(fullMatriculaData);
    navigate('/students');
  } catch (err) {
    setError('Ocurrió un error al matricular. Revisa los datos y los archivos.');
  }
};

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        Ficha de Matrícula
      </h2>
      <form
        onSubmit={handleSubmit}
        className="space-y-8 bg-white p-8 rounded-lg shadow-md"
      >
        {/* --- SECCIÓN DATOS DEL ALUMNO --- */}
        <div className="border-b pb-6">
          <h3 className="text-xl font-semibold text-gray-700">
            Datos del Alumno
          </h3>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="fullName">Nombre Completo del Alumno(a)</Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                value={studentData.fullName}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="dateOfBirth">Fecha de Nacimiento</Label>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={studentData.dateOfBirth}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="lugarNacimiento">Lugar de Nacimiento</Label>
              <Input
                id="lugarNacimiento"
                name="lugarNacimiento"
                type="text"
                value={studentData.lugarNacimiento}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="direccion">Dirección</Label>
              <Input
                id="direccion"
                name="direccion"
                type="text"
                value={studentData.direccion}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="genero">Género</Label>
              <Select
                id="genero"
                name="genero"
                value={studentData.genero}
                onChange={handleChange}
                options={[
                  { value: "Masculino", label: "Masculino" },
                  { value: "Femenino", label: "Femenino" },
                ]}
              />
            </div>
            <div>
              <Label htmlFor="zona">Zona</Label>
              <Select
                id="zona"
                name="zona"
                value={studentData.zona}
                onChange={handleChange}
                options={[
                  { value: "Urbano", label: "Urbano" },
                  { value: "Rural", label: "Rural" },
                ]}
              />
            </div>
            <div>
              <Label htmlFor="jornada">Jornada</Label>
              <Select
                id="jornada"
                name="jornada"
                value={studentData.jornada}
                onChange={handleChange}
                options={[
                  { value: "Matutina", label: "Matutina" },
                  { value: "Vespertina", label: "Vespertina" },
                ]}
              />
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
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="institutoIncluido">
                Instituto donde está incluido
              </Label>
              <Input
                id="institutoIncluido"
                name="institutoIncluido"
                type="text"
                value={studentData.institutoIncluido}
                onChange={handleChange}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="partidaNacimientoUrl">
                Subir Partida de Nacimiento
              </Label>
              <Input
                id="partidaNacimientoUrl"
                name="partidaNacimientoUrl"
                type="file"
                onChange={(e) =>
                  setPartidaFile(e.target.files ? e.target.files?.[0] : null)
                }
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
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
                <Label htmlFor="resultadoEvaluacionUrl">
                  Subir Resultado de Evaluación
                </Label>
                <Input
                  id="resultadoEvaluacionUrl"
                  name="resultadoEvaluacionUrl"
                  type="file"
                  onChange={(e) =>
                    setEvaluacionFile(
                      e.target.files ? e.target.files?.[0] : null
                    )
                  }
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            )}
          </div>
        </div>

        {/* --- SECCIÓN TIPOS DE ATENCIÓN --- */}
        <div className="border-b pb-6">
          <h3 className="text-xl font-semibold text-gray-700">
            Tipos de Atención
          </h3>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {tiposDeAtencion.map((atencion) => (
              <div key={atencion.id} className="flex items-center">
                <input
                  id={atencion.id}
                  name={atencion.id}
                  type="checkbox"
                  checked={
                    studentData[
                      atencion.id as keyof typeof studentData
                    ] as boolean
                  }
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                />
                <Label htmlFor={atencion.id} className="ml-2">
                  {atencion.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* --- SECCIÓN INFORMACIÓN MÉDICA --- */}
        <div className="border-b pb-6">
          <h3 className="text-xl font-semibold text-gray-700">
            Información Médica
          </h3>
          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-2">
              <input
                id="usaMedicamentos"
                name="usaMedicamentos"
                type="checkbox"
                checked={studentData.usaMedicamentos}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
              />
              <Label htmlFor="usaMedicamentos">¿Usa Medicamentos?</Label>
            </div>
            {studentData.usaMedicamentos && (
              <div>
                <Label htmlFor="cualesMedicamentos">¿Cuáles?</Label>
                <Input
                  id="cualesMedicamentos"
                  name="cualesMedicamentos"
                  type="text"
                  value={studentData.cualesMedicamentos}
                  onChange={handleChange}
                />
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                id="esAlergico"
                name="esAlergico"
                type="checkbox"
                checked={studentData.esAlergico}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
              />
              <Label htmlFor="esAlergico">¿Es Alérgico?</Label>
            </div>
            {studentData.esAlergico && (
              <div>
                <Label htmlFor="cualesAlergias">¿A qué es alérgico?</Label>
                <Input
                  id="cualesAlergias"
                  name="cualesAlergias"
                  type="text"
                  value={studentData.cualesAlergias}
                  onChange={handleChange}
                />
              </div>
            )}
          </div>
        </div>

        {/* --- SECCIÓN GUARDIANES --- */}
        <div className="border-b pb-6">
          <h3 className="text-xl font-semibold text-gray-700">
            Información de los Padres o Tutores
          </h3>
          {guardians.map((guardian, index) => (
            <div key={index} className="mt-4 p-4 border rounded-md relative">
              <h4 className="font-medium mb-2">Ficha {index + 1}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor={`g-fullName-${index}`}>Nombre Completo</Label>
                  <Input
                    id={`g-fullName-${index}`}
                    name="fullName"
                    type="text"
                    value={guardian.fullName}
                    onChange={(e) => handleGuardianChange(index, e)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor={`g-parentesco-${index}`}>Parentesco</Label>
                  <Select
                    id={`g-parentesco-${index}`}
                    name="parentesco"
                    value={guardian.parentesco}
                    onChange={(e) => handleGuardianChange(index, e)}
                    options={[
                      { value: "Padre", label: "Padre" },
                      { value: "Madre", label: "Madre" },
                      { value: "Tutor_Legal", label: "Tutor Legal" },
                      { value: "Otro", label: "Otro" },
                    ]}
                  />
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
                    onChange={(e) => handleGuardianChange(index, e)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor={`g-telefono-${index}`}>Teléfono</Label>
                  <Input
                    id={`g-telefono-${index}`}
                    name="telefono"
                    type="text"
                    value={guardian.telefono}
                    onChange={(e) => handleGuardianChange(index, e)}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor={`g-direccionEmergencia-${index}`}>
                    Dirección de Emergencia
                  </Label>
                  <Input
                    id={`g-direccionEmergencia-${index}`}
                    name="direccionEmergencia"
                    type="text"
                    value={guardian.direccionEmergencia}
                    onChange={(e) => handleGuardianChange(index, e)}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor={`g-copiaIdentidadUrl-${index}`}>
                    Subir Copia de Identidad
                  </Label>
                  <Input
                    id={`g-copiaIdentidadUrl-${index}`}
                    name="copiaIdentidadUrl"
                    type="file"
                    onChange={(e) => handleGuardianFileChange(index, e)}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>
              {guardians.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeGuardian(index)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-semibold"
                >
                  Eliminar
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addGuardian}
            className="mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
          >
            Añadir Otra Ficha
          </button>
        </div>

        <div className="pt-6 text-right">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg"
          >
            Matricular Estudiante
          </button>
        </div>
      </form>
    </div>
  );
}

export default MatriculaPage;
