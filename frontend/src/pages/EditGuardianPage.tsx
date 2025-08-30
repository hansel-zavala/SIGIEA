// frontend/src/pages/EditGuardianPage.tsx

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import guardianService from '../services/guardianService';
import Label from '../components/ui/Label';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';

function EditGuardianPage() {
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    numeroIdentidad: '',
    telefono: '',
    parentesco: 'Padre',
    direccionEmergencia: ''
  });
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (id) {
      guardianService.getGuardianById(Number(id))
        .then(data => {
          setFormData({
            nombres: data.nombres || '',
            apellidos: data.apellidos || '',
            numeroIdentidad: data.numeroIdentidad,
            telefono: data.telefono,
            parentesco: data.parentesco,
            direccionEmergencia: data.direccionEmergencia || ''
          });
        })
        .catch(() => setError('No se pudieron cargar los datos del guardián.'));
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'numeroIdentidad' || name === 'telefono') {
        const numericValue = value.replace(/[^0-9]/g, '');
        const maxLength = name === 'numeroIdentidad' ? 13 : 8;
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

    if (!formData.nombres.trim()) errors.nombres = "Los nombres son obligatorios.";
    else if (!nameRegex.test(formData.nombres)) errors.nombres = "Los nombres solo deben contener letras.";
    
    if (!formData.apellidos.trim()) errors.apellidos = "Los apellidos son obligatorios.";
    else if (!nameRegex.test(formData.apellidos)) errors.apellidos = "Los apellidos solo deben contener letras.";

    if (!formData.numeroIdentidad.trim()) errors.numeroIdentidad = "El DNI es obligatorio.";
    else if (!dniRegex.test(formData.numeroIdentidad)) errors.numeroIdentidad = "El DNI debe tener 13 dígitos.";

    if (!formData.telefono.trim()) errors.telefono = "El teléfono es obligatorio.";
    else if (!phoneRegex.test(formData.telefono)) errors.telefono = "El teléfono debe tener 8 dígitos.";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) {
        setError("Por favor, corrige los errores.");
        return;
    }
    setError('');

    if (id) {
        try {
            await guardianService.updateGuardian(Number(id), formData);
            navigate('/guardians');
        } catch (err) {
            setError('No se pudo actualizar el guardián.');
        }
    }
  };

  return (
    <div className=" mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Editar Datos {formData.parentesco.replace('_', ' ')}</h2>
      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-lg shadow-md" noValidate>
        {error && <p className="text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="nombres">Nombres</Label>
          <Input id="nombres" name="nombres" type="text" value={formData.nombres} onChange={handleChange} />
          {formErrors.nombres && <p className="text-red-500 text-sm mt-1">{formErrors.nombres}</p>}
        </div>
        <div>
          <Label htmlFor="apellidos">Apellidos</Label>
          <Input id="apellidos" name="apellidos" type="text" value={formData.apellidos} onChange={handleChange} />
          {formErrors.apellidos && <p className="text-red-500 text-sm mt-1">{formErrors.apellidos}</p>}
        </div>

        <div>
          <Label htmlFor="parentesco">Parentesco</Label>
          <Select id="parentesco" name="parentesco" value={formData.parentesco} onChange={handleChange}
            options={[
              { value: 'Padre', label: 'Padre' },
              { value: 'Madre', label: 'Madre' },
              { value: 'Tutor_Legal', label: 'Tutor Legal' },
              { value: 'Otro', label: 'Otro' },
            ]}
          />
        </div>
        <div>
          <Label htmlFor="numeroIdentidad">Número de Identidad</Label>
          <Input id="numeroIdentidad" name="numeroIdentidad" type="text" value={formData.numeroIdentidad} onChange={handleChange} />
          {formErrors.numeroIdentidad && <p className="text-red-500 text-sm mt-1">{formErrors.numeroIdentidad}</p>}
        </div>
        <div>
          <Label htmlFor="telefono">Teléfono</Label>
          <Input id="telefono" name="telefono" type="text" value={formData.telefono} onChange={handleChange} />
          {formErrors.telefono && <p className="text-red-500 text-sm mt-1">{formErrors.telefono}</p>}
        </div>
        <div>
          <Label htmlFor="direccionEmergencia">Dirección de Emergencia</Label>
          <Input id="direccionEmergencia" name="direccionEmergencia" type="text" value={formData.direccionEmergencia} onChange={handleChange} />
        </div>
        </div>
        <div className="pt-6 text-right">
        <button type="submit" className=" bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Guardar Cambios
        </button>
        </div>
      </form>
    </div>
  );
}
export default EditGuardianPage;