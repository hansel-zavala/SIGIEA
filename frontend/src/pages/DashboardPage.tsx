// frontend/src/pages/DashboardPage.tsx

// import React from 'react';
import { useAuth } from '../context/AuthContext';

function DashboardPage() {
  // Obtenemos los datos del usuario y la función de logout del contexto
  const { user, logout } = useAuth();

  return (
    <div>
      {/* Usamos el '?' para asegurarnos que 'user' no es nulo antes de acceder a 'role' */}
      <h2>Dashboard del {user?.role}</h2>
      <p>¡Bienvenido! Has iniciado sesión correctamente.</p>
      <button onClick={logout}>Cerrar Sesión</button>
    </div>
  );
}

export default DashboardPage;