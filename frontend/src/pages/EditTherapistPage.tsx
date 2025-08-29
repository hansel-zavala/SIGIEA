// frontend/src/pages/EditTherapistPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import therapistService from '../services/therapistService.js';
import Label from '../components/ui/Label.js';
import Input from '../components/ui/Input.js';
import Select from '../components/ui/Select.js';

function EditTherapistPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    identityNumber: '',
    phone: '',
    specialty: 'Terapeuta' as 'Psicologo' | 'Terapeuta' | 'Ambos',
    gender: 'Masculino' as 'Masculino' | 'Femenino',
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
            fullName: data.fullName || '',
            email: data.email || '',
            identityNumber: data.identityNumber || '',
            phone: data.phone || '',
            specialty: data.specialty || 'Terapeuta',
            gender: data.gender || 'Masculino',
            dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : '',
          });
        })
        .catch(() => setError('No se pudieron cargar los datos del terapeuta.'));
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'identityNumber' || name === 'phone') {
      const numericValue = value.replace(/[^0-9]/g, '');
      const maxLength = name === 'identityNumber' ? 13 : 8;
      setFormData(prev => ({ ...prev, [name]: numericValue.slice(0, maxLength) }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    const dniRegex = /^\d{13}$/;
    const phoneRegex = /^\d{8}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.fullName.trim()) errors.fullName = "El nombre es obligatorio.";
    else if (!nameRegex.test(formData.fullName)) errors.fullName = "El nombre solo debe contener letras.";

    if (!formData.email.trim()) errors.email = "El email es obligatorio.";
    else if (!emailRegex.test(formData.email)) errors.email = "El formato del email no es válido.";
    
    if (!formData.identityNumber.trim()) errors.identityNumber = "El DNI es obligatorio.";
    else if (!dniRegex.test(formData.identityNumber)) errors.identityNumber = "El DNI debe tener 13 dígitos, sin guiones.";
    
    if (formData.phone && !phoneRegex.test(formData.phone)) errors.phone = "El teléfono debe tener 8 dígitos.";

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
        await therapistService.updateTherapist(Number(id), formData);
        navigate('/therapists');
      } catch (err: any) {
        setError(err.response?.data?.error || 'No se pudo actualizar el terapeuta.');
      }
    }
  };

  return (
    <div className=" mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Editar Perfil del Terapeuta</h2>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && <p className="text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Nombre Completo</Label>
              <Input id="fullName" name="fullName" type="text" value={formData.fullName} onChange={handleChange} />
              {formErrors.fullName && <p className="text-red-500 text-sm mt-1">{formErrors.fullName}</p>}
            </div>
            <div>
              <Label htmlFor="identityNumber">Número de Identidad</Label>
              <Input id="identityNumber" name="identityNumber" type="text" value={formData.identityNumber} onChange={handleChange} />
              {formErrors.identityNumber && <p className="text-red-500 text-sm mt-1">{formErrors.identityNumber}</p>}
            </div>
            <div>
              <Label htmlFor="email">Email de Acceso</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
              {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
            </div>
             <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" name="phone" type="text" value={formData.phone} onChange={handleChange} />
              {formErrors.phone && <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>}
            </div>
             <div>
              <Label htmlFor="specialty">Especialidad</Label>
              <Select id="specialty" name="specialty" value={formData.specialty} onChange={handleChange}
                options={[
                    { value: 'Terapeuta', label: 'Terapeuta' },
                    { value: 'Psicologo', label: 'Psicólogo' },
                    { value: 'Ambos', label: 'Ambos' },
                ]}
              />
            </div>
             <div>
              <Label htmlFor="gender">Género</Label>
              <Select id="gender" name="gender" value={formData.gender} onChange={handleChange}
                options={[
                    { value: 'Masculino', label: 'Masculino' },
                    { value: 'Femenino', label: 'Femenino' },
                ]}
              />
            </div>
            <div>
                <Label htmlFor="dateOfBirth">Fecha de Nacimiento</Label>
                <Input id="dateOfBirth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} />
            </div>
        </div>

        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-6">
          Guardar Cambios
        </button>
      </form>
    </div>
  );
}

export default EditTherapistPage;