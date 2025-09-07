// frontend/src/pages/StudentDetailModal.tsx
import Modal from 'react-modal';
import Label from '../components/ui/Label';
import Badge from '../components/ui/Badge';

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

const InfoField = ({ label, value }: { label: string, value: string | undefined | null }) => (
  <div>
    <Label as="h3" className="text-sm font-semibold text-gray-500">{label}</Label>
    <p className="text-gray-800">{value || 'No especificado'}</p>
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
    institucionProcedencia?: string | null;
    medicamentos: { nombre: string }[];
    alergias: { nombre: string }[];
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
        <h2 className="text-2xl font-bold text-gray-800">Ficha Completa de: {student.fullName}</h2>

        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold text-blue-700 mb-3">Información Personal</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InfoField label="Fecha de Nacimiento" value={formatDate(student.dateOfBirth)} />
            <InfoField label="Lugar de Nacimiento" value={student.lugarNacimiento} />
            <InfoField label="Dirección" value={student.direccion} />
            <InfoField label="Género" value={student.genero} />
            <InfoField label="Zona" value={student.zona} />
            <InfoField label="Jornada" value={student.jornada} />
            <InfoField label="Fecha de Ingreso" value={formatDate(student.anoIngreso)} />
            <InfoField label="Institución de Procedencia" value={student.institucionProcedencia} />
          </div>
        </div>
        
        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold text-blue-700 mb-3">Información Médica</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <InfoField label="Tipo de Sangre" value={student.tipoSangre?.replace('_', ' ')} />
             <div className="md:col-span-2">
                <Label as="h3" className="text-sm font-semibold text-gray-500">Medicamentos</Label>
                <p className="text-gray-800">{student.medicamentos.length > 0 ? student.medicamentos.map(m => m.nombre).join(', ') : 'Ninguno'}</p>
             </div>
             <div className="md:col-span-3">
                <Label as="h3" className="text-sm font-semibold text-gray-500">Alergias</Label>
                <p className="text-gray-800">{student.alergias.length > 0 ? student.alergias.map(a => a.nombre).join(', ') : 'Ninguna'}</p>
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
          <button onClick={onRequestClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg hover:bg-gray-300">Cerrar</button>
        </div>
      </div>
    </Modal>
  );
}

export default StudentDetailModal;