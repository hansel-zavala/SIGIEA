// frontend/src/components/Sidebar/Sidebar.tsx
import { NavLink } from 'react-router-dom';
import { FaHome, FaUserGraduate, FaBook } from 'react-icons/fa';

interface SidebarProps {
  isOpen: boolean;
}

function Sidebar({ isOpen }: SidebarProps) {
  const modules = [
    { name: 'Dashboard', to: '/', icon: <FaHome size={20} /> },
    { name: 'Estudiantes', to: '/students', icon: <FaUserGraduate size={20} /> },
    { name: 'Lecciones', to: '/lecciones', icon: <FaBook size={20} /> },
  ];

  return (
    <aside className={`bg-blue-800 text-white space-y-6 py-7 px-2 transition-all duration-300 ease-in-out ${isOpen ? 'w-64' : 'w-20'}`}>
      <h2 className="text-2xl font-extrabold text-white text-center">
        {isOpen ? 'SIGIEA' : 'S'}
      </h2>
      <nav>
        {modules.map(module => (
          <NavLink
            key={module.name}
            to={module.to}
            title={module.name}
            className={({ isActive }) =>
              `flex items-center py-2.5 px-4 rounded transition duration-200 ${isActive ? 'bg-blue-900' : 'hover:bg-blue-700'}`
            }
          >
            {module.icon}
            <span className={`ml-4 transition-opacity duration-200 ${!isOpen && 'opacity-0'}`}>{module.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;