// frontend/src/pages/EditGuardianPage.tsx

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import guardianService from '../services/guardianService';
import uploadService from "../services/uploadService";
import { SelectWithCatalog } from "../components/ui/SelectWithCatalog";
import {getAllTiposParentesco, createTipoParentesco, updateTipoParentesco, deleteTipoParentesco,} from "../services/tipoParentescoService";
import Label from '../components/ui/Label';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { useToast } from '../context/ToastContext';


function EditGuardianPage() {
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    numeroIdentidad: '',
    telefono: '',
    parentesco: 'Padre',
    parentescoEspecifico: '',
    direccionEmergencia: '',
    email: '',
    password: '',
    copiaIdentidadUrl: ''
  });
  const [copiaIdentidadFile, setCopiaIdentidadFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();

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
            parentescoEspecifico: data.parentescoEspecifico || '',
            direccionEmergencia: data.direccionEmergencia || '',
            email: data.user?.email || '',
            password: '',
            copiaIdentidadUrl: data.copiaIdentidadUrl || ''
          });
        })
        .catch(() => setError('No se pudieron cargar los datos del guardián.'));
    }
  }, [id]);

  const handleSelectChange = (name: string, value: string | null) => {
    const newFormData = { ...formData, [name]: value || '' };
    if (name === 'parentesco' && value !== 'Tutor_Legal' && value !== 'Otro') {
      newFormData.parentescoEspecifico = '';
    }
    setFormData(newFormData);
  };

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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.nombres.trim()) errors.nombres = "Los nombres son obligatorios.";
    else if (!nameRegex.test(formData.nombres)) errors.nombres = "Los nombres solo deben contener letras.";
    
    if (!formData.apellidos.trim()) errors.apellidos = "Los apellidos son obligatorios.";
    else if (!nameRegex.test(formData.apellidos)) errors.apellidos = "Los apellidos solo deben contener letras.";

    if (!formData.numeroIdentidad.trim()) errors.numeroIdentidad = "El DNI es obligatorio.";
    else if (!dniRegex.test(formData.numeroIdentidad)) errors.numeroIdentidad = "El DNI debe tener 13 dígitos.";

    if (!formData.telefono.trim()) errors.telefono = "El teléfono es obligatorio.";
    else if (!phoneRegex.test(formData.telefono)) errors.telefono = "El teléfono debe tener 8 dígitos.";

    if ((formData.parentesco === 'Tutor_Legal' || formData.parentesco === 'Otro') && !formData.parentescoEspecifico) {
        errors.parentescoEspecifico = "Debe especificar el parentesco.";
    }

    // Si uno de email/contraseña se rellena, exigir ambos y validar
    const hasEmail = !!formData.email?.trim();
    const hasPassword = !!formData.password?.trim();
    if (hasEmail || hasPassword) {
      if (!hasEmail) errors.email = 'Debe ingresar el correo.';
      //if (!hasPassword) errors.password = 'Debe ingresar la contraseña.';
    }
    if (hasEmail && !emailRegex.test(formData.email)) errors.email = 'Correo inválido.';
    if (hasPassword && formData.password.length < 6) errors.password = 'Mínimo 6 caracteres.';
    
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
            let copiaUrl = formData.copiaIdentidadUrl || '';
            if (copiaIdentidadFile) {
              const up = await uploadService.uploadFile(copiaIdentidadFile);
              copiaUrl = up.filePath;
            }

            await guardianService.updateGuardian(Number(id), {
              ...formData,
              copiaIdentidadUrl: copiaUrl,
            });
            const fullName = `${formData.nombres.trim()} ${formData.apellidos.trim()}`.trim() || 'el guardián';
            showToast({ message: `Se actualizó correctamente ${fullName}.` });
            navigate('/guardians');
        } catch (err) {
            setError('No se pudo actualizar el guardián.');
        }
    }
  };

  const parentescoOptions = [
    { value: 'Padre', label: 'Padre' },
    { value: 'Madre', label: 'Madre' },
    { value: 'Tutor_Legal', label: 'Tutor Legal' },
    { value: 'Otro', label: 'Otro' },
  ];

  return (
    <div className=" mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Editar Datos {formData.parentesco.replace('_', ' ')}</h2>
      <form onSubmit={handleSubmit} noValidate>
        {error && <p className="text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}
        <fieldset className="border border-violet-300 p-4 rounded-md">
          <legend className="text-xl font-semibold text-gray-700">Datos {formData.parentesco.replace('_', ' ')}</legend>
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
          <Select 
            instanceId="parentesco-select"
            inputId="parentesco"
            name="parentesco" 
            value={parentescoOptions.find(o => o.value === formData.parentesco) || null}
            onChange={(option) => handleSelectChange('parentesco', option?.value || null)}
            options={parentescoOptions}
          />
        </div>

        {(formData.parentesco === 'Tutor_Legal' || formData.parentesco === 'Otro') && (
            <div>
                <SelectWithCatalog
                    label="Especifique Parentesco"
                    catalogName="Tipos de Parentesco"
                    instanceId="parentesco-especifico-select"
                    value={formData.parentescoEspecifico || null}
                    onChange={(value) => handleSelectChange("parentescoEspecifico", value)}
                    loadCatalogOptions={getAllTiposParentesco}
                    createOptionService={createTipoParentesco}
                    updateOptionService={updateTipoParentesco}
                    deleteOptionService={deleteTipoParentesco}
                    placeholder="Seleccione el tipo"
                />
                {formErrors.parentescoEspecifico && <p className="text-red-500 text-sm mt-1">{formErrors.parentescoEspecifico}</p>}
            </div>
        )}
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
          <Label htmlFor="email">Correo electrónico</Label>
          <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="correo@ejemplo.com" />
          {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
        </div>
        <div>
          <Label htmlFor="password">Contraseña</Label>
          <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Mínimo 6 caracteres" />
          {formErrors.password && <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>}
        </div>
        <div>
          <Label htmlFor="direccionEmergencia">Dirección de Emergencia</Label>
          <Input id="direccionEmergencia" name="direccionEmergencia" type="text" value={formData.direccionEmergencia} onChange={handleChange} />
        </div>
        
        <div className="md:col-span-2">
          <Label>Copía de Identidad</Label>
          {formData.copiaIdentidadUrl && !copiaIdentidadFile && (
            <p className="text-sm text-gray-600 mb-2">Actualmente cargada. Puedes subir una nueva para reemplazarla.</p>
          )}
          <input
            type="file"
            accept="image/png, image/jpeg, application/pdf"
            onChange={(e) => setCopiaIdentidadFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-200 file:text-violet-700 hover:file:bg-violet-100"
          />
        </div>
        </div>
      </fieldset>
      
        <div className="pt-6 text-right">
        <button type="submit" className=" py-3 px-8 text-white font-bold rounded-lg bg-gradient-to-r from-violet-400 to-purple-500 hover:from-violet-500 hover:to-purple-600 transition-all duration-200">
          Guardar Cambios
        </button>
        </div>
      </form>
    </div>
  );
}
export default EditGuardianPage;
