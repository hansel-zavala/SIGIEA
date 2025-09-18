// frontend/src/pages/StudentDetailModal.tsx
import Modal from 'react-modal';
import Label from '../components/ui/Label';
import Badge from '../components/ui/Badge';
import React from 'react';

const modalStyles = {
  content: {
    top: '50%', left: '50%', right: 'auto', bottom: 'auto',
    marginRight: '-50%', transform: 'translate(-50%, -50%)',
    width: '90%', maxWidth: '700px', maxHeight: '90vh',
    borderRadius: '8px', padding: '25px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
  },
  overlay: { backgroundColor: 'rgba(0, 0, 0, 0.6)', zIndex: 1000 }
};

Modal.setAppElement('#root');

const InfoField = ({ label, value, style }: { label: string, value: any, style?: React.CSSProperties }) => (
  <div>
    <Label as="h3" className="text-xs font-semibold text-gray-500">{label}</Label>
    <p className="text-gray-800 text-sm" style={style}>{value ?? 'No especificado'}</p>
  </div>
);

interface Student {
    fullName: string;
    dateOfBirth: string;
    lugarNacimiento?: string | null;
    direccion?: string | null;
    genero?: string | null;
    tipoSangre?: string | null;
    zona?: string | null;
    jornada?: string | null;
    anoIngreso: string;
    institutoIncluido?: string | null;
    medicamentos: { nombre: string }[];
    alergias: { nombre: string }[];
    referenciaMedica?: string | null;
    supportLevel?: string | null;
    therapist?: { fullName: string } | null;
    guardians?: { fullName?: string; nombres?: string; apellidos?: string; parentesco?: string; telefono?: string }[];
    atencionGrupal: boolean;
    atencionIndividual: boolean;
    atencionPrevocacional: boolean;
    atencionDistancia: boolean;
    terapiaDomicilio: boolean;
    atencionVocacional: boolean;
    inclusionEscolar: boolean;
    educacionFisica: boolean;
}

interface ModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  student: Student | null;
}

function StudentDetailModal({ isOpen, onRequestClose, student }: ModalProps) {
  if (!student) return null;

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('es-HN');
  const calculateAge = (birthDate: string) => {
    const birthday = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birthday.getFullYear();
    const m = today.getMonth() - birthday.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthday.getDate())) age--;
    return isNaN(age) ? undefined : `${age} años`;
  };

  const tiposDeAtencion = [
    { label: "Atención Grupal", value: student.atencionGrupal },
    { label: "Atención Individual", value: student.atencionIndividual },
    { label: "Atención Prevocacional", value: student.atencionPrevocacional },
    { label: "Atención a Distancia", value: student.atencionDistancia },
    { label: "Terapia a Domicilio", value: student.terapiaDomicilio },
    { label: "Atención Vocacional", value: student.atencionVocacional },
    { label: "Inclusión Escolar", value: student.inclusionEscolar },
    { label: "Educación Física", value: student.educacionFisica },
  ].filter(atencion => atencion.value);

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} style={modalStyles} contentLabel="Ficha Completa del Estudiante">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Ficha Completa de: {student.fullName}</h2>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold text-blue-700 mb-3">Resumen</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <InfoField label="Terapeuta Asignado"  value={student.therapist?.fullName || 'No asignado'} style={{ fontWeight: 'bold' }}/>
            <InfoField label="Edad" value={calculateAge(student.dateOfBirth)} />
            <InfoField label="Género" value={student.genero} />
            <InfoField label="Jornada" value={student.jornada} />
            <InfoField label="Zona" value={student.zona} />
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold text-blue-700 mb-3">Información Personal</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InfoField label="Fecha de Nacimiento" value={formatDate(student.dateOfBirth)} />
            <InfoField label="Lugar de Nacimiento" value={student.lugarNacimiento} />
            <InfoField label="Dirección" value={student.direccion} />
            <InfoField label="Fecha de Ingreso" value={formatDate(student.anoIngreso)} />
            <InfoField label="Institución de Procedencia" value={student.institutoIncluido} />
            <InfoField label="Referencia Médica" value={student.referenciaMedica} />
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold text-blue-700 mb-3">Contacto y Familia</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(student.guardians || []).length > 0 ? (
              (student.guardians || []).map((g, idx) => (
                <div key={`${g.fullName || g.nombres}-${idx}`} className="rounded-lg border border-gray-200 p-3">
                  <p className="text-sm font-semibold text-gray-800">{g.parentesco || 'Encargado'}</p>
                  <p className="text-sm text-gray-700">{g.fullName || `${g.nombres || ''} ${g.apellidos || ''}`.trim() || 'No especificado'}</p>
                  <p className="text-xs text-gray-500">Teléfono: {g.telefono || 'N/A'}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No hay tutores registrados.</p>
            )}
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold text-blue-700 mb-3">Información Médica</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InfoField label="Tipo de Sangre" value={student.tipoSangre?.replace('_', ' ')} />
            <div>
              <Label as="h3" className="text-xs font-semibold text-gray-500">Medicamentos</Label>
              <p className="text-gray-800 text-sm">{(student.medicamentos || []).length > 0 ? student.medicamentos.map(m => m.nombre).join(', ') : 'Ninguno'}</p>
            </div>
            <div>
              <Label as="h3" className="text-xs font-semibold text-gray-500">Alergias</Label>
              <p className="text-gray-800 text-sm">{(student.alergias || []).length > 0 ? student.alergias.map(a => a.nombre).join(', ') : 'Ninguna'}</p>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold text-blue-700 mb-3">Tipos de Atención Recibida</h3>
          <div className="flex flex-wrap gap-2">
            {tiposDeAtencion.length > 0 ? (
              tiposDeAtencion.map(atencion => (
                <Badge key={atencion.label} color="info">{atencion.label}</Badge>
              ))
            ) : (
              <p className="text-gray-500">No se ha especificado ningún tipo de atención.</p>
            )}
          </div>
        </div>

        <div className="text-right mt-6">
          <button onClick={onRequestClose} className="py-2 px-6 text-white font-bold rounded-lg bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 transition-all duration-200 shadow-md">Cerrar</button>
        </div>
      </div>
    </Modal>
  );
}

export default StudentDetailModal;
