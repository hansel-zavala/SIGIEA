// frontend/src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import AddStudentPage from './pages/AddStudentPage';
import DashboardPage from './pages/DashboardPage';
import StudentsPage from './pages/StudentsPage';
import EditStudentPage from './pages/EditStudentPage';
import AssignPlanPage from './pages/AssignPlanPage';
import StudentDetailPage from './pages/StudentDetailPage';
import EditPlanPage from './pages/EditPlanPage';

function App() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Si el usuario ha iniciado sesión... */}
        {user ? (
          // ...renderiza el Layout principal, y dentro de él, las páginas anidadas
          <Route path="/" element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="students" element={<StudentsPage />} />
            {/* Aquí añadiremos más rutas en el futuro */}
            <Route path="students/new" element={<AddStudentPage />} />
            <Route path="students/edit/:id" element={<EditStudentPage />} />
            <Route path="students/:id" element={<StudentDetailPage />} />
            <Route path="students/:id/assign-plan" element={<AssignPlanPage />} />
            <Route path="/students/:studentId/plans/:planId/edit" element={<EditPlanPage />} />
          </Route>
        ) : (
          // Si NO ha iniciado sesión, solo permite el acceso a /login
          <Route path="/login" element={<LoginPage />} />
        )}

        {/* Si se intenta acceder a cualquier otra ruta, redirige */}
        <Route path="*" element={<Navigate to={user ? '/' : '/login'} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;