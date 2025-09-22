// frontend/src/components/Header/Header.tsx
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaBars, FaTimes, FaUserCircle, FaSignOutAlt, FaChevronDown } from 'react-icons/fa';

interface HeaderProps {
  onToggleSidebar: () => void;
  isOpen: boolean;
}

function Header({ onToggleSidebar, isOpen }: HeaderProps) {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Efecto para cerrar el menú si se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="flex justify-between items-center p-4 bg-white shadow-md">
      {/* Sección Izquierda */}
      <div className="flex items-center">
        {/* --- CORRECCIÓN AQUÍ: SE ELIMINÓ 'md:hidden' --- */}
        <button className="text-gray-500 focus:outline-none" onClick={onToggleSidebar}>
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
        <h1 className="text-xl font-semibold ml-4">SIGIEA</h1>
      </div>

      {/* Sección Derecha: El Menú Desplegable */}
      <div className="relative" ref={menuRef}>
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)} 
          className="flex items-center space-x-2 focus:outline-none"
        >
          <span className="capitalize font-medium text-gray-600">{user?.name || user?.role}</span>
          <FaUserCircle size={24} className="text-gray-600" />
          <FaChevronDown className={`transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-20 ring-1 ring-black/10">
            <Link to="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              <FaUserCircle className="mr-3" /> Mi Perfil
            </Link>
            {/* Eliminado enlace de Configuración al quitar modo oscuro */}
            <div className="border-t border-gray-100"></div>
            <button
              onClick={logout}
              className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <FaSignOutAlt className="mr-3" /> Cerrar Sesión
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
