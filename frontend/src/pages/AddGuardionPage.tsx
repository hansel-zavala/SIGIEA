import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Label from '../components/ui/Label';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { SelectWithCatalog } from '../components/ui/SelectWithCatalog';
import { getAllTiposParentesco, createTipoParentesco, updateTipoParentesco, deleteTipoParentesco } from '../services/tipoParentescoService';
import studentService from '../services/studentService';
import uploadService from '../services/uploadService';
import { useToast } from '../context/ToastContext';

function AddGuardionPage() {
  const { id: studentId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [form, setForm] = useState<any>({
    nombres: '', apellidos: '', numeroIdentidad: '', telefono: '',
    parentesco: '', parentescoEspecifico: '', direccionEmergencia: '',
    email: '', password: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string,string>>({});
  const { showToast } = useToast();

  const parentescoOptions = [
    { value: 'Padre', label: 'Padre' },
    { value: 'Madre', label: 'Madre' },
    { value: 'Tutor_Legal', label: 'Tutor Legal' },
    { value: 'Otro', label: 'Otro' },
  ];

  const validate = () => {
    const e: Record<string,string> = {};
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    const dniRegex = /^\d{13}$/;
    const phoneRegex = /^\d{8}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.nombres.trim()) e.nombres = 'Requerido'; else if (!nameRegex.test(form.nombres)) e.nombres = 'Solo letras';
    if (!form.apellidos.trim()) e.apellidos = 'Requerido'; else if (!nameRegex.test(form.apellidos)) e.apellidos = 'Solo letras';
    if (!dniRegex.test(form.numeroIdentidad || '')) e.numeroIdentidad = 'DNI 13 dígitos';
    if (!phoneRegex.test(form.telefono || '')) e.telefono = 'Teléfono 8 dígitos';
    if (!form.parentesco) e.parentesco = 'Seleccione parentesco';
    if ((form.parentesco === 'Tutor_Legal' || form.parentesco === 'Otro') && !form.parentescoEspecifico) e.parentescoEspecifico = 'Requerido';
    const hasEmail = !!form.email?.trim();
    const hasPassword = !!form.password?.trim();
    if (hasEmail || hasPassword) {
      if (!hasEmail) e.email = 'Ingrese el correo';
      if (!hasPassword) e.password = 'Ingrese la contraseña';
    }
    if (hasEmail && !emailRegex.test(form.email)) e.email = 'Correo inválido';
    if (hasPassword && form.password.length < 6) e.password = 'Mínimo 6 caracteres';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate() || !studentId) return;
    try {
      let copiaIdentidadUrl = '';
      if (file) {
        const uploaded = await uploadService.uploadFile(file);
        copiaIdentidadUrl = uploaded.filePath;
      }
      await studentService.addGuardian(parseInt(studentId), { ...form, copiaIdentidadUrl });
      const guardianName = `${form.nombres.trim()} ${form.apellidos.trim()}`.trim() || 'el nuevo padre/tutor';
      showToast({ message: `Se agregó correctamente ${guardianName}.` });
      navigate(`/students/${studentId}`);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'No se pudo agregar el padre/tutor.');
    }
  };

  const acceptedFileTypes = 'image/png, image/jpeg, application/pdf';

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Agregar Padre o Tutor</h2>
      <form onSubmit={onSubmit} className="space-y-6" noValidate>
        {error && <p className="text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="nombres">Nombres</Label>
            <Input id="nombres" value={form.nombres} onChange={(e)=> setForm((p:any)=>({ ...p, nombres: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g,'') }))} />
            {errors.nombres && <p className="text-red-500 text-sm mt-1">{errors.nombres}</p>}
          </div>
          <div>
            <Label htmlFor="apellidos">Apellidos</Label>
            <Input id="apellidos" value={form.apellidos} onChange={(e)=> setForm((p:any)=>({ ...p, apellidos: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g,'') }))} />
            {errors.apellidos && <p className="text-red-500 text-sm mt-1">{errors.apellidos}</p>}
          </div>
          <div>
            <Label htmlFor="dni">Número de Identidad</Label>
            <Input id="dni" value={form.numeroIdentidad} onChange={(e)=> setForm((p:any)=>({ ...p, numeroIdentidad: e.target.value.replace(/[^0-9]/g,'').slice(0,13) }))} />
            {errors.numeroIdentidad && <p className="text-red-500 text-sm mt-1">{errors.numeroIdentidad}</p>}
          </div>
          <div>
            <Label htmlFor="tel">Teléfono</Label>
            <Input id="tel" value={form.telefono} onChange={(e)=> setForm((p:any)=>({ ...p, telefono: e.target.value.replace(/[^0-9]/g,'').slice(0,8) }))} />
            {errors.telefono && <p className="text-red-500 text-sm mt-1">{errors.telefono}</p>}
          </div>
          <div>
            <Label>Parentesco</Label>
            <Select
              instanceId="parentesco-add-guardian"
              inputId="parentesco"
              value={ parentescoOptions.find(o => o.value === form.parentesco) || null }
              onChange={(opt)=> setForm((p:any)=>({ ...p, parentesco: opt?.value || '' }))}
              options={parentescoOptions}
              placeholder="Seleccione parentesco"
            />
            {errors.parentesco && <p className="text-red-500 text-sm mt-1">{errors.parentesco}</p>}
          </div>
          {(form.parentesco === 'Tutor_Legal' || form.parentesco === 'Otro') && (
            <div>
              <SelectWithCatalog
                label="Especifique Parentesco"
                catalogName="Tipos de Parentesco"
                instanceId="parentesco-especifico-add"
                value={form.parentescoEspecifico || null}
                onChange={(value)=> setForm((p:any)=>({ ...p, parentescoEspecifico: value || '' }))}
                loadCatalogOptions={getAllTiposParentesco}
                createOptionService={createTipoParentesco}
                updateOptionService={updateTipoParentesco}
                deleteOptionService={deleteTipoParentesco}
                placeholder="Seleccione el tipo"
              />
              {errors.parentescoEspecifico && <p className="text-red-500 text-sm mt-1">{errors.parentescoEspecifico}</p>}
            </div>
          )}
          <div className="md:col-span-2">
            <Label htmlFor="direccionEmergencia">Dirección de Emergencia</Label>
            <Input id="direccionEmergencia" value={form.direccionEmergencia} onChange={(e)=> setForm((p:any)=>({ ...p, direccionEmergencia: e.target.value }))} />
          </div>
          <div>
            <Label htmlFor="email">Correo electrónico</Label>
            <Input id="email" type="email" value={form.email} onChange={(e)=> setForm((p:any)=>({ ...p, email: e.target.value }))} />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" type="password" value={form.password} onChange={(e)=> setForm((p:any)=>({ ...p, password: e.target.value }))} />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>
          <div className="md:col-span-2">
            <Label>Copia de Identidad</Label>
            <input
              type="file"
              accept={acceptedFileTypes}
              onChange={(e)=> setFile(e.target.files?.[0] || null)}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-200 file:text-violet-700 hover:file:bg-violet-100"
            />
          </div>
        </div>
        <div className="pt-4 flex justify-end gap-3">
          <button type="button" onClick={()=> navigate(-1)} className="min-w-[120px] py-3 px-4 rounded-lg bg-gray-200">Cancelar</button>
          <button type="submit" className="min-w-[180px] py-3 px-8 text-white font-bold rounded-lg bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 transition-all duration-200">Guardar</button>
        </div>
      </form>
    </div>
  );
}

export default AddGuardionPage;
