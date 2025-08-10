// frontend/src/components/Layout.tsx
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Layout.module.css'; // ¡Importamos nuestros estilos!

function Layout() {
  const { user, logout } = useAuth();

  const modules = [
    { name: 'Dashboard', to: '/' },
    { name: 'Estudiantes', to: '/students' },
    // Puedes añadir futuros módulos aquí
  ];

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <h1>SIGIEA</h1>
          </div>
          <div className={styles.headerRight}>
            <span>{user?.role}</span>
            <button onClick={logout}>Cerrar Sesión</button>
          </div>
        </div>
      </header>

      <div className={styles.container}>
        <aside className={styles.sidebar}>
          <nav>
            <ul>
              {modules.map((module) => (
                <li key={module.name}>
                  <NavLink 
                    to={module.to}
                    className={({ isActive }) => 
                      `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
                    }
                  >
                    <span>{module.name}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <main className={styles.mainContent}>
          <div className={styles.mainContentInner}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Layout;