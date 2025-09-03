// frontend/src/components/Sidebar/Sidebar.tsx
import { NavLink } from 'react-router-dom';
import { FaHome, FaUserGraduate, FaBook, FaFileSignature, FaUsers, FaUserMd, FaCalendarDay } from 'react-icons/fa';
import logo from '../../assets/apo-autis-logo.png';

interface SidebarProps {
  isOpen: boolean;
}

function Sidebar({ isOpen }: SidebarProps) {
  const modules = [
    { name: 'Dashboard', to: '/', icon: <FaHome size={22} /> },
    { name: 'Matrícula', to: '/matricula', icon: <FaFileSignature size={22} /> },
    { name: 'Estudiantes', to: '/students', icon: <FaUserGraduate size={22} /> },
    { name: 'Padres', to: '/guardians', icon: <FaUsers size={22} /> },
    { name: 'Terapeutas', to: '/therapists', icon: <FaUserMd size={22} /> },
    { name: 'Lecciones', to: '/lecciones', icon: <FaBook size={22} /> },
    { name: 'Eventos', to: '/events', icon: <FaCalendarDay size={22} /> },
  ];

  return (
    <aside className={`bg-white border-r border-gray-200 space-y-6 py-7 transition-all duration-300 ease-in-out ${isOpen ? 'w-55 px-8' : 'w-30 px-3'}`}>
      
      <div className="px-2 mb-8">
        <img src={logo} alt="Logo SIGIEA" className={`w-auto mx-auto transition-opacity duration-300 ${isOpen ? 'h-16' : 'h-10'}`} />
        <h1 className={`text-xl font-bold text-center transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>APO-AUTIS</h1>
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
                         ${isOpen ? 'ml-4' : 'text-xs mt-1'}`}
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