// frontend/src/components/Header/Header.tsx
import { useAuth } from '../../context/AuthContext';
import { FaBars, FaTimes } from 'react-icons/fa';

interface HeaderProps {
  onToggleSidebar: () => void;
  isOpen: boolean;
}

function Header({ onToggleSidebar, isOpen }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="flex justify-between items-center p-4 bg-white shadow-md">
      <div className="flex items-center">
        <button className="text-gray-500 focus:outline-none md:hidden" onClick={onToggleSidebar}>
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
        <h1 className="text-xl font-semibold ml-2">SIGIEA</h1>
      </div>
      <div className="flex items-center space-x-4">
        <span>{user?.role}</span>
      </div>
    </header>
  );
}

export default Header;