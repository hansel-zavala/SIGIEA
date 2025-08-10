// frontend/src/components/Layout.tsx
import { useState, useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Layout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Efecto para manejar el estado del sidebar en diferentes tamaños de pantalla
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Módulos de navegación. Usamos `to` para las rutas de React Router
  const modules = [
    { name: 'Dashboard', icon: 'home', to: '/' },
    { name: 'Estudiantes', icon: 'user-graduate', to: '/students' },
    // Aquí puedes añadir los enlaces a los futuros módulos
    // { name: 'Lecciones', icon: 'book', to: '/lecciones' },
    // { name: 'Reportes', icon: 'chart-bar', to: '/reportes' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ----- HEADER ----- */}
      {/* En esta sección puedes cambiar los colores del header (ej. bg-blue-600) */}
      <header className="bg-blue-600 text-white p-4 shadow-md sticky top-0 z-20">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button onClick={toggleSidebar} className="focus:outline-none">
              {/* Este es el ícono de hamburguesa/cierre */}
              <i className={`fas fa-${sidebarOpen ? 'times' : 'bars'} text-xl`}></i>
            </button>
            <h1 className="text-xl font-bold">SIGIEA</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="hidden md:block">{user?.role}</span>
            <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center">
              <i className="fas fa-user"></i>
            </div>
            <button onClick={logout} className="hover:text-gray-300">Cerrar Sesión</button>
          </div>
        </div>
      </header>

      <div className="flex dashboard-height">
        {/* ----- SIDEBAR (MENÚ LATERAL) ----- */}
        {/* Aquí puedes cambiar el color del sidebar (ej. bg-blue-800) y el ancho (ej. w-64) */}
        <aside className={`bg-blue-800 text-white w-64 sidebar-transition transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${isMobile ? 'absolute z-10 h-full' : ''}`}>
          <nav className="p-4">
            <ul className="space-y-2">
              {modules.map((module) => (
                <li key={module.name}>
                  {/* Usamos NavLink para que el enlace activo se resalte */}
                  <NavLink 
                    to={module.to}
                    // Esta es la lógica para resaltar el enlace de la página actual
                    className={({ isActive }) => 
                      `flex items-center p-2 rounded transition-colors ${isActive ? 'bg-blue-900' : 'hover:bg-blue-700'}`
                    }
                  >
                    <i className={`fas fa-${module.icon} mr-3`}></i>
                    <span>{module.name}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* ----- CONTENIDO PRINCIPAL ----- */}
        <main className="flex-1 p-6">
          {/* El componente <Outlet> renderiza aquí la página que corresponda (Dashboard, Estudiantes, etc.) */}
          <div className="bg-white rounded-lg shadow-md p-6 h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Layout;