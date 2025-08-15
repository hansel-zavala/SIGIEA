// frontend/src/pages/AddTherapistPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import therapistService from '../services/therapistService';
import Label from '../components/ui/Label';
import Input from '../components/ui/Input';

function AddTherapistPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    identityNumber: '',
    specialty: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      await therapistService.createTherapist(formData);
      navigate('/therapists');
    } catch (err: any) {
      setError(err.response?.data?.error || 'No se pudo crear el terapeuta.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Añadir Nuevo Terapeuta</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-500">{error}</p>}
        <div>
          <Label htmlFor="fullName">Nombre Completo</Label>
          <Input id="fullName" name="fullName" type="text" value={formData.fullName} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="email">Email de Acceso</Label>
          <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="password">Contraseña Temporal</Label>
          <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} required />
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
          Guardar Terapeuta
        </button>
      </form>
    </div>
  );
}
export default AddTherapistPage;