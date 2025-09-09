// frontend/src/pages/AddTherapistPage.tsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import therapistService from '../services/therapistService';
import uploadService from '../services/uploadService';
import Label from '../components/ui/Label';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import ComboBox from '../components/ui/ComboBox';
import CustomDatePicker from '../components/ui/DatePicker';
import { departamentos, municipiosPorDepartamento } from '../data/honduras-data';
import { FaTrash } from 'react-icons/fa';

const dayOptions = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const genderOptions = [{ value: 'Masculino', label: 'Masculino' }, { value: 'Femenino', label: 'Femenino' }];

function AddTherapistPage() {
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    email: '',
    password: '',
    identityNumber: '',
    phone: '',
    specialty: '', // Este es el "Cargo"
    gender: '',
    dateOfBirth: null as Date | null,
    direccion: '',
    hireDate: new Date(),
    workStartTime: '08:00',
    workEndTime: '17:00',
    lunchStartTime: '12:00',
    lunchEndTime: '13:00',
    workDays: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
  });
  
  const [departamento, setDepartamento] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [municipios, setMunicipios] = useState<{ id: string; nombre: string }[]>([]);
  const [identityFile, setIdentityFile] = useState<File | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const acceptedFileTypes = "image/png, image/jpeg, application/pdf, .doc, .docx";
  const allowedFileTypesCurriculum = ".pdf, .doc, .docx";
  
  
  useEffect(() => {
    if (departamento) {
      setMunicipios(municipiosPorDepartamento[departamento] || []);
      setMunicipio('');
    }
  }, [departamento]);
  
  const handleSelectChange = (name: string, value: string | null) => {
    setFormData(prev => ({ ...prev, [name]: value || '' }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'nombres' || name === 'apellidos') {
        setFormData(prev => ({ ...prev, [name]: value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '') }));
    } else if (name === 'identityNumber' || name === 'phone') {
      const numericValue = value.replace(/[^0-9]/g, '');
      const maxLength = name === 'identityNumber' ? 13 : 8;
      setFormData(prev => ({ ...prev, [name]: numericValue.slice(0, maxLength) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      workDays: prev.workDays.includes(day)
        ? prev.workDays.filter(d => d !== day)
        : [...prev.workDays, day],
    }));
  };

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
  const allowedFileTypesCurriculum = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (!allowedFileTypesCurriculum.includes(file.type)) {
    return "Archivo no válido. Solo se permiten PDF o Word.";
  }
  

  const maxSizeInBytes = 5 * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    return "El archivo es demasiado grande. El límite es de 5MB.";
  }

  return "";
};

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    const addressRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,#\-°]+$/;
    const dniRegex = /^\d{13}$/;
    const phoneRegex = /^\d{8}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validaciones de información personal
    if (!formData.nombres.trim()) errors.nombres = "Los nombres son obligatorios.";
    else if (!nameRegex.test(formData.nombres)) errors.nombres = "Los nombres solo deben contener letras.";

    if (!formData.apellidos.trim()) errors.apellidos = "Los apellidos son obligatorios.";
    else if (!nameRegex.test(formData.apellidos)) errors.apellidos = "Los apellidos solo deben contener letras.";

    if (!formData.identityNumber.trim()) errors.identityNumber = "El DNI es obligatorio.";
    else if (!dniRegex.test(formData.identityNumber)) errors.identityNumber = "El DNI debe tener 13 dígitos, sin guiones.";

    if (!formData.dateOfBirth) errors.dateOfBirth = "La fecha de nacimiento es obligatoria.";
    else if (new Date(formData.dateOfBirth) > new Date()) errors.dateOfBirth = "La fecha no puede ser futura.";
    if (!formData.gender) errors.gender = "El género es obligatorio.";
    if (!formData.phone) errors.phone = "El teléfono es obligatorio.";
    else if (formData.phone && !phoneRegex.test(formData.phone)) errors.phone = "El teléfono debe tener 8 dígitos.";
    if (!departamento) errors.departamento = "El departamento es obligatorio.";
    if (!municipio) errors.municipio = "El municipio es obligatorio.";
    if (!formData.direccion.trim()) errors.direccion = "La dirección es obligatoria.";
    else if (!addressRegex.test(formData.direccion)) errors.direccion = "La dirección contiene caracteres no permitidos.";
    if (!formData.specialty) errors.specialty = "La especialidad es obligatoria.";

    //validacion de cuenta y rol
    if (!formData.email.trim()) errors.email = "El email es obligatorio.";
    else if (!emailRegex.test(formData.email)) errors.email = "El formato del email no es válido.";
    if (!formData.password) errors.password = "La contraseña es obligatoria.";
    else if (formData.password.length < 6) errors.password = "La contraseña debe tener al menos 6 caracteres.";
    if (!formData.specialty.trim()) errors.specialty = "El cargo es obligatorio.";

    // Validaciones de horario
    if (formData.workEndTime <= formData.workStartTime) errors.workEndTime = "La hora de fin debe ser mayor a la de inicio.";
    if (formData.lunchEndTime <= formData.lunchStartTime) errors.lunchEndTime = "La hora de fin debe ser mayor a la de inicio.";

    // Validaciones de archivos
    /*if (!identityFile) errors.identityFileError = "La partida de nacimiento es obligatoria.";
  else errors.identityFileError = validateFile(identityFile);*/
  if (identityFile) errors.identityFile = validateFile(identityFile);

  /*if (!resumeFile) errors.resumeFileError = "El currículum es obligatorio.";
  else errors.resumeFileError = validateFile(resumeFile);*/
  if (resumeFile) errors.resumeFile = validateFile(resumeFile);

    const finalErrors = Object.fromEntries(Object.entries(errors).filter(([_, value]) => value));
    setFormErrors(finalErrors);
    return Object.keys(finalErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) {
        setError('Por favor, corrige los errores marcados en el formulario.');
        return;
    }
    setError('');
    
    try {
      const identityCardUrl = identityFile ? (await uploadService.uploadFile(identityFile)).filePath : '';
      const resumeUrl = resumeFile ? (await uploadService.uploadFile(resumeFile)).filePath : '';
      const lugarNacimiento = `${municipios.find(m => m.id === municipio)?.nombre}, ${departamentos.find(d => d.id === departamento)?.nombre}`;
      
      const finalData = {
        ...formData,
        dateOfBirth: formData.dateOfBirth?.toISOString(),
        hireDate: formData.hireDate.toISOString(),
        lugarNacimiento,
        identityCardUrl,
        resumeUrl,
      };

      await therapistService.createTherapist(finalData);
      navigate('/therapists');

    } catch (err: any) {
      setError(err.response?.data?.error || 'No se pudo crear el perfil del personal.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        Añadir Nuevo Personal
        </h2>
      <form onSubmit={handleSubmit} noValidate>
        {error && <p className="text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}

        <fieldset className="border border-violet-300 p-4 rounded-md">
          <legend className="text-xl font-semibold text-gray-700">Información Personal</legend>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="nombres">Nombres</Label>
              <Input 
                id="nombres" 
                name="nombres" 
                value={formData.nombres} 
                onChange={handleChange}
                placeholder="Ingresa sus nombres"
              />
              {formErrors.nombres && <p className="text-red-500 text-sm">{formErrors.nombres}</p>}
            </div>

            <div>
              <Label htmlFor="apellidos">Apellidos</Label>
              <Input 
                id="apellidos" 
                name="apellidos" 
                value={formData.apellidos} 
                onChange={handleChange}
                placeholder="Ingresa sus apellidos"
              />
              {formErrors.apellidos && <p className="text-red-500 text-sm">{formErrors.apellidos}</p>}
            </div>

            <div>
              <Label htmlFor="identityNumber">Número de Identidad</Label>
              <Input 
                id="identityNumber" 
                name="identityNumber" 
                value={formData.identityNumber} 
                onChange={handleChange} 
                placeholder="Ingresa su número de identidad, sin guiones"
              />
              {formErrors.identityNumber && <p className="text-red-500 text-sm">{formErrors.identityNumber}</p>}
            </div>

            <div>
              <Label>Fecha de Nacimiento</Label>
              <CustomDatePicker 
                selected={formData.dateOfBirth} 
                onChange={(date) => setFormData(prev => ({...prev, dateOfBirth: date}))}
                maxDate={new Date()}
              />
              <p className="text-xs text-gray-500 mt-1 mx-2">    Día / Mes / Año</p>
              {formErrors.dateOfBirth && <p className="text-red-500 text-sm">{formErrors.dateOfBirth}</p>}
            </div>
            
            <div>
              <Label>Género</Label>
              <Select 
                instanceId="gender-select" 
                options={genderOptions} 
                value={genderOptions.find(o => o.value === formData.gender) || null} 
                onChange={(option) => handleSelectChange('gender', option?.value || null)} 
                placeholder="Selecciona su género"
              />
              {formErrors.gender && <p className="text-red-500 text-sm">{formErrors.gender}</p>}
            </div>
            
            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input 
                id="phone" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange} 
                placeholder="Ingresa su teléfono, sin guiones"
              />
              {formErrors.phone && <p className="text-red-500 text-sm">{formErrors.phone}</p>}
            </div>

            <div>
              <Label>Departamento de Nacimiento</Label>
              <ComboBox 
                options={departamentos.map(d => ({ value: d.id, label: d.nombre }))} 
                value={departamento} 
                onChange={setDepartamento}
                placeholder="Selecciona un departamento"
              />
              {formErrors.departamento && <p className="text-red-500 text-sm">{formErrors.departamento}</p>}
            </div>

            <div>
              <Label>Municipio de Nacimiento</Label>
              <ComboBox 
                options={municipios.map(m => ({ value: m.id, label: m.nombre }))} 
                value={municipio} 
                onChange={setMunicipio} 
                disabled={!departamento} 
                placeholder="Selecciona un municipio"
              />
              {formErrors.municipio && <p className="text-red-500 text-sm">{formErrors.municipio}</p>}
            </div>

            <div>
              <Label htmlFor="direccion">Dirección de Domicilio</Label>
              <Input 
                id="direccion" 
                name="direccion" 
                value={formData.direccion} 
                onChange={handleChange} 
                placeholder="Ingresa su dirección de domicilio"
              />
              {formErrors.direccion && <p className="text-red-500 text-sm">{formErrors.direccion}</p>}
            </div>
          </div>
        </fieldset>

        {/* --- SECCIÓN DE INFORMACIÓN DE LA CUENTA Y ROL --- */}
        <fieldset className="border border-violet-300 p-4 rounded-md mt-6">
          <legend className="text-xl font-semibold text-gray-700 px-2">Información de Cuenta y Rol</legend>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <Label htmlFor="email">Email de Acceso</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                value={formData.email} 
                onChange={handleChange} 
                placeholder="Ingresa su email de acceso, Ej: usuario@sigiea.com"
              />
              {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
            </div>

            <div>
              <Label htmlFor="password">Contraseña Temporal</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                value={formData.password} 
                onChange={handleChange}
                placeholder="Ingresa una contraseña temporal"
              />
              {formErrors.password && <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>}
            </div>
        
            <div>
              <Label htmlFor="specialty">Cargo / Puesto</Label>
              <Input 
                id="specialty" 
                name="specialty" 
                value={formData.specialty} 
                onChange={handleChange} 
                placeholder="Ej: Terapeuta, Limpieza" 
              />
              {formErrors.specialty && <p className="text-red-500 text-sm mt-1">{formErrors.specialty}</p>}
            </div>
          </div>
        </fieldset>

        {/* --- SECCIÓN DE HORARIO LABORAL --- */}
        <fieldset className="border border-violet-300 p-4 rounded-md mt-6">
          <legend className="text-xl font-semibold text-gray-700 px-2">Horario Laboral</legend>
          <div className="mt-4">
            <Label>Días de Trabajo</Label>
            <div className="flex flex-wrap gap-2 mt-3">
              {dayOptions.map(day => (
                  <button 
                    type="button" 
                    key={day} 
                    onClick={() => handleDayToggle(day)} 
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${formData.workDays.includes(day) ? 'bg-violet-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                    >
                    {day}
                  </button>
                  ))}
        </div>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <div>
            <Label htmlFor="workStartTime">Inicio Jornada</Label>
            <Input id="workStartTime" name="workStartTime" type="time" value={formData.workStartTime} onChange={handleChange} />
        </div>
        <div>
            <Label htmlFor="workEndTime">Fin Jornada</Label>
            <Input id="workEndTime" name="workEndTime" type="time" value={formData.workEndTime} onChange={handleChange} />
        </div>
        <div>
            <Label htmlFor="lunchStartTime">Inicio Almuerzo</Label>
            <Input id="lunchStartTime" name="lunchStartTime" type="time" value={formData.lunchStartTime} onChange={handleChange} />
        </div>
        <div>
            <Label htmlFor="lunchEndTime">Fin Almuerzo</Label>
            <Input id="lunchEndTime" name="lunchEndTime" type="time" value={formData.lunchEndTime} onChange={handleChange} />
        </div>
    </div>
</fieldset>

        {/* --- SECCIÓN DE DOCUMENTOS --- */}
        <fieldset className="border border-violet-300 p-4 rounded-md mt-6">
            <legend className="text-xl font-semibold text-gray-700 px-2">Documentos</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                {/* Input para Copia de Identidad */}
                <div>
                    <Label>Copia de Identidad</Label>
                    {identityFile ? (
                        <div className="flex items-center justify-between p-2 border rounded-md bg-gray-50">
                            <span className="text-sm text-gray-700">{identityFile.name}</span>
                            <button 
                              type="button" 
                              onClick={() => setIdentityFile(null)} 
                              className="text-red-500 hover:text-red-700"
                              >
                              <FaTrash />
                            </button>
                        </div>
                    ) : (
                        <Input
                          type="file"
                          name="identityCardUrl"
                          accept={acceptedFileTypes}
                          onChange={(e) => setIdentityFile(e.target.files ? e.target.files[0] : null)}
                          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-200 file:text-violet-700 hover:file:bg-violet-100"
                        />
                    )}
                    {formErrors.identityFile && <p className="text-red-500 text-sm mt-1">{formErrors.identityFile}</p>}
                </div>
                {/* Input para Currículum */}
                <div>
                    <Label>Currículum</Label>
                    {resumeFile ? (
                         <div className="flex items-center justify-between p-2 border rounded-md bg-gray-50">
                            <span className="text-sm text-gray-700">{resumeFile.name}</span>
                            <button 
                              type="button" 
                              onClick={() => setResumeFile(null)} 
                              className="text-red-500 hover:text-red-700"
                              >
                              <FaTrash />
                            </button>
                        </div>
                    ) : (
                        <Input 
                          type="file" 
                          name="resumeUrl" 
                          accept={allowedFileTypesCurriculum} 
                          onChange={(e) => setResumeFile(e.target.files ? e.target.files[0] : null)} 
                          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-200 file:text-violet-700 hover:file:bg-violet-100"
                          />
                    )}
                    {formErrors.resumeFile && <p className="text-red-500 text-sm mt-1">{formErrors.resumeFile}</p>}
                </div>
            </div>
        </fieldset>

        <div className="pt-6 text-right">
          <button type="submit" className="py-3 px-8 text-white font-bold rounded-lg bg-gradient-to-r from-violet-400 to-purple-500 hover:from-violet-500 hover:to-purple-600 transition-all duration-200">
            Guardar Terapeuta
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddTherapistPage;