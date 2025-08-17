// frontend/src/pages/DashboardPage.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import dashboardService, { type  DashboardStats } from '../services/dashboardService.js';
import StatCard from '../components/ui/StatCard.js';
import { FaUserGraduate, FaUserMd, FaUsers, FaBook} from 'react-icons/fa';

function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.getStats()
      .then(data => setStats(data))
      .catch(error => console.error(error))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dashboard del {user?.role}</h2>
        <p className="mt-2 text-gray-600">Bienvenido, {user?.name}. Aquí tienes un resumen del sistema.</p>
      </div>

      {loading ? (
        <p>Cargando estadísticas...</p>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard 
            title="Alumnos Matriculados" 
            value={stats.students} 
            icon={<FaUserGraduate size={24} />}
            color="blue"
          />
          <StatCard 
            title="Terapeutas Activos" 
            value={stats.therapists} 
            icon={<FaUserMd size={24} />}
            color="green"
          />
          <StatCard 
            title="Padres Registrados" 
            value={stats.parents} 
            icon={<FaUsers size={24} />}
            color="purple"
          />
          <StatCard 
            title="Lecciones Creadas" 
            value={stats.lecciones} 
            icon={<FaBook size={24} />}
            color="yellow"
          />
        </div>
      ) : (
        <p className="text-red-500">No se pudieron cargar las estadísticas.</p>
      )}
    </div>
  );
}

export default DashboardPage;