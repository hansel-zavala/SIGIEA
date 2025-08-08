// frontend/src/App.tsx

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage'; // Importamos el Dashboard
import { useAuth } from './context/AuthContext';   // Importamos el hook de autenticación

function App() {
  // Obtenemos la información del usuario desde nuestro contexto global
  const { user } = useAuth();

  return (
    <div>
      {/* Aquí está la magia: */}
      {/* Si 'user' existe (no es nulo), muestra el Dashboard. */}
      {/* Si no, muestra la página de Login. */}
      {user ? <DashboardPage /> : <LoginPage />}
    </div>
  );
}

export default App;