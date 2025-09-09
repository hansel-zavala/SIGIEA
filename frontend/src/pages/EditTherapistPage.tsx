// frontend/src/pages/EditTherapistPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import therapistService from '../services/therapistService.js';
import uploadService from '../services/uploadService.js';
import Label from '../components/ui/Label.js';
import Input from '../components/ui/Input.js';
import Select from '../components/ui/Select.js';
import ComboBox from '../components/ui/ComboBox';
import CustomDatePicker from '../components/ui/DatePicker';
import { departamentos, municipiosPorDepartamento } from '../data/honduras-data';
import { FaTrash, FaExternalLinkAlt } from 'react-icons/fa';

const dayOptions = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const genderOptions = [{ value: 'Masculino', label: 'Masculino' }, { value: 'Femenino', label: 'Femenino' }];

function EditTherapistPage() {
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    email: '',
    password: '',
    identityNumber: '',
    phone: '',
    specialty: '',
    gender: '',
    dateOfBirth: null as Date | null,
    lugarNacimiento: '',
    direccion: '',
    hireDate: null as Date | null,
    workStartTime: '08:00',
    workEndTime: '17:00',
    lunchStartTime: '12:00',
    lunchEndTime: '13:00',
    workDays: [] as string[],
    identityCardUrl: '',
    resumeUrl: '',
  });

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [departamento, setDepartamento] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [municipios, setMunicipios] = useState<{ id: string; nombre: string }[]>([]);
  const [newIdentityFile, setNewIdentityFile] = useState<File | null>(null);
  const [newResumeFile, setNewResumeFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const acceptedFileTypes = "image/png, image/jpeg, application/pdf, .doc, .docx";

  useEffect(() => {
    if (id) {
      therapistService.getTherapistById(Number(id))
        .then(data => {
          setFormData({
            ...formData,
            ...data,
            password: '',
            dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
            hireDate: data.hireDate ? new Date(data.hireDate) : null,
            workDays: data.workDays || [],
            phone: data.phone ?? '',
            gender: data.gender ?? '',
            direccion: data.direccion ?? '',
            lugarNacimiento: data.lugarNacimiento ?? '',
            identityCardUrl: data.identityCardUrl ?? '',
            resumeUrl: data.resumeUrl ?? '',
          });

          if (data.lugarNacimiento) {
            const parts = data.lugarNacimiento.split(',').map((p: string) => p.trim());
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
        .catch(() => setError('No se pudieron cargar los datos del personal.'));
    }
  }, [id]);

  useEffect(() => {
    if (departamento) {
      setMunicipios(municipiosPorDepartamento[departamento] || []);
    }
  }, [departamento]);

  // Manejadores de cambios (iguales que en el formulario de creación)
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

  const handleSelectChange = (name: string, value: string | null) => {
    setFormData(prev => ({ ...prev, [name]: value || '' }));
  };

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      workDays: prev.workDays.includes(day)
        ? prev.workDays.filter(d => d !== day)
        : [...prev.workDays, day],
    }));
  };
  
  const handleFileDelete = (fieldName: 'identityCardUrl' | 'resumeUrl') => {
      setFormData(prev => ({ ...prev, [fieldName]: '' }));
  };
  
  const validateForm = () => {
    const errors: Record<string, string> = {};
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    const dniRegex = /^\d{13}$/;
    const phoneRegex = /^\d{8}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.nombres.trim()) errors.nombres = "Los nombres son obligatorios.";
    else if (!nameRegex.test(formData.nombres)) errors.nombres = "Solo debe contener letras.";

    if (!formData.apellidos.trim()) errors.apellidos = "Los apellidos son obligatorios.";
    else if (!nameRegex.test(formData.apellidos)) errors.apellidos = "Solo debe contener letras.";

    if (!formData.email.trim()) errors.email = "El email es obligatorio.";
    else if (!emailRegex.test(formData.email)) errors.email = "El formato del email no es válido.";
    
    if (!formData.identityNumber.trim()) errors.identityNumber = "El DNI es obligatorio.";
    else if (!dniRegex.test(formData.identityNumber)) errors.identityNumber = "El DNI debe tener 13 dígitos.";

    if (!formData.phone.trim()) errors.phone = "El teléfono es obligatorio.";
    else if (formData.phone && !phoneRegex.test(formData.phone)) errors.phone = "El teléfono debe tener 8 dígitos.";

    if (!formData.specialty.trim()) errors.specialty = "La especialidad es obligatoria.";
    if (!formData.gender.trim()) errors.gender = "El género es obligatorio.";
    if (!departamento) errors.departamento = "El departamento de nacimiento es obligatorio.";
    if (!municipio) errors.municipio = "El municipio de nacimiento es obligatorio.";
    if (!formData.direccion.trim()) errors.direccion = "La dirección es obligatoria.";
    if (!formData.dateOfBirth) errors.dateOfBirth = "La fecha de nacimiento es obligatoria.";

    if (formData.password && formData.password.length < 6) {
        errors.password = "La nueva contraseña debe tener al menos 6 caracteres.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (id) {
      try {
        const dataToUpdate = { ...formData };
        
        if (newIdentityFile) dataToUpdate.identityCardUrl = (await uploadService.uploadFile(newIdentityFile)).filePath;
        if (newResumeFile) dataToUpdate.resumeUrl = (await uploadService.uploadFile(newResumeFile)).filePath;

        dataToUpdate.lugarNacimiento = `${municipios.find(m => m.id === municipio)?.nombre}, ${departamentos.find(d => d.id === departamento)?.nombre}`;
        
        if (!dataToUpdate.password) delete (dataToUpdate as Partial<typeof dataToUpdate>).password;

        await therapistService.updateTherapist(Number(id), dataToUpdate);
        navigate('/therapists');
      } catch (err: any) {
        setError(err.response?.data?.error || 'No se pudo actualizar el perfil.');
      }
    }
  };

  const today = new Date().toISOString().split("T")[0];

  const specialtyOptions = [
    { value: 'Terapeuta', label: 'Terapeuta' },
    { value: 'Psicologo', label: 'Psicólogo' },
    { value: 'Ambos', label: 'Ambos' },
  ];

  const genderOptions = [
    { value: 'Masculino', label: 'Masculino' },
    { value: 'Femenino', label: 'Femenino' },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Editar Perfil del Terapeuta</h2>
      <form onSubmit={handleSubmit} noValidate>
        {error && <p className="text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}
        
        <fieldset className="border border-violet-300 p-4 rounded-md">
          <legend className="text-lg font-semibold">Información Personal</legend>
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

        <fieldset className="border p-4 rounded-md mt-6 border-violet-300">
            <legend className="text-xl font-semibold text-gray-700 px-2">Documentos</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                {/* Copia de Identidad */}
                <div>
                    <Label>Copia de Identidad</Label>
                    {newIdentityFile ? (
                        <div className="flex items-center justify-between p-2 border rounded-md bg-gray-50">
                            <span className="text-sm text-gray-700">{newIdentityFile.name}</span>
                            <button type="button" onClick={() => setNewIdentityFile(null)} className="text-red-500"><FaTrash /></button>
                        </div>
                    ) : formData.identityCardUrl ? (
                        <div className="flex items-center justify-between p-2 border rounded-md bg-gray-50">
                            <a href={`http://localhost:3001${formData.identityCardUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-2">Ver Actual <FaExternalLinkAlt /></a>
                            <button 
                              type="button" 
                              onClick={() => handleFileDelete('identityCardUrl')} 
                              className="text-red-500"
                              >
                              <FaTrash />
                            </button>
                        </div>
                    ) : null}
                    <Input 
                      type="file" 
                      name="identityCardUrl" 
                      accept={acceptedFileTypes} 
                      onChange={(e) => setNewIdentityFile(e.target.files ? e.target.files[0] : null)} 
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-200 file:text-violet-700 hover:file:bg-violet-100" 
                      />
                </div>
                {/* Currículum */}
                <div>
                    <Label>Currículum</Label>
                    {newResumeFile ? (
                        <div className="flex items-center justify-between p-2 border rounded-md bg-gray-50">
                            <span className="text-sm text-gray-700">{newResumeFile.name}</span>
                            <button 
                              type="button" 
                              onClick={() => setNewResumeFile(null)} 
                              className="text-red-500"
                              >
                              <FaTrash />
                            </button>
                        </div>
                    ) : formData.resumeUrl ? (
                         <div className="flex items-center justify-between p-2 border rounded-md bg-gray-50">
                            <a href={`http://localhost:3001${formData.resumeUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-2">Ver Actual <FaExternalLinkAlt /></a>
                            <button 
                              type="button" 
                              onClick={() => handleFileDelete('resumeUrl')} 
                              className="text-red-500"
                              >
                              <FaTrash />
                            </button>
                        </div>
                    ) : null}
                      <Input 
                        type="file" 
                        name="resumeUrl" 
                        accept={acceptedFileTypes} 
                        onChange={(e) => setNewResumeFile(e.target.files ? e.target.files[0] : null)} 
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-200 file:text-violet-700 hover:file:bg-violet-100"
                        />
                </div>
            </div>
        </fieldset>

        <div className="pt-6 text-right">
          <button type="submit" className="py-3 px-8 text-white font-bold rounded-lg bg-gradient-to-r from-violet-400 to-purple-500 hover:from-violet-500 hover:to-purple-600 transition-all duration-200">
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditTherapistPage;