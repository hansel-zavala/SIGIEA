// frontend/src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import MatriculaPage from './pages/MatriculaPage';
import DashboardPage from './pages/DashboardPage';
import StudentsPage from './pages/StudentsPage';
import EditStudentPage from './pages/EditStudentPage';
import ScheduleCalendarPage from './pages/ScheduleCalendarPage';
import StudentDetailPage from './pages/StudentDetailPage';
import LeccionesPage from './pages/LeccionesPage';
import AddLeccionPage from './pages/AddLeccionPage';
import EditLeccionPage from './pages/EditLeccionPage';
import LogSessionPage from './pages/LogSessionPage';
import GuardiansPage from './pages/GuardiansPage';
import EditGuardianPage from './pages/EditGuardianPage';
import TherapistsPage from './pages/TherapistsPage';
import AddTherapistPage from './pages/AddTherapistPage';
import EditTherapistPage from './pages/EditTherapistPage';
import PrintMatriculaPage from './pages/PrintMatriculaPage';
import EventsPage from './pages/EventsPage';
import AddEventPage from './pages/AddEventPage';
import EditEventPage from './pages/EditEventPage';
import CategoriesPage from './pages/CategoriesPage';

function App() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {user ? (
          <>
            <Route path="/" element={<Layout />}>
              <Route index element={<DashboardPage />} />
              <Route path="students" element={<StudentsPage />} />
              <Route path="matricula" element={<MatriculaPage />} />
              <Route path="students/edit/:id" element={<EditStudentPage />} />
              <Route path="students/:id" element={<StudentDetailPage />} />
              <Route path="students/:studentId/schedule" element={<ScheduleCalendarPage />} />
              <Route path="lecciones" element={<LeccionesPage />} />
              <Route path="lecciones/new" element={<AddLeccionPage />} />
              <Route path="lecciones/edit/:id" element={<EditLeccionPage />} />
              <Route path="guardians" element={<GuardiansPage />} />
              <Route path="guardians/edit/:id" element={<EditGuardianPage />} />
              <Route path="/students/:studentId/plans/:planId/log-session" element={<LogSessionPage />} />
              <Route path="therapists" element={<TherapistsPage />} />
              <Route path="therapists/new" element={<AddTherapistPage />} />
              <Route path="therapists/edit/:id" element={<EditTherapistPage />} />
              <Route path="events" element={<EventsPage />} />
              <Route path="events/new" element={<AddEventPage />} />
              <Route path="events/edit/:id" element={<EditEventPage />} />
              <Route path="categories" element={<CategoriesPage />} />
            </Route>

            <Route path="/students/:id/print" element={<PrintMatriculaPage />} />
          </>
        ) : (
          <Route path="/login" element={<LoginPage />} />
        )}

        <Route path="*" element={<Navigate to={user ? '/' : '/login'} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;