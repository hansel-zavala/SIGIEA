// frontend/src/pages/EditTherapistPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import therapistService from '../services/therapistService.js';
import Label from '../components/ui/Label.js';
import Input from '../components/ui/Input.js';

function EditTherapistPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    identityNumber: '',
    specialty: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      therapistService.getTherapistById(Number(id))
        .then(data => {
          setFormData({
            fullName: data.fullName,
            email: data.email,
            identityNumber: data.identityNumber || '',
            specialty: data.specialty || '',
            phone: data.phone || ''
          });
        })
        .catch(() => setError('No se pudieron cargar los datos del terapeuta.'));
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (id) {
      try {
        await therapistService.updateTherapist(Number(id), formData);
        navigate('/therapists');
      } catch (err) {
        setError('No se pudo actualizar el terapeuta.');
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Editar Perfil del Terapeuta</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-500">{error}</p>}
        <div>
          <Label htmlFor="fullName">Nombre Completo</Label>
          <Input id="fullName" name="fullName" type="text" value={formData.fullName} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
        </div>
         <div>
          <Label htmlFor="identityNumber">Número de Identidad</Label>
          <Input id="identityNumber" name="identityNumber" type="text" value={formData.identityNumber} onChange={handleChange} required />
        </div>
         <div>
          <Label htmlFor="phone">Teléfono</Label>
          <Input id="phone" name="phone" type="text" value={formData.phone} onChange={handleChange} />
        </div>
         <div>
          <Label htmlFor="specialty">Especialidad</Label>
          <Input id="specialty" name="specialty" type="text" value={formData.specialty} onChange={handleChange} />
        </div>
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Guardar Cambios
        </button>
      </form>
    </div>
  );
}
export default EditTherapistPage;