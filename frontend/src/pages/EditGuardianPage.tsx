// frontend/src/pages/EditGuardianPage.tsx

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import guardianService from '../services/guardianService';
import Label from '../components/ui/Label';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';

function EditGuardianPage() {
  const [formData, setFormData] = useState({ fullName: '', numeroIdentidad: '', telefono: '', parentesco: 'Padre', direccionEmergencia: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      guardianService.getGuardianById(Number(id))
        .then(data => {
          setFormData({
            fullName: data.fullName,
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
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
    <div className="max-w-8xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Editar Guardián</h2>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
        {error && <p className="text-red-500">{error}</p>}
        <div>
          <Label htmlFor="fullName">Nombre Completo</Label>
          <Input id="fullName" name="fullName" type="text" value={formData.fullName} onChange={handleChange} required />
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
          <Input id="numeroIdentidad" name="numeroIdentidad" type="text" value={formData.numeroIdentidad} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="telefono">Teléfono</Label>
          <Input id="telefono" name="telefono" type="text" value={formData.telefono} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="direccionEmergencia">Dirección de Emergencia</Label>
          <Input id="direccionEmergencia" name="direccionEmergencia" type="text" value={formData.direccionEmergencia} onChange={handleChange} />
        </div>
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Guardar Cambios
        </button>
      </form>
    </div>
  );
}
export default EditGuardianPage;