// frontend/src/components/Layout.tsx
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Layout() {
  const { user, logout } = useAuth();

  return (
    <div>
      <nav style={{ padding: '1rem', background: '#f0f0f0', borderBottom: '1px solid #ccc' }}>
        <Link to="/" style={{ marginRight: '1rem' }}>Dashboard</Link>
        <Link to="/students">Estudiantes</Link>
        <span style={{ float: 'right' }}>
          Hola, {user?.role} | <button onClick={logout} style={{ marginLeft: '1rem' }}>Cerrar Sesión</button>
        </span>
      </nav>
      <hr />
      <main style={{ padding: '1rem' }}>
        {/* El componente <Outlet> renderizará aquí la página activa (Dashboard o Estudiantes) */}
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;