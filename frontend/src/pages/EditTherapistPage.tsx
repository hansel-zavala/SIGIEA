// frontend/src/pages/EditTherapistPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import therapistService from '../services/therapistService.js';
import Label from '../components/ui/Label.js';
import Input from '../components/ui/Input.js';
import Select from '../components/ui/Select.js';

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
    dateOfBirth: '',
  });
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (id) {
      therapistService.getTherapistById(Number(id))
        .then(data => {
          setFormData({
            nombres: data.nombres || '',
            apellidos: data.apellidos || '',
            email: data.email || '',
            password: '',
            identityNumber: data.identityNumber || '',
            phone: data.phone || '',
            specialty: data.specialty || '',
            gender: data.gender || '',
            dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : '',
          });
        })
        .catch(() => setError('No se pudieron cargar los datos del terapeuta.'));
    }
  }, [id]);

  const handleSelectChange = (name: string, value: string | null) => {
    setFormData(prev => ({ ...prev, [name]: value || '' }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'identityNumber' || name === 'phone') {
      const numericValue = value.replace(/[^0-9]/g, '');
      const maxLength = name === 'identityNumber' ? 13 : 8;
      setFormData(prev => ({ ...prev, [name]: numericValue.slice(0, maxLength) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
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
    if (!formData.dateOfBirth.trim()) errors.dateOfBirth = "La fecha de nacimiento es obligatoria.";

    if (formData.dateOfBirth && new Date(formData.dateOfBirth) > new Date()) {
        errors.dateOfBirth = "La fecha de nacimiento no puede ser futura.";
    }

    if (formData.password && formData.password.length < 6) {
        errors.password = "La nueva contraseña debe tener al menos 6 caracteres.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) {
        setError('Por favor, corrige los errores marcados.');
        return;
    }
    setError('');

    if (id) {
      try {
        const dataToSend = { ...formData };
        if (!dataToSend.password) {
          delete (dataToSend as Partial<typeof dataToSend>).password;
        }
        await therapistService.updateTherapist(Number(id), dataToSend);
        navigate('/therapists');
      } catch (err: any) {
        setError(err.response?.data?.error || 'No se pudo actualizar el terapeuta.');
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
      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-lg shadow-md" noValidate>
        {error && <p className="text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nombres">Nombres</Label>
              <Input id="nombres" name="nombres" type="text" value={formData.nombres} placeholder="Ingresa sus nombres" onChange={handleChange} />
              {formErrors.nombres && <p className="text-red-500 text-sm mt-1">{formErrors.nombres}</p>}
            </div>
            <div>
              <Label htmlFor="apellidos">Apellidos</Label>
              <Input id="apellidos" name="apellidos" type="text" value={formData.apellidos} placeholder="Ingresa sus apellidos" onChange={handleChange} />
              {formErrors.apellidos && <p className="text-red-500 text-sm mt-1">{formErrors.apellidos}</p>}
            </div>

            <div>
              <Label htmlFor="identityNumber">Número de Identidad</Label>
              <Input id="identityNumber" name="identityNumber" type="text" value={formData.identityNumber} placeholder="Ingresa su número de identidad" onChange={handleChange} />
              {formErrors.identityNumber && <p className="text-red-500 text-sm mt-1">{formErrors.identityNumber}</p>}
            </div>
            <div>
              <Label htmlFor="email">Email de Acceso</Label>
              <Input id="email" name="email" type="email" value={formData.email} placeholder="Ingresa su email" onChange={handleChange} />
              {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
            </div>
            <div>
              <Label htmlFor="password">Nueva Contraseña</Label>
              <Input id="password" name="password" type="password" value={formData.password} placeholder="Ingresa una nueva contraseña" onChange={handleChange} />
              {formErrors.password && <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>}
            </div>
             <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" name="phone" type="text" value={formData.phone} placeholder="Ingresa su teléfono" onChange={handleChange} />
              {formErrors.phone && <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>}
            </div>
             <div>
              <Label htmlFor="specialty">Especialidad</Label>
              <Select id="specialty" name="specialty" instanceId="specialty-select"
                value={specialtyOptions.find(o => o.value === formData.specialty) || null}
                onChange={(option) => handleSelectChange('specialty', option?.value || null)}
                placeholder="Selecciona su especialidad"
                options={specialtyOptions}
              />
              {formErrors.specialty && <p className="text-red-500 text-sm mt-1">{formErrors.specialty}</p>}
            </div>
             <div>
              <Label htmlFor="gender">Género</Label>
              <Select id="gender" name="gender" instanceId="gender-select"
                value={genderOptions.find(o => o.value === formData.gender) || null}
                onChange={(option) => handleSelectChange('gender', option?.value || null)}
                placeholder="Selecciona su género"
                options={genderOptions}
              />
              {formErrors.gender && <p className="text-red-500 text-sm mt-1">{formErrors.gender}</p>}
            </div>
            <div>
                <Label htmlFor="dateOfBirth">Fecha de Nacimiento</Label>
                <Input id="dateOfBirth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} max={today}/>
                <p className="text-xs text-gray-500 mt-1">Mes / Día / Año</p>
                {formErrors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{formErrors.dateOfBirth}</p>}
            </div>
        </div>

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