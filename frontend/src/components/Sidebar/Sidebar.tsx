// frontend/src/components/Sidebar/Sidebar.tsx
import { NavLink } from 'react-router-dom';
import { FaHome, FaUserGraduate, FaBook, FaFileSignature, FaUsers, FaUserMd, FaCalendarDay, FaClipboardList, FaWpforms, FaFolderOpen, FaCog, FaChartBar } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/Logo_CIATEJ.png';

interface SidebarProps {
  isOpen: boolean;
}

function Sidebar({ isOpen }: SidebarProps) { 
  const { user } = useAuth();

  console.log('Sidebar user:', user);

  const allModules = [
    { name: 'Dashboard', to: '/', icon: <FaHome size={22} />, roles: ['ADMIN', 'THERAPIST', 'PARENT'], permission: 'VIEW_DASHBOARD' },
    { name: 'Matrícula', to: '/matricula', icon: <FaFileSignature size={22} />, roles: ['ADMIN', 'THERAPIST'], permission: 'VIEW_MATRICULA' },
    { name: 'Estudiantes', to: '/students', icon: <FaUserGraduate size={22} />, roles: ['ADMIN', 'THERAPIST', 'PARENT'], permission: 'VIEW_STUDENTS' },
    { name: 'Padres', to: '/guardians', icon: <FaUsers size={22} />, roles: ['ADMIN', 'THERAPIST'], permission: 'VIEW_GUARDIANS' },
    { name: 'Terapeutas', to: '/therapists', icon: <FaUserMd size={22} />, roles: ['ADMIN', 'THERAPIST'], permission: 'VIEW_THERAPISTS' },
    { name: 'Lecciones', to: '/lecciones', icon: <FaBook size={22} />, roles: ['ADMIN', 'THERAPIST'], permission: 'VIEW_LECCIONES' },
    { name: 'Eventos', to: '/events', icon: <FaCalendarDay size={22} />, roles: ['ADMIN', 'THERAPIST', 'PARENT'], permission: 'VIEW_EVENTS' },
    { name: 'Archivero', to: '/archivero', icon: <FaFolderOpen size={22} />, roles: ['ADMIN', 'THERAPIST'], permission: 'VIEW_DOCUMENTS' },
    { name: 'Gráficas', to: '/analisis-graficas', icon: <FaChartBar size={22} />, roles: ['ADMIN', 'THERAPIST', 'PARENT'], permission: 'VIEW_ANALYSIS' },
    { name: 'Reportes', to: '/reports', icon: <FaClipboardList size={22} />, roles: ['ADMIN', 'THERAPIST', 'PARENT'], permission: 'VIEW_REPORTS' },
    { name: 'Plantillas', to: '/templates', icon: <FaWpforms size={22} />, roles: ['ADMIN', 'THERAPIST'], permission: 'VIEW_TEMPLATES' },
    { name: 'Controles', to: '/controles', icon: <FaCog size={22} />, roles: ['ADMIN', 'THERAPIST'], permission: 'MANAGE_PERMISSIONS' },
    { name: 'Mi Estudiante', to: '/mi-estudiante', icon: <FaUserGraduate size={22} />, roles: ['PARENT'], permission: 'VIEW_STUDENTS' },
  ];

  // For PARENT role, strictly control visible modules (hide Estudiantes, Eventos, Gráficas y Reportes)
  const modules = (() => {
    if (!user) return [];
    if (user.role === 'PARENT') {
      const allowedForParent = new Set(['Dashboard', 'Mi Estudiante']);
      return allModules.filter(m => allowedForParent.has(m.name));
    }
    // For ADMIN/THERAPIST honor permissions as before (PARENT bypass removed)
    return allModules.filter(module =>
      module.roles.includes(user.role) &&
      (!module.permission || user.role === 'ADMIN' || user.permissions?.[module.permission])
    );
  })();

  console.log('Filtered modules:', modules);

  return (
    <aside
      className={`bg-white border-r border-gray-200 py-7 transition-all duration-300 ease-in-out
                  ${isOpen ? 'w-[240px] px-6' : 'w-[88px] px-2.5'}`}
    >
      
      <div className={`px-2 ${isOpen ? 'mb-6' : 'mb-2'}`}>
        <img
          src={logo}
          alt="Logo SIGIEA"
          className={`w-auto mx-auto transition-all duration-300 ${isOpen ? 'h-16' : 'h-10'}`}
        />
        {isOpen && (
          <h1 className="text-xl font-bold text-center mt-2">CIATEJ</h1>
        )}
      </div>

      <nav>
        {modules.map(module => (
          <NavLink
            key={module.name}
            to={module.to}
            title={module.name}
            className={({ isActive }) =>
              // --- CORRECCIÓN AQUÍ ---
              `flex items-center p-3 my-1 rounded-lg transition-colors duration-200
               ${isOpen ? 'justify-start' : 'flex-col justify-center'}
               ${isActive 
                  ? 'bg-violet-100 text-violet-600'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
               }`
            }
          >
            {module.icon}
            
            <span 
              className={`font-medium whitespace-nowrap transition-all duration-200
                         ${isOpen ? 'ml-4' : 'text-[11px] mt-1'}`}
            >
              {module.name}
            </span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
